import React, { useState } from 'react';
import { Table, Button, Select, Space, message, Modal, Form, Input, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Recycle, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockUpcyclingProjects } from '../../data/mockData';
import { UPCYCLING_STATUS, QC_DECISION } from '../../utils/constants';
import { formatShortDate } from '../../utils/formatters';

const { Option } = Select;

export const ProjectList = () => {
  const [projects, setProjects] = useState(mockUpcyclingProjects);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const filteredProjects = projects.filter(
    (p) => statusFilter === 'ALL' || p.status === statusFilter
  );

  const handleCreateProject = (values) => {
    const newProj = {
      id: `UP-2026-00${projects.length + 1}`,
      title: values.title,
      designer: values.designer,
      status: UPCYCLING_STATUS.CLEANING,
      originalMaterials: values.originalMaterials,
      designConcept: values.designConcept,
      startDate: new Date().toISOString(),
      completionDate: null,
      qcStatus: QC_DECISION.NEEDS_REVISION,
      beforeImages: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600'],
      processImages: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600'],
      finalImages: [],
    };
    setProjects([newProj, ...projects]);
    message.success(`Đã khởi tạo dự án tái chế ${newProj.id} thành công!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Mã dự án',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{id}</span>,
    },
    {
      title: 'Tên dự án tái chế',
      dataIndex: 'title',
      key: 'title',
      render: (t, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#10100f' }}>{t}</div>
          <div style={{ fontSize: '12px', color: '#70706f' }}>{r.originalMaterials}</div>
        </div>
      ),
    },
    {
      title: 'Nhà thiết kế / Nghệ nhân',
      dataIndex: 'designer',
      key: 'designer',
      render: (d) => <span style={{ fontWeight: 500 }}>{d}</span>,
    },
    {
      title: 'Giai đoạn sản xuất',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <StatusBadge status={s} />,
    },
    {
      title: 'Trạng thái QC',
      dataIndex: 'qcStatus',
      key: 'qcStatus',
      render: (qc) => <StatusBadge status={qc} />,
    },
    {
      title: 'Ngày khởi động',
      dataIndex: 'startDate',
      key: 'startDate',
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
            title="Xem hồ sơ dự án"
            onClick={() => navigate(`/upcycling/${record.id}`)}
          />
          {record.status === UPCYCLING_STATUS.QUALITY_CHECK && (
            <Button
              type="text"
              style={{ color: '#10100f', fontWeight: 600 }}
              title="Vào kiểm tra QC"
              onClick={() => navigate('/upcycling/qc')}
            >
              Chấm QC →
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
            XƯỞNG THIẾT KẾ
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Dự án tái chế & May mẫu
          </h1>
        </div>

        <Space size="middle">
          <button 
            className="pill-btn-outlined" 
            style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/upcycling/qc')}
          >
            <CheckCircle2 size={16} />
            <span>Khu vực Kiểm định QC</span>
          </button>
          <button 
            className="pill-btn-filled" 
            style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            <span>Khởi tạo dự án mới</span>
          </button>
        </Space>
      </div>

      {/* Filter */}
      <div 
        className="flat-card" 
        style={{ 
          padding: '16px 20px', 
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ fontSize: '13px', color: '#70706f' }}>
          Quy trình vòng đời: <b>Thu gom → Làm sạch → Thiết kế → May gia công → Kiểm định QC → Mở bán</b>
        </div>

        <Select
          defaultValue="ALL"
          aria-label="Lọc giai đoạn sản xuất" value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 220 }}
        >
          <Option value="ALL">Tất cả giai đoạn</Option>
          <Option value={UPCYCLING_STATUS.CLEANING}>Khử khuẩn và giặt</Option>
          <Option value={UPCYCLING_STATUS.DESIGNING}>Lên phom rập</Option>
          <Option value={UPCYCLING_STATUS.PRODUCTION}>Đang may gia công</Option>
          <Option value={UPCYCLING_STATUS.QUALITY_CHECK}>Chờ kiểm tra chất lượng</Option>
          <Option value={UPCYCLING_STATUS.READY_TO_SELL}>Sẵn sàng mở bán</Option>
        </Select>
      </div>

      <div className="flat-card">
        <Table scroll={{ x: 'max-content' }} dataSource={filteredProjects} columns={columns} rowKey="id" pagination={false} />
      </div>

      {/* Create Project Modal */}
      <Modal rootClassName="rw-admin-modal"
        title="Khởi tạo dự án Tái chế mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateProject} style={{ marginTop: '16px' }}>
          <Form.Item name="title" label="Tên dự án" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Reworked Kimono Denim Jacket" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="designer" label="Nhà thiết kế / Thợ may phụ trách" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: Quang (Lead Designer)" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="originalMaterials" label="Vật liệu đồ cũ đưa vào tái chế" rules={[{ required: true }]}>
            <Input placeholder="Ví dụ: 2 quần jeans cũ + 1 áo khoác kaki" style={{ borderRadius: 0 }} />
          </Form.Item>
          <Form.Item name="designConcept" label="Ý tưởng thiết kế">
            <Input.TextArea rows={3} placeholder="Phối mảng ghép, phong cách Boro..." style={{ borderRadius: 0 }} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '20px' }}>
            <button type="button" className="pill-btn-outlined" onClick={() => setIsModalOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="pill-btn-filled">
              Tạo dự án
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectList;
