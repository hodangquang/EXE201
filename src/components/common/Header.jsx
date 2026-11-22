import React from 'react';
import { Layout, Dropdown, Avatar } from 'antd';
import {
  User,
  LogOut,
  ShieldCheck,
  UserCheck,
  Menu,
  Bell,
  Store,
  ChevronRight,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useNotificationCount } from './NotificationCenter';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

const { Header: AntHeader } = Layout;

const resolveSectionTitle = (pathname) => {
  if (pathname.startsWith('/dashboard')) return ['Tổng quan', 'Hiệu quả kinh doanh & đối soát'];
  if (pathname.startsWith('/notifications')) return ['Trung tâm thông báo', 'Cập nhật vận hành'];
  if (pathname.startsWith('/products/categories')) return ['Sản phẩm (1-of-1)', 'Quản lý danh mục'];
  if (pathname.startsWith('/products/brands')) return ['Sản phẩm (1-of-1)', 'Quản lý thương hiệu'];
  if (pathname.startsWith('/products/drafts')) return ['Sản phẩm (1-of-1)', 'Bản lưu ý tưởng'];
  if (pathname.startsWith('/products')) return ['Sản phẩm (1-of-1)', 'Danh mục độc bản'];
  if (pathname.startsWith('/collections')) return ['Thu gom quần áo', 'Yêu cầu thu mua đồ cũ'];
  if (pathname.startsWith('/upcycling/qc')) return ['Tái chế & QC', 'Kiểm định thành phẩm'];
  if (pathname.startsWith('/upcycling')) return ['Tái chế & QC', 'Dự án tái chế'];
  if (pathname.startsWith('/orders')) return ['Thương mại', 'Quản lý đơn hàng'];
  if (pathname.startsWith('/shipping') || pathname.startsWith('/shipper')) return ['Vận chuyển', 'Điều phối & giao nhận'];
  if (pathname.startsWith('/inventory')) return ['Kho vận', 'Kho vòng đời'];
  if (pathname.startsWith('/customers')) return ['Khách hàng', 'Hồ sơ thành viên'];
  return ['Hệ thống', 'Bảng điều khiển'];
};

export const Header = ({ collapsed, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotificationCount(Boolean(user));
  const isShipper = user?.role === ROLES.SHIPPER;
  const [groupLabel, pageLabel] = resolveSectionTitle(location.pathname);

  const userMenu = {
    items: [
      {
        key: 'profile-info',
        label: (
          <div style={{ padding: '6px 10px' }}>
            <div style={{ fontWeight: 600, color: '#10100f' }}>{user?.fullName || user?.name}</div>
            <div style={{ fontSize: 12, color: '#70706f' }}>{user?.email}</div>
          </div>
        ),
      },
      { type: 'divider' },
      {
        key: 'logout',
        danger: true,
        icon: <LogOut size={14} />,
        label: 'Đăng xuất',
        onClick: logout,
      },
    ],
  };

  const roleText = isShipper
    ? 'Người giao hàng'
    : user?.role === ROLES.ADMIN
      ? 'Quản trị viên'
      : 'Nhân viên';

  return (
    <AntHeader className="rw-admin-header">
      <div className="rw-admin-header-left">
        <button
          type="button"
          className="rw-admin-nav-toggle"
          aria-label={collapsed ? 'Mở menu' : 'Thu gọn menu'}
          aria-expanded={!collapsed}
          aria-controls="rw-admin-sidebar"
          onClick={onToggleSidebar}
        >
          <Menu size={19} />
        </button>

        <div className="rw-admin-breadcrumb">
          <span className="rw-admin-breadcrumb-brand">
            REWEAR · {isShipper ? 'Giao hàng' : 'Quản trị'}
          </span>
          <ChevronRight size={14} className="rw-admin-breadcrumb-sep" />
          <span className="rw-admin-breadcrumb-group">{groupLabel}</span>
          <ChevronRight size={14} className="rw-admin-breadcrumb-sep" />
          <strong className="rw-admin-breadcrumb-current">{pageLabel}</strong>
        </div>
      </div>

      <div className="rw-admin-header-right">
        <Link to="/" className="rw-admin-header-store" title="Mở trang cửa hàng">
          <Store size={15} />
          <span>Cửa hàng</span>
        </Link>

        <button
          type="button"
          className={`rw-admin-notif-btn${unreadCount > 0 ? ' has-unread' : ''}`}
          onClick={() => navigate('/notifications')}
          aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`}
          title="Thông báo"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="rw-admin-notif-badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Role returned by the existing session; no client-side role switching. */}
        <span className={`rw-admin-role${user?.role === ROLES.ADMIN ? ' is-admin' : ''}`}>
          {user?.role === ROLES.ADMIN ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
          <span>{roleText}</span>
        </span>

        {/* User Profile */}
        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <button type="button" className="rw-admin-account" aria-label="Menu tài khoản">
            <Avatar src={user?.avatar} icon={<User size={16} />} style={{ backgroundColor: '#10100f' }} />
            <span className="rw-admin-account-copy">
              <span className="rw-admin-account-name">{user?.fullName || user?.name}</span>
              <span className="rw-admin-account-role">{roleText}</span>
            </span>
          </button>
        </Dropdown>
      </div>
    </AntHeader>
  );
};

export default Header;
