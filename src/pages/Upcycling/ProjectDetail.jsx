import React from 'react';
import { Row, Col, Typography, Space, Button, Divider, Steps } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Recycle, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Calendar, 
  User, 
  Shirt,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockUpcyclingProjects, mockProducts } from '../../data/mockData';
import { formatShortDate } from '../../utils/formatters';
import { UPCYCLING_STATUS } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const project = mockUpcyclingProjects.find((p) => p.id === id) || mockUpcyclingProjects[0];
  const linkedProduct = mockProducts.find((p) => p.id === project.finalProductId);

  // Steps definition for production flow
  const stepsItems = [
    { title: 'Thu gom (Collected)' },
    { title: 'Làm sạch (Cleaning)' },
    { title: 'Thiết kế (Designing)' },
    { title: 'May (Production)' },
    { title: 'Kiểm định (QC)' },
    { title: 'Mở bán (Ready to Sell)' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case UPCYCLING_STATUS.COLLECTED: return 0;
      case UPCYCLING_STATUS.CLEANING: return 1;
      case UPCYCLING_STATUS.DESIGNING: return 2;
      case UPCYCLING_STATUS.PRODUCTION: return 3;
      case UPCYCLING_STATUS.QUALITY_CHECK: return 4;
      case UPCYCLING_STATUS.READY_TO_SELL: return 5;
      default: return 0;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/upcycling')}
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
          <ArrowLeft size={16} /> Quay lại danh sách dự án
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="editorial-sub">HỒ SƠ DỰ ÁN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
                {project.id}: {project.title}
              </h1>
              <StatusBadge status={project.status} />
              <StatusBadge status={project.qcStatus} />
            </div>
          </div>

          {linkedProduct && (
            <button
              className="pill-btn-filled"
              onClick={() => navigate(`/products/${linkedProduct.id}`)}
              style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Shirt size={15} />
              <span>Xem trang thành phẩm mở bán</span>
            </button>
          )}
        </div>
      </div>

      {/* Production Lifecycle Progress Stepper */}
      <div className="flat-card" style={{ padding: '24px 32px', marginBottom: '24px' }}>
        <div className="editorial-sub" style={{ marginBottom: '16px' }}>TIẾN TRÌNH SẢN XUẤT HIỆN TẠI</div>
        <Steps
          current={getStepIndex(project.status)}
          items={stepsItems}
          size="small"
        />
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Visual Gallery of the Lifecycle */}
        <Col xs={24} lg={15}>
          {/* Before Photos */}
          <div className="flat-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="editorial-sub" style={{ marginBottom: '12px' }}>1. NGUYÊN LIỆU ĐỒ CŨ ĐẦU VÀO (BEFORE)</div>
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>
              {project.originalMaterials}
            </div>
            <Row gutter={[12, 12]}>
              {project.beforeImages.map((img, idx) => (
                <Col span={12} key={idx}>
                  <img src={img} alt="before" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                </Col>
              ))}
            </Row>
          </div>

          {/* In-Process Photos */}
          <div className="flat-card" style={{ padding: '24px' }}>
            <div className="editorial-sub" style={{ marginBottom: '12px' }}>2. QUÁ TRÌNH MAY THỦ CÔNG & RẬP MẪU (PROCESS)</div>
            <Row gutter={[12, 12]}>
              {project.processImages.map((img, idx) => (
                <Col span={12} key={idx}>
                  <img src={img} alt="process" style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                </Col>
              ))}
            </Row>
          </div>
        </Col>

        {/* Right Column: Concept, Designer, Specs */}
        <Col xs={24} lg={9}>
          <div className="flat-card" style={{ padding: '28px' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>HỒ SƠ THIẾT KẾ & THÔNG SỐ</div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Nhà thiết kế / Nghệ nhân</span>
              <span style={{ fontWeight: 600, fontSize: '15px', color: '#10100f' }}>{project.designer}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Ngày bắt đầu khởi công</span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{formatShortDate(project.startDate)}</span>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Ngày hoàn thành</span>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>
                {project.completionDate ? formatShortDate(project.completionDate) : 'Đang tiến hành'}
              </span>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block', marginBottom: '4px' }}>Ý tưởng thiết kế (Design Concept)</span>
              <p style={{ fontSize: '13px', color: '#40403f', lineHeight: 1.5, margin: 0 }}>
                {project.designConcept}
              </p>
            </div>

            {project.productionNotes && (
              <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9f9f8', borderLeft: '3px solid #10100f', fontSize: '12px' }}>
                <b>Lưu ý kỹ thuật may:</b> {project.productionNotes}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProjectDetail;
