import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ImageOff, MapPin, ShieldCheck, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import AccountMenu from '../../components/common/AccountMenu';
import { useCart } from '../../contexts/CartContext';
import { getSession, onAuthChange, profileApi, authFetch, paymentsApi, shippingApi } from '../../services/auth';
import { shippingRates } from '../../services/shipping';
import { formatCurrency } from '../../utils/formatters';
import './CheckoutPage.css';

const unwrapList = response => {
  const data = response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.addresses)) return data.addresses;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const readAddressId = address => address?.id ?? address?._id ?? address?.addressId;

const readApiField = (source, ...fieldNames) => {
  if (!source || typeof source !== 'object') return undefined;
  const names = new Set(fieldNames.map(name => name.toLowerCase()));
  const key = Object.keys(source).find(name => names.has(name.toLowerCase()));
  return key ? source[key] : undefined;
};

const extractOrderId = (response, depth = 0, parentKey = '') => {
  if (depth > 5 || response == null) return '';
  if (typeof response === 'string') {
    const raw = response.trim();
    if (!raw || /^https?:\/\//i.test(raw)) return '';
    try {
      return extractOrderId(JSON.parse(raw), depth + 1, parentKey);
    } catch {
      return parentKey.toLowerCase() === 'data' || !parentKey ? raw : '';
    }
  }
  if (typeof response !== 'object' || Array.isArray(response)) return '';
  const id = readApiField(response, 'orderId', 'id');
  if (typeof id === 'string' || typeof id === 'number') return String(id).trim();
  for (const key of ['data', 'result', 'order', 'createdOrder']) {
    const nested = readApiField(response, key);
    const nestedId = extractOrderId(nested, depth + 1, key);
    if (nestedId) return nestedId;
  }
  return '';
};

const extractOrderCode = response => {
  if (!response || typeof response !== 'object' || Array.isArray(response)) return '';
  const code = readApiField(response, 'orderCode', 'code', 'orderNumber');
  if (typeof code === 'string' || typeof code === 'number') return String(code);
  for (const key of ['data', 'result', 'order', 'createdOrder']) {
    const nestedCode = extractOrderCode(readApiField(response, key));
    if (nestedCode) return nestedCode;
  }
  return '';
};

const getPaymentUrl = response => {
  if (typeof response === 'string') {
    try {
      return getPaymentUrl(JSON.parse(response));
    } catch {
      return response;
    }
  }
  const urlKeys = new Set(['checkouturl', 'paymenturl', 'paymentlinkurl', 'payosurl']);
  const nestedKeys = new Set(['data', 'result', 'payment', 'paymentlink', 'checkout', 'paymentsession', 'order', 'createdorder']);
  const visit = (value, depth = 0) => {
    if (depth > 4 || value == null) return '';
    if (typeof value === 'string') {
      try {
        return visit(JSON.parse(value), depth + 1);
      } catch {
        return /^https:\/\//i.test(value) ? value : '';
      }
    }
    if (typeof value !== 'object') return '';
    for (const [key, candidate] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (urlKeys.has(normalizedKey) && typeof candidate === 'string') return candidate;
    }
    for (const [key, candidate] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (nestedKeys.has(normalizedKey)) {
        const nestedUrl = visit(candidate, depth + 1);
        if (nestedUrl) return nestedUrl;
      }
    }
    return '';
  };
  return visit(response);
};

const validatePaymentUrl = rawUrl => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || (host !== 'payos.vn' && !host.endsWith('.payos.vn'))) return '';
    return url.href;
  } catch {
    return '';
  }
};

