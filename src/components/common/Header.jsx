import React from 'react';
import { Layout, Space, Badge, Dropdown, Avatar } from 'antd';
import {
  Bell,
  User,
  LogOut,
  ShieldCheck,
  UserCheck,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';
import { mockNotifications } from '../../data/mockData';

const { Header: AntHeader } = Layout;

export const Header = ({ collapsed, onToggleSidebar }) => {
  const { user, logout } = useAuth();

  const notificationMenu = {
    items: [
      {
        key: 'header',
        label: (
          <div style={{ padding: '6px 12px', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Thông báo ({mockNotifications.filter(n => !n.read).length})
          </div>
        ),
      },
      { type: 'divider' },
      ...mockNotifications.map((notif) => ({
        key: notif.id,
        label: (
          <div style={{ maxWidth: 300, padding: '6px 8px' }}>
            <div style={{ fontWeight: notif.read ? 400 : 600, fontSize: 13, color: '#10100f' }}>
              {notif.title}
            </div>
            <div style={{ fontSize: 12, color: '#70706f', marginTop: 3 }}>
              {notif.message}
            </div>
            <div style={{ fontSize: 11, color: '#b3b3b2', marginTop: 5 }}>
              {notif.time}
            </div>
          </div>
        ),
      })),
    ],
  };

  const userMenu = {
    items: [
      {
        key: 'profile-info',
        label: (
          <div style={{ padding: '6px 10px' }}>
            <div style={{ fontWeight: 600, color: '#10100f' }}>{user?.name}</div>
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
        <button type="button" className="rw-admin-nav-toggle" aria-label={collapsed ? 'Mở menu quản trị' : 'Thu gọn menu quản trị'} aria-expanded={!collapsed} aria-controls="rw-admin-sidebar" onClick={onToggleSidebar}><Menu size={20} /></button>
        <span className="editorial-sub" style={{ color: '#70706f' }}>
          REWEAR · Quản trị
        </span>
      </div>

      <Space size={20}>
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
          <span>{user?.role === ROLES.ADMIN ? 'Quản trị viên' : 'Nhân viên'}</span>
        </span>

        {/* Notifications */}
        <Dropdown menu={notificationMenu} placement="bottomRight" trigger={['click']}>
          <Badge count={mockNotifications.filter(n => !n.read).length} size="small" offset={[-2, 4]} color="#10100f">
            <button
              type="button"
              aria-label="Thông báo minh họa"
              style={{
                width: 44,
                height: 44,
                borderRadius: '9999px',
                border: '1px solid #e5e5e4',
                background: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={16} color="#10100f" />
            </button>
          </Badge>
        </Dropdown>

        {/* User Profile */}
        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <button type="button" className="rw-admin-account" aria-label="Menu tài khoản">
            <Avatar src={user?.avatar} icon={<User size={16} />} style={{ backgroundColor: '#26292a' }} />
            <span className="rw-admin-account-copy" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: '#10100f' }}>{user?.name}</span>
              <span style={{ fontSize: 11, color: '#70706f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user?.role}</span>
            </span>
          </button>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};

export default Header;
