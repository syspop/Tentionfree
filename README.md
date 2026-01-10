# Project Documentation & API Usage Guide

This document tracks the API endpoints, their usage across the frontend, and key business logic to ensure future updates do not break existing functionality.

## 1. Backend Structure (`server.js`)
The backend is an Express.js server using a local JSON database in the `data/` directory.

### Key Features
- **Database**: JSON-based (using `writeLocalJSON` / `readLocalJSON`).
- **Auth**: JWT-based. Admin token stored as `adminToken`, User token as `token`.
- **Static Files**: Serves `.html` files automatically without extension.

## 2. API Endpoints Map

### Products
| Method | Endpoint | Purpose | Used In |
|---|---|---|---|
| `GET` | `/api/products` | Fetch all products | `products.html`, `index.html`, `admin/products.html` |
| `POST` | `/api/products/add` | Add new product | `admin/add-product.html` |
| `PUT` | `/api/products/:id` | Update product | `admin/products.html` |
| `DELETE`| `/api/products/:id` | Delete product | `admin/products.html` |
| `GET` | `/product/:id` | **SSR** Product Details | Direct Browser Navigation (SEO) |

### Orders
| Method | Endpoint | Purpose | Logic Notes | Used In |
|---|---|---|---|---|
| `GET` | `/api/orders` | Fetch Orders (Paginated) | Supports `type=active` (non-archived) and `type=all`. **Critical**: Use `type=active` for management to avoid empty pages. | `admin/manage-orders.html` (`active`), `admin/order-history.html` (`all`) |
| `GET` | `/api/orders/:id` | Fetch Single Order | Fallback if not found in cache. | `admin/manage-orders.html`, `admin/order-history.html` |
| `POST` | `/api/orders` | Create Order | Handles generic & logged-in users. Checks for bans. | `assets/script.js` (Checkout) |
| `PUT` | `/api/orders/:id` | Update Order Status | Triggers emails on `Completed`/`Cancelled`/`Refunded`. | `admin/manage-orders.html` |

### Authentication
| Method | Endpoint | Purpose | Used In |
|---|---|---|---|
| `POST` | `/api/auth/login` | Admin/User Login | `login.html`, `chodir-vai.html` (Admin Login) |
| `POST` | `/api/auth/register`| User Registration | `login.html` |
| `POST` | `/api/auth/google` | Google Social Login | `login.html` |

### Other
| Method | Endpoint | Purpose | Used In |
|---|---|---|---|
| `POST` | `/api/upload` | Upload Images | `admin/add-product.html`, `admin/manage-orders.html` (Proof/Delivery) |
| `GET` | `/api/categories` | Fetch Categories | `admin/manage-categories.html`, `admin/add-product.html` |

## 3. Critical Logic Notes

### Order Pagination & Filtering
- **Issue**: Pagination happens *before* client-side filtering.
- **Solution**: Always pass `type=active` to `/api/orders` when building the "Manage Orders" view. This ensures the server filters out archived items *before* slicing the page, guaranteeing a full list of actionable orders.
- **History**: Use `type=all` for "Order History" to see everything.

### Image Uploads
- Images are stored in `assets/uploads`.
- The API returns a relative path (e.g., `assets/uploads/file.png`).
- **Note**: Ensure `assets/uploads` folder exists (server checks this on start/upload).

### Authentication
- **Admin**: `sessionStorage.getItem('adminAuth')` must be `true` AND `localStorage.getItem('adminToken')` must be valid. Checked in `admin/script.js`.
- **User**: `localStorage.getItem('token')`.

### Server-Side Rendering (SSR)
- URLs like `/product/123` or `/product/product-slug` are intercepted by `server.js`.
- It reads `product-details.html` and injects meta tags (SEO) and content (Title, Price, Image) explicitly before sending to the client.
- **Caution**: When editing `product-details.html`, ensure the `id="..."` attributes targeted by the regex in `server.js` (e.g., `product-modal-title`, `page-display-price`) remain intact.

## 4. Project Architecture

### Directory Structure
```
/
├── admin/              # Admin Panel HTML/CSS/JS (private)
├── api/                # Vercel Serverless Functions (if applicable)
├── assets/             # Shared Frontend Assets (CSS, JS, Images)
├── backend_services/   # Backend Modules (Email, etc.)
├── data/               # JSON Database (products.json, orders.json, users.json)
├── node_modules/       # Dependencies
├── server.js           # Main Backend Server (Express)
├── *.html              # Public Frontend Pages
└── .env                # Environment Variables
```

### Configuration (`.env`)
Ensure these variables are set in your `.env` file (or Railway/Vercel settings):
- `RESEND_API_KEY`: API Key for sending emails.
- `ADMIN_EMAIL`: Email address to receive admin notifications.
- `SITE_URL`: Public URL of the website (e.g., `https://tentionfree.store`).
- `JWT_SECRET`: Secret key for signing JSON Web Tokens.
- `PORT`: (Optional) Port to run the server on (default: 3000).

### Frontend Architecture
The frontend is split into two distinct parts:
1.  **Public Website** (`root/*.html`):
    - Uses `assets/style.css` (Tailwind-based) and `assets/script.js`.
    - Handles Product Browsing, Cart, Checkout, and User Login.
2.  **Admin Panel** (`admin/*.html`):
    - Uses `admin/style.css` and `admin/script.js`.
    - Secured by `adminAuth` (SessionStorage) and `adminToken` (LocalStorage).
    - **Note:** Do not mix public `script.js` functions with admin logic.

## 5. Maintenance Checklist
Before creating a release or updating:
1.  **Check API Routes**: Ensure no duplicate route definitions in `server.js`.
2.  **Verify Admin Token**: Admin pages redirect to `../chodir-vai` if unauthorized.
3.  **Test Checkout**: Verify `POST /api/orders` works for Guest and Logged-in users.

## 5. Database Schema (`data/*.json`)
The application uses a flat-file JSON database system.

### Products (`data/products.json`)
- **Key Fields**: `id` (Number), `name`, `price` (BDT), `variants` (Array of objects), `viewInIndex` (Boolean).
- **Variants**: If a product has variants (e.g. 1 Month, 3 Months), the `price` field in the root object is the base price (usually the cheapest).
- **Instructions**: Contains post-purchase instructions shown to the user.

### Orders (`data/orders.json`)
- **Key Fields**: 
    - `id`: Timestamp-based unique ID (e.g., `1767941631977`).
    - `status`: `Pending`, `Processing`, `Completed`, `Cancelled`, `Refunded`.
    - `proof`: Base64 string or URL of payment proof image.
    - `items`: Array of ordered items with snapshot of price/name at time of purchase.
- **Relationships**: Links to `customers.json` via `email` or `userId`.

## 6. Key Services

### Email System (`backend_services/emailService.js`)
- **Provider**: Resend (API Key in `.env` as `RESEND_API_KEY`).
- **Function**: `sendOrderStatusEmail(order, updates)`.
- **Triggers**: Called when order status changes in Admin Panel.
- **Logic**:
    - **Currency Conversion**: Automatically detects USD/Binance orders if item total (BDT) > Total Price * 50.
    - **Dynamic Content**: Injects Delivery Info, Cancellation Reason, or Refund Details based on status.
    - **Caching**: Appends `?v=timestamp` to image URLs to prevent Gmail caching old images.

### Authentication Flow
1.  **Login**: `POST /api/auth/login` checks `data/users.json`.
2.  **Token**: Returns JWT (stored in LocalStorage).
3.  **Admin**: Admin login is separate (`chodir-vai.html`) and sets `adminAuth=true` in SessionStorage + `adminToken` in LocalStorage. **Both are required.**