function AddressCard({ address, selected, onSelect }) {
  const addressId = readAddressId(address);
  return (
    <label className={`checkout-address-card ${selected ? 'is-selected' : ''}`}>
      <input
        type="radio"
        name="shippingAddress"
        value={addressId ?? ''}
        checked={selected}
        onChange={() => onSelect(String(addressId ?? ''))}
        disabled={!addressId}
      />
      <span className="checkout-address-radio" aria-hidden="true" />
      <span className="checkout-address-copy">
        <span className="checkout-address-heading">
          <strong>{address.recipientName || 'Người nhận'}</strong>
          {address.isDefault && <span className="checkout-default-tag">Mặc định</span>}
        </span>
        <span>{address.phoneNumber || 'Chưa có số điện thoại'}</span>
        <span>{[address.streetAddress, address.ward, address.district, address.province].filter(Boolean).join(', ')}</span>
      </span>
      <MapPin className="checkout-address-icon" size={18} aria-hidden="true" />
    </label>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    selectedCartItemCount,
    selectedCartSubtotal,
    hasUnpricedSelectedItems,
    cartLoading,
    cartError,
    refreshCart,
  } = useCart();
  const [session, setSession] = useState(getSession());
  const [addresses, setAddresses] = useState([]);
  const [addressStatus, setAddressStatus] = useState('idle');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [shippingMethod, setShippingMethod] = useState(0);
  const [rateOptions, setRateOptions] = useState([]);
  const [ratesStatus, setRatesStatus] = useState('loading');
  const [ratesReload, setRatesReload] = useState(0);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState('');

  const selectedItems = useMemo(() => cartItems.filter(item => item.isSelected), [cartItems]);

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  useEffect(() => {
    let active = true;
    setRatesStatus('loading');
    shippingApi.rates().then(response => {
      if (!active) return;
      const options = shippingRates(response);
      setRateOptions(options);
      setShippingMethod(previous => options.some(option => option.method === previous) ? previous : (options[0]?.method ?? 0));
      setRatesStatus(options.length ? 'ready' : 'empty');
    }).catch(() => { if (active) setRatesStatus('error'); });
    return () => { active = false; };
  }, [ratesReload, session?.token]);

  const openPaymentAndWait = (orderId, rawPaymentUrl) => {
    const paymentUrl = validatePaymentUrl(rawPaymentUrl);
    if (!paymentUrl) throw new Error('Đơn hàng chưa có đường dẫn thanh toán PayOS hợp lệ.');

    sessionStorage.setItem('pendingPaymentOrderId', orderId);
    sessionStorage.setItem('pendingPaymentCheckoutUrl', paymentUrl);
    // PayOS ở tab riêng để tab REWEAR tiếp tục gọi API trạng thái.
    // Nếu trình duyệt chặn cửa sổ mới, trang chờ vẫn có nút mở PayOS.
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    navigate(`/payment/waiting?orderId=${encodeURIComponent(orderId)}`);
  };

  const requestPaymentSession = async orderId => {
    const response = await paymentsApi.createSession(orderId);
    if (readApiField(response, 'success') === false) {
      throw new Error(readApiField(response, 'message', 'detail') || 'Không thể tạo phiên thanh toán.');
    }
    const paymentUrl = validatePaymentUrl(getPaymentUrl(response));
    if (!paymentUrl) throw new Error('Phiên thanh toán chưa trả về checkoutUrl PayOS hợp lệ.');
    openPaymentAndWait(orderId, paymentUrl);
  };

  const retryPaymentSession = async () => {
    if (!pendingOrderId || submitting) return;
    setSubmitting(true);
    setCheckoutResult({ type: 'creating-session' });
    try {
      await requestPaymentSession(pendingOrderId);
    } catch (error) {
      setCheckoutResult({ type: 'payment-session-error', message: error.message || 'Không thể tạo phiên thanh toán.' });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!session) {
      setAddressStatus('idle');
      setAddresses([]);
      setSelectedAddressId('');
      return undefined;
    }

    let active = true;
    setAddressStatus('loading');
    profileApi.addresses()
      .then(response => {
        if (!active) return;
        const nextAddresses = unwrapList(response);
        setAddresses(nextAddresses);
        const defaultAddress = nextAddresses.find(address => address.isDefault) || nextAddresses[0];
        setSelectedAddressId(defaultAddress ? String(readAddressId(defaultAddress) ?? '') : '');
        setAddressStatus('ready');
      })
      .catch(error => {
        if (!active) return;
        setAddressStatus('error');
        toast.error(error.message || 'Không tải được sổ địa chỉ. Vui lòng thử lại.');
      });

    return () => { active = false; };
  }, [session?.token]);

  const handleSubmit = async event => {
    event.preventDefault();
    if (submitting || checkoutResult) return;
    if (!session) {
      toast.error('Vui lòng đăng nhập để tiếp tục thanh toán.');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('Chọn ít nhất một sản phẩm trong giỏ hàng.');
      return;
    }
    if (!selectedAddressId) {
      toast.error('Chọn địa chỉ nhận hàng để tiếp tục.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await authFetch('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
          shippingMethod,
          note: note.trim(),
        }),
      });
      if (readApiField(response, 'success') === false) {
        throw new Error(readApiField(response, 'message', 'detail') || 'Không thể tạo đơn hàng.');
      }
      const checkoutPaymentUrl = validatePaymentUrl(getPaymentUrl(response));
      const orderId = extractOrderId(response);
      if (!orderId) {
        setCheckoutResult({ type: 'missing-order-id', orderCode: extractOrderCode(response) });
        return;
      }
      setPendingOrderId(orderId);
      if (checkoutPaymentUrl) {
        // Checkout có thể đã tạo PayOS session theo contract backend; dùng URL này để tránh tạo session trùng.
        openPaymentAndWait(orderId, checkoutPaymentUrl);
        return;
      }
      setCheckoutResult({ type: 'creating-session' });
      try {
        await requestPaymentSession(orderId);
      } catch (error) {
        setCheckoutResult({ type: 'payment-session-error', message: error.message || 'Không thể tạo phiên thanh toán.' });
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const isReady = Boolean(session)
    && selectedItems.length > 0
    && Boolean(selectedAddressId)
    && !hasUnpricedSelectedItems
    && addressStatus === 'ready'
    && ratesStatus === 'ready'
    && !cartLoading
    && !cartError
    && !submitting
    && !checkoutResult;

  return (
    <div className="rw checkout-page">
      <div className="checkout-announcement">
        <span>Thanh toán an toàn cùng REWEAR</span>
      </div>
      <header className="checkout-header">
        <Link to="/" className="checkout-logo" aria-label="REWEAR — Trang chủ">REWEAR</Link>
        <div className="checkout-steps" aria-label="Các bước đặt hàng">
          <span className="is-complete">Giỏ hàng</span><i />
          <span className="is-current">Giao hàng</span><i />
          <span>Thanh toán</span>
        </div>
        <AccountMenu className="checkout-account" withSpan />
      </header>

      <main className="checkout-main">
        <div className="checkout-page-heading">
          <Link to="/" className="checkout-back-link"><ArrowLeft size={16} /> Tiếp tục mua sắm</Link>
          <span className="checkout-eyebrow">ĐƠN HÀNG CỦA BẠN</span>
          <h1>Hoàn tất đơn hàng</h1>
          <p>Chọn nơi nhận hàng và xác nhận để tiếp tục thanh toán qua PayOS.</p>
        </div>

        <div className="checkout-layout">
          <form id="checkout-order-form" className="checkout-form" onSubmit={handleSubmit}>
            {!session ? (
              <section className="checkout-section checkout-auth-prompt">
                <span className="checkout-section-icon"><ShieldCheck size={18} /></span>
                <div>
                  <h2>Đăng nhập để đặt hàng</h2>
                  <p>Đăng nhập tài khoản REWEAR để dùng sổ địa chỉ và tạo đơn hàng.</p>
                  <AccountMenu className="checkout-primary-link" withSpan />
                </div>
              </section>
            ) : (
              <>
                <section className="checkout-section" aria-labelledby="checkout-address-title">
                  <div className="checkout-section-heading">
                    <span className="checkout-section-icon"><MapPin size={18} /></span>
                    <div><span className="checkout-step-label">BƯỚC 01</span><h2 id="checkout-address-title">Địa chỉ nhận hàng</h2></div>
                    <Link to="/profile?tab=addresses" className="checkout-manage-link">Quản lý địa chỉ</Link>
                  </div>

                  {addressStatus === 'loading' ? (
                    <div className="checkout-state" role="status">Đang tải sổ địa chỉ...</div>
                  ) : addressStatus === 'error' ? (
                    <div className="checkout-state checkout-state-error" role="alert">
                      Không tải được địa chỉ. Hãy thử tải lại trang hoặc kiểm tra sổ địa chỉ.
                      <Link to="/profile?tab=addresses">Mở sổ địa chỉ</Link>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="checkout-empty-address">
                      <strong>Bạn chưa có địa chỉ nhận hàng</strong>
                      <p>Thêm địa chỉ trong hồ sơ trước khi tạo đơn.</p>
                      <Link to="/profile?tab=addresses" className="checkout-secondary-button">Thêm địa chỉ</Link>
                    </div>
                  ) : (
                    <div className="checkout-address-list">
                      {addresses.map((address, index) => (
                        <AddressCard
                          key={readAddressId(address) ?? index}
                          address={address}
                          selected={String(readAddressId(address) ?? '') === selectedAddressId}
                          onSelect={setSelectedAddressId}
                        />
                      ))}
                    </div>
                  )}
                </section>

                <section className="checkout-section" aria-labelledby="checkout-delivery-title">
                  <div className="checkout-section-heading">
                    <span className="checkout-section-icon"><ShoppingBag size={18} /></span>
                    <div><span className="checkout-step-label">BƯỚC 02</span><h2 id="checkout-delivery-title">Giao hàng</h2></div>
                  </div>
                  {ratesStatus === 'loading' ? <div className="checkout-state" role="status">Đang tải phương thức giao hàng…</div>
                    : ratesStatus !== 'ready' ? <div className="checkout-state checkout-state-error" role="alert">Chưa tải được bảng giá vận chuyển.<button type="button" onClick={() => setRatesReload(value => value + 1)}>Thử lại</button></div>
                      : rateOptions.map(option => <label className="checkout-shipping-method" key={option.method}>
                        <input type="radio" name="shippingMethod" value={option.method} checked={shippingMethod === option.method} onChange={() => setShippingMethod(option.method)} />
                        <div><strong>{option.label}</strong><span>Miễn phí vận chuyển</span></div>
                        <span className="checkout-method-tag">0 ₫</span>
                      </label>)}
                  <label className="checkout-note-label" htmlFor="checkout-note">Ghi chú cho đơn hàng <span>Tùy chọn</span></label>
                  <textarea
                    id="checkout-note"
                    rows="3"
                    value={note}
                    onChange={event => setNote(event.target.value)}
                    placeholder="Lời nhắn cho REWEAR về đơn hàng của bạn"
                  />
                </section>
              </>
            )}
          </form>

          <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
            <div className="checkout-summary-heading">
              <div><span className="checkout-step-label">TÓM TẮT</span><h2 id="checkout-summary-title">Đơn hàng</h2></div>
              <span className="checkout-item-count">{selectedCartItemCount} món</span>
            </div>

            {cartLoading ? (
              <div className="checkout-state" role="status">Đang tải giỏ hàng...</div>
            ) : cartError ? (
              <div className="checkout-state checkout-state-error" role="alert">
                {cartError}<button type="button" onClick={refreshCart}>Thử tải lại</button>
              </div>
            ) : selectedItems.length === 0 ? (
              <div className="checkout-state">Chưa có sản phẩm được chọn để thanh toán.<button type="button" onClick={() => navigate('/')}>Quay lại cửa hàng</button></div>
            ) : (
              <div className="checkout-summary-items">
                {selectedItems.map(item => (
                  <article className="checkout-summary-item" key={item.id}>
                    <div className="checkout-summary-image-wrap">
                      {item.img ? <img src={item.img} alt={item.name} /> : <span className="checkout-summary-image-placeholder" role="img" aria-label={`Chưa có ảnh ${item.name}`}><ImageOff size={18} aria-hidden="true" /></span>}
                      <span>{item.quantity}</span>
                    </div>
                    <div className="checkout-summary-item-copy">
                      <strong>{item.name}</strong>
                      <span>{[item.color, item.size].filter(Boolean).join(' / ')}</span>
                    </div>
                    <strong className="checkout-summary-item-price">{item.price === null ? 'Chưa cập nhật giá' : formatCurrency(item.price * item.quantity)}</strong>
                  </article>
                ))}
              </div>
            )}

            <div className="checkout-summary-totals">
              <div><span>Tạm tính</span><span>{selectedCartSubtotal === null ? '—' : formatCurrency(selectedCartSubtotal)}</span></div>
              <div><span>Phí giao hàng</span><span>{ratesStatus === 'ready' ? '0 ₫' : '—'}</span></div>
              <div className="checkout-grand-total"><strong>Tổng dự kiến</strong><strong>{selectedCartSubtotal === null || ratesStatus !== 'ready' ? '—' : formatCurrency(selectedCartSubtotal)}</strong></div>
              <p>Hàng được giữ chỗ trong tối đa 15 phút sau khi tạo đơn.</p>
            </div>

            {hasUnpricedSelectedItems && <div className="checkout-state checkout-state-error" role="alert"><span>Chưa lấy được giá sản phẩm từ máy chủ. Tải lại để thử đồng bộ giá trước khi tạo đơn.</span><button type="button" onClick={() => refreshCart()}>Tải lại giỏ hàng</button></div>}

            {checkoutResult?.type === 'missing-order-id' ? (
              <div className="checkout-result checkout-result-warning" role="alert">
                <strong>Đơn đã được tạo nhưng thiếu mã đơn</strong>
                <span>Không thể tạo phiên thanh toán nếu chưa nhận được orderId. Đừng gửi lại biểu mẫu để tránh tạo đơn trùng.{checkoutResult.orderCode ? ` Mã đơn: ${checkoutResult.orderCode}.` : ''}</span>
                <Link to="/profile?tab=orders">Mở danh sách đơn mua</Link>
              </div>
            ) : checkoutResult?.type === 'payment-session-error' ? (
              <div className="checkout-result checkout-result-warning" role="alert">
                <strong>Chưa tạo được phiên thanh toán</strong>
                <span>Đơn đã được tạo. {checkoutResult.message} Bạn có thể thử tạo phiên lại mà không tạo đơn mới.</span>
                <button type="button" onClick={retryPaymentSession} disabled={submitting}>Thử lại phiên thanh toán</button>
              </div>
            ) : checkoutResult?.type === 'creating-session' ? (
              <div className="checkout-result" role="status">Đơn đã tạo. Đang kết nối PayOS…</div>
            ) : null}

            <button
              className="checkout-submit"
              type="submit"
              form="checkout-order-form"
              disabled={!isReady}
            >
              <CreditCard size={17} />
              {submitting ? 'ĐANG TẠO ĐƠN...' : 'TẠO ĐƠN & THANH TOÁN'}
            </button>
            <p className="checkout-secure-note"><ShieldCheck size={14} /> Thanh toán sẽ được xử lý trên cổng PayOS.</p>
            <p className="checkout-policy-note">Khi tiếp tục, bạn xác nhận thông tin giao hàng và ghi chú là chính xác.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}
