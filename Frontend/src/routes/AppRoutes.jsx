import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import CustomerLayout from '../components/layout/CustomerLayout';
import AdminLayout from '../components/layout/AdminLayout';

// Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Customer Pages
import HomePage from '../pages/customer/HomePage';
import ShopPage from '../pages/customer/ShopPage';
import ProductDetailPage from '../pages/customer/ProductDetailPage';
import CartPage from '../pages/customer/CartPage';
import WishlistPage from '../pages/customer/WishlistPage';
import CheckoutPage from '../pages/customer/CheckoutPage';
import OrdersPage from '../pages/customer/OrdersPage';
import OrderDetailPage from '../pages/customer/OrderDetailPage';
import ReturnsPage from '../pages/customer/ReturnsPage';
import ProfilePage from '../pages/customer/ProfilePage';
import LoginPage from '../pages/customer/LoginPage';
import RegisterPage from '../pages/customer/RegisterPage';
import NotFoundPage from '../pages/customer/NotFoundPage';

// Admin Pages
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminProductAddPage from '../pages/admin/AdminProductAddPage';
import AdminProductEditPage from '../pages/admin/AdminProductEditPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminReturnsPage from '../pages/admin/AdminReturnsPage';
import AdminRefundsPage from '../pages/admin/AdminRefundsPage';
import AdminCustomersPage from '../pages/admin/AdminCustomersPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ShopPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Customer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/returns"
          element={
            <ProtectedRoute>
              <ReturnsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Public Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/add" element={<AdminProductAddPage />} />
        <Route path="products/edit/:id" element={<AdminProductEditPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="returns" element={<AdminReturnsPage />} />
        <Route path="refunds" element={<AdminRefundsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
