import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div className="editorial-sub" style={{ marginBottom: '12px' }}>
        LỖI 404 — KHÔNG TÌM THẤY TRANG
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 600,
          color: '#10100f',
          lineHeight: 1.15,
          marginBottom: '20px',
        }}
      >
        Không tìm thấy trang
      </div>
      <p style={{ maxWidth: '420px', color: '#70706f', fontSize: '14px', marginBottom: '32px' }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển vào kho lưu trữ tuần hoàn của REWEAR.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="pill-btn-filled"
        style={{ height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <ArrowLeft size={16} />
        <span>Trở về Bảng điều khiển</span>
      </button>
    </div>
  );
};

export default NotFound;
