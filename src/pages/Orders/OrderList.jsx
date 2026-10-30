import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Input, Select, Space, Table, Tag } from 'antd';
import { operationsApi } from '../../services/operations';
import { orderLabels, paymentLabels } from '../Operations/labels';
import { formatCurrency, formatDate } from '../../utils/formatters';
import '../Operations/OperationsPage.css';

export default function OrderList() {
  const [query, setQuery] = useState({ page: 1, pageSize: 20, search: '', status: '', from: '', to: '' });
  const [search, setSearch] = useState(''); const [result, setResult] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setResult(await operationsApi.orders({ ...query, from: query.from ? new Date(query.from + 'T00:00:00').toISOString() : '', to: query.to ? new Date(query.to + 'T00:00:00').toISOString() : '' })); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [query]);
  useEffect(() => { load(); }, [load]);
  const filter = (key, value) => setQuery(previous => ({ ...previous, [key]: value, page: 1 }));
  return <div className="ops-page"><div className="ops-heading"><div><p className="editorial-sub">VẬN HÀNH REWEAR</p><h1 className="editorial-title">Đơn hàng</h1><p className="ops-muted">Trạng thái đơn hàng, thanh toán và vận chuyển được theo dõi riêng.</p></div><Button onClick={load} loading={loading}>Tải lại</Button></div>
    {error && <Alert type="error" title={error} action={<Button onClick={load}>Thử lại</Button>} />}
    <Card><Space wrap style={{ marginBottom: 20 }}><Input.Search placeholder="Mã đơn, người nhận, số điện thoại" aria-label="Tìm đơn hàng" value={search} onChange={e => setSearch(e.target.value)} onSearch={value => filter('search', value)} allowClear style={{ width: 300 }} /><Select aria-label="Trạng thái đơn hàng" value={query.status} onChange={value => filter('status', value)} style={{ minWidth: 180 }} options={[{ value: '', label: 'Tất cả trạng thái' }, ...Object.entries(orderLabels).map(([value, label]) => ({ value, label }))]} /><label>Từ ngày <Input aria-label="Lọc từ ngày" type="date" value={query.from} onChange={e => filter('from', e.target.value)} /></label><label>Đến trước ngày <Input aria-label="Lọc đến trước ngày" type="date" value={query.to} onChange={e => filter('to', e.target.value)} /></label></Space>
      <Table rowKey="id" loading={loading} dataSource={result.items} scroll={{ x: 'max-content' }} locale={{ emptyText: error ? 'Chưa tải được dữ liệu' : 'Chưa có đơn hàng phù hợp' }}
        pagination={{ current: query.page, pageSize: query.pageSize, total: result.total, showSizeChanger: true, onChange: (page, pageSize) => setQuery({ ...query, page, pageSize }) }} columns={[
          { title: 'Mã đơn', dataIndex: 'orderCode', render: (value, row) => <Link to={`/orders/${row.id}`}>{value}</Link> },
          { title: 'Người nhận', dataIndex: 'shippingAddress', render: address => <><strong>{address.recipientName}</strong><div className="ops-muted">{address.phoneNumber}</div></> },
          { title: 'Sản phẩm', dataIndex: 'items', render: items => items.map(item => <div key={item.id}>{item.productTitle} × {item.quantity}</div>) },
          { title: 'Tổng tiền', dataIndex: 'totalAmount', render: formatCurrency },
          { title: 'Đơn hàng', dataIndex: 'status', render: value => <Tag>{orderLabels[value] || value}</Tag> },
          { title: 'Thanh toán', dataIndex: 'paymentStatus', render: value => <Tag color={value === 'Paid' ? 'green' : 'default'}>{paymentLabels[value] || value || 'Chưa có phiên'}</Tag> },
          { title: 'Ngày tạo', dataIndex: 'createdAt', render: formatDate },
        ]} />
    </Card></div>;
}
