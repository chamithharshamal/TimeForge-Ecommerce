# 🕰️ TimeForge - Luxury E-Commerce Platform

TimeForge is a premium, high-end e-commerce platform dedicated to horological excellence. Built with a "Luxury First" philosophy, the application features a sophisticated Glassmorphism UI, real-time inventory management, and a robust business intelligence dashboard for administrators.

---

## ✨ Key Features

### 💎 For Connoisseurs (Users)
*   **Cinematic UI**: A modern, dark-themed interface with glassmorphism effects and smooth transitions.
*   **Curated Collection**: High-resolution timepiece exploration with detailed narratives.
*   **Exclusive Portal**: Personal profiles with a comprehensive order history and account management.
*   **Secure Cart**: Interactive shopping experience with manual payment reservation capabilities.

### 🏛️ For Curators (Admins)
*   **Business Intelligence**: Statistical overview of revenue, active assets, and customer metrics.
*   **Inventory Command**: Full CRUD support for timepieces including image uploads and stock tracking.
*   **Customer Directory**: Secure oversight of all registered users on the platform.
*   **Stock Alerts**: Automated indicators for out-of-stock or low-stock items.

---

## 🚀 Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Laravel 12 (API-driven) |
| **Frontend** | React / Vite |
| **Authentication** | Laravel Sanctum (Stateful) |
| **Icons** | Lucide React |
| **Styling** | Vanilla CSS (Premium Design Tokens) |
| **Database** | MySQL / PostgreSQL |

---

## 🛠️ Setup Instructions

### Prerequisites
*   **PHP** >= 8.2
*   **Node.js** >= 18
*   **Composer**
*   **MySQL Server**

### 1. Backend Setup
```bash
cd backend

# Install dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Database Configuration: Update your .env with DB credentials
# DB_DATABASE=timeforge

# Run migrations and seed luxury assets
php artisan migrate --seed

# Start the API server
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 📦 Database Seeding
To populate the store with the initial "Luxury Masterpiece" collection (including Chronos, Stellar, and Horizon models), run:
```bash
php artisan db:seed --class=WatchSeeder
```

---

## 🛡️ Administrative Access
By default, the `DatabaseSeeder` creates an admin account if seeded. Check `database/seeders/DatabaseSeeder.php` for default credentials or create one manually via the database.

---

## 🔒 License
This project is proprietary and built for excellence.

**TimeForge** - *Power that shines you.*
