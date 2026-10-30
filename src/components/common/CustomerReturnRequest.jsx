import { useState } from 'react';
import { authFetch } from '../../services/auth';

export default function CustomerReturnRequest({ order, onChanged }) {
  const [open, setOpen] = useState(false); const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [sent, setSent] = useState(false);
  const eligible = !!order.requestId && ['3', 'Delivered'].includes(String(order.status));
  const pending = ['7', '8', '9', 'ReturnRequested', 'ReturnReceived', 'Returned'].includes(String(order.status));
  if (!eligible && !pending && !sent) return null;
  const submit = async event => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await authFetch(`/api/returns/orders/${encodeURIComponent(order.requestId)}`, { method: 'POST', body: JSON.stringify({ reason }) }); setSent(true); setOpen(false); onChanged?.(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <section className="pp-return" aria-label="Yêu cầu trả hàng">
    {order.paymentStatus === 'Refunded' ? <p role="status">Backend đã xác nhận hoàn tiền cho đơn hàng.</p> : (pending || sent) ? <p role="status">Yêu cầu trả hàng đang được xử lý. Cửa hàng tiếp nhận và kiểm định hàng trước khi xác nhận hoàn tiền.</p>
      : <button className="pp-btn ghost" type="button" onClick={() => setOpen(value => !value)}>Yêu cầu trả toàn bộ đơn</button>}
    {open && <form onSubmit={submit}><p>Yêu cầu được gửi để cửa hàng xem xét. Vui lòng liên hệ REWEAR để thống nhất cách gửi trả.</p><label htmlFor={`return-${order.requestId}`}>Lý do trả hàng</label><textarea id={`return-${order.requestId}`} required maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} />{error && <p role="alert">{error}</p>}<button className="pp-btn" type="submit" disabled={busy || !reason.trim()}>{busy ? 'Đang gửi…' : 'Gửi yêu cầu'}</button></form>}
  </section>;
}
