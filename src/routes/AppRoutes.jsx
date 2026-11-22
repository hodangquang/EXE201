import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import { ROLES } from '../utils/constants';

// Pages
import HomePage from '../pages/Home/HomePage';
import AboutPage from '../pages/About/AboutPage';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import ProductList from '../pages/Products/ProductList';
import CatalogDrafts from '../pages/Products/CatalogDrafts';
import ProductDetail from '../pages/Products/ProductDetail';
import ProductForm from '../pages/Products/ProductForm';
import Categories from '../pages/Products/Categories';
import Brands from '../pages/Products/Brands';
import SourcingRequests from '../pages/Collections/SourcingRequests';
import ProjectList from '../pages/Upcycling/ProjectList';
import ProjectDetail from '../pages/Upcycling/ProjectDetail';
import QualityCheck from '../pages/Upcycling/QualityCheck';
import OrderList from '../pages/Orders/OrderList';
import OrderDetail from '../pages/Orders/OrderDetail';
import ShippingPage from '../pages/Shipping/ShippingPage';
import CustomerList from '../pages/Customers/CustomerList';
import CustomerDetail from '../pages/Customers/CustomerDetail';
import InventoryList from '../pages/Inventory/InventoryList';
import ReportsPage from '../pages/Reports/ReportsPage';
import StaffList from '../pages/Staff/StaffList';
import NotFound from '../pages/NotFound/NotFound';
import StoreProductPage from '../pages/Store/StoreProductPage';
import NewInPage from '../pages/Store/NewInPage';
import WomenPage from '../pages/Store/WomenPage';
import MenPage from '../pages/Store/MenPage';
import RainsWorldPage from '../pages/Store/RainsWorldPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import PaymentWaitingPage from '../pages/Checkout/PaymentWaitingPage';
import StorefrontCartLayout from '../layouts/StorefrontCartLayout';
import NotificationCenter from '../components/common/NotificationCenter';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<StorefrontCartLayout />}>
        {/* Public storefront pages share the same cart drawer and API state. */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product/:id" element={<StoreProductPage />} />
        <Route path="/product" element={<Navigate to="/new-in" replace />} />
        <Route path="/store/:id" element={<StoreProductPage />} />
        <Route path="/new-in" element={<NewInPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/world" element={<RainsWorldPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/orders/:id" element={<ProfilePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      {/* Admin shortcut */}
      <Route path="/admin" element={<Navigate to="/login" replace />} />

      {/* Public Login route */}
      <Route path="/login" element={<Login />} />
      <Route path="/payment/waiting" element={<PaymentWaitingPage />} />

      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF, ROLES.SHIPPER]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/notifications" element={<NotificationCenter admin />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredRole={ROLES.SHIPPER} />}>
        <Route element={<AdminLayout />}>
          <Route path="/shipper/orders" element={<ShippingPage />} />
          <Route path="/shipper/orders/:id" element={<ShippingPage />} />
        </Route>
      </Route>

      {/* Protected routes inside AdminLayout */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.STAFF]} />}>
        <Route element={<AdminLayout />}>
          {/* Admin-only routes */}
          <Route element={<ProtectedRoute requiredRole={ROLES.ADMIN} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products/new" element={<Navigate to="/upcycling" replace />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/products/brands" element={<Brands />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/promotions" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Shared routes (Both ADMIN and STAFF) */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/drafts" element={<CatalogDrafts />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/categories" element={<Categories />} />

          <Route path="/collections" element={<Navigate to="/collections/sourcing" replace />} />
          <Route path="/collections/sourcing" element={<SourcingRequests />} />
          <Route path="/collections/inspection" element={<Navigate to="/inventory" replace />} />
          <Route path="/collections/:id" element={<Navigate to="/collections/sourcing" replace />} />

          <Route path="/upcycling" element={<ProjectList />} />
          <Route path="/upcycling/:id" element={<ProjectDetail />} />
          <Route path="/upcycling/qc" element={<QualityCheck />} />

          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/shipping" element={<ShippingPage />} />

          <Route path="/inventory" element={<InventoryList />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
