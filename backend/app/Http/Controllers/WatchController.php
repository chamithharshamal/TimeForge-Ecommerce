<?php

namespace App\Http\Controllers;

use App\Models\Watch;
use Illuminate\Http\Request;
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
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'badge' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096', // 4MB Max
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            // Save local file to storage/app/public/watches
            $path = $request->file('image')->store('watches', 'public');
            $data['image_path'] = $path;
        }

        $watch = Watch::create($data);

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
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'badge' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($watch->image_path && !filter_var($watch->image_path, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($watch->image_path);
            }
            // Save new local file
            $path = $request->file('image')->store('watches', 'public');
            $data['image_path'] = $path;
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
}
