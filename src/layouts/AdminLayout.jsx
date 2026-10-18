import React, { useState } from 'react';
import { ConfigProvider, Layout } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import '../styles/AdminQuality.css';

const { Content } = Layout;

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  const isDemo = ['/dashboard', '/collections', '/upcycling', '/orders', '/inventory', '/promotions', '/settings'].some(path => pathname === path || pathname.startsWith(`${path}/`)) && pathname !== '/collections/sourcing';

  return (
    <ConfigProvider locale={viVN} theme={{ token: { fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' } }}>
    <Layout className="rw-admin" style={{ minHeight: '100vh', backgroundColor: '#efefef' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout className="rw-admin-workspace" style={{ backgroundColor: '#efefef' }}>
        <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed(value => !value)} />
        <Content
          className="rw-admin-content"
        >
          {isDemo && <p className="rw-demo-notice">Giao diện minh họa · Dữ liệu và thao tác trên màn hình này chưa được lưu trên máy chủ.</p>}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
