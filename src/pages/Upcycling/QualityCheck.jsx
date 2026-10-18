import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Row, Col } from 'antd';
import { ShieldCheck, Plus, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockQCRecords, mockUpcyclingProjects } from '../../data/mockData';
import { QC_DECISION, UPCYCLING_STATUS } from '../../utils/constants';
import { formatShortDate } from '../../utils/formatters';

const { Option } = Select;
const { TextArea } = Input;

export const QualityCheck = () => {
  const [records, setRecords] = useState(mockQCRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateQC = (values) => {
    const newRecord = {
      id: `QC-2026-00${records.length + 1}`,
      projectId: values.projectId,
      productName: values.productName,
      inspector: values.inspector,
      stitchingQuality: values.stitchingQuality,
      materialQuality: values.materialQuality,
      cleaningStatus: values.cleaningStatus,
      visualQuality: values.visualQuality,
      sizeAccuracy: values.sizeAccuracy,
      finalDecision: values.finalDecision,
      checkedAt: new Date().toISOString(),
      canBePublished: values.finalDecision === QC_DECISION.APPROVED,
    };

    setRecords([newRecord, ...records]);
    message.success(`Đã hoàn tất đánh giá QC cho dự án ${values.projectId}!`);
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Mã QC',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{id}</span>,
    },
    {
      title: 'Dự án / Sản phẩm',
      key: 'project_info',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#10100f' }}>{r.productName}</div>
          <div style={{ fontSize: '11px', color: '#70706f' }}>Mã dự án: {r.projectId}</div>
        </div>
      ),
    },
    {
      title: 'Người kiểm định (QC Lead)',
      dataIndex: 'inspector',
      key: 'inspector',
      render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: 'Độ chuẩn đường may (Stitching)',
      dataIndex: 'stitchingQuality',
      key: 'stitchingQuality',
      render: (s) => <span style={{ fontSize: '12px' }}>{s}</span>,
    },
    {
      title: 'Khử khuẩn & Vệ sinh',
      dataIndex: 'cleaningStatus',
      key: 'cleaningStatus',
      render: (c) => <span style={{ fontSize: '12px' }}>{c}</span>,
    },
    {
      title: 'Quyết định cuối cùng',
      dataIndex: 'finalDecision',
      key: 'finalDecision',
      render: (dec) => <StatusBadge status={dec} />,
    },
    {
      title: 'Đủ điều kiện mở bán',
      dataIndex: 'canBePublished',
      key: 'canBePublished',
      render: (canPublish) => (
        <span
          style={{
            fontWeight: 600,
            fontSize: '12px',
            color: canPublish ? '#1b4d2e' : '#991b1b',
          }}
        >
          {canPublish ? '✓ ĐỦ ĐIỀU KIỆN' : '✗ CHƯA ĐỦ ĐIỀU KIỆN'}
        </span>
      ),
    },
    {
      title: 'Ngày kiểm tra',
      dataIndex: 'checkedAt',
      key: 'checkedAt',
      render: (d) => <span style={{ fontSize: '12px', color: '#70706f' }}>{formatShortDate(d)}</span>,
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
            TIÊU CHUẨN CHẤT LƯỢNG
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Kiểm tra chất lượng thành phẩm
          </h1>
        </div>

        <button 
          className="pill-btn-filled" 
          style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={16} />
          <span>Thực hiện kiểm định QC mới</span>
        </button>
      </div>

      {/* QC Business Rule Reminder */}
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          borderLeft: '4px solid #10100f', 
          padding: '16px 20px', 
          marginBottom: '24px',
          border: '1px solid #e5e5e4',
          borderLeftWidth: '4px',
        }}
      >
        <div style={{ fontWeight: 600, color: '#10100f', fontSize: '14px', marginBottom: 2 }}>
          Tiêu chuẩn chất lượng REWEAR bắt buộc:
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#555554' }}>
          Mọi sản phẩm tái chế trước khi xuất xưởng mở bán phải vượt qua 5 tiêu chí: Đường chỉ may giấu mũi, vải không bai xù/mục sợi, tiệt trùng nhiệt và khử mùi, thẩm mỹ phom dáng, và kích cỡ chuẩn. Chỉ những sản phẩm có quyết định <b>Đã duyệt</b> mới có thể mở bán trên hệ thống.
        </p>
      </div>

      <div className="flat-card">
        <Table scroll={{ x: 'max-content' }} dataSource={records} columns={columns} rowKey="id" pagination={false} />
      </div>

      {/* QC Form Modal */}
      <Modal rootClassName="rw-admin-modal"
        title="Biên bản kiểm tra chất lượng sản phẩm tái chế (QC)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={680}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateQC} style={{ marginTop: '16px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="projectId" label="Dự án may mẫu cần QC" rules={[{ required: true }]}>
                <Select placeholder="Chọn dự án">
                  {mockUpcyclingProjects.map((p) => (
                    <Option key={p.id} value={p.id}>{p.id} — {p.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="productName" label="Tên sản phẩm dự kiến" rules={[{ required: true }]}>
                <Input placeholder="Tên sản phẩm..." style={{ borderRadius: 0 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="inspector" label="Nhân viên QC phụ trách" rules={[{ required: true }]}>
                <Input placeholder="Đỗ Quốc Việt (QC Lead)" style={{ borderRadius: 0 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="cleaningStatus" label="Trạng thái tiệt trùng & khử khuẩn" rules={[{ required: true }]}>
                <Select>
                  <Option value="Đạt (Khử trùng tia UV & Giặt sinh học)">Đạt (Khử trùng tia UV & Giặt sinh học)</Option>
                  <Option value="Chưa đạt (Cần sấy tiệt trùng lại)">Chưa đạt (Cần sấy tiệt trùng lại)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="stitchingQuality" label="Chất lượng đường may (Stitching)" rules={[{ required: true }]}>
                <Input placeholder="Chỉ kép đồng đều, không chỉ thừa..." style={{ borderRadius: 0 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="materialQuality" label="Độ bền cơ học của mảng ghép" rules={[{ required: true }]}>
                <Input placeholder="Vải chắc chắn, chịu lực tốt..." style={{ borderRadius: 0 }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="visualQuality" label="Thẩm mỹ & Phom dáng" rules={[{ required: true }]}>
                <Input placeholder="Màu sắc hài hòa, không nhăn nhúm..." style={{ borderRadius: 0 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="sizeAccuracy" label="Độ chuẩn kích cỡ (Bảng size)" rules={[{ required: true }]}>
                <Input placeholder="Đạt chuẩn size L..." style={{ borderRadius: 0 }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="finalDecision" label="Quyết định cuối cùng" rules={[{ required: true }]}>
            <Select>
              <Option value={QC_DECISION.APPROVED}>Đạt tiêu chuẩn mở bán</Option>
              <Option value={QC_DECISION.NEEDS_REVISION}>Cần chỉnh sửa</Option>
              <Option value={QC_DECISION.REJECTED}>Không đạt tiêu chuẩn xuất xưởng</Option>
            </Select>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '24px' }}>
            <button type="button" className="pill-btn-outlined" onClick={() => setIsModalOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="pill-btn-filled">
              Lưu biên bản QC
            </button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QualityCheck;
