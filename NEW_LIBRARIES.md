# New Libraries Documentation (NEW_LIBRARIES.md)

This file tracks all third-party libraries installed for the Nilmadhav Saree Store frontend, adhering to the minimal dependency policy.

---

## 1. `react-router-dom`
- **Version**: `^7.18.3`
- **Why it was added**:
  Essential for multi-page client-side routing, navigation, URL parameters (`/products/:slug`, `/orders/:id`, `/admin/products/edit/:id`), search query strings, and protected customer and admin route wrappers.
- **Where it is used**:
  - `src/routes/AppRoutes.jsx` (Route definitions)
  - `src/routes/ProtectedRoute.jsx` & `src/routes/AdminRoute.jsx`
  - `src/components/layout/Navbar.jsx`, `src/components/layout/Footer.jsx`, `src/components/layout/AdminLayout.jsx`
  - All customer and admin pages for navigation (`useNavigate`, `useLocation`, `useParams`, `Link`, `NavLink`).

---

## 2. `axios`
- **Version**: `^1.20.0`
- **Why it was added**:
  Centralized HTTP client with automatic JSON parsing, request/response interceptors for Bearer token injection, centralized 401 unauthenticated redirect, and robust handling of `multipart/form-data` image uploads to backend Cloudinary endpoints.
- **Where it is used**:
  - `src/api/apiClient.js` (Centralized Axios instance and interceptors)
  - `src/api/authApi.js`, `src/api/productApi.js`, `src/api/categoryApi.js`, `src/api/cartApi.js`, `src/api/wishlistApi.js`, `src/api/addressApi.js`, `src/api/orderApi.js`, etc.

---

## 3. `lucide-react`
- **Version**: `^1.40.0`
- **Why it was added**:
  Provides lightweight, crisp, tree-shakeable SVG icons required for a modern e-commerce user experience (shopping bag, wishlist heart, search magnifying glass, user profile, delivery truck, filters, stars, chevron selectors, checkmarks, alerts, and close triggers) without bulky icon font files.
- **Where it is used**:
  - `src/components/layout/Navbar.jsx` (Shopping bag, wishlist, account, search, mobile menu)
  - `src/components/product/ProductCard.jsx`, `ProductFilters.jsx`, `ProductGallery.jsx`
  - `src/components/order/OrderTimeline.jsx` (Shiprocket shipping status icons)
  - `src/components/common/Toast.jsx`, `Modal.jsx`, `EmptyState.jsx`
  - All Admin portal tables and navigation items.
