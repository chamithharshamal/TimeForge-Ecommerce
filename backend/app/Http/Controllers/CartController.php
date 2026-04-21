<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    /**
     * Get the current user's cart items.
     */
    public function index()
    {
        $items = CartItem::with('watch')
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($items);
    }

    /**
     * Add an item to the cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'watch_id' => 'required|exists:watches,id',
            'quantity' => 'nullable|integer|min:1'
        ]);

        $userId = Auth::id();
        $watchId = $request->watch_id;
        $qty = $request->quantity ?? 1;

        // Check if item already exists in cart
        $item = CartItem::where('user_id', $userId)
            ->where('watch_id', $watchId)
            ->first();

        if ($item) {
            $item->increment('quantity', $qty);
        } else {
            $item = CartItem::create([
                'user_id' => $userId,
                'watch_id' => $watchId,
                'quantity' => $qty
            ]);
        }

        return response()->json($item->load('watch'), 201);
    }

    /**
     * Update quantity of a cart item.
     */
    public function update(Request $request, $id)
    {
        $item = CartItem::where('user_id', Auth::id())->findOrFail($id);
        
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);
        
        $item->update([
            'quantity' => $request->quantity
        ]);
        
        return response()->json($item->load('watch'));
    }

    /**
     * Remove an item from the cart.
     */
    public function destroy($id)
    {
        $item = CartItem::where('user_id', Auth::id())->findOrFail($id);
        $item->delete();
        
        return response()->json(['message' => 'Item removed from cart']);
    }
}
