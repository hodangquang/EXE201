import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CircleAlert, LoaderCircle } from 'lucide-react';
import { ordersApi, paymentsApi } from '../../services/auth';
import './PaymentWaitingPage.css';

const readField = (value, fieldName) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const key = Object.keys(value).find(name => name.toLowerCase() === fieldName.toLowerCase());
  return key ? value[key] : undefined;
};

const findNestedValue = (value, fieldName, depth = 0) => {
  if (depth > 5 || !value || typeof value !== 'object') return undefined;
  const direct = readField(value, fieldName);
  if (direct !== undefined) return direct;
  for (const key of ['data', 'result', 'order', 'payment']) {
    const nested = readField(value, key);
    const result = findNestedValue(nested, fieldName, depth + 1);
    if (result !== undefined) return result;
  }
  return undefined;
};

const readOrderId = response => {
  const value = findNestedValue(response, 'orderId') ?? findNestedValue(response, 'id');
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
};

const PAYMENT_STATUS_BY_NUMBER = {
  0: 'PENDING',
  1: 'FAILED',
  2: 'PAID',
  3: 'EXPIRED',
  4: 'REFUNDED',
};

const normalizePaymentState = value => {
  if (typeof value === 'number' && Number.isInteger(value)) return PAYMENT_STATUS_BY_NUMBER[value] || '';
  if (typeof value !== 'string') return '';
  const normalized = value.trim().toUpperCase();
  return /^\d+$/.test(normalized) ? PAYMENT_STATUS_BY_NUMBER[Number(normalized)] || '' : normalized;
};

const getPaymentState = response => {
  if (typeof response === 'string') return normalizePaymentState(response);

  const isPaid = findNestedValue(response, 'isPaid');
  if (isPaid === true) return 'PAID';

  const isExpired = findNestedValue(response, 'isExpired');
  if (isExpired === true) return 'EXPIRED';

  const paymentStatus = findNestedValue(response, 'paymentStatus')
    ?? findNestedValue(response, 'paymentState');
  if (paymentStatus !== undefined) return normalizePaymentState(paymentStatus);

  const data = readField(response, 'data');
  if (typeof data === 'string' || typeof data === 'number') return normalizePaymentState(data);
  const dataStatus = findNestedValue(data, 'status');
  return normalizePaymentState(dataStatus);
};

const validatePaymentUrl = rawUrl => {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();
    return url.protocol === 'https:' && (host === 'payos.vn' || host.endsWith('.payos.vn')) ? url.href : '';
  } catch {
    return '';
  }
};

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 15 * 60 * 1000;
const PAYMENT_TITLES = {
  checking: 'Đang xác nhận thanh toán',
  paid: 'Thanh toán thành công',
  cancelled: 'Giao dịch đã bị hủy',
  expired: 'Phiên thanh toán đã hết hạn',
  failed: 'Thanh toán thất bại',
  refunded: 'Giao dịch đã được hoàn tiền',
};

