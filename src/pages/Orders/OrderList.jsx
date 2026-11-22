import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Input, Row, Select, Space, Table, Tag } from 'antd';
import { Calendar, CheckCircle2, Clock, PackageCheck, RefreshCw, ShoppingBag } from 'lucide-react';
import { operationsApi } from '../../services/operations';
import { orderLabels, paymentLabels } from '../Operations/labels';
import { formatCurrency, formatDate } from '../../utils/formatters';
import '../Operations/OperationsPage.css';

const orderTagColor = (status) => {
  if (['Delivered', '3'].includes(String(status))) return 'green';
  if (['Confirmed', 'Shipping', '1', '2'].includes(String(status))) return 'blue';
  if (['AwaitingPayment', '0'].includes(String(status))) return 'gold';
  if (['ReturnRequested', 'ReturnReceived', 'Returned', '7', '8', '9'].includes(String(status))) return 'purple';
  if (['Cancelled', 'PaymentExpired', 'Failed', '4', '5', '6'].includes(String(status))) return 'red';
  return 'default';
};

const paymentTagColor = (status) => {
  if (status === 'Paid' || status === 1 || status === '1') return 'green';
  if (status === 'Refunded' || status === 4 || status === '4') return 'purple';
  if (status === 'ReconciliationRequired') return 'gold';
  if (status === 'Failed' || status === 'Expired' || status === 2 || status === 3) return 'red';
  return 'default';
};

const QUICK_TABS = [
  ['', 'Tất cả'],
  ['AwaitingPayment', 'Chờ thanh toán'],
  ['Confirmed', 'Đã xác nhận'],
  ['Shipping', 'Đang giao'],
  ['Delivered', 'Đã giao'],
  ['ReturnRequested', 'Yêu cầu trả hàng'],
];

