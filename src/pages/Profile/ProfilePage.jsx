import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { User, MapPin, Package, LogOut, Camera, ChevronRight, Search, ShoppingBag, PlusCircle, UploadCloud, Pencil, Truck, Bell } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import RainsFooter from '../../components/common/RainsFooter';
import AccountMenu from '../../components/common/AccountMenu';
import { getSession, clearSession, onAuthChange, profileApi, ordersApi, updateSessionUser, getAvatarUrl, authFetch } from '../../services/auth';
import { shippingData, shippingField, shippingStatus, shippingStatusLabel } from '../../services/shipping';
import '../Home/HomePage.css';
import CustomerReturnRequest from '../../components/common/CustomerReturnRequest';
import SourcingRequestDetail from '../../components/common/SourcingRequestDetail';
import { paymentLabels } from '../Operations/labels';
import DeliveryTimeline from '../Shipping/DeliveryTimeline';
import StyleWatchSection from './StyleWatchSection';
import NotificationCenter from '../../components/common/NotificationCenter';
import '../Shipping/Delivery.css';
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
      name: readField(item, 'productName', 'productTitle', 'name', 'title') ?? readField(product, 'title', 'name') ?? 'Sản phẩm',
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
    : readField(addressValue, 'fullAddress') || [readField(addressValue, 'streetAddress', 'addressLine', 'address'), readField(addressValue, 'ward'), readField(addressValue, 'district'), readField(addressValue, 'province', 'city')].filter(Boolean).join(', ');
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
    shippingStatus: readField(raw, 'shippingStatus'),
    paymentMethod: readField(raw, 'paymentMethod'),
    recipientName: readField(addressValue, 'recipientName'),
    recipientPhone: readField(addressValue, 'phoneNumber'),
    address,
    tracking: tracking === undefined ? null : String(tracking),
    note: note === undefined ? readField(addressValue, 'note') : String(note),
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
  3: 'Đã giao', 4: 'Đã hủy', 5: 'Hết hạn thanh toán', 6: 'Giao thất bại',
  7: 'Yêu cầu trả hàng', 8: 'Đã nhận hàng hoàn', 9: 'Đã kiểm định hàng hoàn',
  AwaitingPayment: 'Chờ thanh toán', Confirmed: 'Đã xác nhận', Shipping: 'Đang giao',
  Delivered: 'Đã giao', Cancelled: 'Đã hủy', PaymentExpired: 'Hết hạn thanh toán', Failed: 'Giao thất bại',
  ReturnRequested: 'Yêu cầu trả hàng', ReturnReceived: 'Đã nhận hàng hoàn', Returned: 'Đã kiểm định hàng hoàn',
};
const getOrderStatusLabel = (status) => ORDER_STATUS_LABELS[status] || ORDER_STATUS_LABELS[String(status)] || (status == null ? 'Chưa có trạng thái' : String(status));
const paymentStatusLabel = status => paymentLabels[status] || 'Chưa xác nhận';
const isPaymentPaid = status => status === 'Paid' || status === '1' || status === 1;
const SOURCING_STATUS = {
  0: 'Chờ duyệt', 1: 'Đang xem xét', 2: 'Đã định giá', 3: 'Đã đồng ý giá',
  4: 'Đã nhận hàng', 5: 'Đã chấp nhận', 6: 'Hoàn tất', 7: 'Đã từ chối', 8: 'Đã từ chối giá',
  Pending: 'Chờ duyệt', UnderReview: 'Đang xem xét', Priced: 'Đã định giá',
  Accepted: 'Đã đồng ý giá', Received: 'Đã nhận hàng', Approved: 'Đã chấp nhận',
  Rejected: 'Đã từ chối', Declined: 'Đã từ chối giá', Completed: 'Hoàn tất',
};
const sourcingStatus = (status) => SOURCING_STATUS[status ?? 0] || String(status);
const sourcingTone = (status) => ['7', 'Rejected', '8', 'Declined'].includes(String(status)) ? 'rejected' : ['5', 'Approved', '6', 'Completed'].includes(String(status)) ? 'approved' : 'progress';

