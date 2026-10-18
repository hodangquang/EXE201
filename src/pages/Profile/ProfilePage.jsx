import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, MapPin, Package, History, LogOut, Camera, ChevronRight, Search, ShoppingBag, PlusCircle, UploadCloud, Pencil } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import RainsFooter from '../../components/common/RainsFooter';
import AccountMenu from '../../components/common/AccountMenu';
import { getSession, clearSession, onAuthChange, profileApi, ordersApi, updateSessionUser, getAvatarUrl, authFetch } from '../../services/auth';
import '../Home/HomePage.css';
import './ProfilePage.css';

const fmt = (n) => n.toLocaleString('vi-VN') + ' ₫';
const fmtDate = (s) => {
  const date = new Date(s);
  return Number.isNaN(date.getTime()) ? String(s || '') : date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const readField = (obj, ...keys) => {
  if (!obj || typeof obj !== 'object') return undefined;
  const entries = Object.keys(obj);
  const key = keys.find((candidate) => entries.some((entry) => entry.toLowerCase() === candidate.toLowerCase()));
  return key ? obj[entries.find((entry) => entry.toLowerCase() === key.toLowerCase())] : undefined;
};
const unwrapOrders = (response) => {
  const root = response;
  let value = response;
  for (let i = 0; i < 3 && value && !Array.isArray(value); i += 1) {
    const nested = readField(value, 'data', 'result');
    if (nested === undefined || nested === value) break;
    value = nested;
  }
  const rows = Array.isArray(value) ? value : readField(value, 'items', 'orders', 'records', 'results');
  const meta = { ...(root && typeof root === 'object' && !Array.isArray(root) ? root : {}), ...(value && typeof value === 'object' && !Array.isArray(value) ? value : {}) };
  return { rows: Array.isArray(rows) ? rows : [], meta };
};
const unwrapOrder = (response) => {
  let value = response;
  for (let i = 0; i < 3 && value && !Array.isArray(value); i += 1) {
    const nested = readField(value, 'data', 'result', 'order');
    if (nested === undefined || nested === value) break;
    value = nested;
  }
  return value;
};
const normalizeOrder = (raw) => {
  const rawItems = readField(raw, 'items', 'orderItems', 'details', 'lines');
  const items = (Array.isArray(rawItems) ? rawItems : []).map((item) => {
    const product = readField(item, 'product', 'productInfo') || {};
    const imageValue = readField(item, 'imageUrl', 'image', 'thumbnail', 'productImageUrl') ?? readField(product, 'imageUrl', 'image', 'thumbnail');
    const image = typeof imageValue === 'string' ? imageValue : readField(imageValue, 'url', 'imageUrl') || '';
    return {
      productId: readField(item, 'productId', 'productID') ?? readField(product, 'id', 'productId'),
      name: readField(item, 'productName', 'name', 'title') ?? readField(product, 'title', 'name') ?? 'Sản phẩm',
      image,
      variant: [readField(item, 'color'), readField(item, 'size')].filter(Boolean).join(' / '),
      qty: Number(readField(item, 'quantity', 'qty') ?? 1),
      price: readField(item, 'unitPrice', 'price'),
    };
  });
  const status = readField(raw, 'status', 'orderStatus');
  const paymentStatus = readField(raw, 'paymentStatus', 'paymentState');
  const total = readField(raw, 'totalAmount', 'total', 'grandTotal', 'finalAmount');
  const addressValue = readField(raw, 'shippingAddress', 'deliveryAddress', 'address');
  const address = typeof addressValue === 'string'
    ? addressValue
    : [readField(addressValue, 'streetAddress', 'addressLine', 'address'), readField(addressValue, 'ward'), readField(addressValue, 'district'), readField(addressValue, 'province', 'city')].filter(Boolean).join(', ');
  const tracking = readField(raw, 'trackingNumber', 'trackingCode', 'waybillNumber', 'shipmentCode');
  const shippingFee = readField(raw, 'shippingFee', 'deliveryFee');
  const note = readField(raw, 'note', 'customerNote');
  const rawTimeline = readField(raw, 'statusHistory', 'timeline', 'orderHistory', 'events');
  return {
    requestId: readField(raw, 'id', 'orderId'),
    orderCode: readField(raw, 'orderCode', 'code', 'orderNumber'),
    id: String(readField(raw, 'orderCode', 'code', 'orderNumber') ?? readField(raw, 'id', 'orderId') ?? '—'),
    createdAt: readField(raw, 'createdAt', 'orderDate', 'createdDate'),
    status,
    statusLabel: getOrderStatusLabel(status),
    paymentStatus: paymentStatus === undefined ? null : String(paymentStatus),
    items,
    total,
    shippingFee,
    address,
    tracking: tracking === undefined ? null : String(tracking),
    note: note === undefined ? null : String(note),
    timeline: Array.isArray(rawTimeline) ? rawTimeline.map(event => ({
      label: readField(event, 'description', 'title', 'message', 'statusName', 'status'),
      at: readField(event, 'createdAt', 'timestamp', 'changedAt', 'date'),
    })).filter(event => event.label || event.at) : [],
  };
};
const formatOrderMoney = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return fmt(value);
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return fmt(Number(value));
  return typeof value === 'string' && value.trim() ? value : null;
};
const ORDER_STATUS_LABELS = {
  0: 'Chờ thanh toán', 1: 'Đã xác nhận', 2: 'Đang giao',
  3: 'Đã giao', 4: 'Đã hủy', 5: 'Hết hạn thanh toán',
  AwaitingPayment: 'Chờ thanh toán', Confirmed: 'Đã xác nhận', Shipping: 'Đang giao',
  Delivered: 'Đã giao', Cancelled: 'Đã hủy', PaymentExpired: 'Hết hạn thanh toán',
};
const getOrderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || ORDER_STATUS_LABELS[String(status)] || (status == null ? 'Chưa có trạng thái' : String(status));
const SOURCING_STATUS = {
  0: 'Chờ duyệt', 1: 'Đang xem xét', 2: 'Đã định giá', 3: 'Đã đồng ý giá',
  4: 'Đã nhận hàng', 5: 'Đã chấp nhận', 6: 'Đã từ chối', 7: 'Đã từ chối giá', 8: 'Hoàn tất',
  Pending: 'Chờ duyệt', UnderReview: 'Đang xem xét', Priced: 'Đã định giá',
  Accepted: 'Đã đồng ý giá', Received: 'Đã nhận hàng', Approved: 'Đã chấp nhận',
  Rejected: 'Đã từ chối', Declined: 'Đã từ chối giá', Completed: 'Hoàn tất',
};
const sourcingStatus = (status) => SOURCING_STATUS[status ?? 0] || String(status);
const sourcingTone = (status) => ['6', 'Rejected', '7', 'Declined'].includes(String(status)) ? 'rejected' : ['5', 'Approved', '8', 'Completed'].includes(String(status)) ? 'approved' : 'progress';

