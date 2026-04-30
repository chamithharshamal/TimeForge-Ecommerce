<?= '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Main Home Page -->
    <url>
        <loc>{{ $frontendUrl }}/</loc>
        <lastmod>{{ now()->utc()->toAtomString() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    <!-- Dynamic Product Pages -->
    @foreach ($watches as $watch)
        <url>
            <loc>{{ $frontendUrl }}/product/{{ $watch->id }}</loc>
            <lastmod>{{ $watch->updated_at->utc()->toAtomString() }}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
        </url>
    @endforeach
</urlset>
