<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@timeforge.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);
        
        User::create([
            'name' => 'John Doe',
            'email' => 'user@timeforge.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        $this->call([
            WatchSeeder::class,
        ]);
    }
}
