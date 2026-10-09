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
import ProductDetail from '../pages/Products/ProductDetail';
import ProductForm from '../pages/Products/ProductForm';
import Categories from '../pages/Products/Categories';
import Brands from '../pages/Products/Brands';
import CollectionList from '../pages/Collections/CollectionList';
import CollectionDetail from '../pages/Collections/CollectionDetail';
import Inspection from '../pages/Collections/Inspection';
import SourcingRequests from '../pages/Collections/SourcingRequests';
import ProjectList from '../pages/Upcycling/ProjectList';
import ProjectDetail from '../pages/Upcycling/ProjectDetail';
import QualityCheck from '../pages/Upcycling/QualityCheck';
import OrderList from '../pages/Orders/OrderList';
import OrderDetail from '../pages/Orders/OrderDetail';
import CustomerList from '../pages/Customers/CustomerList';
import CustomerDetail from '../pages/Customers/CustomerDetail';
import InventoryList from '../pages/Inventory/InventoryList';
import PromotionList from '../pages/Promotions/PromotionList';
import ReportsPage from '../pages/Reports/ReportsPage';
import StaffList from '../pages/Staff/StaffList';
import SettingsPage from '../pages/Settings/SettingsPage';
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

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<StorefrontCartLayout />}>
        {/* Public storefront pages share the same cart drawer and API state. */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/product/:id" element={<StoreProductPage />} />
        <Route path="/product" element={<Navigate to="/product/suva-hardshell-jacket" replace />} />
        <Route path="/store/:id" element={<StoreProductPage />} />
        <Route path="/new-in" element={<NewInPage />} />
        <Route path="/women" element={<WomenPage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/world" element={<RainsWorldPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      {/* Admin shortcut */}
      <Route path="/admin" element={<Navigate to="/login" replace />} />

      {/* Public Login route */}
      <Route path="/login" element={<Login />} />
      <Route path="/payment/waiting" element={<PaymentWaitingPage />} />

      {/* Protected routes inside AdminLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          {/* Admin-only routes */}
          <Route element={<ProtectedRoute requiredRole={ROLES.ADMIN} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm />} />
            <Route path="/products/brands" element={<Brands />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/promotions" element={<PromotionList />} />

            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Shared routes (Both ADMIN and STAFF) */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/products/categories" element={<Categories />} />

          <Route path="/collections" element={<CollectionList />} />
          <Route path="/collections/sourcing" element={<SourcingRequests />} />
          <Route path="/collections/:id" element={<CollectionDetail />} />
          <Route path="/collections/inspection" element={<Inspection />} />

          <Route path="/upcycling" element={<ProjectList />} />
          <Route path="/upcycling/:id" element={<ProjectDetail />} />
          <Route path="/upcycling/qc" element={<QualityCheck />} />

          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />

          <Route path="/inventory" element={<InventoryList />} />

          {/* 404 Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