export default function PaymentWaitingPage() {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('orderId')?.trim() || '';
  const orderCode = searchParams.get('orderCode')?.trim() || '';
  const [state, setState] = useState('checking');
  const [message, setMessage] = useState('Đang xác nhận giao dịch với hệ thống.');
  const [checkedOrderId, setCheckedOrderId] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    let redirectTimer;
    let pollTimer;
    let onResume;
    const controller = new AbortController();

    setState('checking');
    setMessage('Đang xác nhận giao dịch với hệ thống.');
    setCheckedOrderId('');
    setPaymentUrl('');

    const clearSavedPayment = orderId => {
      if (sessionStorage.getItem('pendingPaymentOrderId') !== orderId) return;
      sessionStorage.removeItem('pendingPaymentOrderId');
      sessionStorage.removeItem('pendingPaymentCheckoutUrl');
    };

    const verifyPayment = async () => {
      let orderId = orderIdFromUrl || sessionStorage.getItem('pendingPaymentOrderId') || '';

      if (!orderCode && !orderId) {
        setState('error');
        setMessage('Không tìm thấy mã đơn hàng để kiểm tra giao dịch.');
        return;
      }

      try {
        if (!orderId && orderCode) {
          const orderResponse = await ordersApi.getByCode(orderCode);
          orderId = readOrderId(orderResponse);
        }
        
        if (!orderId) throw new Error('Không tìm thấy mã đơn nội bộ để kiểm tra thanh toán.');

        if (!active) return;
        setCheckedOrderId(orderId);
        const savedPaymentUrl = sessionStorage.getItem('pendingPaymentOrderId') === orderId
          ? validatePaymentUrl(sessionStorage.getItem('pendingPaymentCheckoutUrl'))
          : '';
        setPaymentUrl(savedPaymentUrl);

        const startedAt = Date.now();
        let polling = false;
        let finished = false;
        const poll = async () => {
          if (!active || polling || finished) return;
          window.clearTimeout(pollTimer);
          polling = true;
          try {
            const statusResponse = await paymentsApi.getStatus(orderId, { signal: controller.signal });
            if (!active) return;
            if (readField(statusResponse, 'success') === false) {
              throw new Error(readField(statusResponse, 'message') || 'Không thể kiểm tra trạng thái thanh toán.');
            }

            const paymentState = getPaymentState(statusResponse);
            if (paymentState === 'PAID') {
              finished = true;
              clearSavedPayment(orderId);
              setState('paid');
              setMessage('Thanh toán đã được xác nhận. Đang chuyển về trang chủ…');
              redirectTimer = window.setTimeout(() => window.location.replace('/'), 1800);
              return;
            }

            if (['CANCELLED', 'EXPIRED', 'FAILED', 'REFUNDED'].includes(paymentState)) {
              finished = true;
              clearSavedPayment(orderId);
              setState(paymentState.toLowerCase());
              const terminalMessages = {
                CANCELLED: 'Giao dịch đã bị hủy. Bạn có thể kiểm tra lại đơn mua.',
                EXPIRED: 'Phiên thanh toán đã hết hạn. Vui lòng kiểm tra đơn mua để biết bước tiếp theo.',
                FAILED: 'Thanh toán thất bại. Vui lòng kiểm tra đơn mua để biết bước tiếp theo.',
                REFUNDED: 'Giao dịch đã được hoàn tiền. Vui lòng kiểm tra đơn mua.',
              };
              setMessage(terminalMessages[paymentState]);
              return;
            }

            setMessage('Đang chờ PayOS xác nhận. Trang này tự kiểm tra lại mỗi 3 giây.');
          } catch (error) {
            if (!active || error.name === 'AbortError') return;
            if (error.status === 401 || error.status === 404) {
              finished = true;
              setState('error');
              setMessage(error.message || 'Không thể kiểm tra đơn hàng.');
              return;
            }
            setMessage('Tạm thời chưa kiểm tra được giao dịch. Sẽ thử lại sau 3 giây.');
          } finally {
            polling = false;
          }

          if (Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
            finished = true;
            setState('pending');
            setMessage('Chưa xác nhận được giao dịch sau thời gian chờ. Bạn có thể kiểm tra lại hoặc xem đơn mua.');
            return;
          }
          pollTimer = window.setTimeout(poll, POLL_INTERVAL_MS);
        };

        onResume = () => {
          if (document.visibilityState === 'visible') poll();
        };
        window.addEventListener('focus', onResume);
        document.addEventListener('visibilitychange', onResume);
        pollTimer = window.setTimeout(poll, 0);
      } catch (error) {
        if (!active) return;
        setState('error');
        setMessage(error.message || 'Không thể kiểm tra trạng thái giao dịch lúc này.');
      }
    };

    verifyPayment();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(pollTimer);
      window.clearTimeout(redirectTimer);
      if (onResume) {
        window.removeEventListener('focus', onResume);
        document.removeEventListener('visibilitychange', onResume);
      }
    };
  }, [orderCode, orderIdFromUrl, retryCount]);

  const Icon = state === 'paid' ? CheckCircle2 : state === 'checking' ? LoaderCircle : CircleAlert;

  return (
    <main className="payment-waiting-page">
      <section className={`payment-waiting-card is-${state}`} aria-live="polite">
        <Icon className={state === 'checking' ? 'is-spinning' : ''} size={36} aria-hidden="true" />
        <p className="payment-waiting-eyebrow">REWEAR · THANH TOÁN</p>
        <h1>{PAYMENT_TITLES[state] || 'Chưa xác nhận được giao dịch'}</h1>
        <p>{message}</p>
        {checkedOrderId && <p className="payment-waiting-order">Mã đơn: {checkedOrderId}</p>}
        {paymentUrl && state === 'checking' && (
          <a className="payment-waiting-open" href={paymentUrl} target="_blank" rel="noopener noreferrer">Mở trang thanh toán PayOS</a>
        )}
        {(state === 'pending' || state === 'error') && checkedOrderId && (
          <button className="payment-waiting-retry" type="button" onClick={() => setRetryCount(count => count + 1)}>Kiểm tra lại</button>
        )}
        {state !== 'checking' && state !== 'paid' && <div className="payment-waiting-actions">
          <Link to="/profile?tab=orders">Xem đơn mua</Link>
          <Link to="/">Về trang chủ</Link>
        </div>}
      </section>
    </main>
  );
}
