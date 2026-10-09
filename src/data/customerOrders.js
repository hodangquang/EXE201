import { STORE_PRODUCTS } from './storeProducts';

/**
 * Demo orders for the customer profile page.
 * TODO: replace with the real orders API when the backend exposes it.
 */
const P = STORE_PRODUCTS.filter((p) => String(p.price).includes('₫'));
const toNum = (s) => Number(String(s).replace(/[^\d]/g, '')) || 0;
const item = (p, qty = 1, color = 0) => ({
  productId: p.id,
  name: p.name,
  image: p.images?.[0]?.src,
  variant: p.colors?.[color]?.name || p.colors?.[0]?.name || 'Mặc định',
  qty,
  price: toNum(p.price),
});

const pick = (i) => P[i % P.length];

export const ORDER_STATUS = {
  pending: 'Chờ xác nhận',
  processing: 'Chờ lấy hàng',
  shipping: 'Đang giao',
  delivered: 'Hoàn thành',
  cancelled: 'Đã hủy',
  returned: 'Trả hàng/Hoàn tiền',
};

export const MOCK_ORDERS = [
  {
    id: 'RW2610050012', status: 'pending', createdAt: '2026-10-05T09:12:00', shippingFee: 30000,
    items: [item(pick(0), 1), item(pick(1), 2, 1)],
    timeline: [{ at: '2026-10-05T09:12:00', text: 'Đơn hàng đã được đặt' }],
  },
  {
    id: 'RW2610030087', status: 'processing', createdAt: '2026-10-03T15:40:00', shippingFee: 30000,
    items: [item(pick(2), 1)],
    timeline: [
      { at: '2026-10-03T15:40:00', text: 'Đơn hàng đã được đặt' },
      { at: '2026-10-03T16:05:00', text: 'Người bán đã xác nhận đơn hàng' },
    ],
  },
  {
    id: 'RW2609280140', status: 'shipping', createdAt: '2026-09-28T10:20:00', shippingFee: 0,
    items: [item(pick(3), 1), item(pick(4), 1)],
    timeline: [
      { at: '2026-09-28T10:20:00', text: 'Đơn hàng đã được đặt' },
      { at: '2026-09-28T11:00:00', text: 'Người bán đã xác nhận đơn hàng' },
      { at: '2026-09-29T08:30:00', text: 'Đơn vị vận chuyển đã lấy hàng' },
      { at: '2026-09-30T14:10:00', text: 'Đang giao đến bạn' },
    ],
  },
  {
    id: 'RW2609150033', status: 'delivered', createdAt: '2026-09-15T19:02:00', shippingFee: 30000,
    items: [item(pick(5), 1)],
    timeline: [
      { at: '2026-09-15T19:02:00', text: 'Đơn hàng đã được đặt' },
      { at: '2026-09-16T09:00:00', text: 'Đơn vị vận chuyển đã lấy hàng' },
      { at: '2026-09-18T16:45:00', text: 'Giao hàng thành công' },
    ],
  },
  {
    id: 'RW2608220091', status: 'delivered', createdAt: '2026-08-22T13:30:00', shippingFee: 0,
    items: [item(pick(6), 1), item(pick(7), 1), item(pick(8), 1)],
    timeline: [
      { at: '2026-08-22T13:30:00', text: 'Đơn hàng đã được đặt' },
      { at: '2026-08-25T10:12:00', text: 'Giao hàng thành công' },
    ],
  },
  {
    id: 'RW2608100006', status: 'cancelled', createdAt: '2026-08-10T08:45:00', shippingFee: 30000,
    items: [item(pick(9), 1)],
    timeline: [
      { at: '2026-08-10T08:45:00', text: 'Đơn hàng đã được đặt' },
      { at: '2026-08-10T09:20:00', text: 'Bạn đã hủy đơn hàng' },
    ],
  },
  {
    id: 'RW2607180120', status: 'returned', createdAt: '2026-07-18T20:15:00', shippingFee: 30000,
    items: [item(pick(10), 1)],
    timeline: [
      { at: '2026-07-18T20:15:00', text: 'Đơn hàng đã được đặt' },
      { at: '2026-07-21T15:00:00', text: 'Giao hàng thành công' },
      { at: '2026-07-23T10:00:00', text: 'Yêu cầu trả hàng đã được chấp nhận — đã hoàn tiền' },
    ],
  },
];
