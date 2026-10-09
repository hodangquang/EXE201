import React from 'react';
import { Outlet } from 'react-router-dom';
import { CartProvider } from '../contexts/CartContext';
import CartDrawer from '../components/common/CartDrawer';

export default function StorefrontCartLayout() {
  return (
    <CartProvider>
      <Outlet />
      <CartDrawer />
    </CartProvider>
  );
}
