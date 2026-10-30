import React from 'react';
import { Layout, Space, Dropdown, Avatar } from 'antd';
import {
  User,
  LogOut,
  ShieldCheck,
  UserCheck,
  Menu,
  Bell,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotificationCount } from './NotificationCenter';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';

const { Header: AntHeader } = Layout;

export const Header = ({ collapsed, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useNotificationCount(Boolean(user));
  const isShipper = user?.role === ROLES.SHIPPER;

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

  return (
    <AntHeader
      className="rw-admin-header"
      style={{
        padding: '0 32px',
        backgroundColor: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e5e4',
        height: 64,
        position: 'sticky',
        top: 0,
        zIndex: 99,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button type="button" className="rw-admin-nav-toggle" aria-label={collapsed ? 'Mở menu' : 'Thu gọn menu'} aria-expanded={!collapsed} aria-controls="rw-admin-sidebar" onClick={onToggleSidebar}><Menu size={20} /></button>
        <span className="editorial-sub" style={{ color: '#70706f' }}>
          REWEAR · {isShipper ? 'Giao hàng' : 'Quản trị'}
        </span>
      </div>

      <Space size={20}>
        <button type="button" onClick={() => navigate('/notifications')} aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ''}`} title="Thông báo"
          style={{ position: 'relative', border: '1px solid #e5e5e4', borderRadius: '50%', width: 38, height: 38, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Bell size={18} />{unreadCount > 0 && <span aria-hidden="true" style={{ position: 'absolute', top: -6, right: -6, borderRadius: 10, background: '#111', color: '#fff', fontSize: 10, lineHeight: '18px', minWidth: 18, height: 18 }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
        {/* Role returned by the existing session; no client-side role switching. */}
        <span
          className="rw-admin-role"
          style={{
            background: user?.role === ROLES.ADMIN ? '#10100f' : '#f0f0ef',
            color: user?.role === ROLES.ADMIN ? '#ffffff' : '#10100f',
            border: 'none',
            borderRadius: '9999px',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.4px',
            textTransform: 'uppercase',
            transition: 'all 0.2s ease',
          }}
        >
          {user?.role === ROLES.ADMIN ? <ShieldCheck size={14} /> : <UserCheck size={14} />}
          <span>{isShipper ? 'Người giao hàng' : user?.role === ROLES.ADMIN ? 'Quản trị viên' : 'Nhân viên'}</span>
        </span>

        {/* User Profile */}
        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <button type="button" className="rw-admin-account" aria-label="Menu tài khoản">
            <Avatar src={user?.avatar} icon={<User size={16} />} style={{ backgroundColor: '#26292a' }} />
            <span className="rw-admin-account-copy" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#10100f' }}>{user?.fullName || user?.name}</span>
              <span style={{ fontSize: 11, color: '#70706f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{isShipper ? 'Người giao hàng' : user?.role === ROLES.ADMIN ? 'Quản trị viên' : 'Nhân viên'}</span>
            </span>
          </button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
