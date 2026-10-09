import React from 'react';
import { Tag } from 'antd';
import {
  PRODUCT_STATUS,
  COLLECTION_STATUS,
  UPCYCLING_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  QC_DECISION,
  INSPECTION_RESULT
} from '../../utils/constants';

const STATUS_LABELS = {
  0: 'Có sẵn để bán', 1: 'Đã đặt trước', 2: 'Đã bán',
  Draft: 'Bản nháp', Published: 'Đang bán', 'Out of Stock': 'Hết hàng', Sold: 'Đã bán', Archived: 'Đã lưu trữ',
  Pending: 'Chờ xử lý', Approved: 'Đã duyệt', 'Pickup Scheduled': 'Đã hẹn lấy hàng', Collected: 'Đã thu gom',
  Inspecting: 'Đang kiểm định', Accepted: 'Đã chấp nhận', Rejected: 'Đã từ chối',
  'Accepted for Upcycling': 'Chấp nhận tái thiết kế', 'Accepted for Material': 'Chấp nhận làm nguyên liệu',
  Cleaning: 'Đang làm sạch', Designing: 'Đang thiết kế', Production: 'Đang sản xuất',
  'Quality Check': 'Chờ kiểm tra chất lượng', 'Ready to Sell': 'Sẵn sàng bán', 'Needs Revision': 'Cần chỉnh sửa',
  Confirmed: 'Đã xác nhận', Preparing: 'Đang chuẩn bị', Shipping: 'Đang giao', Delivered: 'Đã giao',
  Cancelled: 'Đã hủy', Unpaid: 'Chưa thanh toán', Paid: 'Đã thanh toán', Refunded: 'Đã hoàn tiền',
};

export const StatusBadge = ({ status }) => {
  if (status === null || status === undefined || status === '') return null;

  // Product API có thể trả enum dưới dạng số hoặc chuỗi số.
  const normalizedStatus = ['0', '1', '2'].includes(String(status)) ? Number(status) : status;

  let bg = '#efefef';
  let color = '#10100f';
  let border = '1px solid #d4d4d3';

  switch (normalizedStatus) {
    // Product
    case PRODUCT_STATUS.AVAILABLE:
      bg = '#eaf3ed';
      color = '#1b4d2e';
      border = '1px solid #b8dec4';
      break;
    case PRODUCT_STATUS.RESERVED:
      bg = '#fffbeb';
      color = '#b45309';
      border = '1px solid #fde68a';
      break;
    case PRODUCT_STATUS.SOLD:
      bg = '#10100f';
      color = '#fffb85'; // Butter cream text on Ink
      border = '1px solid #10100f';
      break;

    // Collection
    case COLLECTION_STATUS.PENDING:
      bg = '#fff9eb';
      color = '#92400e';
      border = '1px solid #fde68a';
      break;
    case COLLECTION_STATUS.APPROVED:
    case COLLECTION_STATUS.PICKUP_SCHEDULED:
      bg = '#eff6ff';
      color = '#1e40af';
      border = '1px solid #bfdbfe';
      break;
    case COLLECTION_STATUS.COLLECTED:
    case COLLECTION_STATUS.INSPECTING:
      bg = '#f3f4f6';
      color = '#374151';
      border = '1px solid #d1d5db';
      break;
    case COLLECTION_STATUS.ACCEPTED:
      bg = '#eaf3ed';
      color = '#1b4d2e';
      border = '1px solid #b8dec4';
      break;
    case COLLECTION_STATUS.REJECTED:
      bg = '#fbeae8';
      color = '#991b1b';
      border = '1px solid #f5c2be';
      break;

    // Upcycling
    case UPCYCLING_STATUS.COLLECTED:
      bg = '#f4f4f3';
      color = '#60605f';
      border = '1px solid #dcdcdb';
      break;
    case UPCYCLING_STATUS.CLEANING:
    case UPCYCLING_STATUS.DESIGNING:
    case UPCYCLING_STATUS.PRODUCTION:
      bg = '#f0fdf4';
      color = '#166534';
      border = '1px solid #bbf7d0';
      break;
    case UPCYCLING_STATUS.QUALITY_CHECK:
      bg = '#fffbeb';
      color = '#b45309';
      border = '1px solid #fde68a';
      break;
    case UPCYCLING_STATUS.READY_TO_SELL:
      bg = '#eaf3ed';
      color = '#1b4d2e';
      border = '1px solid #b8dec4';
      break;

    // QC & Inspection
    case QC_DECISION.APPROVED:
    case INSPECTION_RESULT.ACCEPTED_UPCYCLING:
      bg = '#eaf3ed';
      color = '#1b4d2e';
      border = '1px solid #b8dec4';
      break;
    case QC_DECISION.NEEDS_REVISION:
    case INSPECTION_RESULT.ACCEPTED_MATERIAL:
      bg = '#fffbeb';
      color = '#b45309';
      border = '1px solid #fde68a';
      break;
    case QC_DECISION.REJECTED:
    case INSPECTION_RESULT.REJECTED:
      bg = '#fbeae8';
      color = '#991b1b';
      border = '1px solid #f5c2be';
      break;

    // Order
    case ORDER_STATUS.PENDING:
      bg = '#fffbeb';
      color = '#b45309';
      border = '1px solid #fde68a';
      break;
    case ORDER_STATUS.CONFIRMED:
    case ORDER_STATUS.PREPARING:
      bg = '#f0f9ff';
      color = '#0369a1';
      border = '1px solid #bae6fd';
      break;
    case ORDER_STATUS.SHIPPING:
      bg = '#f5f3ff';
      color = '#5b21b6';
      border = '1px solid #ddd6fe';
      break;
    case ORDER_STATUS.DELIVERED:
      bg = '#eaf3ed';
      color = '#1b4d2e';
      border = '1px solid #b8dec4';
      break;
    case ORDER_STATUS.CANCELLED:
      bg = '#fbeae8';
      color = '#991b1b';
      border = '1px solid #f5c2be';
      break;

    // Payment
    case PAYMENT_STATUS.PAID:
      bg = '#eaf3ed';
      color = '#1b4d2e';
      border = '1px solid #b8dec4';
      break;
    case PAYMENT_STATUS.UNPAID:
      bg = '#fffbeb';
      color = '#b45309';
      border = '1px solid #fde68a';
      break;
    case PAYMENT_STATUS.REFUNDED:
      bg = '#fdf2f8';
      color = '#9d174d';
      border = '1px solid #fbcfe8';
      break;

    default:
      break;
  }

  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: bg,
        color: color,
        border: border,
        borderRadius: '9999px',
        padding: '2px 10px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.3px',
        textTransform: 'uppercase',
      }}
    >
      {STATUS_LABELS[normalizedStatus] || status}
    </span>
  );
};

export default StatusBadge;
