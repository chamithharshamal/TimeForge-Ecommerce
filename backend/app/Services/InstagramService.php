<?php

namespace App\Services;

use App\Models\Watch;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InstagramService
{
    protected string $accountId;
    protected string $accessToken;
    protected string $graphUrl = 'https://graph.facebook.com/v19.0';

    public function __construct()
    {
        $this->accountId = config('services.instagram.account_id');
        // Instagram uses the same Facebook Page Access Token
        $this->accessToken = config('services.facebook.access_token');
    }

    /**
     * Post a watch product to the Instagram Account.
     */
    public function postWatch(Watch $watch): array
    {
        $imageUrl = $watch->image_url;
        $isLocal = str_contains($imageUrl, 'localhost') || str_contains($imageUrl, '127.0.0.1');
        
        // Handle cases where image_url might have query params
        $pureUrl = explode('?', $imageUrl)[0];
        $isSvg = str_ends_with(strtolower($pureUrl), '.svg');

        // Instagram REQUIRES a public image URL. It does not support text-only posts.
        if (!$imageUrl || $imageUrl === 'https://via.placeholder.com/800x800?text=No+Image' || $isLocal || $isSvg) {
            $reason = $isLocal ? 'Local environment' : ($isSvg ? 'SVG format' : 'No public image');
            Log::info("Skipping Instagram post. Reason: $reason. Instagram requires public images.", ['watch_id' => $watch->id]);
            
            return [
                'success' => false,
                'error' => "Skipped: $reason",
                'skipped' => true
            ];
        }

        $caption = $this->buildCaption($watch);

        // Step 1: Create the media container
        $containerResponse = Http::post("{$this->graphUrl}/{$this->accountId}/media", [
            'image_url'    => $imageUrl,
            'caption'      => $caption,
            'access_token' => $this->accessToken,
        ]);

        if (!$containerResponse->successful()) {
            Log::error('Instagram container creation failed', [
                'error' => $containerResponse->json(),
                'watch_id' => $watch->id,
                'image_url' => $imageUrl
            ]);
            return [
                'success' => false,
                'error'   => $containerResponse->json('error.message', 'Container creation failed'),
            ];
        }

        $creationId = $containerResponse->json('id');

        // Step 2: Publish the media container
        $publishResponse = Http::post("{$this->graphUrl}/{$this->accountId}/media_publish", [
            'creation_id'  => $creationId,
            'access_token' => $this->accessToken,
        ]);

        if ($publishResponse->successful()) {
            Log::info('Instagram photo published successfully', [
                'post_id' => $publishResponse->json('id'),
                'watch_id' => $watch->id
            ]);
            return [
                'success' => true,
                'post_id' => $publishResponse->json('id'),
            ];
        }

        Log::error('Instagram photo publish failed', [
            'error' => $publishResponse->json(),
            'watch_id' => $watch->id
        ]);

        return [
            'success' => false,
            'error'   => $publishResponse->json('error.message', 'Publish failed'),
        ];
    }

    /**
     * Build a nicely formatted caption for the watch (optimized for Instagram).
     */
    protected function buildCaption(Watch $watch): string
    {
        $price = number_format($watch->price, 2);

        $caption = "⌚ NEW ARRIVAL ⌚\n\n";
        $caption .= "🔥 {$watch->name}\n\n";

        if ($watch->description) {
            $caption .= "{$watch->description}\n\n";
        }

        if ($watch->color) {
            $colors = collect(explode(',', $watch->color))->map(fn($c) => trim($c))->filter()->join(' | ');
            if ($colors) {
                $caption .= "🎨 Available Colors: {$colors}\n\n";
            }
        }

        $caption .= "💰 Price: $ {$price}\n";

        if ($watch->badge) {
            $caption .= "🏷️ {$watch->badge}\n";
        }

        $caption .= "\n🛒 Shop now at TimeForge! Link in bio.\n\n";
        $caption .= "#TimeForge #Watches #LuxuryWatches #WatchCollector #NewArrival #WatchOfTheDay";

        return $caption;
    }
}
