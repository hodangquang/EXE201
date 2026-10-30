import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import AuthModal from './AuthModal';
import { getSession, clearSession, onAuthChange, getAvatarUrl } from '../../services/auth';
import { useNotificationCount } from './NotificationCenter';

/**
 * Account button: "Account" pill when logged out, avatar + dropdown when logged in.
 * `withSpan` wraps the label in <span> (used by the store page styling).
 */
const AccountMenu = ({ className = '', withSpan = false }) => {
  const navigate = useNavigate();
  const [session, setSession] = useState(getSession());
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadCount = useNotificationCount(Boolean(session?.token));
  const wrapRef = useRef(null);

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  useEffect(() => {
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const name = session?.fullName || session?.email || '';
  const avatar = getAvatarUrl(session);
  const initial = name.trim().charAt(0).toUpperCase() || 'U';

  return (
    <>
      {session ? (
        <div ref={wrapRef} style={{ position: 'relative' }}>
          <button
            type="button"
            title={unreadCount ? `${name} · ${unreadCount} thông báo mới` : name}
            aria-label={unreadCount ? `Tài khoản, ${unreadCount} thông báo mới` : 'Tài khoản'}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: '2px solid #111', padding: 0,
              overflow: 'hidden', cursor: 'pointer', background: '#111', color: '#fff',
              fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {avatar ? <img src={avatar} alt="Ảnh đại diện" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initial}
          </button>
          {unreadCount > 0 && <span aria-hidden="true" style={{ position: 'absolute', top: -7, right: -7, minWidth: 18, height: 18, borderRadius: 10, background: '#fff', border: '1px solid #111', color: '#111', fontSize: 10, lineHeight: '16px', textAlign: 'center', padding: '0 3px', boxSizing: 'border-box', pointerEvents: 'none' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)', minWidth: 190, background: '#fff', color: '#111',
              borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,.18)', padding: 6, zIndex: 9999,
            }}>
              <div style={{ padding: '8px 12px', fontSize: 12, color: '#777', borderBottom: '1px solid #eee' }}>{name}</div>
              <MenuItem onClick={() => { setMenuOpen(false); navigate('/profile?tab=profile'); }}>Tài khoản của tôi</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); navigate('/profile?tab=orders'); }}>Đơn mua</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); navigate('/profile?tab=notifications'); }}>Thông báo{unreadCount ? ` (${unreadCount} mới)` : ''}</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); navigate('/profile?tab=style'); }}>Theo dõi gu đồ</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); navigate('/profile?tab=history'); }}>Lịch sử mua hàng</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); navigate('/profile?tab=sourcing'); }}>Bán đồ cũ</MenuItem>
              <MenuItem onClick={() => { setMenuOpen(false); clearSession(); }}>Đăng xuất</MenuItem>
            </div>
          )}
        </div>
      ) : (
        <button type="button" className={className} title="Tài khoản" onClick={() => setAuthOpen(true)}>
          <User size={14} />
          {withSpan ? <span>Tài khoản</span> : 'Tài khoản'}
        </button>
      )}

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

const MenuItem = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', border: 0, background: 'none', cursor: 'pointer', fontSize: 14, borderRadius: 8 }}
    onMouseEnter={(e) => (e.currentTarget.style.background = '#f2f2f2')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
  >
    {children}
  </button>
);

export default AccountMenu;
