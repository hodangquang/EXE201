import React, { useState } from 'react';
import { Table, Input, Select, Space, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockOrders } from '../../data/mockData';
import { ORDER_STATUS } from '../../utils/constants';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

const { Option } = Select;

export const OrderList = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(searchText.toLowerCase()) ||
                          o.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          o.customer.phone.includes(searchText);
    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
    );
    message.success(`Đã cập nhật đơn hàng ${id} sang trạng thái: ${newStatus}`);
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{id}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (c) => (
        <div>
          <div style={{ fontWeight: 600 }}>{c.name}</div>
          <div style={{ fontSize: '11px', color: '#70706f' }}>{c.phone}</div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm mua',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div>
          {items.map((it, idx) => (
            <div key={idx} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{it.name}</span>
              {it.isOneOfOne && <span className="one-of-one-pill" style={{ fontSize: '9px', padding: '1px 6px' }}>ĐỘC BẢN</span>}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Tổng thanh toán',
      dataIndex: 'total',
      key: 'total',
      render: (val) => <span style={{ fontWeight: 600, color: '#10100f' }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Hình thức & Thanh toán',
      key: 'payment',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: '12px' }}>{r.paymentMethod}</div>
          <StatusBadge status={r.paymentStatus} />
        </div>
      ),
    },
    {
      title: 'Trạng thái đơn',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (st) => <StatusBadge status={st} />,
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => <span style={{ fontSize: '12px', color: '#70706f' }}>{formatShortDate(d)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<Eye size={15} />}
            title="Xem chi tiết đơn hàng"
            onClick={() => navigate(`/orders/${record.id}`)}
          />
          {record.orderStatus === ORDER_STATUS.PREPARING && (
            <Button
              type="text"
              style={{ color: '#0369a1', fontWeight: 600 }}
              title="Giao đơn cho shipper"
              onClick={() => handleUpdateStatus(record.id, ORDER_STATUS.SHIPPING)}
            >
              Giao hàng →
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="rw-admin-page">
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e5e4'
        }}
      >
        <div>
          <div className="editorial-sub" style={{ marginBottom: '6px' }}>
            QUẢN LÝ ĐƠN HÀNG
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Quản lý đơn hàng REWEAR
          </h1>
        </div>
      </div>

      <div 
        className="flat-card" 
        style={{ 
          padding: '16px 20px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 'min(240px, 100%)' }}>
          <Input
            prefix={<Search size={16} color="#70706f" style={{ marginRight: 6 }} />}
            placeholder="Tìm theo mã đơn (#RW...), tên khách hoặc số điện thoại..."
            aria-label="Tìm kiếm trong danh sách" value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 0 }}
          />
        </div>

        <Select
          defaultValue="ALL"
          aria-label="Lọc trạng thái đơn hàng" value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 220 }}
        >
          <Option value="ALL">Tất cả trạng thái đơn</Option>
          <Option value={ORDER_STATUS.PENDING}>Chờ xác nhận</Option>
          <Option value={ORDER_STATUS.CONFIRMED}>Đã xác nhận</Option>
          <Option value={ORDER_STATUS.PREPARING}>Đang đóng gói</Option>
          <Option value={ORDER_STATUS.SHIPPING}>Đang giao hàng</Option>
          <Option value={ORDER_STATUS.DELIVERED}>Đã giao hàng</Option>
          <Option value={ORDER_STATUS.CANCELLED}>Đã hủy</Option>
        </Select>
      </div>

      <div className="flat-card">
        <Table scroll={{ x: 'max-content' }} dataSource={filteredOrders} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>
    </div>
  );
};

export default OrderList;
