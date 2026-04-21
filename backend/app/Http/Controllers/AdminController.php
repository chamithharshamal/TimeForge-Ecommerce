<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Watch;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function stats()
    {
        $totalUsers = User::count();
        $totalWatches = Watch::count();
        $outOfStock = Watch::where('stock', 0)->count();
        $totalStockValue = Watch::sum(DB::raw('price * stock'));
        $totalRevenue = Order::where('status', 'paid')->sum('total_amount');

        return response()->json([
            'total_users' => $totalUsers,
            'total_watches' => $totalWatches,
            'out_of_stock' => $outOfStock,
            'total_stock_value' => round($totalStockValue, 2),
            'total_revenue' => round($totalRevenue, 2)
        ]);
    }

    public function users()
    {
        return response()->json(User::latest()->get());
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting self
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete your own admin account.'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully.']);
    }
}
