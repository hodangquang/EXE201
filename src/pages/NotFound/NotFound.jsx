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
        ERROR 404 — PAGE NOT FOUND
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 'clamp(64px, 10vw, 120px)',
          fontWeight: 600,
          color: '#10100f',
          lineHeight: 0.9,
          marginBottom: '20px',
        }}
      >
        OUT OF ARCHIVE
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
