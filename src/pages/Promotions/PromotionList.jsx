import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Tag } from 'antd';
import { Plus, TicketPercent, Copy, Check } from 'lucide-react';
import { mockPromotions } from '../../data/mockData';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

const { Option } = Select;

export const PromotionList = () => {
  const [promotions, setPromotions] = useState(mockPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = (values) => {
    const newPromo = {
      id: `PRM-00${promotions.length + 1}`,
      name: values.name,
      code: values.code.toUpperCase(),
      discountType: values.discountType,
      discountValue: values.discountValue,
      minOrder: values.minOrder,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      usageLimit: values.usageLimit,
      usedCount: 0,
      status: 'Active',
    };
    setPromotions([newPromo, ...promotions]);
    message.success(`Đã tạo mã ưu đãi ${newPromo.code} thành công!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Mã khuyến mãi (Code)',
      dataIndex: 'code',
      key: 'code',
      render: (code) => (
        <span
          style={{
            fontFamily: "'Space Grotesk', monospace",
            fontWeight: 700,
            fontSize: '13px',
            backgroundColor: '#f0f0ef',
            padding: '3px 8px',
            border: '1px solid #dcdcdb',
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: 'Tên chiến dịch ưu đãi',
      dataIndex: 'name',
      key: 'name',
      render: (n) => <span style={{ fontWeight: 600, color: '#10100f' }}>{n}</span>,
    },
    {
      title: 'Mức giảm giá',
      key: 'discount',
      render: (_, r) => (
        <span style={{ fontWeight: 600, color: '#1b4d2e' }}>
          {r.discountType === 'Percentage' ? `${r.discountValue}%` : formatCurrency(r.discountValue)}
        </span>
      ),
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrder',
      key: 'minOrder',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Lượt sử dụng',
      key: 'usage',
      render: (_, r) => (
        <span>{r.usedCount} / {r.usageLimit}</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'success' : 'default'} style={{ borderRadius: '9999px' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Hạn dùng',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d) => <span style={{ fontSize: '12px', color: '#70706f' }}>{formatShortDate(d)}</span>,
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
            CAMPAIGNS & REWARDS
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Mã giảm giá & Ưu đãi quyên góp
          </h1>
        </div>

        <button 
          className="pill-btn-filled" 
          style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>Tạo mã ưu đãi mới</span>
        </button>
      </div>

      <div className="flat-card">
        <Table dataSource={promotions} columns={columns} rowKey="id" pagination={false} />
      </div>

      {/* Modal */}
      <Modal
        title="Tạo mã khuyến mãi / Voucher mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: '16px' }}>
          <Form.Item name="name" label="Tên chương trình" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Tri ân khách hàng thu gom đợt 1" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="code" label="Mã Voucher (Code)" rules={[{ required: true }]}>
            <Input placeholder="REWEAR50K" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="discountType" label="Loại chiết khấu" initialValue="Fixed Amount">
            <Select>
              <Option value="Fixed Amount">Số tiền cố định (VND)</Option>
              <Option value="Percentage">Phần trăm (%)</Option>
              <Option value="Free Shipping">Miễn phí vận chuyển</Option>
            </Select>
          </Form.Item>
          <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%', borderRadius: 0 }} placeholder="50000 hoặc 10" />
          </Form.Item>
          <Form.Item name="minOrder" label="Đơn hàng tối thiểu (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%', borderRadius: 0 }} placeholder="300000" />
          </Form.Item>
          <Form.Item name="usageLimit" label="Số lượng phát hành" initialValue={500}>
            <InputNumber style={{ width: '100%', borderRadius: 0 }} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '24px' }}>
            <button type="button" className="pill-btn-outlined" onClick={() => setIsModalOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="pill-btn-filled">
              Tạo mã
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default PromotionList;
