import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Bell, RefreshCw } from 'lucide-react';
import { authFetch } from '../../services/auth';
import './StyleWatchSection.css';

const initial = { categoryIds: [], sizes: [], colors: [], minPrice: '', maxPrice: '', isEnabled: false, emailEnabled: false };
const commonSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Một cỡ'];
const money = value => Number(value).toLocaleString('vi-VN') + ' đ';
const unwrap = response => response?.data ?? response;

export default function StyleWatchSection({ notify }) {
  const navigate = useNavigate();
  const [watch, setWatch] = useState(initial);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedAt, setSavedAt] = useState('');

  const refreshNotifications = async () => {
    try {
      const alerts = unwrap(await authFetch('/api/style-watch/notifications', { skipGlobalLoading: true }));
      setNotifications(Array.isArray(alerts) ? alerts : []);
    } catch (cause) { notify('error', cause.message || 'Chưa cập nhật được thông báo.'); }
  };

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [preference, categoryResult, alerts] = await Promise.all([
        authFetch('/api/style-watch', { skipGlobalLoading: true }),
        authFetch('/api/Categories?isActive=true', { skipGlobalLoading: true }),
        authFetch('/api/style-watch/notifications', { skipGlobalLoading: true }),
      ]);
      const value = unwrap(preference) || {};
      setWatch({
        categoryIds: value.categoryIds || [], sizes: value.sizes || [], colors: value.colors || [],
        minPrice: value.minPrice ?? '', maxPrice: value.maxPrice ?? '',
        isEnabled: Boolean(value.isEnabled), emailEnabled: Boolean(value.emailEnabled),
      });
      setCategories(Array.isArray(unwrap(categoryResult)) ? unwrap(categoryResult) : []);
      setNotifications(Array.isArray(unwrap(alerts)) ? unwrap(alerts) : []);
    } catch (cause) { setError(cause.message || 'Chưa tải được gu đồ của bạn.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      authFetch('/api/style-watch/notifications', { skipGlobalLoading: true })
        .then(response => { const alerts = unwrap(response); if (Array.isArray(alerts)) setNotifications(alerts); })
        .catch(() => {});
    }, 30000);
    return () => window.clearInterval(timer);
  }, []);

  const toggle = (key, value) => {
    if (!watch[key].includes(value) && watch[key].length >= 8) { notify('error', 'Mỗi nhóm chọn tối đa 8 giá trị.'); return; }
    setWatch(previous => ({ ...previous,
      [key]: previous[key].includes(value) ? previous[key].filter(item => item !== value) : [...previous[key], value],
    }));
  };
  const addValue = (key, text, clear) => {
    const value = text.trim();
    if (!value) return;
    if (watch[key].length >= 8) { notify('error', 'Mỗi nhóm chọn tối đa 8 giá trị.'); return; }
    if (value.length > (key === 'colors' ? 40 : 24)) { notify('error', 'Giá trị vừa nhập quá dài.'); return; }
    setWatch(previous => ({ ...previous, [key]: previous[key].some(item => item.toLocaleLowerCase('vi') === value.toLocaleLowerCase('vi'))
      ? previous[key] : [...previous[key], value] }));
    clear('');
  };

  const save = async event => {
    event.preventDefault();
    const sizes = sizeInput.trim() && !watch.sizes.some(item => item.toLocaleLowerCase('vi') === sizeInput.trim().toLocaleLowerCase('vi'))
      ? [...watch.sizes, sizeInput.trim()] : watch.sizes;
    const colors = colorInput.trim() && !watch.colors.some(item => item.toLocaleLowerCase('vi') === colorInput.trim().toLocaleLowerCase('vi'))
      ? [...watch.colors, colorInput.trim()] : watch.colors;
    const minPrice = watch.minPrice === '' ? null : Number(watch.minPrice);
    const maxPrice = watch.maxPrice === '' ? null : Number(watch.maxPrice);
    if ((minPrice != null && (!Number.isFinite(minPrice) || minPrice < 0)) ||
        (maxPrice != null && (!Number.isFinite(maxPrice) || maxPrice <= 0)) ||
        (minPrice != null && maxPrice != null && minPrice > maxPrice)) {
      notify('error', 'Khoảng giá chưa hợp lệ.'); return;
    }
    if (!watch.categoryIds.length && !sizes.length && !colors.length && minPrice == null && maxPrice == null) {
      notify('error', 'Hãy chọn ít nhất một tiêu chí.'); return;
    }
    setSaving(true);
    try {
      const result = unwrap(await authFetch('/api/style-watch', {
        method: 'PUT', body: JSON.stringify({ ...watch, sizes, colors, minPrice, maxPrice, emailEnabled: watch.isEnabled && watch.emailEnabled }),
      }));
      setWatch({ ...result, minPrice: result.minPrice ?? '', maxPrice: result.maxPrice ?? '' });
      setSizeInput(''); setColorInput('');
      setSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
      notify('success', 'Đã lưu gu đồ và lựa chọn thông báo.');
    } catch (cause) { notify('error', cause.message || 'Không lưu được gu đồ.'); }
    finally { setSaving(false); }
  };

  const openNotification = async alert => {
    if (!alert.readAt) {
      try {
        await authFetch(`/api/style-watch/notifications/${encodeURIComponent(alert.id)}/read`, { method: 'POST', skipGlobalLoading: true });
        setNotifications(items => items.map(item => item.id === alert.id ? { ...item, readAt: new Date().toISOString() } : item));
        window.dispatchEvent(new Event('style-watch-changed'));
      } catch { /* Opening the product remains available even if marking read fails. */ }
    }
    navigate(`/product/${alert.productId}`);
  };

  if (loading) return <section className="sw-panel"><p role="status">Đang tải gu đồ của bạn…</p></section>;
  if (error) return <section className="sw-panel"><p role="alert">{error}</p><button type="button" className="sw-secondary" onClick={load}>Thử lại</button></section>;

  const unread = notifications.filter(item => !item.readAt).length;
  return <div className="sw-page">
    <div className="sw-heading"><span>GU ĐỒ CỦA BẠN / REWEAR</span><h2>Để món phù hợp tìm đến bạn.</h2><p>Chọn điều bạn thích. Khi một món độc bản mới được mở bán và khớp các tiêu chí, REWEAR sẽ báo cho bạn.</p></div>
    <form className="sw-panel" onSubmit={save}>
      <div className="sw-field"><div className="sw-field-head"><h3>01 / Loại đồ</h3><span>Chọn nhiều loại</span></div>
        <div className="sw-chips">{categories.map(category => <button key={category.id} type="button" className={watch.categoryIds.includes(category.id) ? 'selected' : ''} aria-pressed={watch.categoryIds.includes(category.id)} onClick={() => toggle('categoryIds', category.id)}>{category.name}</button>)}{watch.categoryIds.filter(id => !categories.some(category => category.id === id)).map(id => <button key={id} type="button" className="selected" onClick={() => toggle('categoryIds', id)}>Danh mục cũ ×</button>)}{!categories.length && !watch.categoryIds.length && <p>Chưa có danh mục để chọn.</p>}</div>
      </div>
      <div className="sw-field"><div className="sw-field-head"><h3>02 / Kích cỡ</h3><span>Chọn cỡ bạn mặc</span></div>
        <div className="sw-chips">{[...new Set([...commonSizes, ...watch.sizes])].map(size => <button key={size} type="button" className={watch.sizes.includes(size) ? 'selected' : ''} aria-pressed={watch.sizes.includes(size)} onClick={() => toggle('sizes', size)}>{size}</button>)}</div>
        <div className="sw-add"><label htmlFor="sw-size">Cỡ khác</label><input id="sw-size" value={sizeInput} maxLength={24} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addValue('sizes', sizeInput, setSizeInput); } }} placeholder="Ví dụ: 32" /><button type="button" onClick={() => addValue('sizes', sizeInput, setSizeInput)}>Thêm</button></div>
      </div>
      <div className="sw-field"><div className="sw-field-head"><h3>03 / Màu sắc</h3><span>Nhập tên màu bạn thích</span></div>
        <div className="sw-chips">{watch.colors.map(color => <button key={color} type="button" className="selected" aria-label={`Bỏ màu ${color}`} onClick={() => toggle('colors', color)}>{color} ×</button>)}</div>
        <div className="sw-add"><label htmlFor="sw-color">Màu</label><input id="sw-color" value={colorInput} maxLength={40} onChange={e => setColorInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addValue('colors', colorInput, setColorInput); } }} placeholder="Ví dụ: xanh chàm" /><button type="button" onClick={() => addValue('colors', colorInput, setColorInput)}>Thêm</button></div>
      </div>
      <div className="sw-field"><div className="sw-field-head"><h3>04 / Khoảng giá</h3><span>Đơn vị: đồng</span></div>
        <div className="sw-price"><label>Giá từ <input type="number" inputMode="numeric" min="0" max="1000000000" step="1000" value={watch.minPrice} onChange={e => setWatch(value => ({ ...value, minPrice: e.target.value }))} placeholder="Không giới hạn" /></label><label>Đến <input type="number" inputMode="numeric" min="1" max="1000000000" step="1000" value={watch.maxPrice} onChange={e => setWatch(value => ({ ...value, maxPrice: e.target.value }))} placeholder="Không giới hạn" /></label></div>
      </div>
      <p className="sw-hint">Trong cùng một nhóm, món đồ chỉ cần khớp một lựa chọn. Giữa các nhóm đã chọn, món đồ cần khớp tất cả.</p>
      <div className="sw-alert-options"><h3>Nhận tin về món mới</h3>
        <label><input type="checkbox" checked={watch.isEnabled} onChange={e => setWatch(value => ({ ...value, isEnabled: e.target.checked, emailEnabled: e.target.checked && value.emailEnabled }))} /><span><strong>Báo trong tài khoản</strong><small>Chỉ báo những món được mở bán sau khi bạn lưu và bật theo dõi.</small></span></label>
        <label><input type="checkbox" checked={watch.emailEnabled} disabled={!watch.isEnabled} onChange={e => setWatch(value => ({ ...value, emailEnabled: e.target.checked }))} /><span><strong>Gửi thêm qua email</strong><small>Bạn có thể tắt email bất cứ lúc nào.</small></span></label>
      </div>
      <div className="sw-actions"><button className="sw-primary" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu gu đồ'}</button>{savedAt && <span role="status">Đã lưu lúc {savedAt}</span>}</div>
    </form>
    <section className="sw-panel sw-notifications" aria-labelledby="sw-notifications-title"><div className="sw-notification-head"><div><span>THÔNG BÁO CỦA BẠN</span><h3 id="sw-notifications-title">Món mới hợp gu {unread > 0 && <em>{unread} mới</em>}</h3></div><button type="button" className="sw-secondary" onClick={refreshNotifications} aria-label="Cập nhật thông báo"><RefreshCw size={16} /> Cập nhật</button></div>
      {notifications.length ? <ul>{notifications.map(alert => <li key={alert.id}><button type="button" className={!alert.readAt ? 'unread' : ''} onClick={() => openNotification(alert)}>{alert.imageUrl ? <img src={alert.imageUrl} alt="" loading="lazy" /> : <span className="sw-no-image"><Bell size={20} /></span>}<span><strong>{alert.productTitle}</strong><small>Giá khi đăng bán: {money(alert.productPrice)} · {new Date(alert.createdAt).toLocaleDateString('vi-VN')}</small></span><ArrowUpRight size={18} aria-hidden="true" /></button></li>)}</ul> : <p className="sw-empty">Chưa có thông báo. Khi có món mới khớp gu đã bật theo dõi, bạn sẽ thấy ở đây.</p>}
      <p className="sw-hint">Món độc bản có thể đã bán hoặc ngừng hiển thị trước khi bạn mở thông báo. Kiểm tra trạng thái hiện tại ở trang sản phẩm.</p>
    </section>
  </div>;
}
