import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { themeConfig } from './styles/theme';
import AppRoutes from './routes/AppRoutes';
import GlobalLoader from './components/common/GlobalLoader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ConfigProvider theme={themeConfig}>
      <AuthProvider>
        <GlobalLoader />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
