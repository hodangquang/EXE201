import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import CartDrawer from '../components/common/CartDrawer';
import '../styles/StorefrontQuality.css';

export default function StorefrontCartLayout() {
  const { pathname } = useLocation();
  const content = <><Outlet /><CartDrawer /></>;
  return (
    <CartProvider>
      {pathname === '/' ? content : <div className="rw-storefront-quality">{content}</div>}
    </CartProvider>
  );
}