const MENU = [
  { key: 'profile', label: 'Hồ sơ của tôi', icon: User },
  { key: 'addresses', label: 'Sổ địa chỉ', icon: MapPin },
  { key: 'orders', label: 'Đơn mua', icon: Package },
  { key: 'history', label: 'Lịch sử mua hàng', icon: History },
  { key: 'sourcing', label: 'Bán đồ cũ', icon: PlusCircle },
];

const EMPTY_ADDR = {
  recipientName: '', phoneNumber: '', province: '', district: '',
  ward: '', streetAddress: '', note: '', isDefault: false,
};

function SectionTitle({ kicker, title, description, action }) {
  return <div className="pp-card-head row pp-section-head">
    <div><span className="pp-profile-eyebrow"><span />{kicker}</span><h2>{title}</h2><p>{description}</p></div>
    {action}
  </div>;
}

/* ───────────────────────── Profile section ───────────────────────── */
function ProfileSection({ notify, onLoaded }) {
  const [form, setForm] = useState({ fullName: '', phoneNumber: '', birthDate: '', email: '', gender: '' });
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState('loading');
  const [isEditing, setIsEditing] = useState(false);
  const fileRef = useRef(null);
  const savedFormRef = useRef(form);

  const loadProfile = async () => {
    setProfileStatus('loading');
    try {
      const d = await profileApi.get();
      const p = d.data || d.profile || d;
      const profileForm = {
        fullName: p.fullName || '',
        phoneNumber: p.phoneNumber || p.phone || '',
        birthDate: (p.birthDate || p.dateOfBirth || '').slice(0, 10),
        email: p.email || '',
        gender: p.gender || '',
      };
      setForm(profileForm);
      savedFormRef.current = profileForm;
      setAvatar(getAvatarUrl(p));
      onLoaded?.(p);
      setProfileStatus('ready');
    } catch (e) {
      setProfileStatus('error');
      notify('error', e.message);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await profileApi.update({
        fullName: form.fullName,
        gender: form.gender,
      });
      updateSessionUser({ fullName: form.fullName });
      savedFormRef.current = { ...form };
      setIsEditing(false);
      notify('success', 'Cập nhật hồ sơ thành công!');
    } catch (err) { notify('error', err.message); }
    finally { setLoading(false); }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) return notify('error', 'Chỉ hỗ trợ ảnh JPEG hoặc PNG.');
    if (file.size > 1024 * 1024 * 5) return notify('error', 'Ảnh tối đa 5MB.');
    setLoading(true);
    try {
      const d = await profileApi.uploadAvatar(file);
      const url = getAvatarUrl(d.data || d) || URL.createObjectURL(file);
      setAvatar(url);
      updateSessionUser({ avatarUrl: url });
      notify('success', 'Đã cập nhật ảnh đại diện!');
    } catch (err) { notify('error', err.message); }
    finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const initial = (form.fullName || form.email || 'U').trim().charAt(0).toUpperCase();
  const birthDate = form.birthDate ? form.birthDate.split('-').reverse().join('/') : '';
  const cancelEdit = () => {
    setForm({ ...savedFormRef.current });
    setIsEditing(false);
  };

  return (
    <section className="pp-card pp-profile-card" aria-labelledby="pp-profile-title">
      <div className="pp-card-head row pp-profile-head">
        <div>
          <span className="pp-profile-eyebrow"><span aria-hidden="true" /> Tài khoản của bạn</span>
          <h2 id="pp-profile-title">Hồ sơ cá nhân</h2>
          <p>Thông tin liên hệ và cách bạn xuất hiện trên REWEAR.</p>
        </div>
        {!isEditing && profileStatus === 'ready' && (
          <button type="button" className="pp-btn pp-profile-edit-btn" onClick={() => setIsEditing(true)}>
            <Pencil size={15} aria-hidden="true" /> Chỉnh sửa hồ sơ
          </button>
        )}
      </div>
      {profileStatus === 'loading' && (
        <div className="pp-profile-loading" role="status" aria-label="Đang tải hồ sơ">
          <span /><span /><span /><span />
        </div>
      )}
      {profileStatus === 'error' && (
        <div className="pp-profile-error" role="alert">
          <strong>Chưa tải được hồ sơ</strong>
          <p>Vui lòng thử lại để xem thông tin tài khoản của bạn.</p>
          <button type="button" className="pp-btn ghost" onClick={loadProfile}>Thử lại</button>
        </div>
      )}
      {profileStatus === 'ready' && <div className="pp-profile-grid">
        <form className="pp-form" onSubmit={save}>
          <div className="pp-form-intro">
            <h3>Thông tin của bạn</h3>
            <p>{isEditing ? 'Bạn có thể thay đổi họ tên và giới tính.' : 'Các thông tin đang lưu trong tài khoản của bạn.'}</p>
          </div>

          <div className="pp-field">
            {isEditing ? <label htmlFor="pp-full-name">Họ và tên</label> : <span className="pp-field-label">Họ và tên</span>}
            {isEditing ? <input id="pp-full-name" value={form.fullName} onChange={set('fullName')} required /> : <div className="pp-val">{form.fullName || <span className="pp-muted">Chưa cập nhật</span>}</div>}
          </div>

          <div className="pp-field pp-field-static">
            <span className="pp-field-label">Email</span>
            <div className="pp-val">{form.email || <span className="pp-muted">Chưa cập nhật</span>}</div>
          </div>

          <div className="pp-field">
            <span className="pp-field-label">Giới tính</span>
            {isEditing ? (
              <div className="pp-radios" role="radiogroup" aria-label="Giới tính">
                {[['Male', 'Nam'], ['Female', 'Nữ'], ['Other', 'Khác']].map(([v, l]) => (
                  <label key={v}><input type="radio" name="gender" value={v} checked={form.gender === v} onChange={set('gender')} />{l}</label>
                ))}
              </div>
            ) : (
              <div className="pp-val">{form.gender === 'Male' ? 'Nam' : form.gender === 'Female' ? 'Nữ' : form.gender === 'Other' ? 'Khác' : <span className="pp-muted">Chưa cập nhật</span>}</div>
            )}
          </div>

          <div className="pp-field pp-field-static">
            <span className="pp-field-label">Số điện thoại</span>
            <div className="pp-val">{form.phoneNumber || <span className="pp-muted">Chưa cập nhật</span>}</div>
          </div>

          <div className="pp-field pp-field-static">
            <span className="pp-field-label">Ngày sinh</span>
            <div className="pp-val">{birthDate || <span className="pp-muted">Chưa cập nhật</span>}</div>
          </div>

          {isEditing && (
            <div className="pp-actions-right pp-profile-actions">
              <button type="button" className="pp-btn ghost" disabled={loading} onClick={cancelEdit}>Hủy</button>
              <button type="submit" className="pp-btn" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
            </div>
          )}
        </form>

        <div className="pp-avatar-col">
          <span className="pp-avatar-eyebrow">Ảnh đại diện</span>
          <button type="button" className="pp-avatar-lg" aria-label="Thay ảnh đại diện" disabled={loading} onClick={() => fileRef.current?.click()}>
            {avatar ? <img src={avatar} alt="" /> : <span>{initial}</span>}
            <span className="pp-avatar-overlay" aria-hidden="true"><Camera size={21} /></span>
          </button>
          <strong>{form.fullName || 'Tài khoản của bạn'}</strong>
          <span className="pp-avatar-helper">Ảnh hiển thị cùng hồ sơ của bạn</span>
          <button type="button" className="pp-btn ghost pp-avatar-upload" disabled={loading} onClick={() => fileRef.current?.click()}>
            <Camera size={15} aria-hidden="true" /> {loading ? 'Đang tải...' : 'Thay ảnh'}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png" hidden onChange={onFile} />
          <small>JPEG hoặc PNG · tối đa 5MB</small>
        </div>
      </div>}
    </section>
  );
}

