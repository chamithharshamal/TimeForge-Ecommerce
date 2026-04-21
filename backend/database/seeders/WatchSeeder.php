<?php

namespace Database\Seeders;

use App\Models\Watch;
use Illuminate\Database\Seeder;

class WatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $watches = [
            [
                'name' => 'Chronos Elite Black',
                'description' => 'A masterpiece of horology featuring a sleek black finish.',
                'price' => 1200.00,
                'stock' => 3,
                'image_path' => 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Low Stock',
            ],
            [
                'name' => 'Stellar Velocity Gold',
                'description' => 'Engineered for the relentless. 24k gold plating.',
                'price' => 4850.00,
                'stock' => 12,
                'image_path' => 'https://images.unsplash.com/photo-1548171915-e7af5eb4480e?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Best Seller',
            ],
            [
                'name' => 'Horizon Deep Blue',
                'description' => 'Dive into luxury with up to 300m water resistance.',
                'price' => 2400.00,
                'stock' => 0,
                'image_path' => 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Sold Out',
            ],
            [
                'name' => 'Lunar Titanium',
                'description' => 'Aerospace-grade titanium chassis meant for extreme conditions.',
                'price' => 3100.00,
                'stock' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1587836374828-cb4387df3eb7?q=80&w=800&auto=format&fit=crop',
                'badge' => 'New Arrival',
            ],
            [
                'name' => 'Zenith Aerolite Silv',
                'description' => 'Brushed stainless steel with an open-heart movement display.',
                'price' => 1850.00,
                'stock' => 8,
                'image_path' => 'https://images.unsplash.com/photo-1547996160-81dfa63595dd?q=80&w=800&auto=format&fit=crop',
                'badge' => 'New Arrival',
            ],
            [
                'name' => 'Midnight Phantom',
                'description' => 'Carbon fiber casing and a stealth matte black aesthetic.',
                'price' => 2900.00,
                'stock' => 4,
                'image_path' => 'https://images.unsplash.com/photo-1522337360788-8b13df75cfef?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Limited Edition',
            ],
            [
                'name' => 'Rosewood Classic',
                'description' => 'Exotic rosewood dial paired with premium Italian leather.',
                'price' => 950.00,
                'stock' => 15,
                'image_path' => 'https://images.unsplash.com/photo-1619134769035-492751d7bf42?q=80&w=800&auto=format&fit=crop',
                'badge' => '',
            ],
            [
                'name' => 'Alpine Vanguard',
                'description' => 'Forest green dial and rugged nylon strap for the modern explorer.',
                'price' => 1100.00,
                'stock' => 20,
                'image_path' => 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Best Seller',
            ],
            [
                'name' => 'Orbital Tourbillon',
                'description' => 'Complex tourbillon movement visible through crystal sapphire.',
                'price' => 9800.00,
                'stock' => 2,
                'image_path' => 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=800&auto=format&fit=crop',
                'badge' => 'Exclusive',
            ]
        ];

        foreach ($watches as $watch) {
            Watch::updateOrCreate(['name' => $watch['name']], $watch);
        }
    }
}
