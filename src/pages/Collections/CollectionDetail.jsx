import React, { useState } from 'react';
import { Row, Col, Typography, Space, Button, Select, Modal, InputNumber, message, Divider } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle, 
  AlertCircle,
  Truck,
  Shirt
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockCollectionRequests, mockStaff } from '../../data/mockData';
import { COLLECTION_STATUS, ROLES } from '../../utils/constants';
import { formatDate, formatShortDate } from '../../utils/formatters';

const { Option } = Select;

export const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(
    mockCollectionRequests.find((r) => r.id === id) || mockCollectionRequests[0]
  );
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(60);

  const handleStatusChange = (newStatus) => {
    setRequest({ ...request, status: newStatus });
    message.success(`Đã cập nhật trạng thái sang: ${newStatus}`);
  };

  const handleAssignStaff = (staffName) => {
    setRequest({ ...request, assignedStaff: staffName });
    message.success(`Đã phân công cho nhân viên: ${staffName}`);
  };

  const handleGrantReward = () => {
    setRequest({
      ...request,
      rewardPointsGranted: (request.rewardPointsGranted || 0) + rewardPoints,
      status: COLLECTION_STATUS.ACCEPTED,
    });
    message.success(`Đã cộng thành công ${rewardPoints} điểm REWEAR Points cho khách hàng ${request.customer.name}!`);
    setRewardModalOpen(false);
  };

  return (
    <div>
      {/* Top Bar */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/collections')}
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
          <ArrowLeft size={16} /> Quay lại danh sách thu gom
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="editorial-sub">HỒ SƠ QUYÊN GÓP</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
                Yêu cầu thu gom {request.id}
              </h1>
              <StatusBadge status={request.status} />
            </div>
          </div>

          <Space size="middle">
            <button
              className="pill-btn-outlined"
              onClick={() => navigate('/collections/inspection')}
              style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Shirt size={15} />
              <span>Chuyển sang kiểm định</span>
            </button>

            {request.status === COLLECTION_STATUS.ACCEPTED ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1b4d2e', fontWeight: 600, fontSize: '13px' }}>
                <CheckCircle size={16} /> Đã tặng {request.rewardPointsGranted} Điểm
              </div>
            ) : (
              <button
                className="pill-btn-filled"
                onClick={() => setRewardModalOpen(true)}
                style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Award size={15} color="#fffb85" />
                <span>Chấp nhận & Tặng REWEAR Points</span>
              </button>
            )}
          </Space>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Customer & Collection Schedule */}
        <Col xs={24} lg={10}>
          {/* Customer Info Card */}
          <div className="flat-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>THÔNG TIN NGƯỜI QUYÊN GÓP</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '9999px', backgroundColor: '#f0f0ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="#10100f" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '16px', color: '#10100f' }}>{request.customer.name}</div>
                <div style={{ fontSize: '12px', color: '#70706f' }}>Mã KH: {request.customer.id}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '10px', fontSize: '13px' }}>
              <Phone size={15} color="#70706f" />
              <span style={{ fontWeight: 500 }}>{request.customer.phone}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: '13px', color: '#40403f' }}>
              <MapPin size={15} color="#70706f" style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{request.customer.address}</span>
            </div>
          </div>

          {/* Collection Status & Logistics Card */}
          <div className="flat-card" style={{ padding: '24px' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>LỊCH TRÌNH VẬN CHUYỂN & ĐIỀU PHỐI</div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block', marginBottom: '4px' }}>
                Cập nhật trạng thái đợt thu gom:
              </span>
              <Select
                value={request.status}
                onChange={handleStatusChange}
                style={{ width: '100%' }}
              >
                <Option value={COLLECTION_STATUS.PENDING}>Pending (Chờ duyệt)</Option>
                <Option value={COLLECTION_STATUS.APPROVED}>Approved (Đã duyệt)</Option>
                <Option value={COLLECTION_STATUS.PICKUP_SCHEDULED}>Pickup Scheduled (Đã xếp lịch)</Option>
                <Option value={COLLECTION_STATUS.COLLECTED}>Collected (Đã nhận đồ)</Option>
                <Option value={COLLECTION_STATUS.INSPECTING}>Inspecting (Đang kiểm định)</Option>
                <Option value={COLLECTION_STATUS.ACCEPTED}>Accepted (Đã chấp nhận)</Option>
                <Option value={COLLECTION_STATUS.REJECTED}>Rejected (Từ chối)</Option>
              </Select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block', marginBottom: '4px' }}>
                Phân công nhân viên lấy hàng:
              </span>
              <Select
                value={request.assignedStaff}
                onChange={handleAssignStaff}
                style={{ width: '100%' }}
              >
                {mockStaff.map((s) => (
                  <Option key={s.id} value={`${s.name} (${s.role})`}>
                    {s.name} — {s.department}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0ef' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Ngày gửi yêu cầu</span>
                <span style={{ fontWeight: 500, fontSize: '13px' }}>{formatShortDate(request.requestDate)}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Ngày hẹn lấy</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: '#10100f' }}>{formatShortDate(request.pickupDate)}</span>
              </div>
            </div>

            {request.notes && (
              <div style={{ marginTop: '16px', padding: '10px 12px', backgroundColor: '#f9f9f8', borderLeft: '3px solid #70706f', fontSize: '12px' }}>
                <b>Ghi chú của khách:</b> {request.notes}
              </div>
            )}
          </div>
        </Col>

        {/* Right Column: Clothes Details & Photos */}
        <Col xs={24} lg={14}>
          <div className="flat-card" style={{ padding: '28px', height: '100%' }}>
            <div className="editorial-sub" style={{ marginBottom: '16px' }}>CHI TIẾT KIỆN ĐỒ QUYÊN GÓP</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: '24px' }}>
              <div style={{ padding: '16px', border: '1px solid #e5e5e4', backgroundColor: '#fafafa' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Tổng số lượng món</span>
                <span style={{ fontSize: '24px', fontWeight: 600, color: '#10100f' }}>{request.clothesCount} chiếc</span>
              </div>

              <div style={{ padding: '16px', border: '1px solid #e5e5e4', backgroundColor: '#fafafa' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Tình trạng khai báo</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#10100f' }}>{request.condition}</span>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block', marginBottom: '4px' }}>Chủng loại đồ cũ</span>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>{request.clothingType}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block', marginBottom: '4px' }}>Chất liệu & Tone màu</span>
              <div style={{ fontSize: '13px', color: '#555' }}>Chất liệu: {request.material} • Tone: {request.color}</div>
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* Photos from Customer */}
            <div>
              <div className="editorial-sub" style={{ marginBottom: '12px' }}>HÌNH ẢNH KHÁCH CHỤP ĐỒ CŨ GỬI LÊN</div>
              {request.photos && request.photos.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {request.photos.map((pUrl, idx) => (
                    <Col span={12} key={idx}>
                      <img
                        src={pUrl}
                        alt={`donation-${idx}`}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          border: '1px solid #e5e5e4',
                        }}
                      />
                    </Col>
                  ))}
                </Row>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#f9f9f8', color: '#70706f', fontSize: '13px' }}>
                  Khách hàng chưa tải lên hình ảnh đính kèm
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Reward Points Modal */}
      <Modal
        title="Tặng điểm REWEAR Points cho khách quyên góp"
        open={rewardModalOpen}
        onCancel={() => setRewardModalOpen(false)}
        footer={null}
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>
            Quy tắc hệ thống: Khách hàng được tặng điểm thưởng khi đồ quyên góp được kiểm định và chấp nhận đạt tiêu chuẩn làm nguyên liệu tái chế.
          </p>

          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              Số điểm thưởng REWEAR Points:
            </span>
            <InputNumber
              value={rewardPoints}
              onChange={setRewardPoints}
              min={10}
              max={1000}
              style={{ width: '100%', borderRadius: 0 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '24px' }}>
            <button type="button" className="pill-btn-outlined" onClick={() => setRewardModalOpen(false)}>
              Hủy
            </button>
            <button type="button" className="pill-btn-filled" onClick={handleGrantReward}>
              Xác nhận cộng điểm
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CollectionDetail;