export default function OrderList() {
  const [query, setQuery] = useState({ page: 1, pageSize: 20, search: '', status: '', from: '', to: '' });
  const [search, setSearch] = useState('');
  const [result, setResult] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setResult(
        await operationsApi.orders({
          ...query,
          from: query.from ? new Date(query.from + 'T00:00:00').toISOString() : '',
          to: query.to ? new Date(query.to + 'T00:00:00').toISOString() : '',
        })
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  const filter = (key, value) => setQuery((previous) => ({ ...previous, [key]: value, page: 1 }));

  const pageStats = useMemo(() => {
    const rows = Array.isArray(result.items) ? result.items : [];
    return {
      paid: rows.filter((r) => r.paymentStatus === 'Paid').length,
      active: rows.filter((r) => ['Confirmed', 'Shipping'].includes(r.status)).length,
      delivered: rows.filter((r) => r.status === 'Delivered').length,
      pageValue: rows.reduce((sum, r) => sum + (Number(r.totalAmount) || 0), 0),
    };
  }, [result.items]);

  return (
    <div className="ops-page">
      <div className="ops-heading">
        <div>
          <p className="editorial-sub">VẬN HÀNH REWEAR</p>
          <h1 className="editorial-title">Đơn hàng</h1>
          <p className="ops-muted">Trạng thái đơn hàng, thanh toán và vận chuyển được theo dõi riêng biệt.</p>
        </div>
        <Button className="ops-refresh-btn" icon={<RefreshCw size={15} />} onClick={load} loading={loading}>
          Tải lại
        </Button>
      </div>

      {error && <Alert type="error" showIcon title={error} action={<Button onClick={load}>Thử lại</Button>} />}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <div className="ops-mini-stat">
            <span className="ops-mini-stat-icon"><ShoppingBag size={17} /></span>
            <div>
              <span className="ops-mini-stat-label">Tổng đơn khớp bộ lọc</span>
              <strong className="ops-mini-stat-val">{result.total ?? result.items?.length ?? 0} đơn</strong>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <div className="ops-mini-stat">
            <span className="ops-mini-stat-icon"><CheckCircle2 size={17} /></span>
            <div>
              <span className="ops-mini-stat-label">Đã thanh toán (trang này)</span>
              <strong className="ops-mini-stat-val">{pageStats.paid} đơn</strong>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <div className="ops-mini-stat">
            <span className="ops-mini-stat-icon"><Clock size={17} /></span>
            <div>
              <span className="ops-mini-stat-label">Đang xử lý & giao (trang này)</span>
              <strong className="ops-mini-stat-val">{pageStats.active} đơn</strong>
            </div>
          </div>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <div className="ops-mini-stat">
            <span className="ops-mini-stat-icon"><PackageCheck size={17} /></span>
            <div>
              <span className="ops-mini-stat-label">Giá trị đơn (trang này)</span>
              <strong className="ops-mini-stat-val">{formatCurrency(pageStats.pageValue)}</strong>
            </div>
          </div>
        </Col>
      </Row>

      <Card>
        <div className="ops-quick-tabs" role="tablist" aria-label="Lọc nhanh trạng thái đơn hàng">
          {QUICK_TABS.map(([val, label]) => (
            <button
              key={val || 'all'}
              type="button"
              className={`ops-preset-pill${query.status === val ? ' active' : ''}`}
              onClick={() => filter('status', val)}
            >
              {label}
            </button>
          ))}
        </div>

        <Space wrap style={{ marginBottom: 20 }}>
          <Input.Search
            placeholder="Mã đơn, người nhận, số điện thoại"
            aria-label="Tìm đơn hàng"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={(value) => filter('search', value)}
            allowClear
            style={{ width: 300 }}
          />
          <Select
            aria-label="Trạng thái đơn hàng"
            value={query.status}
            onChange={(value) => filter('status', value)}
            style={{ minWidth: 190 }}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              ...Object.entries(orderLabels).map(([value, label]) => ({ value, label })),
            ]}
          />
          <label className="ops-inline-date">
            <span><Calendar size={13} /> Từ ngày</span>
            <Input
              aria-label="Lọc từ ngày"
              type="date"
              value={query.from}
              onChange={(e) => filter('from', e.target.value)}
            />
          </label>
          <label className="ops-inline-date">
            <span><Calendar size={13} /> Đến trước ngày</span>
            <Input
              aria-label="Lọc đến trước ngày"
              type="date"
              value={query.to}
              onChange={(e) => filter('to', e.target.value)}
            />
          </label>
        </Space>

        <Table
          rowKey="id"
          loading={loading}
          dataSource={result.items}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: error ? 'Chưa tải được dữ liệu' : 'Chưa có đơn hàng phù hợp' }}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total: result.total,
            showSizeChanger: true,
            onChange: (page, pageSize) => setQuery({ ...query, page, pageSize }),
          }}
          columns={[
            {
              title: 'Mã đơn',
              dataIndex: 'orderCode',
              render: (value, row) => (
                <Link to={`/orders/${row.id}`} className="ops-code-link">
                  {value}
                </Link>
              ),
            },
            {
              title: 'Người nhận',
              dataIndex: 'shippingAddress',
              render: (address) => (
                <>
                  <strong>{address?.recipientName}</strong>
                  <div className="ops-muted">{address?.phoneNumber}</div>
                </>
              ),
            },
            {
              title: 'Sản phẩm',
              dataIndex: 'items',
              render: (items) =>
                (items || []).map((item) => (
                  <div key={item.id}>
                    {item.productTitle} × {item.quantity}
                  </div>
                )),
            },
            {
              title: 'Tổng tiền',
              dataIndex: 'totalAmount',
              render: (v) => <strong>{formatCurrency(v)}</strong>,
            },
            {
              title: 'Đơn hàng',
              dataIndex: 'status',
              render: (value) => <Tag color={orderTagColor(value)}>{orderLabels[value] || value}</Tag>,
            },
            {
              title: 'Thanh toán',
              dataIndex: 'paymentStatus',
              render: (value) => (
                <Tag color={paymentTagColor(value)}>
                  {paymentLabels[value] || value || 'Chưa có phiên'}
                </Tag>
              ),
            },
            { title: 'Ngày tạo', dataIndex: 'createdAt', render: formatDate },
          ]}
        />
      </Card>
    </div>
  );
}
