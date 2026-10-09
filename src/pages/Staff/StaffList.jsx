import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Avatar } from 'antd';
import { Plus, User, ShieldCheck, UserCheck, Trash2, Edit } from 'lucide-react';
import { mockStaff } from '../../data/mockData';
import { ROLES } from '../../utils/constants';

const { Option } = Select;

export const StaffList = () => {
  const [staffList, setStaffList] = useState(mockStaff);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = (values) => {
    const newStaff = {
      id: `STF-00${staffList.length + 1}`,
      name: values.name,
      email: values.email,
      phone: values.phone,
      role: values.role,
      department: values.department,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setStaffList([...staffList, newStaff]);
    message.success(`Đã thêm nhân sự "${newStaff.name}" thành công!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleToggleStatus = (id) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === 'Active' ? 'Disabled' : 'Active';
          message.success(`Đã đổi trạng thái sang ${nextStatus}`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const columns = [
    {
      title: 'Nhân sự',
      key: 'staff',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={r.avatar} icon={<User size={16} />} style={{ backgroundColor: '#10100f' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#10100f' }}>{r.name}</div>
            <div style={{ fontSize: '12px', color: '#70706f' }}>{r.email} • {r.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phòng ban / Bộ phận',
      dataIndex: 'department',
      key: 'department',
      render: (dep) => <span style={{ fontSize: '13px' }}>{dep}</span>,
    },
    {
      title: 'Vai trò hệ thống',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 600,
            fontSize: '11px',
            backgroundColor: role === ROLES.ADMIN ? '#10100f' : '#f0f0ef',
            color: role === ROLES.ADMIN ? '#ffffff' : '#10100f',
            padding: '2px 8px',
            borderRadius: '9999px',
          }}
        >
          {role === ROLES.ADMIN ? <ShieldCheck size={12} /> : <UserCheck size={12} />}
          {role}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <Tag color={st === 'Active' ? 'success' : 'default'} style={{ borderRadius: '9999px' }}>
          {st}
        </Tag>
      ),
    },
    {
      title: 'Ngày gia nhập',
      dataIndex: 'joinedDate',
      key: 'joinedDate',
      render: (d) => <span style={{ fontSize: '12px', color: '#70706f' }}>{d}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, r) => (
        <Button
          size="small"
          onClick={() => handleToggleStatus(r.id)}
          style={{ fontSize: '12px' }}
        >
          {r.status === 'Active' ? 'Khóa tài khoản' : 'Kích hoạt'}
        </Button>
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
            ORGANIZATION & ACCESS CONTROL
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Quản trị Nhân sự & Phân quyền
          </h1>
        </div>

        <button 
          className="pill-btn-filled" 
          style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>Thêm nhân viên mới</span>
        </button>
      </div>

      <div className="flat-card">
        <Table dataSource={staffList} columns={columns} rowKey="id" pagination={false} />
      </div>

      {/* Modal */}
      <Modal
        title="Thêm nhân viên mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: '16px' }}>
          <Form.Item name="name" label="Họ và tên" rules={[{ required: true }]}>
            <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="email" label="Email đăng nhập" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="staff@rewear.vn" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input placeholder="0901234567" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="department" label="Bộ phận công tác" rules={[{ required: true }]}>
            <Input placeholder="Xưởng tái chế (Upcycling Lab)" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="role" label="Vai trò" initialValue={ROLES.STAFF}>
            <Select>
              <Option value={ROLES.STAFF}>STAFF (Chỉ quản lý Thu gom, QC, Kho & Đơn hàng)</Option>
              <Option value={ROLES.ADMIN}>ADMIN (Toàn quyền hệ thống, xem doanh thu & cài đặt)</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '24px' }}>
            <button type="button" className="pill-btn-outlined" onClick={() => setIsModalOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="pill-btn-filled">
              Thêm nhân sự
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffList;
