import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, RefreshCw } from 'lucide-react';
import { authFetch } from '../../services/auth';
import './NotificationCenter.css';

export function useNotificationCount(enabled = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled) { setCount(0); return undefined; }
    let active = true;
    const refresh = () => authFetch('/api/notifications', { skipGlobalLoading: true })
      .then(response => { if (active) setCount(Number(response.unreadCount) || 0); })
      .catch(() => { if (active) setCount(0); });
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    window.addEventListener('notifications-changed', refresh);
    window.addEventListener('style-watch-changed', refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('notifications-changed', refresh); window.removeEventListener('style-watch-changed', refresh); };
  }, [enabled]);
  return count;
}

export default function NotificationCenter({ admin = false }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const refresh = useCallback(async () => {
    try {
      setError('');
      const response = await authFetch('/api/notifications', { skipGlobalLoading: true });
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (cause) { setError(cause.message || 'Không tải được thông báo.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [refresh]);

  const open = async (item) => {
    if (busyId) return;
    if (!item.readAt) {
      setBusyId(item.id);
      try {
        await authFetch(`/api/notifications/${encodeURIComponent(item.id)}/read`, { method: 'POST', skipGlobalLoading: true });
        setItems(current => current.map(row => row.id === item.id ? { ...row, readAt: new Date().toISOString() } : row));
        window.dispatchEvent(new Event('notifications-changed'));
      } catch (cause) { setError(cause.message || 'Không đánh dấu đã đọc được.'); setBusyId(null); return; }
      setBusyId(null);
    }
    if (item.link?.startsWith('/')) navigate(item.link);
  };

  return <section className={`rw-notifications${admin ? ' rw-notifications-admin' : ''}`} aria-labelledby="rw-notifications-title">
    <div className="rw-notifications-head">
      <div>
        <span className="rw-notifications-kicker">{admin ? 'REWEAR / QUẢN TRỊ' : 'TÀI KHOẢN / 05'}</span>
        <h1 id="rw-notifications-title">Thông báo</h1>
        <p>Cập nhật về đơn mua, giao hàng, bán đồ cũ và món hợp gu.</p>
      </div>
      <button type="button" className="rw-notifications-refresh" onClick={() => { setLoading(true); refresh(); }} disabled={loading} aria-label="Tải lại thông báo">
        <RefreshCw size={15} className={loading ? 'rw-spin' : ''} aria-hidden="true" /> Tải lại
      </button>
    </div>
    {loading && (
      <div className="rw-notifications-skeleton" role="status" aria-label="Đang tải thông báo">
        <span />
        <span />
        <span />
      </div>
    )}
    {error && (
      <div className="rw-notifications-state error" role="alert">
        <strong>Chưa tải được thông báo</strong>
        <p>{error}</p>
        <button type="button" onClick={refresh}>Thử lại</button>
      </div>
    )}
    {!loading && !error && items.length === 0 && (
      <div className="rw-notifications-empty">
        <div className="rw-notifications-empty-icon" aria-hidden="true"><Bell size={22} /></div>
        <strong>Chưa có thông báo mới</strong>
        <p>Các cập nhật về đơn mua, giao hàng, bán đồ cũ và món hợp gu sẽ xuất hiện tại đây.</p>
      </div>
    )}
    {!loading && !error && items.length > 0 && <div className="rw-notifications-list">
      {items.map(item => <button type="button" key={item.id} className={`rw-notification-item${item.readAt ? '' : ' unread'}`}
        disabled={busyId === item.id} onClick={() => open(item)}>
        <span className="rw-notification-dot" aria-hidden="true" />
        <span className="rw-notification-content">
          <strong>{item.title}</strong>
          <span>{item.body}</span>
          <small>{new Date(item.createdAt).toLocaleString('vi-VN')}</small>
        </span>
        {item.readAt ? <span className="rw-notification-read"><Check size={15} aria-hidden="true" /> Đã đọc</span> : <span className="rw-notification-new">Mới</span>}
      </button>)}
    </div>}
  </section>;
}
