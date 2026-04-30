<?php

namespace App\Http\Controllers;

use App\Models\Watch;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    /**
     * Generate the dynamic sitemap.
     */
    public function index()
    {
        // Get all watches from the database
        $watches = Watch::all();
        
        // Return the XML view with the correct header
        return response()->view('sitemap', [
            'watches' => $watches,
            'frontendUrl' => env('FRONTEND_URL', 'http://localhost:5173'),
        ])->header('Content-Type', 'text/xml');
    }
}
