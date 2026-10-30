import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Tag, message, Image, Space, Button, Modal, Descriptions, Upload } from 'antd';
import SourcingPayoutPanel from '../../components/common/SourcingPayoutPanel';
import { Link, useNavigate } from 'react-router-dom';
import { authFetch, shippingApi } from '../../services/auth';
import { operationsApi } from '../../services/operations';
import { Scissors, ArrowRight, Truck } from 'lucide-react';

const { Option } = Select;
const CONDITION_LABELS = { 0: 'Như mới', 1: 'Rất tốt', 2: 'Tốt', 3: 'Khá', LikeNew: 'Như mới', Excellent: 'Rất tốt', Good: 'Tốt', Fair: 'Khá' };
const conditionCode = value => ({ LikeNew: 0, Excellent: 1, Good: 2, Fair: 3 }[value] ?? Number(value));

const STATUS_MAP = {
  0: { color: 'blue', label: 'Chờ duyệt' },
  1: { color: 'orange', label: 'Đang xem xét' },
  2: { color: 'purple', label: 'Đã định giá' },
  3: { color: 'cyan', label: 'Đã đồng ý giá' },
  4: { color: 'green', label: 'Đã nhận hàng' },
  5: { color: 'green', label: 'Đã duyệt' },
  6: { color: 'geekblue', label: 'Hoàn tất' },
  7: { color: 'red', label: 'Đã từ chối' },
  8: { color: 'volcano', label: 'Đã từ chối giá' },
  'Pending': { color: 'blue', label: 'Chờ duyệt' },
  'UnderReview': { color: 'orange', label: 'Đang xem xét' },
  'Priced': { color: 'purple', label: 'Đã định giá' },
  'Accepted': { color: 'cyan', label: 'Đã đồng ý giá' },
  'Declined': { color: 'volcano', label: 'Đã từ chối giá' },
  'Received': { color: 'green', label: 'Đã nhận hàng' },
  'Approved': { color: 'green', label: 'Đã duyệt' },
  'Rejected': { color: 'red', label: 'Đã từ chối' },
  'Completed': { color: 'geekblue', label: 'Hoàn tất' },
};

