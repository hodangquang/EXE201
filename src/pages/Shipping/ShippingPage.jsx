import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Form, Input, Modal, Select, Space, Statistic, Table, Tag, message } from 'antd';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Phone,
  Navigation,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Boxes,
  BarChart3,
  RefreshCw,
  LayoutGrid,
  List as ListIcon,
  PackageCheck,
  Calendar,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { shippingApi } from '../../services/auth';
import { shippingData, shippingField, shippingOrderId, shippingRows, shippingStatus, shippingStatusLabel } from '../../services/shipping';
import { ROLES } from '../../utils/constants';
import { operationsApi } from '../../services/operations';
import './ShippingPage.css';
import DeliveryTimeline, { paymentLabel } from './DeliveryTimeline';
import './Delivery.css';

const orderIdFor = (row, isQueue) => shippingOrderId(row) || (isQueue ? shippingField(row, 'id') : '');
const statusOptions = [0, 5, 1, 2, 3, 4].map(value => ({ value, label: shippingStatusLabel(value) }));

// Status badge helper
const renderStatusBadge = (statusVal) => {
  const str = String(statusVal);
  if (['0', 'Pending'].includes(str)) {
    return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}>Chờ lấy từ kho</span>;
  }
  if (['1', '5', 'PickedUp', 'InTransit'].includes(str)) {
    return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}>Đang đi giao</span>;
  }
  if (['2', 'Delivered'].includes(str)) {
    return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>Giao thành công</span>;
  }
  if (['3', 'Failed'].includes(str)) {
    return <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}>Giao thất bại</span>;
  }
  return <Tag>{shippingStatusLabel(statusVal)}</Tag>;
};

