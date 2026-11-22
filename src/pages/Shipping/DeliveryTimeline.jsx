import React from 'react';

export const deliveryDate = value => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có thời gian được ghi nhận';
export const paymentLabel = value => ({ Paid: 'Đã thanh toán', Pending: 'Chờ thanh toán', Failed: 'Thanh toán thất bại', Cancelled: 'Đã hủy thanh toán', Expired: 'Hết hạn thanh toán', Refunded: 'Đã hoàn tiền', ReconciliationRequired: 'Đang đối soát' }[value] || 'Chưa xác nhận thanh toán');

export default function DeliveryTimeline({ events = [] }) {
  return events.length ? <ol className="delivery-timeline">{events.map((event, index) => <li key={`${event.code}-${index}`}>
    <strong>{event.label}</strong><time>{deliveryDate(event.occurredAt)}</time>
    {event.note && <p>{event.note}</p>}
  </li>)}</ol> : <p className="delivery-muted">Chưa có lịch sử được ghi nhận.</p>;
}
