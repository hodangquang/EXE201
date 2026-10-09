import React, { useState } from 'react';
import { Row, Col, Table, Select, Button, Input, Modal, message, Space, Tag } from 'antd';
import { CheckCircle2, AlertTriangle, XCircle, Search, Sparkles, Plus, Image } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockInspectionItems } from '../../data/mockData';
import { INSPECTION_RESULT } from '../../utils/constants';

const { Option } = Select;
const { TextArea } = Input;

export const Inspection = () => {
  const [items, setItems] = useState(mockInspectionItems);
  const [filterResult, setFilterResult] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredItems = items.filter((i) => {
    return filterResult === 'ALL' || i.inspectionResult === filterResult;
  });

  const handleUpdateDecision = (itemId, decision) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, inspectionResult: decision } : i))
    );
    message.success(`Đã cập nhật kết quả kiểm định món ${itemId}: ${decision}`);
  };

  const columns = [
    {
      title: 'Mã món đồ',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{id}</span>,
    },
    {
      title: 'Thuộc đợt quyên góp',
      dataIndex: 'requestId',
      key: 'requestId',
      render: (reqId) => <span style={{ color: '#70706f', fontSize: '12px' }}>{reqId}</span>,
    },
    {
      title: 'Loại trang phục & Chất liệu',
      key: 'type_material',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: '#10100f' }}>{r.type}</div>
          <div style={{ fontSize: '12px', color: '#70706f' }}>
            {r.material} • Tone: {r.color}
          </div>
        </div>
      ),
    },
    {
      title: 'Tình trạng & Mức hư tổn',
      key: 'condition_damage',
      render: (_, r) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{r.condition}</div>
          <div style={{ fontSize: '12px', color: '#991b1b' }}>{r.damageLevel}</div>
        </div>
      ),
    },
    {
      title: 'Giá trị tái sử dụng ước tính',
      dataIndex: 'estimatedReusableValue',
      key: 'estimatedReusableValue',
      render: (v) => <span style={{ fontSize: '12px', color: '#40403f' }}>{v}</span>,
    },
    {
      title: 'Kết quả kiểm định',
      dataIndex: 'inspectionResult',
      key: 'inspectionResult',
      render: (res) => <StatusBadge status={res} />,
    },
    {
      title: 'Phân loại nhanh',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            style={{
              borderRadius: '9999px',
              fontSize: '11px',
              backgroundColor: record.inspectionResult === INSPECTION_RESULT.ACCEPTED_UPCYCLING ? '#10100f' : '#fff',
              color: record.inspectionResult === INSPECTION_RESULT.ACCEPTED_UPCYCLING ? '#fff' : '#10100f',
              border: '1px solid #10100f',
            }}
            onClick={() => handleUpdateDecision(record.id, INSPECTION_RESULT.ACCEPTED_UPCYCLING)}
          >
            Làm SP 1-of-1
          </Button>

          <Button
            size="small"
            style={{
              borderRadius: '9999px',
              fontSize: '11px',
              backgroundColor: record.inspectionResult === INSPECTION_RESULT.ACCEPTED_MATERIAL ? '#b45309' : '#fff',
              color: record.inspectionResult === INSPECTION_RESULT.ACCEPTED_MATERIAL ? '#fff' : '#b45309',
              borderColor: '#fde68a',
            }}
            onClick={() => handleUpdateDecision(record.id, INSPECTION_RESULT.ACCEPTED_MATERIAL)}
          >
            Tận dụng vải vụn
          </Button>

          <Button
            size="small"
            danger
            style={{
              borderRadius: '9999px',
              fontSize: '11px',
              backgroundColor: record.inspectionResult === INSPECTION_RESULT.REJECTED ? '#991b1b' : '#fff',
              color: record.inspectionResult === INSPECTION_RESULT.REJECTED ? '#fff' : '#991b1b',
            }}
            onClick={() => handleUpdateDecision(record.id, INSPECTION_RESULT.REJECTED)}
          >
            Từ chối
          </Button>
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
            MATERIAL INTAKE & TRIAGE
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Bàn kiểm định & Phân loại quần áo cũ
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            defaultValue="ALL"
            value={filterResult}
            onChange={setFilterResult}
            style={{ width: 220 }}
          >
            <Option value="ALL">Tất cả kết quả kiểm định</Option>
            <Option value={INSPECTION_RESULT.ACCEPTED_UPCYCLING}>Chấp nhận để tái thiết kế</Option>
            <Option value={INSPECTION_RESULT.ACCEPTED_MATERIAL}>Chấp nhận làm nguyên liệu</Option>
            <Option value={INSPECTION_RESULT.REJECTED}>Rejected (Từ chối)</Option>
          </Select>
        </div>
      </div>

      {/* Business rule banner */}
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
          Quy tắc phân loại & Kiểm định đồ cũ của REWEAR:
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#555554' }}>
          • <b>Accepted for Upcycling:</b> Chất liệu tốt, kết cấu sợi vững, màu sắc phù hợp đưa trực tiếp vào may thành phẩm 1-of-1.<br />
          • <b>Accepted for Material:</b> Quần áo có vết ố hoặc rách cục bộ, chuyển sang kho cắt mảng ghép Boro hoặc làm phụ liệu lót.<br />
          • <b>Rejected:</b> Hỏng nặng màng nhựa/PU mục nát hoặc không an toàn vệ sinh. Đồ bị từ chối <b>tuyệt đối không được đưa vào dự án tái chế</b>.
        </p>
      </div>

      <div className="flat-card">
        <Table
          dataSource={filteredItems}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </div>
    </div>
  );
};

export default Inspection;