const MENU = [
  { key: 'profile', label: 'Hồ sơ của tôi', icon: User },
  { key: 'addresses', label: 'Sổ địa chỉ', icon: MapPin },
  { key: 'orders', label: 'Đơn mua', icon: Package },
  { key: 'delivery', label: 'Theo dõi giao hàng', icon: Truck },
  { key: 'notifications', label: 'Thông báo', icon: Bell },
  { key: 'style', label: 'Theo dõi gu đồ', icon: Bell },
  { key: 'sourcing', label: 'Bán đồ cũ', icon: PlusCircle },
];

const EMPTY_ADDR = {
  recipientName: '', phoneNumber: '', province: '', district: '',
  ward: '', streetAddress: '', note: '', isDefault: false,
};

function SectionTitle({ kicker, title, description, action }) {
  return <div className="pp-card-head row pp-section-head">
    <div><span className="pp-profile-eyebrow">{kicker}</span><h2>{title}</h2>{description && <p>{description}</p>}</div>
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
          <span className="pp-profile-eyebrow">Tài khoản của bạn</span>
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
              <div className={`pp-addr ${a.isDefault ? 'is-default' : ''}`} key={id}>
                <div className="pp-addr-main">
                  <div className="pp-addr-name">
                    <strong>{a.recipientName}</strong>
                    {a.isDefault && <span className="pp-tag">Mặc định</span>}
                  </div>
                  <p className="pp-addr-phone">{a.phoneNumber}</p>
                  <p className="pp-addr-street">{a.streetAddress}</p>
                  <p className="pp-addr-region">{[a.ward, a.district, a.province].filter(Boolean).join(', ')}</p>
                  {a.note && <p className="pp-muted pp-addr-note">Ghi chú: {a.note}</p>}
                </div>
                <div className="pp-addr-side">
                  <div className="pp-links">
                    <button type="button" onClick={() => edit(a)}>Chỉnh sửa</button>
                    {!a.isDefault && <button type="button" className="danger" disabled={loading} onClick={() => window.confirm('Xóa địa chỉ này?') && run(() => profileApi.deleteAddress(id), 'Đã xóa địa chỉ.')}>Xóa</button>}
                  </div>
                  {!a.isDefault && (
                    <button type="button" className="pp-btn ghost sm" disabled={loading} onClick={() => run(() => profileApi.setDefault(id), 'Đã đặt làm mặc định.')}>
                      Đặt làm mặc định
                    </button>
                  )}
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
function OrderCard({ order, initiallyOpen = false }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [detail, setDetail] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [detailStatus, setDetailStatus] = useState('idle');
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const id = order.requestId;
  const loadDetail = useCallback(async (background = false) => {
    if (!id) return;
    const request = ++sequence.current;
    if (!background) setDetailStatus('loading');
    setError('');
    try {
      const tracking = shippingData(await ordersApi.tracking(id));
      if (!tracking?.order) throw new Error('Chưa có dữ liệu theo dõi của đơn hàng.');
      if (request !== sequence.current) return;
      setDetail(normalizeOrder(tracking.order));
      setShipment(tracking.shipping || null);
      setEvents(Array.isArray(tracking.deliveryHistory) ? tracking.deliveryHistory : []);
      setDetailStatus('ready');
    } catch (err) {
      if (request === sequence.current) { setError(err.message || 'Không tải được hành trình đơn hàng.'); setDetailStatus(previous => previous === 'ready' && background ? previous : 'error'); }
    }
  }, [id]);
  useEffect(() => {
    if (!open) return;
    loadDetail();
    const timer = setInterval(() => { if (!document.hidden) loadDetail(true); }, 20000);
    return () => { sequence.current += 1; clearInterval(timer); };
  }, [open, loadDetail]);
  const shown = detail || order;
  const deliveryStatus = shipment ? shippingStatus(shipment) : shown.shippingStatus;
  return <article className="pp-order">
    <div className="pp-order-head">
      <div className="pp-order-shop"><span className="pp-shop-pill">REWEAR</span><span className="pp-muted">Mã đơn: {shown.id}{shown.createdAt ? ' · ' + fmtDate(shown.createdAt) : ''}</span></div>
      <div className="pp-status">{shown.statusLabel}</div>
    </div>
    {shown.items.map((item, index) => {
      const content = <>{item.image ? <img src={item.image} alt={item.name} /> : <div className="pp-order-placeholder"><Package size={20} /></div>}<div className="pp-order-info"><div className="pp-order-name">{item.name}</div>{item.variant && <div className="pp-muted">Phân loại: {item.variant}</div>}<div className="pp-muted">Số lượng: {item.qty}</div></div>{formatOrderMoney(item.price) && <div className="pp-order-price">{formatOrderMoney(item.price)}</div>}</>;
      return item.productId ? <Link className="pp-order-item" key={index} to={'/product/' + item.productId}>{content}</Link> : <div className="pp-order-item" key={index}>{content}</div>;
    })}
    {/* Khối trạng thái giao hàng riêng biệt */}
    <div className="pp-order-delivery-block" aria-label="Trạng thái giao hàng">
      <div className="pp-delivery-badge-group">
        <div className="pp-delivery-icon-circle">
          <Truck size={17} />
        </div>
        <div className="pp-delivery-info">
          <span className="pp-delivery-label">Trạng thái vận chuyển</span>
          <strong className="pp-delivery-value">
            {deliveryStatus != null ? shippingStatusLabel(deliveryStatus) : isPaymentPaid(shown.paymentStatus) ? 'Đang chuẩn bị giao hàng' : 'Chưa phân công giao hàng'}
          </strong>
        </div>
      </div>
      {shipment?.trackingNumber && (
        <div className="pp-delivery-meta">
          <span>Mã vận đơn: <strong>{shipment.trackingNumber}</strong></span>
          {shipment?.carrier && <span className="pp-muted">({shipment.carrier})</span>}
        </div>
      )}
    </div>

    <div className="pp-order-foot">
      <div className="pp-order-foot-left">
        <div className="pp-payment-inline">
          <span className="pp-muted">Thanh toán:</span>
          <span className={`pp-payment-badge ${isPaymentPaid(shown.paymentStatus) ? 'paid' : ''}`}>
            {paymentStatusLabel(shown.paymentStatus)}
          </span>
        </div>
        {formatOrderMoney(shown.total) && <div className="pp-order-total">Tổng thanh toán: <strong>{formatOrderMoney(shown.total)}</strong></div>}
      </div>
      <div className="pp-order-actions">
        <button type="button" className="pp-btn ghost" aria-expanded={open} aria-controls={'tracking-' + id} disabled={!id} onClick={() => setOpen(value => !value)}>
          {open ? 'Ẩn chi tiết' : 'Theo dõi đơn hàng'}
        </button>
      </div>
    </div>
    {open && <div className="pp-order-expanded" id={'tracking-' + id}>
      {detailStatus === 'loading' && <p role="status">Đang tải hành trình đơn hàng…</p>}
      {error && <div className="pp-order-detail-error" role="alert">{error}<button type="button" onClick={() => loadDetail()}>Thử lại</button></div>}
      {detailStatus === 'ready' && detail && <>
        <section className="pp-tracking-section"><h3>Thông tin nhận hàng</h3><p><strong>{detail.recipientName}</strong>{detail.recipientPhone ? ' · ' + detail.recipientPhone : ''}</p><p>{detail.address || 'Chưa có địa chỉ nhận hàng'}</p>{detail.note && <p>Ghi chú: {detail.note}</p>}</section>
        <section className="pp-tracking-section"><h3>Theo dõi giao hàng</h3>{shipment ? <><p>Trạng thái: <strong>{shippingStatusLabel(shippingStatus(shipment))}</strong></p>{shipment.shipperName && <p>Người giao hàng: <strong>{shipment.shipperName}</strong></p>}{shipment.carrier && <p>Đơn vị vận chuyển: {shipment.carrier}</p>}{shipment.trackingNumber && <p>Mã vận đơn: {shipment.trackingNumber}</p>}{shipment.estimatedDeliveryDate && <p>Dự kiến giao: {fmtDate(shipment.estimatedDeliveryDate)}</p>}{shipment.status === 'Failed' && <p role="status">{shipment.lastFailureReason || 'REWEAR đang xử lý lần giao chưa thành công.'}</p>}</> : <p>{isPaymentPaid(detail.paymentStatus) ? 'REWEAR đang chuẩn bị và phân công giao hàng.' : 'Đơn chưa được phân công giao hàng.'}</p>}
          <DeliveryTimeline events={events} />
        </section>
        <section className="pp-tracking-section"><h3>Thanh toán</h3><p>Phương thức: {String(detail.paymentMethod).toLowerCase().includes('pay') ? 'payOS' : 'Chưa xác định'}</p><p>Trạng thái: <strong>{paymentStatusLabel(detail.paymentStatus)}</strong></p>{detail.shippingFee !== undefined && <p>Phí giao hàng: {formatOrderMoney(detail.shippingFee)}</p>}<p>Tổng tiền: <strong>{formatOrderMoney(detail.total)}</strong></p></section>
        <CustomerReturnRequest order={detail} onChanged={loadDetail} />
        <button type="button" className="pp-btn ghost" onClick={() => loadDetail()}>Cập nhật hành trình</button>
      </>}
    </div>}
  </article>;
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

function OrdersSection({ selectedOrderId }) {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { orders, totalPages, totalCount, loading, error, retry } = useCustomerOrders({ status, page });
  const shown = orders.filter((order) => !q || order.id.toLowerCase().includes(q.toLowerCase()) || order.items.some((item) => item.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <div className="pp-card pp-section-card pp-section-intro">
        <SectionTitle kicker="Tài khoản / 03" title="Đơn mua" description="Xem tất cả đơn mua, trạng thái thanh toán và hành trình giao hàng tại đây." />
        <button type="button" className="pp-btn ghost" onClick={retry} disabled={loading}>Cập nhật đơn mua</button>
      </div>
      <div className="pp-order-filters">
        <label htmlFor="order-status">Trạng thái đơn hàng</label>
        <select id="order-status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => <option key={value} value={value}>{ORDER_STATUS_LABELS[value]}</option>)}
        </select>
        <div className="pp-search"><Search size={16} /><input aria-label="Tìm đơn hàng" placeholder="Tìm mã đơn hoặc tên sản phẩm trên trang này" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      {selectedOrderId && <OrderCard key={selectedOrderId} order={orders.find(order => order.requestId === selectedOrderId) || { requestId: selectedOrderId, id: 'Đơn được chọn', items: [] }} initiallyOpen />}
      {loading ? <div className="pp-card pp-order-state" role="status">Đang tải đơn hàng…</div>
        : error ? <div className="pp-card pp-order-state pp-order-error" role="alert"><strong>Chưa tải được đơn hàng</strong><span>{error}</span><button type="button" className="pp-btn ghost" onClick={retry}>Thử lại</button></div>
          : shown.length === 0 ? (
            <div className="pp-card pp-empty"><Package size={36} /><strong>{orders.length ? 'Không tìm thấy đơn phù hợp' : 'Bạn chưa có đơn hàng'}</strong><p>{orders.length ? 'Thử từ khóa khác trong các đơn đang hiển thị.' : 'Đơn hàng của bạn sẽ xuất hiện tại đây sau khi đặt hàng.'}</p>{q && <button type="button" className="pp-btn ghost" onClick={() => setQ('')}>Xóa từ khóa</button>}</div>
          ) : (
            shown.filter(order => order.requestId !== selectedOrderId).map(order => <OrderCard key={order.requestId || order.id} order={order} />)
          )}
      {!loading && !error && orders.length > 0 && <div className="pp-order-pagination"><span>{totalCount !== null ? `${totalCount} đơn hàng` : `Trang ${page}${totalPages ? ` / ${totalPages}` : ''}`}</span><div><button type="button" className="pp-btn ghost" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Trước</button><button type="button" className="pp-btn ghost" disabled={(totalPages !== null && page >= totalPages) || (totalPages === null && orders.length < 10)} onClick={() => setPage((value) => value + 1)}>Tiếp</button></div></div>}
    </>
  );
}

/* ───────────────────────── Delivery section ───────────────────────── */
function DeliveryTrackerCard({ order }) {
  const [detail, setDetail] = useState(null);
  const [shipment, setShipment] = useState(null);
  const [events, setEvents] = useState([]);
  const [detailStatus, setDetailStatus] = useState('loading');
  const [error, setError] = useState('');
  const id = order.requestId;

  const loadTracking = useCallback(async (background = false) => {
    if (!id) return;
    if (!background) setDetailStatus('loading');
    setError('');
    try {
      const tracking = shippingData(await ordersApi.tracking(id));
      if (!tracking?.order) throw new Error('Chưa có dữ liệu theo dõi của đơn hàng.');
      setDetail(normalizeOrder(tracking.order));
      setShipment(tracking.shipping || null);
      setEvents(Array.isArray(tracking.deliveryHistory) ? tracking.deliveryHistory : []);
      setDetailStatus('ready');
    } catch (err) {
      setError(err.message || 'Chưa tải được lộ trình vận chuyển.');
      setDetailStatus(previous => previous === 'ready' && background ? previous : 'error');
    }
  }, [id]);

  useEffect(() => {
    loadTracking();
    const timer = setInterval(() => { if (!document.hidden) loadTracking(true); }, 20000);
    return () => clearInterval(timer);
  }, [loadTracking]);

  const shown = detail || order;
  const deliveryStatus = shipment ? shippingStatus(shipment) : shown.shippingStatus;
  const statusText = deliveryStatus != null
    ? shippingStatusLabel(deliveryStatus)
    : isPaymentPaid(shown.paymentStatus)
      ? 'Đang chuẩn bị giao hàng'
      : 'Chờ thanh toán / phân công';

  return (
    <article className="pp-card pp-delivery-tracker-card">
      <div className="pp-delivery-tracker-head">
        <div className="pp-tracker-title-group">
          <div className="pp-tracker-icon-badge">
            <Truck size={20} />
          </div>
          <div>
            <div className="pp-tracker-order-id">
              <span>Đơn hàng:</span> <strong>{shown.id}</strong>
              {shown.createdAt && <span className="pp-muted"> · {fmtDate(shown.createdAt)}</span>}
            </div>
            <div className="pp-tracker-status-tag">
              <span className={`pp-delivery-pill status-${deliveryStatus ?? (isPaymentPaid(shown.paymentStatus) ? 'preparing' : 'awaiting')}`}>
                {statusText}
              </span>
            </div>
          </div>
        </div>

        <div className="pp-tracker-head-actions">
          <button type="button" className="pp-btn ghost sm" onClick={() => loadTracking()}>
            Cập nhật lộ trình
          </button>
        </div>
      </div>

      {/* Thông tin vận chuyển tóm tắt */}
      <div className="pp-tracker-meta-grid">
        <div className="pp-tracker-meta-item">
          <span className="pp-tracker-meta-label">Mã vận đơn</span>
          <strong>{shipment?.trackingNumber || 'Đang tạo mã vận đơn'}</strong>
        </div>
        <div className="pp-tracker-meta-item">
          <span className="pp-tracker-meta-label">Đơn vị vận chuyển</span>
          <strong>{shipment?.carrier || 'REWEAR Express'}</strong>
        </div>
        <div className="pp-tracker-meta-item">
          <span className="pp-tracker-meta-label">Người giao hàng</span>
          <strong>{shipment?.shipperName || 'Đang phân công shipper'}</strong>
        </div>
        <div className="pp-tracker-meta-item">
          <span className="pp-tracker-meta-label">Dự kiến giao</span>
          <strong>{shipment?.estimatedDeliveryDate ? fmtDate(shipment.estimatedDeliveryDate) : '1 - 3 ngày làm việc'}</strong>
        </div>
      </div>

      {/* Lộ trình chi tiết */}
      <div className="pp-tracker-timeline-wrap">
        <h4>Lộ trình vận chuyển</h4>
        {detailStatus === 'loading' && <p className="pp-muted">Đang cập nhật vị trí kiện hàng...</p>}
        {error && <p className="pp-muted pp-order-detail-error">{error}</p>}
        <DeliveryTimeline events={events} />
      </div>

      {/* Thông tin nhận hàng & Kiện hàng */}
      <div className="pp-tracker-footer-grid">
        <div className="pp-tracker-address">
          <h4>Địa chỉ nhận hàng</h4>
          <p className="pp-tracker-recipient">
            <strong>{shown.recipientName || 'Người nhận'}</strong>
            {shown.recipientPhone ? ` · ${shown.recipientPhone}` : ''}
          </p>
          <p className="pp-tracker-dest">{shown.address || 'Địa chỉ giao hàng'}</p>
          {shown.note && <p className="pp-muted pp-addr-note">Ghi chú: {shown.note}</p>}
        </div>

        <div className="pp-tracker-items">
          <h4>Kiện hàng ({shown.items.length} món)</h4>
          <div className="pp-tracker-item-list">
            {shown.items.map((item, idx) => (
              <div key={idx} className="pp-tracker-mini-item">
                {item.image ? <img src={item.image} alt={item.name} /> : <div className="pp-order-placeholder"><Package size={16} /></div>}
                <div className="pp-tracker-mini-info">
                  <span className="pp-tracker-mini-name">{item.name}</span>
                  <span className="pp-muted">SL: {item.qty} {item.variant ? ` · ${item.variant}` : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function DeliverySection({ selectedOrderId }) {
  const [filter, setFilter] = useState('all');
  const { orders, loading, error, retry } = useCustomerOrders({ pageSize: 20 });

  const deliveryOrders = useMemo(() => {
    return orders.filter(order => {
      if (filter === 'active') {
        const status = String(order.status);
        return ['Confirmed', 'Shipping', 'Failed', 'ReturnRequested', 'ReturnReceived', '1', '2', '6', '7', '8'].includes(status)
          || (order.status == null && isPaymentPaid(order.paymentStatus));
      }
      if (filter === 'completed') {
        return ['Delivered', 'Returned', '3', '9'].includes(String(order.status));
      }
      return true;
    });
  }, [orders, filter]);

  return (
    <>
      <div className="pp-card pp-section-card pp-section-intro">
        <SectionTitle
          kicker="Tài khoản / 04"
          title="Theo dõi giao hàng"
          description="Tra cứu tiến độ vận chuyển, lộ trình kiện hàng và cập nhật trực tiếp từ Shipper theo thời gian thực."
          action={
            <button type="button" className="pp-btn ghost" onClick={retry} disabled={loading}>
              Làm mới dữ liệu
            </button>
          }
        />
      </div>

      <div className="pp-delivery-tabs-bar">
        <div className="pp-delivery-filter-pills">
          <button type="button" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            Tất cả đơn giao ({orders.length})
          </button>
          <button type="button" className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>
            Đang vận chuyển / Chuẩn bị
          </button>
          <button type="button" className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
            Đã giao thành công
          </button>
        </div>
      </div>

      {loading ? (
        <div className="pp-card pp-order-state" role="status">Đang tải danh sách kiện hàng…</div>
      ) : error ? (
        <div className="pp-card pp-order-state pp-order-error" role="alert">
          <strong>Chưa tải được thông tin giao hàng</strong>
          <span>{error}</span>
          <button type="button" className="pp-btn ghost" onClick={retry}>Thử lại</button>
        </div>
      ) : deliveryOrders.length === 0 ? (
        <div className="pp-card pp-empty">
          <Truck size={40} />
          <strong>Chưa có kiện hàng nào cần theo dõi</strong>
          <p>Khi bạn hoàn tất đặt hàng, tiến độ vận chuyển của shipper sẽ hiển thị trực tiếp tại mục này.</p>
        </div>
      ) : (
        deliveryOrders.map(order => (
          <DeliveryTrackerCard key={order.requestId || order.id} order={order} />
        ))
      )}
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
      await authFetch(`/api/Sourcing/${id}/accept`, { method: 'PATCH', body: JSON.stringify({ offerVersion: detailModal.data?.offerVersion }) });
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
              <option value={0}>Như mới</option>
              <option value={1}>Rất tốt</option>
              <option value={2}>Tốt</option>
              <option value={3}>Khá</option>
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
          <div ref={modalRef} className="pp-modal-content srd-dialog" role="dialog" aria-modal="true" aria-labelledby="pp-sourcing-dialog-title">
            <div className="pp-modal-head">
              <h3 id="pp-sourcing-dialog-title">Chi tiết yêu cầu</h3>
              <button ref={modalCloseRef} type="button" className="pp-modal-close" aria-label="Đóng chi tiết" onClick={() => setDetailModal({ open: false, data: null, loading: false })}>×</button>
            </div>
            <div className="pp-modal-body">
              {detailModal.loading ? (
                <div className="pp-empty" role="status">Đang tải chi tiết...</div>
              ) : detailModal.data ? (
                <SourcingRequestDetail request={detailModal.data} statusLabel={sourcingStatus(detailModal.data.status)} statusTone={sourcingTone(detailModal.data.status)} />
              ) : (
                <div className="pp-empty">Không có dữ liệu</div>
              )}
            </div>
            <div className="pp-modal-footer">
              {detailModal.data && (detailModal.data.status === 'Priced' || detailModal.data.status === 2 || detailModal.data.status === '2' || detailModal.data.requiresRevisedAcceptance) && (
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
  const { id: selectedOrderId } = useParams();
  const { openCart, cartItemCount } = useCart();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get('tab');
  const section = selectedOrderId || requestedTab === 'history' ? 'orders' : MENU.some(m => m.key === requestedTab) ? requestedTab : 'profile';
  useEffect(() => {
    if (requestedTab === 'history') { const next = new URLSearchParams(params); next.set('tab', 'orders'); setParams(next, { replace: true }); }
  }, [requestedTab, params, setParams]);
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
              <button type="button" key={key} className={section === key ? 'active' : ''} aria-current={section === key ? 'page' : undefined} onClick={() => navigate(`/profile?tab=${key}`)}>
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
          {section === 'orders' && <OrdersSection selectedOrderId={selectedOrderId} />}
          {section === 'delivery' && <DeliverySection selectedOrderId={selectedOrderId} />}
          {section === 'style' && <StyleWatchSection notify={notify} />}
          {section === 'notifications' && <NotificationCenter />}
          {section === 'sourcing' && <SourcingSection notify={notify} />}
        </main>
      </div>

      {toast && <div role="status" className={`pp-toast ${toast.type}`} key={toast.id}>{toast.text}</div>}

      <RainsFooter />
    </div>
  );
}
