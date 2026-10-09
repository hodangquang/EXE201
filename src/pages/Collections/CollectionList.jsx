import React, { useState } from 'react';
import { Table, Input, Select, Space, Button, Modal, message, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Calendar, UserCheck, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockCollectionRequests } from '../../data/mockData';
import { COLLECTION_STATUS } from '../../utils/constants';
import { formatShortDate } from '../../utils/formatters';

const { Option } = Select;

export const CollectionList = () => {
  const [requests, setRequests] = useState(mockCollectionRequests);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = r.id.toLowerCase().includes(searchText.toLowerCase()) ||
                          r.customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
                          r.customer.phone.includes(searchText);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    message.success(`Đã cập nhật yêu cầu ${id} sang trạng thái: ${newStatus}`);
  };

  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, color: '#10100f' }}>{id}</span>,
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
      title: 'Số lượng đồ',
      dataIndex: 'clothesCount',
      key: 'clothesCount',
      render: (count) => <span style={{ fontWeight: 600 }}>{count} món</span>,
    },
    {
      title: 'Phương thức nhận',
      dataIndex: 'collectionMethod',
      key: 'collectionMethod',
      render: (m) => <span style={{ fontSize: '12px' }}>{m}</span>,
    },
    {
      title: 'Ngày hẹn lấy',
      dataIndex: 'pickupDate',
      key: 'pickupDate',
      render: (d) => <span style={{ fontSize: '12px', color: '#70706f' }}>{formatShortDate(d)}</span>,
    },
    {
      title: 'Nhân sự phụ trách',
      dataIndex: 'assignedStaff',
      key: 'assignedStaff',
      render: (staff) => (
        <span style={{ fontSize: '12px', color: staff === 'Chưa phân công' ? '#b45309' : '#10100f' }}>
          {staff}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<Eye size={15} />}
            title="Xem chi tiết đơn thu gom"
            onClick={() => navigate(`/collections/${record.id}`)}
          />
          {record.status === COLLECTION_STATUS.PENDING && (
            <Button
              type="text"
              style={{ color: '#1b4d2e' }}
              title="Duyệt yêu cầu"
              onClick={() => handleUpdateStatus(record.id, COLLECTION_STATUS.APPROVED)}
            >
              Duyệt
            </Button>
          )}
          {record.status === COLLECTION_STATUS.COLLECTED && (
            <Button
              type="text"
              style={{ color: '#10100f', fontWeight: 600 }}
              title="Bắt đầu kiểm định đồ cũ"
              onClick={() => navigate('/collections/inspection')}
            >
              Kiểm định →
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
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
            CIRCULAR INTAKE PIPELINE
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Yêu cầu thu gom quần áo cũ
          </h1>
        </div>

        <button 
          className="pill-btn-filled" 
          style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => navigate('/collections/inspection')}
        >
          <CheckCircle2 size={16} />
          <span>Vào bàn Kiểm định đồ cũ</span>
        </button>
      </div>

      {/* Filter bar */}
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
        <div style={{ flex: 1, minWidth: '240px' }}>
          <Input
            prefix={<Search size={16} color="#70706f" style={{ marginRight: 6 }} />}
            placeholder="Tìm theo mã yêu cầu, tên khách, số điện thoại..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 0 }}
          />
        </div>

        <Select
          defaultValue="ALL"
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 200 }}
        >
          <Option value="ALL">Tất cả trạng thái</Option>
          <Option value={COLLECTION_STATUS.PENDING}>Pending (Chờ duyệt)</Option>
          <Option value={COLLECTION_STATUS.APPROVED}>Approved (Đã duyệt)</Option>
          <Option value={COLLECTION_STATUS.PICKUP_SCHEDULED}>Pickup Scheduled (Đã xếp lịch)</Option>
          <Option value={COLLECTION_STATUS.COLLECTED}>Collected (Đã nhận đồ)</Option>
          <Option value={COLLECTION_STATUS.INSPECTING}>Inspecting (Đang kiểm định)</Option>
          <Option value={COLLECTION_STATUS.ACCEPTED}>Accepted (Đã chấp nhận)</Option>
          <Option value={COLLECTION_STATUS.REJECTED}>Rejected (Từ chối)</Option>
        </Select>
      </div>

      {/* Table */}
      <div className="flat-card">
        <Table dataSource={filteredRequests} columns={columns} rowKey="id" pagination={{ pageSize: 8 }} />
      </div>
    </div>
  );
};

export default CollectionList;
