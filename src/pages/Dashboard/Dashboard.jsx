import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Input, Row, Space, Statistic, Table } from 'antd';
import { operationsApi } from '../../services/operations';
import { orderLabels } from '../Operations/labels';
import { lifecycleLabels } from '../Operations/OperationsPage';
import { formatCurrency } from '../../utils/formatters';
import '../Operations/OperationsPage.css';

const localDate = date => { const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); };
export default function Dashboard() {
  const [range, setRange] = useState(() => { const end = new Date(); end.setDate(end.getDate() + 1); const start = new Date(); start.setDate(start.getDate() - 29); return { from: localDate(start), to: localDate(end) }; });
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await operationsApi.metrics({ from: new Date(range.from + 'T00:00:00').toISOString(), to: new Date(range.to + 'T00:00:00').toISOString() })); }
    catch (e) { setError(e.message || 'Khoảng thời gian không hợp lệ.'); } finally { setLoading(false); }
  }, [range]);
  useEffect(() => { load(); }, [load]);
  const cards = data ? [
    ['Tiền đã nhận trong kỳ', data.receivedRevenue], ['Doanh thu được ghi nhận', data.recognizedRevenue], ['Tiền đã hoàn', data.refundedAmount], ['Thu ròng trong kỳ', data.netReceipts],
    ['Chi trả thu mua trong kỳ', data.purchasePayouts], ['Chi phí tái chế ghi nhận trong kỳ', data.productionSpending], ['Giá vốn thu mua hàng đã bán', data.soldAcquisitionCost], ['Giá vốn tái chế hàng đã bán', data.soldProductionCost], ['Lãi gộp tham khảo', data.estimatedGrossProfit],
  ] : [];
  return <div className="ops-page"><div className="ops-heading"><div><p className="editorial-sub">VẬN HÀNH REWEAR</p><h1 className="editorial-title">Tổng quan kinh doanh</h1><p className="ops-muted">Doanh thu và chi phí lấy từ giao dịch đã lưu trong hệ thống.</p></div><Button onClick={load} loading={loading}>Tải lại</Button></div>
    <Card><Space wrap><label>Từ ngày <Input type="date" aria-label="Báo cáo từ ngày" value={range.from} onChange={e => setRange({ ...range, from: e.target.value })} /></label><label>Đến trước ngày <Input type="date" aria-label="Báo cáo đến trước ngày" value={range.to} onChange={e => setRange({ ...range, to: e.target.value })} /></label><span className="ops-muted">Tối đa 366 ngày. Các bảng trạng thái thể hiện tình hình hiện tại.</span></Space></Card>
    {error && <Alert type="error" title={error} action={<Button onClick={load}>Thử lại</Button>} />}
    {!data && loading && <Card loading />}
    {data && <><Row gutter={[20, 20]}>{cards.map(([title, value]) => <Col xs={24} sm={12} xl={8} key={title}><Card><Statistic title={title} value={value == null ? 'Chưa đủ dữ liệu' : formatCurrency(value)} /></Card></Col>)}</Row>
      <Alert type={data.estimatedGrossProfit == null ? 'warning' : 'info'} title={data.estimatedGrossProfit == null ? 'Chưa thể tính lãi gộp đầy đủ cho kỳ này.' : 'Lãi gộp tham khảo = doanh thu được ghi nhận − giá vốn thu mua và tái chế của các món đã bán.'} description={`Đơn thiếu dữ liệu giá vốn: ${data.unknownCostOrders}. Giao dịch đang cần đối soát: ${data.reconciliationCases}. Khoản chờ hoàn: ${data.refundPendingCases ?? 0}. Bản ghi tiền lịch sử chưa đủ thời điểm: ${data.legacyCashTransactions ?? 0}. Vật tư trong kỳ: ${formatCurrency(data.materialSpending ?? 0)}; nhân công: ${formatCurrency(data.laborSpending ?? 0)}. Chưa bao gồm chi phí vận hành, thuế và phí cổng thanh toán. Chi trả thu mua và chi phí tái chế phát sinh trong kỳ có thể thuộc các món chưa bán.`} />
      <Row gutter={[20, 20]}>{[['Đơn hàng', data.orders, orderLabels, '/orders'], ['Kho vòng đời', data.inventory, lifecycleLabels, '/inventory'], ['Dự án tái chế', data.projects, lifecycleLabels, '/upcycling']].map(([title, rows, labels, path]) => <Col xs={24} lg={8} key={title}><Card title={title} extra={<Link to={path}>Xem chi tiết</Link>}><Table size="small" rowKey="state" pagination={false} dataSource={rows} locale={{ emptyText: 'Chưa có dữ liệu' }} columns={[{ title: 'Trạng thái', dataIndex: 'state', render: value => labels[value] || value }, { title: 'Số lượng', dataIndex: 'count', align: 'right' }]} /></Card></Col>)}</Row>
    </>}
  </div>;
}
