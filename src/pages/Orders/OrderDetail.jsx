import React, { useState } from 'react';
import { Row, Col, Typography, Space, Button, Select, Divider, message, Table } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  Package
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockOrders } from '../../data/mockData';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../utils/constants';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

const { Option } = Select;

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(
    mockOrders.find((o) => o.id === id) || mockOrders[0]
  );

  const handleUpdateStatus = (newStatus) => {
    setOrder({ ...order, orderStatus: newStatus });
    message.success(`Đã cập nhật trạng thái đơn sang: ${newStatus}`);
  };

  const handlePaymentStatus = (newPayStatus) => {
    setOrder({ ...order, paymentStatus: newPayStatus });
    message.success(`Đã cập nhật trạng thái thanh toán sang: ${newPayStatus}`);
  };

  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={item.image}
            alt={item.name}
            style={{ width: 52, height: 52, objectFit: 'cover', border: '1px solid #e5e5e4' }}
          />
          <div>
            <div style={{ fontWeight: 600, color: '#10100f' }}>{item.name}</div>
            {item.isOneOfOne && (
              <span className="one-of-one-pill" style={{ fontSize: '9px', padding: '1px 6px' }}>
                1-OF-1 ARCHIVE
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (p) => formatCurrency(p),
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (q) => <span>{q}</span>,
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      render: (_, item) => <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/orders')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '13px',
            color: '#70706f',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách đơn hàng
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="editorial-sub">HỒ SƠ ĐƠN HÀNG</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
                Chi tiết đơn hàng #{order.id}
              </h1>
              <StatusBadge status={order.orderStatus} />
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: '13px', color: '#70706f' }}>Đổi trạng thái:</span>
            <Select
              value={order.orderStatus}
              onChange={handleUpdateStatus}
              style={{ width: 180 }}
            >
              <Option value={ORDER_STATUS.PENDING}>Chờ xác nhận</Option>
              <Option value={ORDER_STATUS.CONFIRMED}>Đã xác nhận</Option>
              <Option value={ORDER_STATUS.PREPARING}>Đang chuẩn bị</Option>
              <Option value={ORDER_STATUS.SHIPPING}>Đang giao</Option>
              <Option value={ORDER_STATUS.DELIVERED}>Đã giao</Option>
              <Option value={ORDER_STATUS.CANCELLED}>Đã hủy</Option>
            </Select>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Items & Financial Breakdown */}
        <Col xs={24} lg={15}>
          {/* Order Items Table */}
          <div className="flat-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>DANH SÁCH SẢN PHẨM ĐẶT MUA</div>
            <Table
              dataSource={order.items}
              columns={itemColumns}
              rowKey="productId"
              pagination={false}
              size="middle"
            />
          </div>

          {/* Payment & Invoice Breakdown */}
          <div className="flat-card" style={{ padding: '28px' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>CHI TIẾT THANH TOÁN</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#70706f' }}>Tiền hàng tạm tính:</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(order.subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#70706f' }}>Phí vận chuyển:</span>
              <span style={{ fontWeight: 500 }}>{formatCurrency(order.shippingFee)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
              <span style={{ color: '#70706f' }}>Voucher giảm giá (Eco Hero):</span>
              <span style={{ fontWeight: 600, color: '#991b1b' }}>- {formatCurrency(order.discount)}</span>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#10100f' }}>Tổng cộng thanh toán:</span>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 700, color: '#10100f' }}>
                {formatCurrency(order.total)}
              </span>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0ef', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '12px', color: '#70706f', display: 'block' }}>Phương thức: {order.paymentMethod}</span>
                {order.transactionId && (
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#70706f' }}>
                    Mã giao dịch: {order.transactionId}
                  </span>
                )}
              </div>
              <Button
                size="small"
                onClick={() => handlePaymentStatus(order.paymentStatus === PAYMENT_STATUS.PAID ? PAYMENT_STATUS.UNPAID : PAYMENT_STATUS.PAID)}
              >
                Đánh dấu: {order.paymentStatus === PAYMENT_STATUS.PAID ? 'Chưa trả' : 'Đã trả'}
              </Button>
            </div>
          </div>
        </Col>

        {/* Right Column: Customer Info & Shipping Address */}
        <Col xs={24} lg={9}>
          {/* Customer Card */}
          <div className="flat-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>THÔNG TIN NGƯỜI NHẬN</div>
            <div style={{ fontWeight: 600, fontSize: '16px', color: '#10100f', marginBottom: '4px' }}>
              {order.customer.name}
            </div>
            <div style={{ fontSize: '13px', color: '#70706f', marginBottom: '12px' }}>
              Số điện thoại: {order.customer.phone}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '13px', color: '#40403f' }}>
              <MapPin size={16} color="#70706f" style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{order.customer.address}</span>
            </div>
          </div>

          {/* Shipping & Fulfillment Card */}
          <div className="flat-card" style={{ padding: '24px' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>VẬN CHUYỂN & GIAO NHẬN</div>

            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Đơn vị vận chuyển</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{order.shippingCarrier || 'Chưa cập nhật'}</span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Mã vận đơn (Tracking Code)</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#10100f' }}>
                {order.trackingCode || 'Chưa tạo vận đơn'}
              </span>
            </div>

            {order.notes && (
              <div style={{ marginTop: '16px', padding: '10px 12px', backgroundColor: '#f9f9f8', borderLeft: '3px solid #10100f', fontSize: '12px' }}>
                <b>Ghi chú giao hàng:</b> {order.notes}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetail;
