# Nilmadhav Saree Store — Frontend Setup & Developer Guide

Complete guide for installing, configuring, running, and deploying the React.js frontend application for Nilmadhav Sarees.

---

## 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested with v22.12.0)
- **npm**: v9.0.0 or higher (Tested with v10.9.0)
- **Backend API Server**: Running on `http://localhost:5000`

---

## 2. Environment Variables Configuration

Create a `.env` file inside the `Frontend/` folder (or copy from `.env.example`):

```bash
# Frontend/.env
VITE_API_URL=http://localhost:5000/api
```

> **Note**: Never expose private keys, MongoDB connection URIs, or Razorpay secrets in frontend environment variables. All secrets stay protected within the `server/.env`.

---

## 3. Installation

From the `Frontend/` directory, install all required dependencies:

```bash
cd Frontend
npm install
```

*(On Windows systems with PowerShell script execution restrictions, invoke via Command Prompt or `npm.cmd install`)*

---

## 4. Running Locally in Development Mode

Start the Vite development server on port `3000`:

```bash
npm run dev
```

Once running, access the application in your browser at:
- **Customer Storefront**: `http://localhost:3000`
- **Admin Management Portal**: `http://localhost:3000/admin/login`

---

## 5. Building for Production

Compile and bundle the production-ready static assets:

```bash
npm run build
```

This compiles optimized HTML, JavaScript, and CSS bundles into the `Frontend/dist/` directory.

You can preview the production bundle locally with:

```bash
npm run preview
```

---

## 6. Key Application Routes

### Customer Storefront
- `/` — Homepage (Hero banner, royal category grid, featured sarees, artisan story)
- `/products` — Saree Catalog (Live search, category, fabric, color, price filters, and sorting)
- `/products/:id` — Product Details (Multi-image thumbnail gallery, specifications table, stock status, bag and wishlist triggers)
- `/cart` — Shopping Bag (Live quantities, stock boundaries, free shipping threshold progress, subtotal calculation)
- `/wishlist` — Saved Sarees (Quick add to bag, remove item, empty state)
- `/checkout` — Secure 2-Step Checkout (Address book selector, Add address modal, COD & Razorpay selector, backend order placement)
- `/orders` — Order History (Order cards, status badges, previews)
- `/orders/:id` — Order Tracking (Live Shiprocket logistics timeline, courier partner details, AWB tracking link, order cancellation, return request modal)
- `/returns` — Returns & Refunds Center (Return request status timeline, reverse pickup AWB, refund audit trail)
- `/profile` — Customer Account (Personal information update, address manager, password change)
- `/login` & `/register` — Customer Authentication

### Admin Management Portal
- `/admin/login` — Administrative authentication
- `/admin/dashboard` — High-level statistics (Total sarees, orders, pending fulfillment, delivered, revenue) and recent orders
- `/admin/products` — Saree inventory table with search, stock counts, active states, and deactivation
- `/admin/products/add` — Add new saree form with multiple photo selector (up to 6 images) and primary image designation
- `/admin/products/edit/:id` — Edit saree attributes, delete individual Cloudinary photos, and append new images
- `/admin/categories` — Categories manager with add/edit modals and deactivation
- `/admin/orders` — Order lifecycle status updater (`PENDING`, `CONFIRMED`, `PACKED`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) and Shiprocket fulfillment info
- `/admin/returns` — Customer return request reviewer (Approve, reject, assign reverse pickup AWB)
- `/admin/refunds` — Refund audit trail and reimbursement processor
- `/admin/customers` — Registered customers directory

---

## 7. Connecting to Backend Endpoints

The frontend uses a centralized Axios client (`src/api/apiClient.js`) that automatically injects the customer's JWT token:
```
Authorization: Bearer <token>
```

When new backend endpoints are completed in `server/`, simply check `TODO_BACKEND.md` and remove the fallback mocks from the corresponding API module (`src/api/paymentApi.js`, `src/api/returnApi.js`, `src/api/refundApi.js`, `src/api/adminApi.js`).
