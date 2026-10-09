import React, { useState, useEffect } from 'react';
import './AuthModal.css';
import { apiUrl, saveSession } from '../../services/auth';

const AuthModal = ({ isOpen, onClose }) => {
  const [authMode, setAuthMode] = useState('register'); // 'login', 'register', 'forgot-password', 'verify-otp', 'reset-password'
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    birthDate: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'customer',
    otpCode: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'
  const [bgIndex, setBgIndex] = useState(0);

  const bgImages = [
    'https://images.pexels.com/photos/26936525/pexels-photo-26936525.jpeg',
    'https://images.pexels.com/photos/26964993/pexels-photo-26964993.jpeg',
    'https://images.pexels.com/photos/29685417/pexels-photo-29685417.jpeg',
    'https://images.pexels.com/photos/26936523/pexels-photo-26936523.jpeg',
  ];

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setMessage({ type: '', text: '' });
  };

  const callApi = async (endpoint, payload) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        throw new Error(data.message || data.title || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
      
      return { success: true, data };
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (authMode === 'register') {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        passwordConfirm: formData.passwordConfirm
      };
      const result = await callApi('/api/Auth/register', payload);
      if (result.success) {
        setMessage({ type: 'success', text: result.data.message || 'Đăng ký thành công! Vui lòng nhập mã OTP.' });
        setTimeout(() => switchMode('verify-otp'), 1500);
      }
    } 
    else if (authMode === 'login') {
      const payload = {
        email: formData.email,
        password: formData.password
      };
      const result = await callApi('/api/Auth/login', payload);
      if (result.success) {
        saveSession(result.data);
        setMessage({ type: 'success', text: 'Đăng nhập thành công!' });
        setTimeout(() => onClose(), 800);
      }
    }
    else if (authMode === 'forgot-password') {
      const payload = { email: formData.email };
      const result = await callApi('/api/Auth/forgot-password', payload);
      if (result.success) {
        setMessage({ type: 'success', text: 'Mã OTP đã được gửi. Vui lòng kiểm tra email.' });
        switchMode('reset-password');
      }
    }
    else if (authMode === 'verify-otp') {
      const payload = {
        email: formData.email,
        otpCode: formData.otpCode
      };
      const result = await callApi('/api/Auth/verify-otp', payload);
      if (result.success) {
        setMessage({ type: 'success', text: 'Xác thực OTP thành công!' });
        setTimeout(() => switchMode('login'), 1500);
      }
    }
    else if (authMode === 'reset-password') {
      const payload = {
        email: formData.email,
        otpCode: formData.otpCode,
        newPassword: formData.newPassword,
        newPasswordConfirm: formData.newPasswordConfirm
      };
      const result = await callApi('/api/Auth/reset-password', payload);
      if (result.success) {
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Bạn có thể đăng nhập.' });
        setTimeout(() => switchMode('login'), 1500);
      }
    }
  };

  const renderForm = () => {
    switch (authMode) {
      case 'login':
        return (
          <>
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="auth-links">
              <button type="button" className="text-btn" onClick={() => switchMode('forgot-password')}>Quên mật khẩu?</button>
            </div>
          </>
        );
      
      case 'forgot-password':
        return (
          <>
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
          </>
        );

      case 'verify-otp':
        return (
          <>
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="text" name="otpCode" placeholder="Mã OTP" value={formData.otpCode} onChange={handleChange} required />
            </div>
          </>
        );

      case 'reset-password':
        return (
          <>
            <div className="form-group">
              <input type="email" name="email" placeholder="Email (xác nhận)" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="text" name="otpCode" placeholder="Mã OTP" value={formData.otpCode} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="password" name="newPassword" placeholder="Mật khẩu mới" value={formData.newPassword} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <input type="password" name="newPasswordConfirm" placeholder="Xác nhận mật khẩu mới" value={formData.newPasswordConfirm} onChange={handleChange} required />
            </div>
          </>
        );

      case 'register':
      default:
        return (
          <>
            <div className="form-group">
              <input type="text" name="fullName" placeholder="Họ và tên" value={formData.fullName} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <input type="password" name="password" placeholder="Mật khẩu" value={formData.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <input type="password" name="passwordConfirm" placeholder="Xác nhận mật khẩu" value={formData.passwordConfirm} onChange={handleChange} required />
            </div>


            <div className="checkbox-group">
              <label>
                <input type="checkbox" required />
                <span className="checkmark"></span>
                <span className="checkbox-text">
                  Bằng việc tham gia, bạn đồng ý nhận thông báo từ chúng tôi. Có thể hủy đăng ký bất cứ lúc nào. Đọc thêm trong <a href="#">Chính sách Bảo mật</a>.
                </span>
              </label>
            </div>
          </>
        );
    }
  };

  const getTitles = () => {
    switch (authMode) {
      case 'login': return { title: 'Chào mừng trở lại.', subtitle: 'Đăng nhập vào tài khoản của bạn để tiếp tục.' };
      case 'forgot-password': return { title: 'Khôi phục mật khẩu.', subtitle: 'Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.' };
      case 'verify-otp': return { title: 'Xác thực OTP.', subtitle: 'Nhập mã được gửi đến email của bạn.' };
      case 'reset-password': return { title: 'Mật khẩu mới.', subtitle: 'Tạo mật khẩu mới cho tài khoản của bạn.' };
      case 'register':
      default: return { title: 'Tạo tài khoản.', subtitle: 'Nhận thông tin cập nhật về quyền truy cập sớm, sản phẩm mới, ưu đãi độc quyền dành cho thành viên, và hơn thế nữa.' };
    }
  };

  const { title, subtitle } = getTitles();

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} disabled={loading}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="auth-modal-left" style={{ position: 'relative', overflow: 'hidden' }}>
          {bgImages.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Auth model"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: bgIndex === i ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
              }}
            />
          ))}
        </div>

        <div className="auth-modal-right">
          <h2>{title}</h2>
          <p>{subtitle}</p>

          {message.text && (
            <div className={`auth-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-modal-form">
            {renderForm()}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Đang xử lý...' : (authMode === 'login' ? 'Đăng nhập' : authMode === 'register' ? 'Đăng ký' : 'Xác nhận')}
            </button>
            
            <div className="auth-footer-links">
              {authMode === 'login' ? (
                <p>Chưa có tài khoản? <button type="button" className="text-btn" onClick={() => switchMode('register')}>Đăng ký</button></p>
              ) : authMode === 'register' ? (
                <p>Đã có tài khoản? <button type="button" className="text-btn" onClick={() => switchMode('login')}>Đăng nhập</button></p>
              ) : (
                <p><button type="button" className="text-btn" onClick={() => switchMode('login')}>Quay lại đăng nhập</button></p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
