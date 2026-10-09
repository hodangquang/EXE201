import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';
import { Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';

const { Title, Text } = Typography;

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ROLES.ADMIN);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await login(values.email, values.password);
      const role = data.data?.role || data.role || '';
      message.success(`Đăng nhập thành công với vai trò ${role}`);
      navigate(role === ROLES.ADMIN ? '/dashboard' : '/collections');
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#efefef',
      }}
    >
      {/* Editorial Left Hero - As per DESIGN (1).md Nordic catalog styling */}
      <div
        style={{
          flex: '1 1 50%',
          position: 'relative',
          backgroundColor: '#10100f',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          color: '#ffffff',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(to bottom, rgba(16,16,15,0.1) 0%, rgba(16,16,15,0.85) 100%), url(https://images.pexels.com/photos/19392457/pexels-photo-19392457.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Content Overlay */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '4px',
              backgroundColor: '#fffb85',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10100f',
              transform: 'rotate(45deg)',
            }}
          >
            <div style={{ transform: 'rotate(-45deg)', display: 'flex' }}>
              <Sparkles size={16} strokeWidth={2.5} />
            </div>
          </div>
          <span
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}
          >
            REWEAR
          </span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 'clamp(48px, 6vw, 84px)',
              fontWeight: 700,
              lineHeight: 0.85,
              color: '#fffb85', // Butter cream accent
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '24px',
              textShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            UPCYCLED<br />STUDIO
          </div>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              maxWidth: '440px',
              lineHeight: 1.6,
              color: '#efefef',
              fontWeight: 400,
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            Nền tảng quản trị vòng đời thời trang tuần hoàn. Từ khâu thu gom quần áo cũ, phân loại, khử khuẩn, tái thiết kế thành các tác phẩm độc bản 1-of-1 đến khách hàng.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 1, fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#b3b3b2', letterSpacing: '0.5px' }}>
          REWEAR VIETNAM © 2026 — CIRCULAR FASHION INITIATIVE
        </div>
      </div>

      {/* Right Login Form */}
      <div
        style={{
          flex: '1 1 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          backgroundColor: '#efefef',
        }}
      >
        <div
          className="flat-card"
          style={{
            width: '100%',
            maxWidth: '440px',
            padding: '48px 40px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e5e4',
          }}
        >
          <div style={{ marginBottom: '32px' }}>
            <div className="editorial-sub" style={{ marginBottom: '8px' }}>
              REWEAR PORTAL
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '28px',
                fontWeight: 600,
                color: '#10100f',
                letterSpacing: '-0.5px',
              }}
            >
              Đăng nhập quản trị
            </div>
            <Text type="secondary" style={{ fontSize: '13px', display: 'block', marginTop: '6px' }}>
              Chọn vai trò và nhập thông tin để truy cập hệ thống
            </Text>
          </div>



          <Form
            layout="vertical"
            initialValues={{
              email: '',
              password: 'password123',
              remember: true,
            }}
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              name="email"
              label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</span>}
              rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
            >
              <Input
                prefix={<Mail size={16} color="#70706f" style={{ marginRight: 6 }} />}
                placeholder="admin@rewear.vn"
                style={{ height: '42px', borderRadius: 0 }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mật khẩu</span>}
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<Lock size={16} color="#70706f" style={{ marginRight: 6 }} />}
                placeholder="••••••••"
                style={{ height: '42px', borderRadius: 0 }}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ fontSize: '13px' }}>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <a href="#forgot" style={{ fontSize: '12px', color: '#10100f', textDecoration: 'underline' }}>
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pill-btn-filled"
              style={{
                width: '100%',
                height: '44px',
                fontSize: '13px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              <span>{loading ? 'Đang xác thực...' : 'Truy cập hệ thống'}</span>
              <ArrowRight size={16} />
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