export default function ShippingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isShipper = user?.role === ROLES.SHIPPER;

  const mode = searchParams.get('mode') || 'delivery'; // 'delivery' | 'pickup' | 'history'
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'active' | '0' | '1' | '2' | '3'

  const [tab, setTab] = useState(isShipper ? 'mine' : 'queue');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [shippers, setShippers] = useState([]);
  const [shipperError, setShipperError] = useState('');
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
  const [modal, contextHolder] = Modal.useModal();

  const targetStatus = Form.useWatch('status', statusForm);
  const failureCode = Form.useWatch('failureCode', statusForm);
  const currentStatus = shippingStatus(detail);
  const nextStatuses = ['0', 'Pending'].includes(String(currentStatus)) ? [5] : ['5', 'PickedUp'].includes(String(currentStatus)) ? [1] : ['1', 'InTransit'].includes(String(currentStatus)) ? [2, 3] : [];
  const shipperOptions = shippers.map(shipper => ({ value: shipper.id, label: shipper.fullName || 'Nhân viên giao hàng' }));
  const detailRequest = useRef(0);

  // Sourcing Pickup Tasks State (Fetched from real API)
  const [pickups, setPickups] = useState([]);
  const [pickupsLoading, setPickupsLoading] = useState(false);
  const [pickupsError, setPickupsError] = useState('');

  const fetchPickups = useCallback(() => {
    if (!isShipper) return;
    setPickupsLoading(true);
    shippingApi.myPickups()
      .then(res => {
        const data = res?.data || res || [];
        setPickups(Array.isArray(data) ? data : []);
        setPickupsError('');
      })
      .catch(err => {
        setPickupsError(err.message || 'Không tải được danh sách thu gom.');
      })
      .finally(() => setPickupsLoading(false));
  }, [isShipper]);

  useEffect(() => {
    fetchPickups();
  }, [fetchPickups, reload, mode]);

  const updatePickupStatus = async (pickup, newStatus) => {
    try {
      const targetId = pickup.sourcingId || pickup.id;
      await shippingApi.updatePickupStatus(targetId, { status: newStatus });
      message.success('Đã cập nhật trạng thái đơn thu gom!');
      fetchPickups();
      setReload(v => v + 1);
    } catch (err) {
      message.error(err.message || 'Không cập nhật được trạng thái thu gom.');
    }
  };

  useEffect(() => {
    if (isShipper) return;
    let active = true;
    operationsApi.shippers().then(data => { if (active) { setShippers(data); setShipperError(''); } })
      .catch(error => { if (active) setShipperError(error.message); });
    return () => { active = false; };
  }, [isShipper, reload]);

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
        : shippingApi.myOrders({ status: isShipper ? undefined : status, shipperId: tab === 'assigned' ? shipperFilter : undefined });
    request.then(response => {
      if (active) setRows(shippingRows(response));
    }).catch(err => {
      if (active) { setRows([]); setError(err.message || 'Không tải được danh sách vận chuyển.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [tab, status, shipperFilter, reload, isShipper]);

  useEffect(() => {
    const timer = setInterval(() => { if (!document.hidden && !saving) setReload(value => value + 1); }, 20000);
    return () => clearInterval(timer);
  }, [saving]);

  const openDetail = useCallback(async (row) => {
    const request = ++detailRequest.current;
    const id = orderIdFor(row, tab === 'queue');
    setSelected({ ...row, orderId: id });
    setDetail(null);
    setDetailState('loading');
    assignForm.resetFields();
    statusForm.resetFields();
    try {
      const data = shippingData(await shippingApi.get(id));
      if (request === detailRequest.current) {
        setDetail(data);
        setDetailState('ready');
        statusForm.setFieldsValue({
          trackingNumber: shippingField(data, 'trackingNumber') || '',
        });
      }
    } catch (err) {
      if (request === detailRequest.current) setDetailState(err.status === 404 && !isShipper ? 'missing' : 'error');
    }
  }, [tab, statusForm, assignForm, isShipper]);

  useEffect(() => {
    if (isShipper && id) openDetail({ orderId: id });
  }, [isShipper, id, openDetail]);

  const createShipping = async values => {
    setSaving(true);
    try {
      await shippingApi.create(selected.orderId, {
        shipperId: values.shipperId.trim(),
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
        failureCode: values.failureCode,
      });
      message.success('Đã cập nhật trạng thái vận chuyển.');
      setReload(value => value + 1);
      await openDetail(selected);
    } catch (err) {
      message.error(err.message || 'Không cập nhật được vận chuyển.');
      throw err;
    } finally { setSaving(false); }
  };

  const confirmUpdate = values => modal.confirm({
    title: `Xác nhận: ${shippingStatusLabel(values.status).toLowerCase()}`,
    content: 'Chỉ xác nhận sau khi đã thực hiện bước này. Cập nhật sẽ được lưu vào hành trình đơn hàng.',
    okText: 'Xác nhận cập nhật', cancelText: 'Quay lại', onOk: () => updateShipping(values),
  });

  // Fast 1-touch actions for Shipper card
  const handleQuickDeliver = (row) => {
    const id = orderIdFor(row);
    modal.confirm({
      title: `Xác nhận giao thành công đơn ${shippingField(row, 'orderCode') || id}`,
      content: 'Bạn xác nhận đã giao kiện hàng tận tay người nhận và hoàn tất đơn hàng?',
      okText: 'Xác nhận đã giao',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await shippingApi.updateStatus(id, {
            status: 2, // Delivered
            note: 'Shipper đã giao thành công cho người nhận.',
          });
          message.success('Đã xác nhận giao hàng thành công!');
          setReload(v => v + 1);
        } catch (err) {
          message.error(err.message || 'Không cập nhật được trạng thái.');
        }
      }
    });
  };

  const handleQuickPickupFromWarehouse = (row) => {
    const id = orderIdFor(row);
    let trackingInput = shippingField(row, 'trackingNumber') || `RW-${Date.now().toString().slice(-6)}`;
    modal.confirm({
      title: `Nhận kiện hàng ${shippingField(row, 'orderCode') || id} từ kho`,
      content: (
        <div>
          <p>Xác nhận bạn đã nhận kiện hàng từ kho REWEAR để bắt đầu đi giao cho khách.</p>
          <p>Mã vận đơn gắn kèm: <strong>{trackingInput}</strong></p>
        </div>
      ),
      okText: 'Bắt đầu đi giao',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await shippingApi.updateStatus(id, {
            status: 1, // InTransit
            trackingNumber: trackingInput,
            note: 'Shipper đã lấy kiện hàng từ kho và đang trên đường giao.',
          });
          message.success('Đã bắt đầu đi giao hàng!');
          setReload(v => v + 1);
        } catch (err) {
          message.error(err.message || 'Không cập nhật được trạng thái.');
        }
      }
    });
  };

  // Filter rows
  const shownRows = rows.filter(row => {
    const rowStatus = String(shippingStatus(row));
    // Quick filter check
    if (isShipper && quickFilter !== 'all') {
      if (quickFilter === 'active' && !['0', '1', '5', 'Pending', 'InTransit', 'PickedUp'].includes(rowStatus)) return false;
      if (quickFilter === '0' && !['0', 'Pending'].includes(rowStatus)) return false;
      if (quickFilter === '1' && !['1', '5', 'InTransit', 'PickedUp'].includes(rowStatus)) return false;
      if (quickFilter === '2' && !['2', 'Delivered'].includes(rowStatus)) return false;
      if (quickFilter === '3' && !['3', 'Failed'].includes(rowStatus)) return false;
    } else if (!isShipper && status !== '') {
      if (shippingStatusLabel(shippingStatus(row)) !== shippingStatusLabel(status)) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const code = (shippingField(row, 'orderCode') || '').toLowerCase();
      const name = (shippingField(row, 'recipientName', 'buyerName') || '').toLowerCase();
      const addr = (shippingField(row, 'shippingAddress') || '').toLowerCase();
      if (!code.includes(q) && !name.includes(q) && !addr.includes(q)) return false;
    }
    return true;
  });

  const counts = [
    ['Chờ lấy hàng', rows.filter(row => ['0', 'Pending'].includes(String(shippingStatus(row)))).length],
    ['Đang thực hiện', rows.filter(row => ['1', '5', 'PickedUp', 'InTransit'].includes(String(shippingStatus(row)))).length],
    ['Giao thành công', rows.filter(row => ['2', 'Delivered'].includes(String(shippingStatus(row)))).length],
    ['Giao thất bại', rows.filter(row => ['3', 'Failed'].includes(String(shippingStatus(row)))).length],
  ];

  const columns = [
    { title: 'Mã đơn', key: 'orderId', render: (_, row) => <strong>{String(shippingField(row, 'orderCode') || orderIdFor(row, tab === 'queue') || '—')}</strong> },
    { title: 'Trạng thái giao', key: 'status', render: (_, row) => renderStatusBadge(tab === 'queue' ? 'Chờ phân công' : shippingStatus(row)) },
    {
      title: 'Người nhận / Địa chỉ',
      key: 'recipient',
      render: (_, row) => {
        const phone = shippingField(row, 'recipientPhone', 'phone');
        const addr = shippingField(row, 'shippingAddress');
        return (
          <div>
            <strong>{shippingField(row, 'recipientName', 'buyerName') || '—'}</strong>
            {phone && <div><a href={`tel:${phone}`} style={{ color: '#16a34a', fontWeight: 600 }}>📞 {phone}</a></div>}
            <p style={{ maxWidth: 280, whiteSpace: 'normal', margin: '4px 0' }}>{addr || '—'}</p>
            <small style={{ color: '#64748b' }}>{paymentLabel(shippingField(row, 'paymentStatus'))}</small>
          </div>
        );
      }
    },
    ...(!isShipper ? [{ title: 'Người giao hàng', key: 'shipper', render: (_, row) => String(shippingField(row, 'shipperName', 'shipperId') ?? '—') }] : []),
    { title: 'Mã vận đơn', key: 'tracking', render: (_, row) => String(shippingField(row, 'trackingNumber') ?? '—') },
    { title: 'Thao tác', key: 'action', render: (_, row) => <Button onClick={() => openDetail(row)} disabled={!orderIdFor(row, tab === 'queue')}>Xem vận chuyển</Button> },
  ];

  return (
    <main className="shipping-page rw-admin-page">
      {contextHolder}

      {/* Shipper Hub Greeting Banner (Only for Shipper) */}
      {isShipper && (
        <div className="shipper-hub-banner">
          <div className="shipper-hub-info">
            <div className="shipper-hub-avatar">
              {(user?.fullName || 'S')[0].toUpperCase()}
            </div>
            <div className="shipper-hub-details">
              <h2>Xin chào, {user?.fullName || 'Tài xế REWEAR'}</h2>
              <div className="shipper-hub-status-tag">
                <span className="pulse-dot"></span>
                <span>Đang trực tuyến · Sẵn sàng giao vận</span>
              </div>
            </div>
          </div>
          <Space>
            <Button icon={<RefreshCw size={14} />} onClick={() => setReload(v => v + 1)}>
              Làm mới dữ liệu
            </Button>
          </Space>
        </div>
      )}

      {/* Heading (For Admin/Staff or Default) */}
      {!isShipper && (
        <div className="shipping-heading">
          <div>
            <span className="editorial-sub">VẬN CHUYỂN REWEAR</span>
            <h1>Quản lý vận chuyển</h1>
          </div>
          <Button icon={<RefreshCw size={14} />} onClick={() => setReload(v => v + 1)}>Tải lại</Button>
        </div>
      )}

      {/* Shipper Sub-Nav Switcher */}
      {isShipper && (
        <div className="shipper-nav-tabs">
          <button
            className={`shipper-nav-btn ${mode === 'delivery' ? 'active' : ''}`}
            onClick={() => setSearchParams({ mode: 'delivery' })}
          >
            <Truck size={16} />
            <span>Đơn giao hàng (Bán lẻ)</span>
            <span className="badge-count">{rows.length}</span>
          </button>
          <button
            className={`shipper-nav-btn ${mode === 'pickup' ? 'active' : ''}`}
            onClick={() => setSearchParams({ mode: 'pickup' })}
          >
            <Boxes size={16} />
            <span>Thu gom đồ cũ (Inbound)</span>
            <span className="badge-count">{pickups.length}</span>
          </button>
          <button
            className={`shipper-nav-btn ${mode === 'history' ? 'active' : ''}`}
            onClick={() => setSearchParams({ mode: 'history' })}
          >
            <BarChart3 size={16} />
            <span>Lịch sử & Hiệu suất</span>
          </button>
        </div>
      )}

      {/* MODE 1: GIAO HÀNG (DELIVERY) */}
      {mode === 'delivery' && (
        <>
          {/* Statistics summary */}
          {isShipper && (
            <div className="shipping-summary">
              {counts.map(([title, value]) => (
                <Card key={title} size="small">
                  <Statistic title={title} value={value} loading={loading} />
                </Card>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="shipping-toolbar">
            <Input.Search
              aria-label="Tìm vận chuyển"
              placeholder="Tìm mã đơn, người nhận, địa chỉ..."
              value={search}
              onChange={event => setSearch(event.target.value)}
              allowClear
              style={{ maxWidth: 320 }}
            />

            {/* Shipper Quick Filter Pills */}
            {isShipper ? (
              <div className="shipping-filter-pills">
                <button
                  className={`filter-pill ${quickFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setQuickFilter('all')}
                >
                  Tất cả ({rows.length})
                </button>
                <button
                  className={`filter-pill ${quickFilter === 'active' ? 'active' : ''}`}
                  onClick={() => setQuickFilter('active')}
                >
                  ⚡ Cần giao ngay ({rows.filter(r => ['0', '1', '5', 'Pending', 'InTransit', 'PickedUp'].includes(String(shippingStatus(r)))).length})
                </button>
                <button
                  className={`filter-pill ${quickFilter === '0' ? 'active' : ''}`}
                  onClick={() => setQuickFilter('0')}
                >
                  Chờ lấy từ kho ({counts[0][1]})
                </button>
                <button
                  className={`filter-pill ${quickFilter === '1' ? 'active' : ''}`}
                  onClick={() => setQuickFilter('1')}
                >
                  Đang đi giao ({counts[1][1]})
                </button>
                <button
                  className={`filter-pill ${quickFilter === '2' ? 'active' : ''}`}
                  onClick={() => setQuickFilter('2')}
                >
                  Giao thành công ({counts[2][1]})
                </button>
                <button
                  className={`filter-pill ${quickFilter === '3' ? 'active' : ''}`}
                  onClick={() => setQuickFilter('3')}
                >
                  Thất bại ({counts[3][1]})
                </button>
              </div>
            ) : (
              <Space wrap>
                <Select
                  aria-label="Danh sách vận chuyển"
                  value={tab}
                  onChange={value => { setTab(value); setStatus(''); }}
                  options={[
                    { value: 'queue', label: 'Đơn chờ phân công' },
                    { value: 'assigned', label: 'Đơn theo người giao hàng' },
                    { value: 'all', label: 'Tất cả vận chuyển' },
                  ]}
                />
                {tab === 'assigned' && (
                  <Select
                    aria-label="Người giao hàng cần xem"
                    placeholder="Chọn người giao hàng"
                    value={shipperFilter || undefined}
                    onChange={setShipperFilter}
                    options={shipperOptions}
                    showSearch
                    optionFilterProp="label"
                  />
                )}
                {tab !== 'queue' && (
                  <Select
                    aria-label="Lọc trạng thái vận chuyển"
                    value={status}
                    onChange={setStatus}
                    options={[{ value: '', label: 'Tất cả trạng thái' }, ...statusOptions]}
                  />
                )}
              </Space>
            )}

            {/* View Mode Switcher (Card vs Table for Shipper) */}
            {isShipper && (
              <Space>
                <Button
                  type={viewMode === 'cards' ? 'primary' : 'default'}
                  icon={<LayoutGrid size={15} />}
                  onClick={() => setViewMode('cards')}
                  title="Dạng thẻ di động"
                >
                  Thẻ
                </Button>
                <Button
                  type={viewMode === 'table' ? 'primary' : 'default'}
                  icon={<ListIcon size={15} />}
                  onClick={() => setViewMode('table')}
                  title="Dạng bảng"
                >
                  Bảng
                </Button>
              </Space>
            )}
          </div>

          {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} action={<Button onClick={() => setReload(v => v + 1)}>Thử lại</Button>} />}
          {shipperError && <Alert type="warning" title={shipperError} style={{ marginBottom: 16 }} action={<Button onClick={() => setReload(v => v + 1)}>Tải lại người giao hàng</Button>} />}

          {/* SHIPPER CARDS VIEW (Mobile-first, Quick actions) */}
          {isShipper && viewMode === 'cards' ? (
            <div>
              {shownRows.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', background: '#fff', borderRadius: 12, border: '1px solid #e7e7e2' }}>
                  <Truck size={42} strokeWidth={1.5} color="#94a3b8" />
                  <p style={{ marginTop: 12, color: '#64748b', fontSize: 15 }}>
                    {search || quickFilter !== 'all' ? 'Không tìm thấy đơn hàng phù hợp.' : 'Hiện tại bạn chưa có đơn hàng nào được phân công.'}
                  </p>
                </div>
              ) : (
                <div className="shipper-cards-grid">
                  {shownRows.map((row, idx) => {
                    const st = String(shippingStatus(row));
                    const orderCode = String(shippingField(row, 'orderCode') || orderIdFor(row));
                    const recipientName = shippingField(row, 'recipientName', 'buyerName') || 'Khách hàng REWEAR';
                    const recipientPhone = shippingField(row, 'recipientPhone', 'phone');
                    const address = shippingField(row, 'shippingAddress') || 'Chưa có địa chỉ';
                    const tracking = shippingField(row, 'trackingNumber');
                    const payment = paymentLabel(shippingField(row, 'paymentStatus'));

                    return (
                      <div key={idx} className="shipper-card">
                        <div>
                          {/* Card Header */}
                          <div className="shipper-card-header">
                            <div>
                              <div className="shipper-card-code">{orderCode}</div>
                              <span style={{ fontSize: 11, color: '#64748b' }}>{payment}</span>
                            </div>
                            {renderStatusBadge(st)}
                          </div>

                          {/* Card Customer & Address */}
                          <div className="shipper-card-body">
                            <div className="shipper-card-customer">
                              <div className="shipper-card-name">{recipientName}</div>
                              <div className="shipper-card-address">
                                <MapPin size={15} />
                                <span>{address}</span>
                              </div>
                            </div>

                            {/* Direct Contact Actions (Call & Maps) */}
                            <div className="shipper-card-contact-actions">
                              {recipientPhone ? (
                                <a href={`tel:${recipientPhone}`} className="shipper-action-link phone">
                                  <Phone size={14} />
                                  <span>Gọi {recipientPhone}</span>
                                </a>
                              ) : (
                                <span className="shipper-action-link phone" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                                  <Phone size={14} /> Chưa có SĐT
                                </span>
                              )}

                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="shipper-action-link maps"
                              >
                                <Navigation size={14} />
                                <span>Chỉ đường Maps</span>
                              </a>
                            </div>

                            {/* Package Details */}
                            <div className="shipper-card-package-info">
                              <div><strong>Mã vận đơn:</strong> {tracking || 'Chưa cập nhật'}</div>
                              {shippingField(row, 'deliveryNotes') && (
                                <div style={{ marginTop: 4 }}><strong>Ghi chú:</strong> {shippingField(row, 'deliveryNotes')}</div>
                              )}
                              {['3', 'Failed'].includes(st) && shippingField(row, 'lastFailureReason') && (
                                <div style={{ marginTop: 4, color: '#dc2626' }}>
                                  <strong>Lý do thất bại:</strong> {shippingField(row, 'lastFailureReason')} (Lần giao {shippingField(row, 'attemptCount') || 1})
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Quick Action Footer */}
                        <div className="shipper-card-footer">
                          <div className="actions-left">
                            {['0', 'Pending'].includes(st) && (
                              <Button
                                type="primary"
                                style={{ background: '#10100f', borderColor: '#10100f' }}
                                onClick={() => handleQuickPickupFromWarehouse(row)}
                              >
                                Nhận kiện từ kho
                              </Button>
                            )}

                            {['1', '5', 'InTransit', 'PickedUp'].includes(st) && (
                              <>
                                <Button
                                  type="primary"
                                  style={{ background: '#15803d', borderColor: '#15803d' }}
                                  onClick={() => handleQuickDeliver(row)}
                                >
                                  Giao thành công
                                </Button>
                                <Button
                                  danger
                                  onClick={() => openDetail(row)}
                                >
                                  Báo thất bại
                                </Button>
                              </>
                            )}

                            {['3', 'Failed'].includes(st) && (
                              <Button
                                onClick={() => openDetail(row)}
                              >
                                Giao lại / Xem lý do
                              </Button>
                            )}
                          </div>

                          <Button type="text" onClick={() => openDetail(row)}>
                            Chi tiết
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Table View (Default for Admin/Staff or switched by Shipper) */
            <Table
              rowKey={(row, index) => `${orderIdFor(row, tab === 'queue')}-${index}`}
              loading={loading}
              dataSource={shownRows}
              columns={columns}
              scroll={{ x: 680 }}
              locale={{
                emptyText: error ? 'Không tải được dữ liệu' : tab === 'assigned' && !shipperFilter ? 'Chọn người giao hàng để xem đơn được phân công' : search || status !== '' ? 'Không có đơn phù hợp' : isShipper ? 'Bạn chưa có đơn được phân công' : 'Chưa có đơn vận chuyển'
              }}
              pagination={{ pageSize: 10 }}
            />
          )}
        </>
      )}

      {/* MODE 2: THU GOM ĐỒ CŨ (SOURCING PICKUP) */}
      {mode === 'pickup' && (
        <div>
          <div style={{ background: '#ffffff', border: '1px solid #e7e7e2', borderRadius: 12, padding: 20, marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700 }}>Nhiệm vụ lấy quần áo cũ từ khách hàng về xưởng REWEAR</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Các yêu cầu thu gom đã được REWEAR định giá và khách hàng đồng ý giao đồ. Shipper tới tận nơi nhận kiện đồ và chở về kho kiểm định.
            </p>
          </div>

          {pickupsLoading && <p style={{ padding: 20 }}>Đang tải danh sách nhiệm vụ thu gom…</p>}
          {pickupsError && <Alert type="error" message={pickupsError} style={{ marginBottom: 16 }} />}
          {!pickupsLoading && pickups.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', borderRadius: 12, border: '1px solid #e7e7e2' }}>
              <Boxes size={36} color="#94a3b8" style={{ marginBottom: 12 }} />
              <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600 }}>Chưa có nhiệm vụ thu gom</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                Hiện tại bạn chưa được phân công cuốc thu gom quần áo cũ nào từ khách hàng.
              </p>
            </div>
          )}

          {!pickupsLoading && pickups.length > 0 && (
            <div className="shipper-cards-grid">
              {pickups.map(pickup => (
                <div key={pickup.id} className="shipper-card">
                  <div>
                    <div className="shipper-card-header">
                      <div>
                        <div className="shipper-card-code">{pickup.id}</div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Hẹn lấy: {pickup.preferredTime}</span>
                      </div>
                      {pickup.status === 'Assigned' && <Tag color="orange">Chờ qua lấy</Tag>}
                      {pickup.status === 'OnTheWay' && <Tag color="blue">Đang tới lấy</Tag>}
                      {pickup.status === 'PickedUp' && <Tag color="green">Shipper đã lấy đồ</Tag>}
                    </div>

                    <div className="shipper-card-body">
                      <div className="shipper-card-customer">
                        <div className="shipper-card-name">{pickup.senderName}</div>
                        <div className="shipper-card-address">
                          <MapPin size={15} />
                          <span>{pickup.pickupAddress}</span>
                        </div>
                      </div>

                      <div className="shipper-card-contact-actions">
                        {pickup.senderPhone ? (
                          <a href={`tel:${pickup.senderPhone}`} className="shipper-action-link phone">
                            <Phone size={14} />
                            <span>Gọi {pickup.senderPhone}</span>
                          </a>
                        ) : null}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pickup.pickupAddress)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="shipper-action-link maps"
                        >
                          <Navigation size={14} />
                          <span>Chỉ đường</span>
                        </a>
                      </div>

                      <div className="shipper-card-package-info">
                        <div><strong>Kiện đồ cũ:</strong> {pickup.itemsCount}</div>
                        <div style={{ marginTop: 4 }}><strong>Ghi chú người gửi:</strong> {pickup.note}</div>
                      </div>
                    </div>
                  </div>

                  <div className="shipper-card-footer">
                    <div className="actions-left">
                      {pickup.status === 'Assigned' && (
                        <Button
                          type="primary"
                          style={{ background: '#10100f', borderColor: '#10100f' }}
                          onClick={() => updatePickupStatus(pickup, 'OnTheWay')}
                        >
                          Bắt đầu tới lấy
                        </Button>
                      )}
                      {pickup.status === 'OnTheWay' && (
                        <Button
                          type="primary"
                          style={{ background: '#15803d', borderColor: '#15803d' }}
                          onClick={() => updatePickupStatus(pickup, 'PickedUp')}
                        >
                          Xác nhận đã lấy đồ
                        </Button>
                      )}
                      {pickup.status === 'PickedUp' && (
                        <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                          ✓ Chờ cửa hàng xác nhận nhận tại kho
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: LỊCH SỬ & HIỆU SUẤT (HISTORY) */}
      {mode === 'history' && (
        <div>
          <div className="shipping-summary" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <Card size="small">
              <Statistic title="Tổng đơn đã giao thành công" value={counts[2][1]} prefix={<PackageCheck size={18} color="#15803d" />} />
            </Card>
            <Card size="small">
              <Statistic title="Đơn thu gom đã hoàn tất" value={pickups.filter(p => p.status === 'PickedUp').length} prefix={<Boxes size={18} color="#2563eb" />} />
            </Card>
            <Card size="small">
              <Statistic title="Tỷ lệ giao đúng hẹn" value={100} suffix="%" prefix={<CheckCircle2 size={18} color="#16a34a" />} />
            </Card>
          </div>

          <Card title="Nhật ký các cuốc giao nhận gần đây" style={{ borderRadius: 12 }}>
            <Table
              dataSource={[
                ...rows.filter(r => ['2', 'Delivered'].includes(String(shippingStatus(r)))).map(r => ({
                  type: 'Giao hàng bán lẻ',
                  code: shippingField(r, 'orderCode') || orderIdFor(r),
                  customer: shippingField(r, 'recipientName', 'buyerName'),
                  address: shippingField(r, 'shippingAddress'),
                  status: 'Hoàn thành',
                })),
                ...pickups.filter(p => p.status === 'PickedUp').map(p => ({
                  type: 'Thu gom đồ cũ',
                  code: p.id,
                  customer: p.senderName,
                  address: p.pickupAddress,
                  status: 'Shipper đã lấy đồ',
                }))
              ]}
              columns={[
                { title: 'Loại nhiệm vụ', dataIndex: 'type', key: 'type', render: t => <Tag color={t.includes('Giao') ? 'green' : 'blue'}>{t}</Tag> },
                { title: 'Mã đơn / Mã gom', dataIndex: 'code', key: 'code', render: c => <strong>{c}</strong> },
                { title: 'Người liên hệ', dataIndex: 'customer', key: 'customer' },
                { title: 'Địa chỉ thực hiện', dataIndex: 'address', key: 'address' },
                { title: 'Kết quả', dataIndex: 'status', key: 'status', render: s => <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ {s}</span> },
              ]}
              locale={{ emptyText: 'Chưa có lịch sử cuốc giao hoàn tất.' }}
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </div>
      )}

      {/* Modal Detail / Status Update */}
      <Modal
        title={`Vận chuyển đơn ${detail?.orderCode || selected?.orderCode || ''}`}
        open={Boolean(selected)}
        onCancel={() => {
          if (saving) return;
          detailRequest.current += 1;
          setSelected(null);
          if (isShipper && id) navigate('/shipper/orders', { replace: true });
        }}
        footer={null}
        destroyOnHidden
        width={620}
      >
        {detailState === 'loading' && <p role="status">Đang tải thông tin vận chuyển…</p>}
        {detailState === 'error' && <Alert type="error" message="Không tải được thông tin vận chuyển." action={<Button onClick={() => openDetail(selected)}>Thử lại</Button>} />}
        {detailState === 'missing' && <p>Đơn chưa có thông tin vận chuyển.</p>}
        {detailState === 'ready' && detail && (
          <div className="shipping-detail">
            <p><strong>Trạng thái:</strong> {shippingStatusLabel(shippingStatus(detail))}</p>
            <p><strong>Đơn vị vận chuyển:</strong> {String(shippingField(detail, 'carrier') ?? '—')}</p>
            <p><strong>Mã vận đơn:</strong> {String(shippingField(detail, 'trackingNumber') ?? '—')}</p>
            <p><strong>Số lần giao:</strong> {String(shippingField(detail, 'attemptCount') ?? '—')}</p>
            <p><strong>Người nhận:</strong> {detail.recipientName} · {detail.recipientPhone}</p>
            <p>{detail.shippingAddress}</p>
            {detail.recipientPhone && (
              <p><a href={`tel:${detail.recipientPhone}`} style={{ color: '#16a34a', fontWeight: 600 }}>📞 Gọi ngay cho người nhận</a></p>
            )}
            {detail.deliveryNotes && <p><strong>Ghi chú nhận hàng:</strong> {detail.deliveryNotes}</p>}
            <p><strong>Thanh toán:</strong> {paymentLabel(detail.paymentStatus)}</p>
            {detail.items?.length > 0 && (
              <>
                <h3>Kiện hàng</h3>
                <ul>
                  {detail.items.map((item, index) => (
                    <li key={index}>{item.productTitle} · {item.size} {item.color} · Số lượng: {item.quantity}</li>
                  ))}
                </ul>
              </>
            )}
            {detail.lastFailureReason && <Alert type="warning" message={detail.lastFailureReason} style={{ marginTop: 12 }} />}
            <h3 style={{ marginTop: 16 }}>Hành trình giao hàng</h3>
            <DeliveryTimeline events={detail.history} />
          </div>
        )}

        {/* Form phân công cho Admin/Staff */}
        {!isShipper && selected && (detailState === 'missing' || (detailState === 'ready' && detail?.status === 'Pending')) && (
          <Form form={assignForm} layout="vertical" onFinish={createShipping} initialValues={{ method: 0 }}>
            <h3>Phân công người giao hàng</h3>
            <p>Chỉ phân công giao hàng cho đơn đã được xác nhận thanh toán.</p>
            <Form.Item name="shipperId" label="Người giao hàng" rules={[{ required: true, message: 'Chọn người giao hàng.' }]}>
              <Select options={shipperOptions} showSearch optionFilterProp="label" placeholder="Chọn người giao hàng" notFoundContent="Chưa có tài khoản shipper" />
            </Form.Item>
            <p>Phương thức giao hàng giữ theo lựa chọn đã chốt trong đơn.</p>
            <Form.Item name="carrier" label="Đơn vị vận chuyển (nếu có)"><Input /></Form.Item>
            <Button type="primary" htmlType="submit" loading={saving}>{detail ? 'Cập nhật phân công' : 'Phân công giao hàng'}</Button>
          </Form>
        )}

        {!isShipper && detailState === 'ready' && (
          <Button onClick={() => { setSelected(null); navigate(`/orders/${selected.orderId}`); }}>
            Xem đơn hàng / xử lý hàng hoàn
          </Button>
        )}

        {/* Form cập nhật trạng thái dành cho Shipper */}
        {isShipper && detailState === 'ready' && nextStatuses.length > 0 && (
          <Form form={statusForm} layout="vertical" onFinish={confirmUpdate} disabled={saving}>
            <h3>Cập nhật kết quả giao hàng</h3>
            <p>Chọn bước tiếp theo. Nếu giao thất bại, vui lòng chọn đúng lý do để cửa hàng đối soát.</p>
            <Form.Item name="status" label="Kết quả giao hàng" rules={[{ required: true, message: 'Chọn kết quả.' }]}>
              <Select options={statusOptions.filter(option => nextStatuses.includes(option.value))} />
            </Form.Item>
            {targetStatus === 3 && (
              <Form.Item name="failureCode" label="Lý do giao thất bại" rules={[{ required: true, message: 'Chọn lý do.' }]}>
                <Select
                  options={[
                    { value: 'CustomerUnavailable', label: 'Người nhận chưa thể nhận hàng' },
                    { value: 'Unreachable', label: 'Không liên hệ được người nhận (gọi 3 lần)' },
                    { value: 'IncorrectAddress', label: 'Địa chỉ cần xác minh lại' },
                    { value: 'Refused', label: 'Người nhận từ chối nhận' },
                    { value: 'Other', label: 'Lý do khác' }
                  ]}
                />
              </Form.Item>
            )}
            <Form.Item
              name="note"
              label="Ghi chú cho điều phối"
              rules={targetStatus === 3 && failureCode === 'Other' ? [{ required: true, whitespace: true, message: 'Nhập lý do giao thất bại.' }] : []}
            >
              <Input.TextArea rows={3} maxLength={1000} placeholder="Ví dụ: Gọi khách 3 cuộc không nhấc máy, đã hẹn giao lại sáng mai..." />
            </Form.Item>
            {targetStatus === 1 && (
              <Form.Item name="trackingNumber" label="Mã vận đơn" rules={[{ required: true, whitespace: true, message: 'Nhập mã vận đơn trước khi giao.' }]}>
                <Input maxLength={100} />
              </Form.Item>
            )}
            <Button type="primary" htmlType="submit" loading={saving}>Lưu cập nhật</Button>
          </Form>
        )}
      </Modal>
    </main>
  );
}
