<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Watch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image_path',
        'badge',
        'color',
    ];

    // Append a fully qualified URL for the image
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image_path && \Storage::disk('public')->exists($this->image_path)) {
            return asset('storage/' . $this->image_path);
        }
        
        // If the path is a direct URL (e.g., Unsplash dummy data), return it directly
        if (filter_var($this->image_path, FILTER_VALIDATE_URL)) {
             return $this->image_path;
        }

        // Return a default placeholder if nothing exists
        return 'https://via.placeholder.com/800x800?text=No+Image';
    }
}
