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
  Inbox,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationCount } from './NotificationCenter';
import { ROLES } from '../../utils/constants';

const { Sider } = Layout;

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const unreadCount = useNotificationCount(Boolean(user));
  const isAdmin = user?.role === ROLES.ADMIN;
  const isShipper = user?.role === ROLES.SHIPPER;

  const notificationLabel = (
    <span className="rw-admin-menu-label-row">
      <span>Thông báo</span>
      {unreadCount > 0 && (
        <span className="rw-admin-sidebar-badge">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </span>
  );

  const menuItems = isShipper
    ? [
        { key: '/notifications', icon: <Bell size={17} strokeWidth={1.9} />, label: notificationLabel },
        { key: '/shipper/orders', icon: <Truck size={17} strokeWidth={1.9} />, label: 'Đơn giao hàng (Bán lẻ)' },
        { key: '/shipper/orders?mode=pickup', icon: <Boxes size={17} strokeWidth={1.9} />, label: 'Thu gom đồ cũ (Inbound)' },
        { key: '/shipper/orders?mode=history', icon: <BarChart3 size={17} strokeWidth={1.9} />, label: 'Lịch sử & Hiệu suất' },
      ]
    : [
        ...(isAdmin
          ? [
              {
                key: '/dashboard',
                icon: <LayoutDashboard size={17} strokeWidth={1.9} />,
                label: 'Tổng quan kinh doanh',
              },
            ]
          : []),
        {
          key: '/notifications',
          icon: <Bell size={17} strokeWidth={1.9} />,
          label: notificationLabel,
        },
        {
          key: 'products-group',
          icon: <Shirt size={17} strokeWidth={1.9} />,
          label: 'Sản phẩm (1-of-1)',
          children: [
            { key: '/products', label: 'Tất cả sản phẩm' },
            ...(isAdmin ? [{ key: '/products/new', label: 'Tạo từ dự án tái chế' }] : []),
            { key: '/products/categories', label: 'Danh mục' },
            ...(isAdmin ? [{ key: '/products/brands', label: 'Thương hiệu' }] : []),
          ],
        },
        {
          key: 'collections-group',
          icon: <Inbox size={17} strokeWidth={1.9} />,
          label: 'Thu gom quần áo',
          children: [{ key: '/collections/sourcing', label: 'Yêu cầu thu mua' }],
        },
        {
          key: 'upcycling-group',
          icon: <Recycle size={17} strokeWidth={1.9} />,
          label: 'Tái chế và QC',
          children: [
            { key: '/upcycling', label: 'Dự án tái chế' },
            { key: '/upcycling/qc', label: 'Kiểm định thành phẩm' },
          ],
        },
        {
          key: '/orders',
          icon: <ShoppingBag size={17} strokeWidth={1.9} />,
          label: 'Đơn hàng',
        },
        {
          key: '/shipping',
          icon: <Truck size={17} strokeWidth={1.9} />,
          label: 'Vận chuyển',
        },
        {
          key: '/inventory',
          icon: <Boxes size={17} strokeWidth={1.9} />,
          label: 'Kho vòng đời',
        },
        ...(isAdmin
          ? [
              {
                key: '/customers',
                icon: <Users size={17} strokeWidth={1.9} />,
                label: 'Khách hàng',
              },
            ]
          : []),
      ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const paths = menuItems.flatMap((item) => item.children || [item]).map((item) => item.key);
  const currentPath = location.pathname + location.search;
  const selectedKey =
    paths.find((path) => path === currentPath) ||
    [...paths]
      .sort((a, b) => b.length - a.length)
      .find((path) => location.pathname === path || location.pathname.startsWith(`${path}/`)) ||
    paths[0];

  return (
    <Sider
      id="rw-admin-sidebar"
      className="rw-admin-sider"
      inert={collapsed}
      trigger={null}
      breakpoint="lg"
      collapsedWidth={0}
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={264}
      theme="dark"
    >
      <div className="rw-admin-sider-inner">
        {/* Brand Header */}
        <Link
          className="rw-admin-brand"
          to={isShipper ? '/shipper/orders' : isAdmin ? '/dashboard' : '/collections/sourcing'}
          aria-label={isShipper ? 'REWEAR — Giao hàng' : 'REWEAR — Quản trị'}
        >
          {collapsed ? (
            <div className="rw-admin-brand-mark">RW</div>
          ) : (
            <div className="rw-admin-brand-wrap">
              <div className="rw-admin-brand-badge">RW</div>
              <div className="rw-admin-brand-text">
                <div className="rw-admin-brand-title">
                  REWEAR
                  <span className="rw-admin-brand-tag">
                    {isShipper ? 'SHIP' : isAdmin ? 'ADMIN' : 'OPS'}
                  </span>
                </div>
                <div className="rw-admin-brand-sub">Thời trang tuần hoàn</div>
              </div>
            </div>
          )}
        </Link>

        {/* Navigation Menu */}
        <div className="rw-admin-menu-scroll">
          {!collapsed && (
            <div className="rw-admin-menu-section-title">
              {isShipper ? 'ĐIỀU PHỐI GIAO NHẬN' : 'ĐIỀU HÀNH HỆ THỐNG'}
            </div>
          )}
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={['products-group', 'collections-group', 'upcycling-group']}
            items={menuItems}
            onClick={handleMenuClick}
            className="rw-admin-menu"
          />
        </div>

        {/* Footer quick link to Storefront */}
        {!collapsed && (
          <div className="rw-admin-sider-footer">
            <Link to="/" className="rw-admin-store-link">
              <span>Xem trang cửa hàng</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default Sidebar;
