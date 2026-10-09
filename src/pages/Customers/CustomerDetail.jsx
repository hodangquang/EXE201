import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Avatar, Divider, message, Tag, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { authFetch } from '../../services/auth';
import { formatShortDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export const CustomerDetail = ({ userId, isModal = false }) => {
  const params = useParams();
  const id = userId || params.id;
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      const data = await authFetch(`/api/admin/users/${id}`);
      setCustomer(data.data || data);
    } catch (error) {
      message.error(error.message || 'Lỗi khi tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!customer) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Không tìm thấy thông tin người dùng.</div>;
  }

  const { fullName, email, gender, avatarUrl, role, isVerified, createdAt, updatedAt } = customer;

  return (
    <div>
      {!isModal && (
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/customers')}
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
            <ArrowLeft size={16} /> Quay lại danh sách người dùng
          </button>

          <div>
            <div className="editorial-sub">HỒ SƠ KHÁCH HÀNG</div>
            <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
              {fullName || 'Chưa cập nhật'}
            </h1>
          </div>
        </div>
      )}

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={isModal ? 24 : 12}>
          <div className={isModal ? '' : 'flat-card'} style={{ padding: isModal ? '0' : '32px 24px' }}>
            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <Avatar 
                src={avatarUrl} 
                icon={<User size={40} />} 
                size={86} 
                style={{ backgroundColor: '#26292a', flexShrink: 0 }} 
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '20px', color: '#141414', marginBottom: 4 }}>
                  {fullName || 'Chưa cập nhật'}
                </div>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <Tag color={role === 'Admin' ? 'purple' : role === 'Staff' ? 'blue' : 'default'} style={{ borderRadius: '9999px', margin: 0 }}>
                    {role || 'Member'}
                  </Tag>
                  <Tag color={isVerified ? 'success' : 'warning'} style={{ borderRadius: '9999px', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isVerified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                  </Tag>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '14px', color: '#4A4A4A' }}>
                    <ShieldCheck size={16} color="#70706f" />
                    <span>ID: <strong>{customer.id}</strong></span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '14px', color: '#4A4A4A' }}>
                    <Mail size={16} color="#70706f" />
                    <span>{email || 'Không có email'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '14px', color: '#4A4A4A' }}>
                    <User size={16} color="#70706f" />
                    <span>Giới tính: <strong>{gender || 'Không có thông tin'}</strong></span>
                  </div>
                </div>

                <Divider style={{ margin: '20px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#4A4A4A' }}>
                    <Calendar size={16} color="#70706f" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày tham gia</div>
                      <div style={{ fontWeight: 600, color: '#141414' }}>
                        {createdAt ? formatShortDate(createdAt) : 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: '#4A4A4A' }}>
                    <Clock size={16} color="#70706f" style={{ marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lần cập nhật cuối</div>
                      <div style={{ fontWeight: 600, color: '#141414' }}>
                        {updatedAt ? formatShortDate(updatedAt) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerDetail;
