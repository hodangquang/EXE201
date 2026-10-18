import React, { useState, useEffect } from 'react';
import { Table, Card, Select, Tag, message, Image, Space, Button, Modal, Descriptions } from 'antd';
import { authFetch } from '../../services/auth';

const { Option } = Select;

const STATUS_MAP = {
  0: { color: 'blue', label: 'Chờ duyệt' },
  1: { color: 'orange', label: 'Đang xem xét' },
  2: { color: 'purple', label: 'Đã định giá' },
  3: { color: 'cyan', label: 'Đã đồng ý giá' },
  4: { color: 'green', label: 'Đã nhận hàng' },
  5: { color: 'green', label: 'Đã duyệt' },
  6: { color: 'red', label: 'Đã từ chối' },
  7: { color: 'volcano', label: 'Đã từ chối giá' },
  8: { color: 'geekblue', label: 'Hoàn tất' },
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });
  const [offerModal, setOfferModal] = useState({ open: false, id: null, offeredPrice: 0, adminNote: '' });
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, rejectReason: '' });
  const [inspectModal, setInspectModal] = useState({ open: false, id: null, inspectedCondition: 1, adminNote: '' });
  const [convertModal, setConvertModal] = useState({ open: false, id: null, sellingPrice: 0 });

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

  const handleInspect = async () => {
    try {
      await authFetch(`/api/Sourcing/${inspectModal.id}/inspect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspectedCondition: Number(inspectModal.inspectedCondition),
          adminNote: inspectModal.adminNote
        })
      });
      message.success('Đã kiểm định và duyệt yêu cầu.');
      setInspectModal({ open: false, id: null, inspectedCondition: 1, adminNote: '' });
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi kiểm định: ' + err.message);
    }
  };

  const handleConvert = async () => {
    if (!convertModal.sellingPrice || convertModal.sellingPrice <= 0) {
      message.error('Vui lòng nhập giá bán hợp lệ');
      return;
    }
    try {
      await authFetch(`/api/Sourcing/${convertModal.id}/convert-to-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sellingPrice: Number(convertModal.sellingPrice)
        })
      });
      message.success('Đã chuyển yêu cầu thành sản phẩm.');
      setConvertModal({ open: false, id: null, sellingPrice: 0 });
      fetchRequests(statusFilter);
    } catch (err) {
      message.error('Lỗi khi convert: ' + err.message);
    }
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
          {record.images && record.images[0] && (
            <Image
              src={record.images[0].imageUrl || record.images[0]}
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
        const labels = { 1: '1 - Như mới', 2: '2 - Tốt', 3: '3 - Khá' };
        return labels[cond] || cond;
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
        <Space>
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
            <Button type="primary" size="small" style={{ backgroundColor: '#287447', borderColor: '#287447' }} onClick={() => handleReceived(record.id)}>
              Đã nhận hàng
            </Button>
          )}
          {(record.status === 'Received' || record.status === 4 || record.status === '4') && (
            <Button type="primary" size="small" onClick={() => setInspectModal({ open: true, id: record.id, inspectedCondition: 1, adminNote: '' })}>
              Kiểm định
            </Button>
          )}
          {(record.status === 'Approved' || record.status === 5 || record.status === '5') && (
            <Button type="primary" size="small" style={{ backgroundColor: '#eb2f96', borderColor: '#eb2f96' }} onClick={() => setConvertModal({ open: true, id: record.id, sellingPrice: 0 })}>
              Đăng bán
            </Button>
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
              <Descriptions.Item label="Tình trạng (Condition)">{detailModal.data.declaredCondition}</Descriptions.Item>
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
        title="Kiểm định yêu cầu"
        open={inspectModal.open}
        onOk={handleInspect}
        onCancel={() => setInspectModal({ open: false, id: null, inspectedCondition: 1, adminNote: '' })}
        okText="Xác nhận kiểm định"
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="sourcing-condition" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Tình trạng thực tế</label>
            <Select 
              style={{ width: '100%' }}
              id="sourcing-condition" value={inspectModal.inspectedCondition}
              onChange={val => setInspectModal({ ...inspectModal, inspectedCondition: val })}
            >
              <Option value={1}>1 - Như mới</Option>
              <Option value={2}>2 - Tốt</Option>
              <Option value={3}>3 - Khá</Option>
            </Select>
          </div>
          <div>
            <label htmlFor="sourcing-inspect-note" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Ghi chú của quản trị viên (Không bắt buộc)</label>
            <textarea 
              className="ant-input" 
              rows={4}
              id="sourcing-inspect-note" value={inspectModal.adminNote}
              onChange={e => setInspectModal({ ...inspectModal, adminNote: e.target.value })}
              placeholder="Nhập ghi chú sau khi kiểm định..."
            />
          </div>
        </div>
      </Modal>

      <Modal rootClassName="rw-admin-modal"
        title="Đăng bán sản phẩm"
        open={convertModal.open}
        onOk={handleConvert}
        onCancel={() => setConvertModal({ open: false, id: null, sellingPrice: 0 })}
        okText="Xác nhận đăng bán"
        cancelText="Hủy"
        destroyOnClose
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, color: '#555' }}>Sản phẩm này đã vượt qua kiểm định. Vui lòng nhập giá bán niêm yết trên cửa hàng.</p>
          <div>
            <label htmlFor="sourcing-price" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Giá bán ra (VNĐ)</label>
            <input 
              type="number" 
              className="ant-input" 
              id="sourcing-price" value={convertModal.sellingPrice}
              onChange={e => setConvertModal({ ...convertModal, sellingPrice: e.target.value })}
              placeholder="VD: 500000"
            />
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default SourcingRequests;
