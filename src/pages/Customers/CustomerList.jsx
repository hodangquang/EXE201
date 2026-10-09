import React, { useState, useEffect } from 'react';
import { Table, Input, Space, Button, Avatar, Tag, message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, User } from 'lucide-react';
import { formatShortDate } from '../../utils/formatters';
import { authFetch } from '../../services/auth';
import { CustomerDetail } from './CustomerDetail';

export const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authFetch('/api/admin/users');
      // Assume data is an array or data.data is an array. Adapt to your actual API response.
      const usersList = Array.isArray(data) ? data : (data.data || []);
      setCustomers(usersList);
    } catch (error) {
      message.error(error.message || 'Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const searchLower = searchText.toLowerCase();
    const nameMatch = (c.name || c.fullName || '').toLowerCase().includes(searchLower);
    const emailMatch = (c.email || '').toLowerCase().includes(searchLower);
    const phoneMatch = (c.phone || c.phoneNumber || '').includes(searchText);
    return nameMatch || emailMatch || phoneMatch;
  });

  const columns = [
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={r.avatar || r.avatarUrl} icon={<User size={16} />} style={{ backgroundColor: '#10100f' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#10100f' }}>{r.name || r.fullName || 'Chưa cập nhật'}</div>
            <div style={{ fontSize: '12px', color: '#70706f' }}>{r.email} {r.phone || r.phoneNumber ? `• ${r.phone || r.phoneNumber}` : ''}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'Admin' ? 'purple' : role === 'Staff' ? 'blue' : 'default'} style={{ borderRadius: '9999px', margin: 0 }}>
          {role || 'Member'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái xác thực',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified) => (
        <Tag color={isVerified ? 'success' : 'warning'} style={{ borderRadius: '9999px', margin: 0 }}>
          {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span style={{ fontSize: '13px' }}>{date ? formatShortDate(date) : ''}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<Eye size={15} />}
          title="Xem hồ sơ khách hàng & Lịch sử điểm"
          onClick={() => {
            setSelectedUserId(record.id || record.userId);
            setDetailModalVisible(true);
          }}
        />
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
            PATRON DIRECTORY
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Cộng đồng Khách hàng & Điểm thưởng
          </h1>
        </div>
      </div>

      <div className="flat-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <Input
          prefix={<Search size={16} color="#70706f" style={{ marginRight: 6 }} />}
          placeholder="Tìm khách hàng theo tên, email hoặc số điện thoại..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: '400px', borderRadius: 0 }}
        />
      </div>

      <div className="flat-card">
        <Table 
          dataSource={filteredCustomers} 
          columns={columns} 
          rowKey={(r) => r.id || r.userId || r.email} 
          pagination={{ pageSize: 8 }} 
          loading={loading}
        />
      </div>

      <Modal
        title={null}
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedUserId(null);
        }}
        footer={null}
        width={700}
        destroyOnClose
        centered
      >
        <div style={{ paddingTop: '24px' }}>
          {selectedUserId && <CustomerDetail userId={selectedUserId} isModal={true} />}
        </div>
      </Modal>
    </div>
  );
};

export default CustomerList;
