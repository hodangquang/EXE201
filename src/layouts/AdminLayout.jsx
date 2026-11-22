import React, { useState } from 'react';
import { ConfigProvider, Layout } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { themeConfig } from '../styles/theme';
import '../styles/AdminQuality.css';

const { Content } = Layout;

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ConfigProvider locale={viVN} theme={themeConfig}>
      <Layout className="rw-admin">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <Layout className="rw-admin-workspace">
          <Header collapsed={collapsed} onToggleSidebar={() => setCollapsed((value) => !value)} />
          <Content className="rw-admin-content">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AdminLayout;
