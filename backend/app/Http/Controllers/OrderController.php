<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\CartItem;
use App\Models\Watch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Place a new order and clear the cart.
     */
    public function placeOrder(Request $request)
    {
        $user = $request->user();
        
        // 1. Get all cart items
        $cartItems = CartItem::where('user_id', $user->id)->with('watch')->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Your cart is empty'], 400);
        }

        // 2. Validate stock and calculate total
        foreach ($cartItems as $item) {
            if ($item->watch->stock < $item->quantity) {
                return response()->json([
                    'message' => "Insufficient stock for {$item->watch->name}. Only {$item->watch->stock} available."
                ], 400);
            }
        }

        $totalAmount = $cartItems->sum(function ($item) {
            return $item->watch->price * $item->quantity;
        });

        // 3. Process Order Informally (Simulating Success)
        try {
            DB::beginTransaction();

            // Create Order
            $order = Order::create([
                'user_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => 'paid', // Mark as paid for demo/placeholder
                'payment_id' => 'MANUAL-' . strtoupper(uniqid())
            ]);

            // Create Order Items and Update Stock
            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'watch_id' => $item->watch_id,
                    'quantity' => $item->quantity,
                    'price' => $item->watch->price,
                    'color' => $item->color
                ]);

                // Reduce stock
                $item->watch->decrement('stock', $item->quantity);
            }

            // Clear Cart
            CartItem::where('user_id', $user->id)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Order placed successfully',
                'order' => $order->load('items.watch')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Order placement failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to process order. Please try again.'], 500);
        }
    }

    /**
     * Get order history for the authenticated user.
     */
    public function index(Request $request)
    {
        return response()->json(
            $request->user()->orders()->with('items.watch')->latest()->paginate(10)
        );
    }
}
