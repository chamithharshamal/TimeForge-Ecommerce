<?php

namespace App\Services;

use App\Models\Watch;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FacebookService
{
    protected string $pageId;
    protected string $accessToken;
    protected string $graphUrl = 'https://graph.facebook.com/v19.0';

    public function __construct()
    {
        $this->pageId = config('services.facebook.page_id');
        $this->accessToken = config('services.facebook.access_token');
    }

    /**
     * Post a watch product to the Facebook Page.
     */
    public function postWatch(Watch $watch): array
    {
        // Build a nice caption
        $caption = $this->buildCaption($watch);

        $imageUrl = $watch->image_url;
        $isLocal = str_contains($imageUrl, 'localhost') || str_contains($imageUrl, '127.0.0.1');
        $isSvg = str_ends_with(strtolower(explode('?', $imageUrl)[0]), '.svg');

        // Facebook cannot pull images from localhost, and does NOT support SVG files
        if ($isLocal || $isSvg) {
            $reason = $isLocal ? 'Local environment' : 'SVG format (unsupported by FB)';
            Log::info("Falling back to text post for Facebook. Reason: $reason", ['watch_id' => $watch->id]);
            
            if ($isSvg) {
                $caption .= "\n\n(Note: Image link included as text because SVG is not supported for FB photos)";
                $caption .= "\nImage: " . $imageUrl;
            } else {
                $caption .= "\n\n(Note: Image hidden in local development mode)";
            }
            
            return $this->postMessage($caption);
        }

        // If the watch has a valid public image, post as a photo
        if ($imageUrl && $imageUrl !== 'https://via.placeholder.com/800x800?text=No+Image') {
            return $this->postPhoto($caption, $imageUrl);
        }

        return $this->postMessage($caption);
    }

    /**
     * Post a photo with caption to the Facebook Page.
     */
    public function postPhoto(string $caption, string $imageUrl): array
    {
        $response = Http::post("{$this->graphUrl}/{$this->pageId}/photos", [
            'url'          => $imageUrl,
            'message'      => $caption,
            'access_token' => $this->accessToken,
        ]);

        if ($response->successful()) {
            Log::info('Facebook photo posted successfully', [
                'post_id' => $response->json('id'),
            ]);
            return [
                'success' => true,
                'post_id' => $response->json('id'),
            ];
        }

        Log::error('Facebook photo post failed', [
            'error' => $response->json(),
        ]);

        return [
            'success' => false,
            'error'   => $response->json('error.message', 'Unknown error'),
        ];
    }

    /**
     * Post a text message to the Facebook Page.
     */
    public function postMessage(string $message): array
    {
        $response = Http::post("{$this->graphUrl}/{$this->pageId}/feed", [
            'message'      => $message,
            'access_token' => $this->accessToken,
        ]);

        if ($response->successful()) {
            Log::info('Facebook message posted successfully', [
                'post_id' => $response->json('id'),
            ]);
            return [
                'success' => true,
                'post_id' => $response->json('id'),
            ];
        }

        Log::error('Facebook message post failed', [
            'error' => $response->json(),
        ]);

        return [
            'success' => false,
            'error'   => $response->json('error.message', 'Unknown error'),
        ];
    }

    /**
     * Build a nicely formatted caption for the watch.
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

        $caption .= "\n🛒 Shop now at TimeForge!\n";
        $caption .= "#TimeForge #Watches #LuxuryWatches #NewArrival";

        return $caption;
    }
}
