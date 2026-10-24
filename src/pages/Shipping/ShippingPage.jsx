import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { shippingApi } from '../../services/auth';
import { shippingData, shippingField, shippingOrderId, shippingRows, shippingStatus, shippingStatusLabel } from '../../services/shipping';
import { ROLES } from '../../utils/constants';
import './ShippingPage.css';

const orderIdFor = (row, isQueue) => shippingOrderId(row) || (isQueue ? shippingField(row, 'id') : '');
const statusOptions = [0, 1, 2, 3, 4].map(value => ({ value, label: `Mã trạng thái ${value}` }));

export default function ShippingPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isShipper = user?.role === ROLES.SHIPPER;
  const isAdmin = user?.role === ROLES.ADMIN;
  const [tab, setTab] = useState(isShipper ? 'mine' : 'queue');
  const [status, setStatus] = useState('');
  const [shipperDraft, setShipperDraft] = useState('');
  const [shipperFilter, setShipperFilter] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailState, setDetailState] = useState('idle');
  const [saving, setSaving] = useState(false);
  const [assignForm] = Form.useForm();
  const [statusForm] = Form.useForm();
  const detailRequest = useRef(0);

  useEffect(() => {
    let active = true;
    if (tab === 'assigned' && !shipperFilter) {
      setRows([]);
      setError('');
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    const request = tab === 'queue' ? shippingApi.queue()
      : tab === 'all' ? shippingApi.all({ status })
        : shippingApi.myOrders({ status, shipperId: tab === 'assigned' ? shipperFilter : undefined });
    request.then(response => {
      if (active) setRows(shippingRows(response));
    }).catch(err => {
      if (active) { setRows([]); setError(err.message || 'Không tải được danh sách vận chuyển.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, status, shipperFilter, reload]);

  const openDetail = useCallback(async (row) => {
    const request = ++detailRequest.current;
    const id = orderIdFor(row, tab === 'queue');
    setSelected({ ...row, orderId: id });
    setDetail(null);
    setDetailState('loading');
    statusForm.resetFields();
    try {
      const data = shippingData(await shippingApi.get(id));
      if (request === detailRequest.current) {
        setDetail(data);
        setDetailState('ready');
        statusForm.setFieldsValue({
          trackingNumber: shippingField(data, 'trackingNumber') || '',
          attemptCount: shippingField(data, 'attemptCount') ?? 0,
        });
      }
    } catch (err) {
      if (request === detailRequest.current) setDetailState(err.status === 404 ? 'missing' : 'error');
    }
  }, [tab, statusForm]);

  const createShipping = async values => {
    setSaving(true);
    try {
      await shippingApi.create(selected.orderId, {
        shipperId: values.shipperId.trim(),
        method: values.method,
        carrier: values.carrier?.trim() || undefined,
      });
      message.success('Đã tạo thông tin vận chuyển.');
      assignForm.resetFields();
      setReload(value => value + 1);
      await openDetail(selected);
    } catch (err) {
      message.error(err.message || 'Không tạo được thông tin vận chuyển.');
    } finally { setSaving(false); }
  };

  const updateShipping = async values => {
    setSaving(true);
    try {
      await shippingApi.updateStatus(selected.orderId, {
        status: values.status,
        note: values.note?.trim() || '',
        trackingNumber: values.trackingNumber?.trim() || '',
        attemptCount: values.attemptCount ?? 0,
      });
      message.success('Đã cập nhật trạng thái vận chuyển.');
      setReload(value => value + 1);
      await openDetail(selected);
    } catch (err) {
      message.error(err.message || 'Không cập nhật được vận chuyển.');
    } finally { setSaving(false); }
  };

  const columns = [
    { title: 'Mã đơn', key: 'orderId', render: (_, row) => <strong>{String(orderIdFor(row, tab === 'queue') || '—')}</strong> },
    { title: 'Trạng thái giao', key: 'status', render: (_, row) => <Tag>{tab === 'queue' ? 'Chờ phân công' : shippingStatusLabel(shippingStatus(row))}</Tag> },
    { title: 'Người giao hàng', key: 'shipper', render: (_, row) => String(shippingField(row, 'shipperName', 'shipperId') ?? '—') },
    { title: 'Mã vận đơn', key: 'tracking', render: (_, row) => String(shippingField(row, 'trackingNumber') ?? '—') },
    { title: 'Thao tác', key: 'action', render: (_, row) => <Button onClick={() => openDetail(row)} disabled={!orderIdFor(row, tab === 'queue')}>Xem vận chuyển</Button> },
  ];

  return <main className={`shipping-page ${isShipper ? 'shipping-page-shipper' : 'rw-admin-page'}`}>
    {isShipper && <header className="shipping-header"><strong>REWEAR · Giao hàng</strong><Button onClick={() => { logout(); navigate('/login'); }}>Đăng xuất</Button></header>}
    <div className="shipping-heading"><div><span className="editorial-sub">VẬN CHUYỂN REWEAR</span><h1>{isShipper ? 'Đơn giao của tôi' : 'Quản lý vận chuyển'}</h1></div><Button onClick={() => setReload(value => value + 1)}>Tải lại</Button></div>
    <div className="shipping-toolbar">
      {!isShipper && <Select aria-label="Danh sách vận chuyển" value={tab} onChange={value => { setTab(value); setStatus(''); }} options={[
        { value: 'queue', label: 'Đơn chờ phân công' },
        { value: 'assigned', label: 'Đơn theo người giao hàng' },
        ...(isAdmin ? [{ value: 'all', label: 'Tất cả vận chuyển' }] : []),
      ]} />}
      {tab === 'assigned' && <Space.Compact><Input aria-label="Mã người giao hàng cần xem" placeholder="Nhập mã người giao hàng" value={shipperDraft} onChange={event => setShipperDraft(event.target.value)} onPressEnter={() => setShipperFilter(shipperDraft.trim())} /><Button onClick={() => setShipperFilter(shipperDraft.trim())}>Xem</Button></Space.Compact>}
      {tab !== 'queue' && <Select aria-label="Lọc mã trạng thái vận chuyển" value={status} onChange={setStatus} options={[{ value: '', label: 'Tất cả trạng thái' }, ...statusOptions]} />}
    </div>
    {error && <Alert type="error" showIcon message={error} action={<Button onClick={() => setReload(value => value + 1)}>Thử lại</Button>} />}
    <Table rowKey={(row, index) => `${orderIdFor(row, tab === 'queue')}-${index}`} loading={loading} dataSource={rows} columns={columns} scroll={{ x: 680 }} locale={{ emptyText: error ? 'Không tải được dữ liệu' : tab === 'assigned' && !shipperFilter ? 'Nhập mã người giao hàng để xem đơn được phân công' : 'Chưa có đơn vận chuyển' }} pagination={{ pageSize: 10 }} />

    <Modal title={`Vận chuyển đơn ${selected?.orderId || ''}`} open={Boolean(selected)} onCancel={() => { detailRequest.current += 1; setSelected(null); }} footer={null} destroyOnHidden width={620}>
      {detailState === 'loading' && <p role="status">Đang tải thông tin vận chuyển…</p>}
      {detailState === 'error' && <Alert type="error" message="Không tải được thông tin vận chuyển." action={<Button onClick={() => openDetail(selected)}>Thử lại</Button>} />}
      {detailState === 'missing' && <p>Đơn chưa có thông tin vận chuyển.</p>}
      {detailState === 'ready' && detail && <div className="shipping-detail">
        <p><strong>Trạng thái:</strong> {shippingStatusLabel(shippingStatus(detail))}</p>
        <p><strong>Đơn vị vận chuyển:</strong> {String(shippingField(detail, 'carrier') ?? '—')}</p>
        <p><strong>Mã vận đơn:</strong> {String(shippingField(detail, 'trackingNumber') ?? '—')}</p>
        <p><strong>Số lần giao:</strong> {String(shippingField(detail, 'attemptCount') ?? '—')}</p>
        {Array.isArray(shippingField(detail, 'timeline', 'statusHistory', 'events')) && <ol>{shippingField(detail, 'timeline', 'statusHistory', 'events').map((event, index) => <li key={index}>{String(shippingField(event, 'note', 'description', 'status') ?? 'Cập nhật vận chuyển')} {String(shippingField(event, 'createdAt', 'timestamp') ?? '')}</li>)}</ol>}
      </div>}
      {!isShipper && tab === 'queue' && selected && <Form form={assignForm} layout="vertical" onFinish={createShipping} initialValues={{ method: 0 }}>
        <h3>Phân công người giao hàng</h3>
        <p>Chỉ tạo vận chuyển sau khi backend xác nhận đơn đã thanh toán.</p>
        <Form.Item name="shipperId" label="Mã người giao hàng" rules={[{ required: true, whitespace: true, message: 'Nhập mã người giao hàng.' }]}><Input autoComplete="off" /></Form.Item>
        <Form.Item name="method" label="Phương thức" rules={[{ required: true }]}><Select options={[{ value: 0, label: 'Tiêu chuẩn' }, { value: 1, label: 'Nhanh' }]} /></Form.Item>
        <Form.Item name="carrier" label="Đơn vị vận chuyển (nếu có)"><Input /></Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>Tạo vận chuyển</Button>
      </Form>}
      {isShipper && detailState === 'ready' && <Form form={statusForm} layout="vertical" onFinish={updateShipping}>
        <h3>Cập nhật giao hàng</h3>
        <p>Chọn mã trạng thái theo quy trình giao hàng của REWEAR.</p>
        <Form.Item name="status" label="Mã trạng thái mới" rules={[{ required: true, message: 'Chọn mã trạng thái.' }]}><Select options={statusOptions} /></Form.Item>
        <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={3} /></Form.Item>
        <Form.Item name="trackingNumber" label="Mã vận đơn"><Input /></Form.Item>
        <Form.Item name="attemptCount" label="Số lần giao" rules={[{ required: true }]}><InputNumber min={0} precision={0} style={{ width: '100%' }} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>Lưu cập nhật</Button>
      </Form>}
    </Modal>
  </main>;
}
