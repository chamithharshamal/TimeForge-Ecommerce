<?php

namespace App\Http\Controllers;

use App\Models\Watch;
use App\Services\FacebookService;
use App\Services\InstagramService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class WatchController extends Controller
{
    /**
     * Display a listing of the watches (Public).
     */
    public function index()
    {
        // For the frontend, maybe we want to order by created_at desc or something
        return response()->json(Watch::latest()->get());
    }

    /**
     * Display the specified watch (Public).
     */
    public function show($id)
    {
        $watch = Watch::findOrFail($id);
        return response()->json($watch);
    }

    /**
     * Store a newly created watch (Admin Only).
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'badge' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096', // 4MB Max
            'image_url' => 'nullable|string|url',
        ]);

        $data = $request->except(['image', 'image_url']);

        if ($request->hasFile('image')) {
            // Save local file to storage/app/public/watches
            $path = $request->file('image')->store('watches', 'public');
            $data['image_path'] = $path;
        } elseif ($request->filled('image_url')) {
            // Use the provided direct URL
            $data['image_path'] = $request->input('image_url');
        }

        $watch = Watch::create($data);

        // Auto-post to Facebook Page
        try {
            $fb = new FacebookService();
            $result = $fb->postWatch($watch);

            if ($result['success']) {
                Log::info('Watch posted to Facebook', ['watch_id' => $watch->id, 'fb_post_id' => $result['post_id']]);
            } else {
                Log::warning('Facebook post failed', ['watch_id' => $watch->id, 'error' => $result['error']]);
            }
        } catch (\Exception $e) {
            // Don't block watch creation if FB fails
            Log::error('Facebook posting error', ['watch_id' => $watch->id, 'error' => $e->getMessage()]);
        }

        // Auto-post to Instagram Business
        try {
            $ig = new InstagramService();
            $result = $ig->postWatch($watch);

            if ($result['success']) {
                Log::info('Watch posted to Instagram', ['watch_id' => $watch->id, 'ig_post_id' => $result['post_id']]);
            } elseif (isset($result['skipped'])) {
                // Already logged in service
            } else {
                Log::warning('Instagram post failed', ['watch_id' => $watch->id, 'error' => $result['error']]);
            }
        } catch (\Exception $e) {
            Log::error('Instagram posting error', ['watch_id' => $watch->id, 'error' => $e->getMessage()]);
        }

        return response()->json($watch, 201);
    }

    /**
     * Update the specified watch (Admin Only).
     */
    public function update(Request $request, $id)
    {
        $watch = Watch::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'badge' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'image_url' => 'nullable|string|url',
        ]);

        $data = $request->except(['image', 'image_url']);

        if ($request->hasFile('image')) {
            // Delete old image if exists locally
            if ($watch->image_path && !filter_var($watch->image_path, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($watch->image_path);
            }
            // Save new local file
            $path = $request->file('image')->store('watches', 'public');
            $data['image_path'] = $path;
        } elseif ($request->filled('image_url')) {
            // Delete old local image if we are switching to a URL
            if ($watch->image_path && !filter_var($watch->image_path, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($watch->image_path);
            }
            $data['image_path'] = $request->input('image_url');
        }

        $watch->update($data);

        return response()->json($watch);
    }

    /**
     * Remove the specified watch (Admin Only).
     */
    public function destroy($id)
    {
        $watch = Watch::findOrFail($id);

        // Cleanup image file
        if ($watch->image_path && !filter_var($watch->image_path, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($watch->image_path);
        }

        $watch->delete();

        return response()->json(['message' => 'Watch deleted successfully']);
    }

    /**
     * Generate an AI description for a watch based on name and color.
     */
    public function generateDescription(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'color' => 'nullable|string',
        ]);

        $name = $request->input('name');
        $color = $request->input('color', 'unspecified color');

        try {
            $apiKey = env('OPENROUTER_API_KEY');
            if (!$apiKey) {
                return response()->json(['error' => 'API Key not configured'], 500);
            }

            $prompt = "Write an SEO-friendly product description for a luxury watch named '{$name}' with color '{$color}'. Make it compelling for e-commerce, highlighting style and prestige, maximum 100 words. Return only the description text.";

            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
            ])->timeout(60)->post('https://openrouter.ai/api/v1/chat/completions', [
                        'model' => 'minimax/minimax-m2.5:free',
                        'messages' => [
                            ['role' => 'user', 'content' => $prompt]
                        ],
                        'temperature' => 0.7,
                    ]);

            if ($response->successful()) {
                $description = $response->json('choices.0.message.content');
                return response()->json(['description' => trim($description)]);
            }

            if ($response->status() === 429) {
                return response()->json(['error' => 'Rate limit reached on OpenRouter. Please try again in a moment.'], 429);
            }

            \Illuminate\Support\Facades\Log::error('OpenRouter API Error', ['response' => $response->body()]);
            return response()->json(['error' => 'Failed to generate description from AI. Please try again.'], 500);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('OpenRouter Exception', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Server error while generating description'], 500);
        }
    }
}
