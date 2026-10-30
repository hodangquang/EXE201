import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  Recycle,
  ShoppingBag,
  Truck,
  Users,
  Boxes,
  BarChart3,
  UserCog,
  Inbox,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

const { Sider } = Layout;

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;
  const isShipper = user?.role === ROLES.SHIPPER;

  const menuItems = isShipper ? [
    { key: '/notifications', icon: <Bell size={17} strokeWidth={1.8} />, label: 'Thông báo' },
    { key: '/shipper/orders', icon: <Truck size={17} strokeWidth={1.8} />, label: 'Đơn giao hàng (Bán lẻ)' },
    { key: '/shipper/orders?mode=pickup', icon: <Boxes size={17} strokeWidth={1.8} />, label: 'Thu gom đồ cũ (Inbound)' },
    { key: '/shipper/orders?mode=history', icon: <BarChart3 size={17} strokeWidth={1.8} />, label: 'Lịch sử & Hiệu suất' },
  ] : [
    { key: '/notifications', icon: <Bell size={17} strokeWidth={1.8} />, label: 'Thông báo' },
    ...(isAdmin ? [{
      key: '/dashboard',
      icon: <LayoutDashboard size={17} strokeWidth={1.8} />,
      label: 'Tổng quan',
    }] : []),

    {
      key: 'products-group',
      icon: <Shirt size={17} strokeWidth={1.8} />,
      label: 'Sản phẩm (1-of-1)',
      children: [
        {
          key: '/products',
          label: 'Tất cả sản phẩm',
        },
        ...(isAdmin ? [{
          key: '/products/new',
          label: 'Tạo từ dự án tái chế',
        }] : []),
        {
          key: '/products/categories',
          label: 'Danh mục',
        },
        ...(isAdmin ? [{
          key: '/products/brands',
          label: 'Thương hiệu',
        }] : []),
      ],
    },

    {
      key: 'collections-group',
      icon: <Inbox size={17} strokeWidth={1.8} />,
      label: 'Thu gom quần áo',
      children: [
        {
          key: '/collections/sourcing',
          label: 'Yêu cầu thu mua',
        },
      ],
    },



    {
      key: 'upcycling-group', icon: <Recycle size={17} strokeWidth={1.8} />, label: 'Tái chế và QC',
      children: [{ key: '/upcycling', label: 'Dự án tái chế' }, { key: '/upcycling/qc', label: 'Kiểm định thành phẩm' }],
    },

    {
      key: '/orders',
      icon: <ShoppingBag size={17} strokeWidth={1.8} />,
      label: 'Đơn hàng',
    },
    {
      key: '/shipping',
      icon: <Truck size={17} strokeWidth={1.8} />,
      label: 'Vận chuyển',
    },

    ...(isAdmin ? [{
      key: '/customers',
      icon: <Users size={17} strokeWidth={1.8} />,
      label: 'Khách hàng ',
    }] : []),

    {
      key: '/inventory',
      icon: <Boxes size={17} strokeWidth={1.8} />,
      label: 'Kho vòng đời',
    },

  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const paths = menuItems.flatMap(item => item.children || [item]).map(item => item.key);
  const currentPath = location.pathname + location.search;
  const selectedKey = paths.find(path => path === currentPath) || paths.sort((a, b) => b.length - a.length).find(path => location.pathname === path || location.pathname.startsWith(`${path}/`)) || paths[0];

  return (
    <Sider
      id="rw-admin-sidebar"
      inert={collapsed}
      trigger={null}
      breakpoint="lg"
      collapsedWidth={0}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={250}
      theme="dark"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 100,
        backgroundColor: '#10100f', // Ink
        borderRight: '1px solid #26292a',
      }}
    >
      {/* Brand Header */}
      <Link className="rw-admin-brand" to={isShipper ? '/shipper/orders' : isAdmin ? '/dashboard' : '/collections/sourcing'} aria-label={isShipper ? 'REWEAR — Giao hàng' : 'REWEAR — Quản trị'}
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 24px',
          borderBottom: '1px solid #26292a',
          cursor: 'pointer',
        }}
      >
        {collapsed ? (
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 24,
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.05em',
            }}
          >
            RW
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div
              style={{
                fontFamily: "'Barlow Condensed', 'Inter', sans-serif",
                fontSize: 24,
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              REWEAR
            </div>
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9,
                fontWeight: 600,
                color: '#888888',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              Thời trang tuần hoàn
            </div>
          </div>
        )}
      </Link>

      {/* Navigation Menu */}
      <div style={{ padding: '12px 8px' }}>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['products-group', 'collections-group', 'upcycling-group']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            backgroundColor: 'transparent',
            borderRight: 0,
            fontSize: '13px',
          }}
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