const SourcingRequests = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });
  const [offerModal, setOfferModal] = useState({ open: false, id: null, offeredPrice: 0, adminNote: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, rejectReason: '' });
  const [inspectModal, setInspectModal] = useState({
    open: false,
    id: null,
    inspectedCondition: 0,
    adminNote: '',
    passed: true,
    revisedPrice: ''
  });
  const [inspectionImages, setInspectionImages] = useState([]);
  const [inspectionUploading, setInspectionUploading] = useState(false);
  const [assignModal, setAssignModal] = useState({
    open: false,
    id: null,
    shipperId: '',
    pickupAddress: '',
    senderName: '',
    senderPhone: '',
    preferredPickupTime: '',
    pickupNote: ''
  });
  const [shippersList, setShippersList] = useState([]);

  useEffect(() => {
    operationsApi.shippers().then(data => setShippersList(Array.isArray(data) ? data : [])).catch(() => {});
  }, []);

  const handleViewDetail = async (id) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await authFetch(`/api/Sourcing/${id}`);
      setDetailModal({ open: true, data: res.data || res, loading: false });
    } catch (err) {
      message.error('Lỗi tải chi tiết: ' + err.message);
      setDetailModal({ open: false, data: null, loading: false });
    }
  };

  const handleStartReview = async (id) => {
    try {
      await authFetch(`/api/Sourcing/${id}/review`, { method: 'PATCH' });
      message.success('Đã chuyển yêu cầu sang trạng thái đang xem xét.');
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái: ' + err.message);
    }
  };

  const handleOffer = async () => {
    try {
      await authFetch(`/api/Sourcing/${offerModal.id}/offer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeredPrice: Number(offerModal.offeredPrice),
          adminNote: offerModal.adminNote
        })
      });
      message.success('Đã định giá thành công.');
      setOfferModal({ open: false, id: null, offeredPrice: 0, adminNote: '' });
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi định giá: ' + err.message);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.rejectReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      await authFetch(`/api/Sourcing/${rejectModal.id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejectReason: rejectModal.rejectReason
        })
      });
      message.success('Đã từ chối yêu cầu thành công');
      setRejectModal({ open: false, id: null, rejectReason: '' });
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi từ chối: ' + err.message);
    }
  };

  const handleReceived = async (id) => {
    try {
      await authFetch(`/api/Sourcing/${id}/received`, { method: 'PATCH' });
      message.success('Đã đánh dấu nhận hàng thành công.');
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi đánh dấu nhận hàng: ' + err.message);
    }
  };

  const handleAssignShipper = async () => {
    if (!assignModal.shipperId) {
      message.error('Vui lòng chọn nhân viên giao hàng (Shipper).');
      return;
    }
    if (!assignModal.senderName.trim() || !assignModal.pickupAddress.trim() || !assignModal.senderPhone.trim() || !assignModal.preferredPickupTime.trim()) {
      message.error('Nhập tên liên hệ, địa chỉ, số điện thoại và giờ hẹn lấy đồ đã xác nhận.');
      return;
    }
    try {
      await shippingApi.assignPickup(assignModal.id, {
        shipperId: assignModal.shipperId,
        pickupAddress: assignModal.pickupAddress,
        senderName: assignModal.senderName,
        senderPhone: assignModal.senderPhone,
        preferredPickupTime: assignModal.preferredPickupTime,
        pickupNote: assignModal.pickupNote
      });
      message.success('Đã phân công shipper thu gom đồ cũ thành công!');
      setAssignModal({ open: false, id: null, shipperId: '', pickupAddress: '', senderName: '', senderPhone: '', preferredPickupTime: '', pickupNote: '' });
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi phân công shipper: ' + err.message);
    }
  };

  const handleInspect = async () => {
    if (!inspectModal.adminNote.trim()) { message.error('Nhập kết quả kiểm định hoặc lý do không đạt.'); return; }
    if (inspectionUploading) return;
    try {
      await authFetch(`/api/Sourcing/${inspectModal.id}/inspect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectedCondition: Number(inspectModal.inspectedCondition),
          adminNote: inspectModal.adminNote,
          passed: inspectModal.passed,
          revisedPrice: inspectModal.revisedPrice === '' ? null : Number(inspectModal.revisedPrice),
          images: inspectionImages
        })
      });
      message.success('Đã ghi nhận kết quả kiểm định. Xem chi tiết để kiểm tra bước tiếp theo.');
      setInspectModal({ open: false, id: null, inspectedCondition: 0, adminNote: '', passed: true, revisedPrice: '' });
      setInspectionImages([]);
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi kiểm định: ' + err.message);
    }
  };

  const uploadInspectionImage = async ({ file, onSuccess, onError }) => {
    setInspectionUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await authFetch('/api/operations/images', { method: 'POST', body });
      const url = response.data?.url;
      if (!url) throw new Error('Hệ thống chưa trả về ảnh kiểm định.');
      setInspectionImages(previous => [...previous, url]);
      onSuccess({ url });
    } catch (error) { message.error(error.message); onError(error); }
    finally { setInspectionUploading(false); }
  };

  const fetchRequests = async (status) => {
    setLoading(true);
    try {
      let url = '/api/Sourcing';
      if (status && status !== 'all') {
        url += `?status=${status}`;
      }
      const response = await authFetch(url);
      // Assuming response is an array or object containing { data: [] }
      const items = Array.isArray(response) ? response : response.data || [];
      setData(items);
    } catch (error) {
      message.error('Lỗi khi tải danh sách yêu cầu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(statusFilter);
  }, [statusFilter]);

  const columns = [
    {
      title: 'Khách hàng / Liên hệ',
      dataIndex: 'customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div><strong>{record.customerName || 'N/A'}</strong></div>
          <div style={{ color: '#888', fontSize: '12px' }}>{record.customerPhone || record.customerEmail || ''}</div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {(record.imageUrls?.[0] || record.images?.[0]) && (
            <Image
              src={record.imageUrls?.[0] || record.images?.[0]?.imageUrl || record.images?.[0]}
              width={60}
              height={60}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 600 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Kích cỡ: {record.size || '-'} | Màu sắc: {record.color || '-'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Giá mong muốn: {record.customerExpectedPrice ? record.customerExpectedPrice.toLocaleString() + ' đ' : 'Chưa nhập'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tình trạng',
      dataIndex: 'declaredCondition',
      key: 'declaredCondition',
      render: (cond) => {
        return CONDITION_LABELS[cond] || cond;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === null || status === undefined || status === '') return <Tag>Không rõ</Tag>;
        const mapped = STATUS_MAP[status] || { color: 'default', label: status };
        return <Tag color={mapped.color}>{mapped.label}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '-',
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space wrap size="small">
          <Button type="link" size="small" onClick={() => handleViewDetail(record.id)}>Chi tiết</Button>
          {(record.status === 'Pending' || record.status === 0 || record.status === '0') && (
            <Button type="primary" size="small" onClick={() => handleStartReview(record.id)}>
              Bắt đầu xem xét
            </Button>
          )}
          {(record.status === 'UnderReview' || record.status === 1 || record.status === '1') && (
            <Button type="primary" size="small" style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }} onClick={() => setOfferModal({ open: true, id: record.id, offeredPrice: record.customerExpectedPrice || 0, adminNote: '' })}>
              Định giá
            </Button>
          )}
          {(record.status === 'Pending' || record.status === 0 || record.status === '0' || record.status === 'UnderReview' || record.status === 1 || record.status === '1') && (
            <Button type="primary" danger size="small" onClick={() => setRejectModal({ open: true, id: record.id, rejectReason: '' })}>
              Từ chối
            </Button>
          )}
          {(record.status === 'Accepted' || record.status === 3 || record.status === '3') && (
            <Space wrap size="small">
              {!['OnTheWay', 'PickedUp'].includes(record.pickupStatus) && <Button
                type="primary"
                size="small"
                style={{ backgroundColor: '#1d4ed8', borderColor: '#1d4ed8' }}
                icon={<Truck size={12} />}
                onClick={() => setAssignModal({
                  open: true,
                  id: record.id,
                  shipperId: record.assignedShipperId || '',
                  pickupAddress: record.pickupAddress || '',
                  senderName: record.senderName || '',
                  senderPhone: record.senderPhone || '',
                  preferredPickupTime: record.preferredPickupTime || '',
                  pickupNote: record.pickupNote || ''
                })}
              >
                {record.assignedShipperName ? `Đổi Shipper (${record.assignedShipperName})` : 'Phân công Shipper'}
              </Button>}
              {(!record.assignedShipperId || record.pickupStatus === 'PickedUp') && <Button type="primary" size="small" style={{ backgroundColor: '#287447', borderColor: '#287447' }} onClick={() => handleReceived(record.id)}>
                Đã nhận tại kho
              </Button>}
              {record.assignedShipperId && record.pickupStatus !== 'PickedUp' && <Tag color="blue">Chờ shipper lấy đồ</Tag>}
            </Space>
          )}
          {((record.status === 'Received' || record.status === 4 || record.status === '4') && !record.requiresRevisedAcceptance) && (
            <Button
              type="primary"
              size="small"
              onClick={() => { setInspectionImages([]); setInspectModal({
                open: true,
                id: record.id,
                inspectedCondition: conditionCode(record.declaredCondition ?? 2),
                adminNote: '',
                passed: true,
                revisedPrice: ''
              }); }}
            >
              Kiểm định
            </Button>
          )}
          {((record.status === 'Approved' || record.status === 5 || record.status === '5') && !!record.payout) && (
            <Space wrap size="small">
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                onClick={() => navigate(`/upcycling?inventory=${record.id}&title=${encodeURIComponent(record.title || '')}`)}
              >
                Tạo dự án tái chế
              </Button>
            </Space>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={<h1 className="editorial-title" style={{ fontSize: 26, margin: 0 }}>Duyệt yêu cầu đồ cũ</h1>}
      extra={
        <Space>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Bộ lọc trạng thái:</span>
          <Select
            aria-label="Lọc trạng thái yêu cầu" value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'Pending', label: 'Chờ duyệt' },
              { value: 'UnderReview', label: 'Đang xem xét' },
              { value: 'Priced', label: 'Đã định giá' },
              { value: 'Accepted', label: 'Đã đồng ý giá' },
              { value: 'Declined', label: 'Đã từ chối giá' },
              { value: 'Received', label: 'Đã nhận hàng' },
              { value: 'Approved', label: 'Đã duyệt' },
              { value: 'Completed', label: 'Hoàn tất' },
              { value: 'Rejected', label: 'Đã từ chối' },
            ]}
          />
          <Button onClick={() => fetchRequests(statusFilter)}>Tải lại</Button>
        </Space>
      }
    >
      <Table scroll={{ x: 'max-content' }}
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal rootClassName="rw-admin-modal"
        title="Chi tiết yêu cầu đồ cũ"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, data: null, loading: false })}
        footer={null}
        width={700}
        destroyOnClose
      >
        {detailModal.loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>Đang tải...</div>
        ) : detailModal.data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Mã yêu cầu">{detailModal.data.id}</Descriptions.Item>
              <Descriptions.Item label="Tên sản phẩm"><strong>{detailModal.data.title}</strong></Descriptions.Item>
              <Descriptions.Item label="Mô tả">{detailModal.data.description || 'Không có'}</Descriptions.Item>
              <Descriptions.Item label="Tình trạng khách khai báo">{CONDITION_LABELS[detailModal.data.declaredCondition] || 'Chưa có'}</Descriptions.Item>
              {detailModal.data.inspectedCondition != null && <Descriptions.Item label="Tình trạng sau kiểm định">{CONDITION_LABELS[detailModal.data.inspectedCondition] || 'Chưa có'}</Descriptions.Item>}
              <Descriptions.Item label="Kích cỡ / Màu sắc">
                {detailModal.data.size || '-'} / {detailModal.data.color || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Giá KH mong muốn">
                {detailModal.data.customerExpectedPrice ? detailModal.data.customerExpectedPrice.toLocaleString() + ' đ' : 'Chưa nhập'}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {detailModal.data.customerName} - {detailModal.data.customerPhone || detailModal.data.customerEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {new Date(detailModal.data.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const mapped = STATUS_MAP[detailModal.data.status] || { color: 'default', label: detailModal.data.status };
                  return <Tag color={mapped.color}>{mapped.label}</Tag>;
                })()}
              </Descriptions.Item>
            </Descriptions>
            <SourcingPayoutPanel sourcing={detailModal.data} onChanged={() => { handleViewDetail(detailModal.data.id); fetchRequests(statusFilter); }} />
            {detailModal.data.payout && (
              <div style={{ marginTop: 8, padding: 16, backgroundColor: '#f9f9f8', border: '1px solid #e8e8e7', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#10100f', marginBottom: 6 }}>
                  Bước xử lý tiếp theo
                </div>
                <p style={{ fontSize: 13, color: '#626260', margin: '0 0 12px 0' }}>
                  Cửa hàng đã ghi nhận chi trả. Đồ thu mua được dùng làm nguyên liệu cho dự án tái chế; thành phẩm phải đạt kiểm định trước khi đăng bán.
                </p>
                <Space wrap>
                  <Button
                    type="primary"
                    icon={<Scissors size={14} style={{ marginRight: 4 }} />}
                    style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
                    onClick={() => {
                      const itemData = detailModal.data;
                      setDetailModal({ open: false, data: null, loading: false });
                      navigate(`/upcycling?inventory=${itemData.id}&title=${encodeURIComponent(itemData.title || '')}`);
                    }}
                  >
                    Tạo dự án tái chế
                  </Button>
                  <Link to="/inventory" style={{ fontSize: 13, marginLeft: 8 }}>Xem trong Kho</Link>
                </Space>
              </div>
            )}

            {(() => {
              const imgs = detailModal.data.images || detailModal.data.sourcingImages || detailModal.data.imageUrls || [];
              if (imgs.length === 0) return null;
              return (
                <div>
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>Hình ảnh đính kèm:</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {imgs.map((img, idx) => (
                      <Image key={idx} src={img.imageUrl || img.url || img} width={100} height={100} style={{ objectFit: 'cover', borderRadius: 4 }} />
                    ))}
                  </div>
                </div>
              );
            })()}
            {detailModal.data.inspectionImages?.length > 0 && <div>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Ảnh ghi nhận khi kiểm định:</p>
              <Image.PreviewGroup>{detailModal.data.inspectionImages.map((url, idx) => <Image key={`${url}-${idx}`} src={url} width={100} height={100} style={{ objectFit: 'contain', marginRight: 8 }} />)}</Image.PreviewGroup>
            </div>}
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>Không có dữ liệu</div>
        )}
      </Modal>

      <Modal rootClassName="rw-admin-modal"
        title="Định giá yêu cầu"
        open={offerModal.open}
        onOk={handleOffer}
        onCancel={() => setOfferModal({ open: false, id: null, offeredPrice: 0, adminNote: '' })}
        okText="Xác nhận định giá"
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="sourcing-offer" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Giá đề xuất (VNĐ)</label>
            <input
              type="number"
              className="ant-input"
              id="sourcing-offer" value={offerModal.offeredPrice}
              onChange={e => setOfferModal({ ...offerModal, offeredPrice: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="sourcing-offer-note" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ghi chú của quản trị viên</label>
            <textarea
              className="ant-input"
              rows={4}
              id="sourcing-offer-note" value={offerModal.adminNote}
              onChange={e => setOfferModal({ ...offerModal, adminNote: e.target.value })}
              placeholder="Nhập ghi chú hoặc lý do định giá..."
            />
          </div>
        </div>
      </Modal>

      <Modal rootClassName="rw-admin-modal"
        title="Từ chối Yêu cầu"
        open={rejectModal.open}
        onOk={handleReject}
        onCancel={() => setRejectModal({ open: false, id: null, rejectReason: '' })}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="sourcing-reject" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Lý do từ chối *</label>
            <textarea
              className="ant-input"
              rows={4}
              id="sourcing-reject" value={rejectModal.rejectReason}
              onChange={e => setRejectModal({ ...rejectModal, rejectReason: e.target.value })}
              placeholder="Nhập lý do từ chối yêu cầu này..."
            />
          </div>
        </div>
      </Modal>

      <Modal rootClassName="rw-admin-modal"
        title="Kiểm định yêu cầu & Phân luồng xử lý"
        open={inspectModal.open}
        onOk={handleInspect}
        onCancel={() => setInspectModal({ open: false, id: null, inspectedCondition: 0, adminNote: '', passed: true, revisedPrice: '' })}
        okText="Xác nhận kiểm định"
        okButtonProps={{ disabled: inspectionUploading }}
        cancelText="Hủy"
        destroyOnClose
        width={620}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="sourcing-inspect-result" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Kết quả kiểm định</label>
            <Select id="sourcing-inspect-result" style={{ width: '100%', marginBottom: 16 }} value={inspectModal.passed} onChange={passed => setInspectModal({ ...inspectModal, passed })} options={[{ value: true, label: 'Đạt yêu cầu' }, { value: false, label: 'Không đạt — trả người gửi' }]} />

            <label htmlFor="sourcing-revised-price" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Giá điều chỉnh nếu cần (người gửi phải đồng ý lại)</label>
            <input id="sourcing-revised-price" type="number" min="1" className="ant-input" style={{ marginBottom: 16 }} value={inspectModal.revisedPrice} onChange={e => setInspectModal({ ...inspectModal, revisedPrice: e.target.value })} placeholder="Bỏ trống nếu giữ nguyên giá đã đồng ý" />

            <label htmlFor="sourcing-condition" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tình trạng thực tế</label>
            <Select
              style={{ width: '100%' }}
              id="sourcing-condition" value={inspectModal.inspectedCondition}
              onChange={val => setInspectModal({ ...inspectModal, inspectedCondition: val })}
            >
              <Option value={0}>Như mới</Option>
              <Option value={1}>Rất tốt</Option>
              <Option value={2}>Tốt</Option>
              <Option value={3}>Khá</Option>
            </Select>
          </div>
          <div>
            <label htmlFor="sourcing-inspect-note" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ghi chú kiểm định / đánh giá (Bắt buộc)</label>
            <textarea
              className="ant-input"
              rows={4}
              id="sourcing-inspect-note" value={inspectModal.adminNote}
              onChange={e => setInspectModal({ ...inspectModal, adminNote: e.target.value })}
              placeholder="Nhập ghi chú sau khi kiểm định..."
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ảnh hiện vật khi kiểm định (tối đa 5)</label>
            <Upload customRequest={uploadInspectionImage} accept="image/jpeg,image/png,image/webp" maxCount={5} multiple={false}
              beforeUpload={file => { if (file.size > 5 * 1024 * 1024 || inspectionImages.length >= 5) { message.error('Tối đa 5 ảnh, mỗi ảnh không quá 5 MB.'); return Upload.LIST_IGNORE; } return true; }}
              onRemove={file => setInspectionImages(previous => previous.filter(url => url !== file.response?.url))}>
              <Button loading={inspectionUploading}>Tải ảnh kiểm định</Button>
            </Upload>
          </div>
        </div>
      </Modal>

      <Modal rootClassName="rw-admin-modal"
        title="Phân công Shipper lấy quần áo cũ tận nơi"
        open={assignModal.open}
        onOk={handleAssignShipper}
        onCancel={() => setAssignModal({ open: false, id: null, shipperId: '', pickupAddress: '', senderName: '', senderPhone: '', preferredPickupTime: '', pickupNote: '' })}
        okText="Xác nhận phân công"
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Chọn nhân viên giao hàng (Shipper) *</label>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn shipper"
              value={assignModal.shipperId || undefined}
              onChange={val => setAssignModal({ ...assignModal, shipperId: val })}
              options={shippersList.map(s => ({ value: s.id, label: `${s.fullName} (${s.email})` }))}
            />
          </div>
          <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Địa chỉ lấy đồ đã xác nhận *</label>
            <input
              className="ant-input"
              value={assignModal.pickupAddress}
              onChange={e => setAssignModal({ ...assignModal, pickupAddress: e.target.value })}
              placeholder="VD: 280 An Dương Vương, P.4, Q.5, TP.HCM"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tên người liên hệ *</label>
              <input
                className="ant-input"
                value={assignModal.senderName}
                onChange={e => setAssignModal({ ...assignModal, senderName: e.target.value })}
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Số điện thoại *</label>
              <input
                className="ant-input"
                value={assignModal.senderPhone}
                onChange={e => setAssignModal({ ...assignModal, senderPhone: e.target.value })}
                placeholder="VD: 0903123456"
              />
            </div>
          </div>
          <div>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Khung giờ hẹn lấy đã xác nhận *</label>
            <input
              className="ant-input"
              value={assignModal.preferredPickupTime}
              onChange={e => setAssignModal({ ...assignModal, preferredPickupTime: e.target.value })}
              placeholder="VD: 26/10, 09:00–11:30"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Ghi chú cho Shipper</label>
            <textarea
              className="ant-input"
              rows={2}
              value={assignModal.pickupNote}
              onChange={e => setAssignModal({ ...assignModal, pickupNote: e.target.value })}
              placeholder="VD: Đồ đã giặt sạch để trong túi vải màu xanh..."
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default SourcingRequests;