/* ───────────────────────── Address section ───────────────────────── */
function AddressSection({ notify }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('loading');

  const load = async () => {
    setStatus('loading');
    try {
      const d = await profileApi.addresses();
      setList(Array.isArray(d) ? d : d.data || d.addresses || []);
      setStatus('ready');
    } catch (e) { setStatus('error'); notify('error', e.message); }
  };
  useEffect(() => { load(); }, []);

  const run = async (fn, ok) => {
    setLoading(true);
    try { await fn(); await load(); notify('success', ok); }
    catch (e) { notify('error', e.message); }
    finally { setLoading(false); }
  };

  const submit = (e) => {
    e.preventDefault();
    const { id, ...body } = form;
    run(async () => {
      if (id) await profileApi.updateAddress(id, body);
      else await profileApi.addAddress(body);
      setForm(null);
    }, id ? 'Đã cập nhật địa chỉ!' : 'Đã thêm địa chỉ mới!');
  };

  const edit = (a) => setForm({
    id: a.id || a._id,
    ...Object.fromEntries(Object.keys(EMPTY_ADDR).map((k) => [k, k === 'isDefault' ? !!a[k] : a[k] || ''])),
  });
  const f = (k) => ({ value: form?.[k] ?? '', onChange: (e) => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="pp-card pp-section-card">
      <SectionTitle kicker="Tài khoản / 02" title="Sổ địa chỉ" description="Lưu địa chỉ để chọn nhanh khi mua hàng."
        action={!form && <button type="button" className="pp-btn" onClick={() => setForm({ ...EMPTY_ADDR })}><PlusCircle size={16} /> Thêm địa chỉ</button>} />

      {form ? (
        <form className="pp-addr-form" onSubmit={submit}>
          <div className="pp-form-intro"><h3>{form.id ? 'Chỉnh sửa địa chỉ' : 'Địa chỉ mới'}</h3><p>Thông tin người nhận và nơi giao hàng</p></div>
          <div className="pp-grid-2">
            <label className="pp-input-field">Họ và tên người nhận <input autoComplete="name" placeholder="Tên người nhận" {...f('recipientName')} required /></label>
            <label className="pp-input-field">Số điện thoại <input type="tel" autoComplete="tel" placeholder="Số điện thoại" {...f('phoneNumber')} required /></label>
            <label className="pp-input-field">Tỉnh / Thành phố <input autoComplete="address-level1" placeholder="Tỉnh / Thành phố" {...f('province')} required /></label>
            <label className="pp-input-field">Quận / Huyện <input autoComplete="address-level2" placeholder="Quận / Huyện" {...f('district')} required /></label>
            <label className="pp-input-field">Phường / Xã <input placeholder="Phường / Xã" {...f('ward')} required /></label>
            <label className="pp-input-field">Số nhà, tên đường <input autoComplete="street-address" placeholder="Địa chỉ cụ thể" {...f('streetAddress')} required /></label>
          </div>
          <label className="pp-input-field">Ghi chú giao hàng <input placeholder="Ví dụ: Gọi trước khi giao" {...f('note')} /></label>
          <label className="pp-check">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Đặt làm địa chỉ mặc định
          </label>
          <div className="pp-actions-right">
            <button type="button" className="pp-btn ghost" onClick={() => setForm(null)}>Hủy</button>
            <button type="submit" className="pp-btn" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu địa chỉ'}</button>
          </div>
        </form>
      ) : status === 'loading' ? (
        <div className="pp-empty" role="status"><p>Đang tải địa chỉ...</p></div>
      ) : status === 'error' ? (
        <div className="pp-empty"><MapPin size={32} /><strong>Không tải được sổ địa chỉ</strong><button type="button" className="pp-btn ghost" onClick={load}>Thử lại</button></div>
      ) : list.length === 0 ? (
        <div className="pp-empty"><MapPin size={36} /><strong>Chưa có địa chỉ nhận hàng</strong><p>Thêm địa chỉ đầu tiên để sẵn sàng cho đơn mua tiếp theo.</p><button type="button" className="pp-btn" onClick={() => setForm({ ...EMPTY_ADDR })}>Thêm địa chỉ</button></div>
      ) : (
        <div className="pp-addr-list">
          {list.map((a) => {
            const id = a.id || a._id;
            return (
              <div className="pp-addr" key={id}>
                <div className="pp-addr-main">
                  <div className="pp-addr-name"><strong>{a.recipientName}</strong>{a.isDefault && <span className="pp-tag">Mặc định</span>}</div>
                  <p className="pp-addr-phone">{a.phoneNumber}</p>
                  <p>{a.streetAddress}</p>
                  <p>{[a.ward, a.district, a.province].filter(Boolean).join(', ')}</p>
                  {a.note && <p className="pp-muted">Ghi chú: {a.note}</p>}
                </div>
                <div className="pp-addr-side">
                  <div className="pp-links">
                    <button type="button" onClick={() => edit(a)}>Chỉnh sửa</button>
                    {!a.isDefault && <button type="button" className="danger" disabled={loading} onClick={() => window.confirm('Xóa địa chỉ này?') && run(() => profileApi.deleteAddress(id), 'Đã xóa địa chỉ.')}>Xóa</button>}
                  </div>
                  <button type="button" className="pp-btn ghost sm" disabled={a.isDefault || loading} onClick={() => run(() => profileApi.setDefault(id), 'Đã đặt làm mặc định.')}>
                    Đặt làm mặc định
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Orders section ───────────────────────── */
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailStatus, setDetailStatus] = useState('idle');
  const loadDetail = async () => {
    const id = order.requestId || order.id;
    if (!order.orderCode && (!id || id === '—')) return;
    setDetailStatus('loading');
    try {
      const response = order.orderCode
        ? await ordersApi.getByCode(order.orderCode)
        : await ordersApi.get(id);
      const normalized = normalizeOrder(unwrapOrder(response));
      setDetail({
        ...order,
        ...Object.fromEntries(Object.entries(normalized).filter(([key, value]) => value !== undefined && value !== null && !['id', 'requestId', 'orderCode'].includes(key) && !(key === 'statusLabel' && normalized.status == null) && !(key === 'items' && value.length === 0) && !(key === 'timeline' && value.length === 0))),
        items: normalized.items.length ? normalized.items : order.items,
        timeline: normalized.timeline.length ? normalized.timeline : [],
      });
      setDetailStatus('ready');
    } catch {
      setDetailStatus('error');
    }
  };
  const toggleDetail = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!detail && detailStatus !== 'loading') loadDetail();
  };

  return (
    <div className="pp-order">
      <div className="pp-order-head">
        <div className="pp-order-shop"><span className="pp-shop-pill">REWEAR</span><span className="pp-muted">Mã đơn: {order.id}{order.createdAt ? ` · ${fmtDate(order.createdAt)}` : ''}</span></div>
        <div className="pp-status">{order.statusLabel}</div>
      </div>
      {order.items.map((it, i) => {
        const content = <>
          {it.image ? <img src={it.image} alt={it.name} /> : <div className="pp-order-placeholder"><Package size={20} /></div>}
          <div className="pp-order-info">
            <div className="pp-order-name">{it.name}</div>
            {it.variant && <div className="pp-muted">Phân loại: {it.variant}</div>}
            <div className="pp-muted">Số lượng: {it.qty}</div>
          </div>
          {formatOrderMoney(it.price) && <div className="pp-order-price">{formatOrderMoney(it.price)}</div>}
        </>;
        return it.productId
          ? <Link className="pp-order-item" key={i} to={`/product/${it.productId}`} aria-label={`Xem ${it.name}`}>{content}</Link>
          : <div className="pp-order-item" key={i}>{content}</div>;
      })}

      <div className="pp-order-foot">
        {formatOrderMoney(order.total) && <div className="pp-order-total">Tổng đơn: <strong>{formatOrderMoney(order.total)}</strong></div>}
        <div className="pp-order-actions">
          {order.paymentStatus && <span className="pp-muted">Thanh toán: {order.paymentStatus}</span>}
          <button type="button" className="pp-btn ghost" aria-expanded={open} onClick={toggleDetail}>{open ? 'Ẩn chi tiết' : 'Chi tiết đơn hàng'}</button>
        </div>
      </div>
      {open && <div className="pp-order-expanded">
        {detailStatus === 'loading' && <div role="status">Đang tải chi tiết đơn hàng…</div>}
        {detailStatus === 'error' && <div className="pp-order-detail-error" role="alert">Không tải được chi tiết đơn hàng.<button type="button" onClick={loadDetail}>Thử lại</button></div>}
        {detailStatus === 'ready' && detail && <>
          {detail.items.map((item, index) => <div key={`${item.name}-${index}`}>{item.name} <span>{item.variant ? `${item.variant} · ` : ''}× {item.qty}</span></div>)}
          {detail.address && <div><strong>Địa chỉ nhận hàng</strong><span>{detail.address}</span></div>}
          {detail.tracking && <div><strong>Mã vận đơn</strong><span>{detail.tracking}</span></div>}
          {detail.paymentStatus && <div><strong>Thanh toán</strong><span>{detail.paymentStatus}</span></div>}
          {detail.shippingFee !== undefined && <div><strong>Phí giao hàng</strong><span>{formatOrderMoney(detail.shippingFee) || '—'}</span></div>}
          {detail.note && <div><strong>Ghi chú</strong><span>{detail.note}</span></div>}
          {detail.timeline.map((event, index) => <div key={`event-${index}`}><strong>{event.label || 'Cập nhật đơn hàng'}</strong><span>{event.at ? fmtDate(event.at) : ''}</span></div>)}
        </>}
      </div>}
    </div>
  );
}

function useCustomerOrders({ status = '', page = 1, pageSize = 10 } = {}) {
  const [result, setResult] = useState({ orders: [], totalPages: null, totalCount: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    ordersApi.list({ status, page, pageSize }).then((response) => {
      const { rows, meta } = unwrapOrders(response);
      const orders = rows.map(normalizeOrder);
      const totalPages = Number(readField(meta, 'totalPages', 'pageCount'));
      const totalCount = Number(readField(meta, 'totalCount', 'totalRecords', 'totalItems'));
      if (current) setResult({ orders, totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : null, totalCount: Number.isFinite(totalCount) && totalCount >= 0 ? totalCount : null });
    }).catch((err) => {
      if (current) setError(err.message || 'Không thể tải danh sách đơn hàng.');
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [status, page, pageSize, reload]);
  return { ...result, loading, error, retry: () => setReload((value) => value + 1) };
}

function OrdersSection() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { orders, totalPages, totalCount, loading, error, retry } = useCustomerOrders({ status, page });
  const shown = orders.filter((order) => !q || order.id.toLowerCase().includes(q.toLowerCase()) || order.items.some((item) => item.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <div className="pp-card pp-section-card pp-section-intro">
        <SectionTitle kicker="Tài khoản / 03" title="Đơn mua" description="Theo dõi đơn hàng và tìm lại sản phẩm bạn quan tâm." />
      </div>
      <div className="pp-order-filters">
        <label htmlFor="order-status">Lọc theo mã trạng thái</label>
        <select id="order-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          {[0, 1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{ORDER_STATUS_LABELS[value]}</option>)}
        </select>
        <div className="pp-search"><Search size={16} /><input aria-label="Tìm đơn hàng" placeholder="Tìm mã đơn hoặc tên sản phẩm trên trang này" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {loading ? <div className="pp-card pp-order-state" role="status">Đang tải đơn hàng…</div>
        : error ? <div className="pp-card pp-order-state pp-order-error" role="alert"><strong>Chưa tải được đơn hàng</strong><span>{error}</span><button type="button" className="pp-btn ghost" onClick={retry}>Thử lại</button></div>
        : shown.length === 0 ? (
        <div className="pp-card pp-empty"><Package size={36} /><strong>{orders.length ? 'Không tìm thấy đơn phù hợp' : 'Bạn chưa có đơn hàng'}</strong><p>{orders.length ? 'Thử từ khóa khác trong các đơn đang hiển thị.' : 'Đơn hàng của bạn sẽ xuất hiện tại đây sau khi đặt hàng.'}</p>{q && <button type="button" className="pp-btn ghost" onClick={() => setQ('')}>Xóa từ khóa</button>}</div>
      ) : (
        shown.map((order, index) => <OrderCard key={`${order.id}-${index}`} order={order} />)
      )}
      {!loading && !error && orders.length > 0 && <div className="pp-order-pagination"><span>{totalCount !== null ? `${totalCount} đơn hàng` : `Trang ${page}${totalPages ? ` / ${totalPages}` : ''}`}</span><div><button type="button" className="pp-btn ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Trước</button><button type="button" className="pp-btn ghost" disabled={(totalPages !== null && page >= totalPages) || (totalPages === null && orders.length < 10)} onClick={() => setPage((value) => value + 1)}>Tiếp</button></div></div>}
    </>
  );
}

/* ───────────────────────── History section ───────────────────────── */
function HistorySection() {
  const { orders, loading, error, retry } = useCustomerOrders({ pageSize: 50 });

  return (
    <>
      <div className="pp-card pp-section-card pp-section-intro">
        <SectionTitle kicker="Tài khoản / 04" title="Lịch sử mua hàng" description="Xem lại các đơn hàng bạn đã đặt." />
      </div>
      <div className="pp-card pp-section-card pp-history-card">
        <div className="pp-history-head"><h3>Đơn hàng gần đây</h3><span>{orders.length} đơn</span></div>
        {loading && <div className="pp-order-state" role="status">Đang tải lịch sử đơn hàng…</div>}
        {error && <div className="pp-order-state pp-order-error" role="alert"><span>{error}</span><button type="button" className="pp-btn ghost" onClick={retry}>Thử lại</button></div>}
        {!loading && !error && orders.length === 0 && <div className="pp-empty"><History size={36} /><strong>Chưa có lịch sử mua hàng</strong><p>Đơn hàng của bạn sẽ xuất hiện tại đây sau khi đặt hàng.</p></div>}
        {!loading && !error && orders.map((order, index) => <OrderCard key={`${order.id}-${index}`} order={order} />)}
      </div>
    </>
  );
}

/* ───────────────────────── Sourcing section ───────────────────────── */
function SourcingSection({ notify }) {
  const [view, setView] = useState('list');
  const [requests, setRequests] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });
  const [listError, setListError] = useState(false);
  const modalRef = useRef(null);
  const modalCloseRef = useRef(null);
  useEffect(() => {
    if (!detailModal.open) return undefined;
    const returnFocusTo = document.activeElement;
    modalCloseRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setDetailModal({ open: false, data: null, loading: false });
      if (event.key === 'Tab') {
        const focusable = [...(modalRef.current?.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])') || [])];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); returnFocusTo?.focus?.(); };
  }, [detailModal.open]);

  const handleViewDetail = async (id) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await authFetch(`/api/Sourcing/${id}`);
      setDetailModal({ open: true, data: res.data || res, loading: false });
    } catch (err) {
      notify('error', 'Lỗi tải chi tiết: ' + err.message);
      setDetailModal({ open: false, data: null, loading: false });
    }
  };

  const handleAcceptOffer = async (id) => {
    try {
      await authFetch(`/api/Sourcing/${id}/accept`, { method: 'PATCH' });
      notify('success', 'Đã đồng ý giá đề xuất thành công!');
      setDetailModal({ open: false, data: null, loading: false });
      loadRequests();
    } catch (err) {
      notify('error', 'Lỗi khi đồng ý giá: ' + err.message);
    }
  };

  const handleDeclineOffer = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối mức giá này?')) return;
    try {
      await authFetch(`/api/Sourcing/${id}/decline`, { method: 'PATCH' });
      notify('success', 'Đã từ chối mức giá đề xuất.');
      setDetailModal({ open: false, data: null, loading: false });
      loadRequests();
    } catch (err) {
      notify('error', 'Lỗi khi từ chối giá: ' + err.message);
    }
  };

  const [form, setForm] = useState({
    Title: '', Description: '', BrandId: '', CategoryId: '', 
    DeclaredCondition: 1, Size: '', Color: '', CustomerExpectedPrice: ''
  });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    authFetch('/api/Brands?isActive=true')
      .then(res => setBrands(Array.isArray(res) ? res : res.data || []))
      .catch(err => notify('error', 'Lỗi tải thương hiệu: ' + err.message));

    authFetch('/api/Categories?isActive=true')
      .then(res => setCategories(Array.isArray(res) ? res : res.data || []))
      .catch(err => notify('error', 'Lỗi tải danh mục: ' + err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRequests = async () => {
    setLoadingList(true);
    setListError(false);
    try {
      const res = await authFetch('/api/Sourcing/my');
      setRequests(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setListError(true);
      notify('error', 'Lỗi tải danh sách: ' + err.message);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (view === 'list') loadRequests();
  }, [view]);

  const submit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return notify('error', 'Vui lòng tải lên ít nhất 1 hình ảnh!');
    if (files.length > 5) return notify('error', 'Chỉ được tải lên tối đa 5 hình ảnh!');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('Title', form.Title);
      formData.append('Description', form.Description);
      formData.append('BrandId', form.BrandId);
      formData.append('CategoryId', form.CategoryId);
      formData.append('DeclaredCondition', form.DeclaredCondition);
      if (form.Size) formData.append('Size', form.Size);
      if (form.Color) formData.append('Color', form.Color);
      if (form.CustomerExpectedPrice) formData.append('CustomerExpectedPrice', form.CustomerExpectedPrice);
      
      files.forEach(f => formData.append('Images', f));

      await authFetch('/api/Sourcing', { method: 'POST', body: formData });
      
      notify('success', 'Đã gửi yêu cầu bán đồ cũ thành công!');
      setForm({ Title: '', Description: '', BrandId: '', CategoryId: '', DeclaredCondition: 1, Size: '', Color: '', CustomerExpectedPrice: '' });
      setFiles([]);
      setView('list');
    } catch (err) {
      notify('error', err.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.some((file) => !file.type.startsWith('image/'))) {
      notify('error', 'Vui lòng chỉ chọn tệp hình ảnh.');
      e.target.value = '';
      return;
    }
    if (selected.length + files.length > 5) {
      notify('error', 'Chỉ được phép tải lên tối đa 5 ảnh.');
      return;
    }
    setFiles([...files, ...selected]);
    e.target.value = '';
  };

  const removeFile = (idx) => setFiles(files.filter((_, i) => i !== idx));

  return (
    <div className="pp-card pp-section-card">
      <SectionTitle kicker="Tài khoản / 05" title="Bán đồ cũ" description="Cho món đồ của bạn một vòng đời mới cùng REWEAR."
      action={
        view === 'list' ? (
          <button type="button" className="pp-btn" onClick={() => setView('new')}><PlusCircle size={16} /> Tạo yêu cầu</button>
        ) : (
          <button type="button" className="pp-btn ghost" onClick={() => setView('list')}>Danh sách yêu cầu</button>
        )
      } />

      {view === 'list' ? (
        <div className="pp-sourcing-content">
          {loadingList ? (
            <div className="pp-empty" role="status"><p>Đang tải yêu cầu...</p></div>
          ) : listError ? (
            <div className="pp-empty"><strong>Không tải được yêu cầu</strong><button type="button" className="pp-btn ghost" onClick={loadRequests}>Thử lại</button></div>
          ) : requests.length === 0 ? (
            <div className="pp-empty"><PlusCircle size={36} /><strong>Chưa có yêu cầu nào</strong><p>Chụp ảnh và gửi thông tin món đồ để bắt đầu.</p><button type="button" className="pp-btn" onClick={() => setView('new')}>Tạo yêu cầu đầu tiên</button></div>
          ) : (
            <div className="pp-sourcing-list">
              {requests.map(r => (
                <article key={r.id} className="pp-sourcing-item">
                  {r.images && r.images[0] && (
                    <img className="pp-sourcing-thumb" src={r.images[0].imageUrl || r.images[0]} alt={r.title} />
                  )}
                  <div className="pp-sourcing-item-main">
                    <span className="pp-sourcing-date">Yêu cầu #{String(r.id).slice(0, 8)} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ ngày'}</span>
                    <h3>{r.title}</h3>
                    <p>{r.description || 'Chưa có mô tả'}</p>
                    <span className={`pp-sourcing-status ${sourcingTone(r.status)}`}>{sourcingStatus(r.status)}</span>
                  </div>
                  <button type="button" className="pp-btn ghost" onClick={() => handleViewDetail(r.id)}>Xem chi tiết</button>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : (
        <form className="pp-addr-form pp-sourcing-form" onSubmit={submit}>
          <div className="pp-form-intro"><h3>Thông tin món đồ</h3><p>Mô tả chính xác để cửa hàng có thể định giá nhanh hơn.</p></div>
          <div className="pp-grid-2">
            <label className="pp-input-field">Tên sản phẩm *
              <input placeholder="Ví dụ: Áo khoác Jean Levis" value={form.Title} onChange={setF('Title')} required />
            </label>
            <label className="pp-input-field">Giá mong muốn bán (VND)
              <input type="number" min={1} placeholder="Ví dụ: 150000" value={form.CustomerExpectedPrice} onChange={setF('CustomerExpectedPrice')} />
            </label>
            <label className="pp-input-field">Thương hiệu *
              <select value={form.BrandId} onChange={setF('BrandId')} required>
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </label>
            <label className="pp-input-field">Danh mục *
              <select value={form.CategoryId} onChange={setF('CategoryId')} required>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="pp-input-field">Kích cỡ
              <input placeholder="S, M, L..." value={form.Size} onChange={setF('Size')} />
            </label>
            <label className="pp-input-field">Màu sắc
              <input placeholder="Trắng, Đen, Xanh..." value={form.Color} onChange={setF('Color')} />
            </label>
          </div>

          <label className="pp-input-field">Tình trạng món đồ *
            <select value={form.DeclaredCondition} onChange={setF('DeclaredCondition')} required>
              <option value={1}>1 - Như mới</option>
              <option value={2}>2 - Tốt</option>
              <option value={3}>3 - Khá</option>
            </select>
          </label>

          <label className="pp-input-field">Mô tả chi tiết *
            <textarea rows={4} placeholder="Tình trạng hiện tại, số lần mặc, lỗi (nếu có)..." value={form.Description} onChange={setF('Description')} required />
          </label>

          <div className="pp-upload-zone">
            <div className="pp-upload-heading"><strong>Hình ảnh món đồ *</strong><span>1–5 ảnh rõ mặt trước, mặt sau và chi tiết lỗi nếu có</span></div>
            <div className="pp-upload-list">
              {files.map((f, idx) => (
                <div key={`${f.name}-${idx}`} className="pp-upload-preview">
                  <img src={previews[idx]} alt={`Ảnh tải lên ${idx + 1}`} />
                  <button type="button" aria-label={`Xóa ảnh ${f.name}`} onClick={() => removeFile(idx)}>×</button>
                </div>
              ))}
              {files.length < 5 && (
                <label className="pp-upload-add">
                  <UploadCloud size={22} />
                  <span>Thêm ảnh</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} aria-label="Thêm ảnh món đồ" />
                </label>
              )}
            </div>
          </div>

          <div className="pp-actions-right pp-sourcing-actions">
            <button type="button" className="pp-btn ghost" onClick={() => setView('list')}>Hủy</button>
            <button type="submit" className="pp-btn" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        </form>
      )}

      {/* Sourcing Detail Modal (Customer) */}
      {detailModal.open && (
        <div className="pp-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setDetailModal({ open: false, data: null, loading: false }); }}>
          <div ref={modalRef} className="pp-modal-content" role="dialog" aria-modal="true" aria-labelledby="pp-sourcing-dialog-title">
            <div className="pp-modal-head">
              <h3 id="pp-sourcing-dialog-title">Chi tiết yêu cầu</h3>
              <button ref={modalCloseRef} type="button" className="pp-modal-close" aria-label="Đóng chi tiết" onClick={() => setDetailModal({ open: false, data: null, loading: false })}>×</button>
            </div>
            <div className="pp-modal-body">
              {detailModal.loading ? (
                <div className="pp-empty" role="status">Đang tải chi tiết...</div>
              ) : detailModal.data ? (
                <div className="pp-detail-grid">
                  <div className="pp-grid-2">
                    <div className="pp-detail-field"><span>Tên sản phẩm</span><strong>{detailModal.data.title}</strong></div>
                    <div className="pp-detail-field"><span>Trạng thái</span><span className={`pp-sourcing-status ${sourcingTone(detailModal.data.status)}`}>{sourcingStatus(detailModal.data.status)}</span></div>
                  </div>
                  <div className="pp-detail-field"><span>Mô tả</span><p>{detailModal.data.description || 'Không có mô tả'}</p></div>
                  <div className="pp-grid-2">
                    <div className="pp-detail-field"><span>Kích cỡ / Màu sắc</span><strong>{detailModal.data.size || '—'} / {detailModal.data.color || '—'}</strong></div>
                    <div className="pp-detail-field"><span>Giá mong muốn</span><strong>{detailModal.data.customerExpectedPrice ? fmt(Number(detailModal.data.customerExpectedPrice)) : 'Chưa nhập'}</strong></div>
                  </div>
                  {(detailModal.data.offeredPrice > 0 || detailModal.data.adminNote) && (
                    <div className="pp-grid-2 pp-detail-offer">
                      <div className="pp-detail-field"><span>Giá REWEAR đề xuất</span><strong>{detailModal.data.offeredPrice ? fmt(Number(detailModal.data.offeredPrice)) : '—'}</strong></div>
                      <div className="pp-detail-field"><span>Ghi chú từ cửa hàng</span><p>{detailModal.data.adminNote || '—'}</p></div>
                    </div>
                  )}
                  <div className="pp-detail-field"><span>Hình ảnh đính kèm</span>
                    {(() => {
                      const imgs = detailModal.data.images || detailModal.data.sourcingImages || detailModal.data.imageUrls || [];
                      return imgs.length > 0 ? (
                        <div className="pp-detail-images">
                          {imgs.map((img, idx) => (
                            <img key={idx} src={img.imageUrl || img.url || img} alt={`Ảnh món đồ ${idx + 1}`} />
                          ))}
                        </div>
                      ) : (
                        <p>Không có ảnh</p>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="pp-empty">Không có dữ liệu</div>
              )}
            </div>
            <div className="pp-modal-footer">
              {detailModal.data && (detailModal.data.status === 'Priced' || detailModal.data.status === 2 || detailModal.data.status === '2') && (
                <>
                  <button type="button" className="pp-btn ghost" onClick={() => handleDeclineOffer(detailModal.data.id)}>Từ chối giá</button>
                  <button type="button" className="pp-btn" onClick={() => handleAcceptOffer(detailModal.data.id)}>Đồng ý giá</button>
                </>
              )}
              <button type="button" className="pp-btn ghost" onClick={() => setDetailModal({ open: false, data: null, loading: false })}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Page ───────────────────────── */
export default function ProfilePage() {
  const { openCart, cartItemCount } = useCart();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const section = MENU.some((m) => m.key === params.get('tab')) ? params.get('tab') : 'profile';
  const [session, setSession] = useState(getSession());
  const [toast, setToast] = useState(null);

  useEffect(() => onAuthChange(() => setSession(getSession())), []);
  useEffect(() => { if (!session) navigate('/', { replace: true }); }, [session]);
  useEffect(() => { window.scrollTo(0, 0); }, [section]);

  const notify = (type, text) => {
    setToast({ type, text, id: Date.now() });
    setTimeout(() => setToast((t) => (t && Date.now() - t.id >= 2900 ? null : t)), 3000);
  };

  if (!session) return null;

  const name = session.fullName || session.email || 'Thành viên';
  const avatar = getAvatarUrl(session);

  return (
    <div className="rw pp-page">
      <div className="rw-announcement"><div className="rw-announcement-inner"><span>Thời trang tuần hoàn, thêm vòng đời mới</span></div></div>

      <nav className="rw-nav" aria-label="Điều hướng chính">
        <div className="rw-nav-inner">
          <div className="rw-nav-left">
            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="rw-logo-pill">REWEAR</a>
            <div className="rw-nav-menu">
              {[['/new-in', 'Mới về'], ['/women', 'Nữ'], ['/men', 'Nam'], ['/world', 'Thế giới REWEAR'], ['/about', 'Giới thiệu']].map(([to, l]) => (
                <a key={to} href={to} onClick={(e) => { e.preventDefault(); navigate(to); }} className="rw-nav-lk">{l}</a>
              ))}
            </div>
          </div>
          <div className="rw-nav-right">
            <Link to="/new-in#catalog-tools" className="rw-nav-pill" aria-label="Tìm kiếm sản phẩm"><Search size={15} aria-hidden="true" /><span>Tìm kiếm</span></Link>
            <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}><ShoppingBag size={15} aria-hidden="true" /><span>Giỏ hàng ({cartItemCount})</span></button>
            <AccountMenu className="rw-nav-pill" withSpan />
          </div>
        </div>
      </nav>

      <div className="pp-layout">
        <aside className="pp-sidebar">
          <div className="pp-user">
            <div className="pp-avatar-sm">{avatar ? <img src={avatar} alt="" /> : name.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{name}</strong>
              <span className="pp-user-meta">Tài khoản REWEAR</span>
            </div>
          </div>
          <nav className="pp-menu">
            {MENU.map(({ key, label, icon: Icon }) => (
              <button type="button" key={key} className={section === key ? 'active' : ''} aria-current={section === key ? 'page' : undefined} onClick={() => setParams({ tab: key })}>
                <Icon size={17} />{label}
              </button>
            ))}
            <button className="logout" onClick={() => { clearSession(); navigate('/'); }}>
              <LogOut size={17} />Đăng xuất
            </button>
          </nav>
        </aside>

        <main className="pp-main">
          {section === 'profile' && <ProfileSection notify={notify} />}
          {section === 'addresses' && <AddressSection notify={notify} />}
          {section === 'orders' && <OrdersSection />}
          {section === 'history' && <HistorySection />}
          {section === 'sourcing' && <SourcingSection notify={notify} />}
        </main>
      </div>

      {toast && <div role="status" className={`pp-toast ${toast.type}`} key={toast.id}>{toast.text}</div>}

      <RainsFooter />
    </div>
  );
}
