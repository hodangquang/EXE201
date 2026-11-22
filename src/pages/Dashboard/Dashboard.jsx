import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, Col, Input, Row, Table, Tag } from 'antd';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Calendar,
  CheckCircle2,
  Hammer,
  RefreshCw,
  Scale,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { operationsApi } from '../../services/operations';
import { orderLabels } from '../Operations/labels';
import { lifecycleLabels } from '../Operations/OperationsPage';
import { formatCurrency } from '../../utils/formatters';
import '../Operations/OperationsPage.css';

const localDate = (date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const makePresetRange = (days) => {
  const end = new Date();
  end.setDate(end.getDate() + 1);
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { from: localDate(start), to: localDate(end) };
};

const compactVnd = (value) => {
  const num = Number(value) || 0;
  if (Math.abs(num) >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} tỷ`;
  if (Math.abs(num) >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} tr`;
  if (Math.abs(num) >= 1_000) return `${Math.round(num / 1_000)}k`;
  return `${num}`;
};

const CHART_PALETTE = ['#10100f', '#40403f', '#6b705c', '#a5a58d', '#b78338', '#9a2525', '#3d5a80', '#777771'];

function CurrencyTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ops-chart-tooltip">
      {label && <div className="ops-chart-tooltip-label">{label}</div>}
      {payload.map((entry) => (
        <div key={entry.name} className="ops-chart-tooltip-row">
          <span className="ops-chart-dot" style={{ background: entry.color || entry.fill || '#10100f' }} />
          <span>{entry.name}:</span>
          <strong>{formatCurrency(entry.value ?? 0)}</strong>
        </div>
      ))}
    </div>
  );
}

function CountTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="ops-chart-tooltip">
      <div className="ops-chart-tooltip-row">
        <span className="ops-chart-dot" style={{ background: item.payload?.fill || '#10100f' }} />
        <span>{item.name}:</span>
        <strong>{item.value} mục</strong>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [presetDays, setPresetDays] = useState(30);
  const [range, setRange] = useState(() => makePresetRange(30));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await operationsApi.metrics({
        from: new Date(`${range.from}T00:00:00`).toISOString(),
        to: new Date(`${range.to}T00:00:00`).toISOString(),
      });
      setData(response);
    } catch (e) {
      setError(e.message || 'Khoảng thời gian không hợp lệ.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const applyPreset = (days) => {
    setPresetDays(days);
    setRange(makePresetRange(days));
  };

  const cashflowChartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Tiền đã nhận', value: Number(data.receivedRevenue) || 0, fill: '#10100f' },
      { name: 'Thu ròng', value: Number(data.netReceipts) || 0, fill: '#26292a' },
      { name: 'Doanh thu ghi nhận', value: Number(data.recognizedRevenue) || 0, fill: '#4b5563' },
      { name: 'Chi trả thu mua', value: Number(data.purchasePayouts) || 0, fill: '#b78338' },
      { name: 'Chi phí tái chế', value: Number(data.productionSpending) || 0, fill: '#6b705c' },
      { name: 'Tiền đã hoàn', value: Number(data.refundedAmount) || 0, fill: '#9a2525' },
    ];
  }, [data]);

  const costBreakdownData = useMemo(() => {
    if (!data) return [];
    const material = Number(data.materialSpending) || 0;
    const labor = Number(data.laborSpending) || 0;
    const totalProd = Number(data.productionSpending) || 0;
    const otherProd = Math.max(0, totalProd - material - labor);
    return [
      {
        group: 'Chi phát sinh trong kỳ',
        'Thu mua nguồn hàng': Number(data.purchasePayouts) || 0,
        'Vật tư tái chế': material,
        'Nhân công tái chế': labor,
        'Chi tái chế khác': otherProd,
      },
      {
        group: 'Giá vốn hàng đã bán',
        'Thu mua nguồn hàng': Number(data.soldAcquisitionCost) || 0,
        'Vật tư tái chế': Number(data.soldProductionCost) || 0,
        'Nhân công tái chế': 0,
        'Chi tái chế khác': 0,
      },
    ];
  }, [data]);

  const detailCards = useMemo(() => {
    if (!data) return [];
    return [
      ['Tiền đã nhận trong kỳ', data.receivedRevenue, 'Tổng tiền thực thu qua cổng thanh toán'],
      ['Doanh thu được ghi nhận', data.recognizedRevenue, 'Đơn hàng đủ điều kiện ghi nhận doanh thu'],
      ['Tiền đã hoàn', data.refundedAmount, 'Khoản hoàn tiền đã xác nhận hoàn tất'],
      ['Thu ròng trong kỳ', data.netReceipts, 'Tiền đã nhận trừ đi tiền đã hoàn'],
      ['Chi trả thu mua trong kỳ', data.purchasePayouts, 'Tổng tiền đã thanh toán thu mua đồ cũ'],
      ['Chi phí tái chế ghi nhận trong kỳ', data.productionSpending, `Vật tư: ${formatCurrency(data.materialSpending ?? 0)} · Nhân công: ${formatCurrency(data.laborSpending ?? 0)}`],
      ['Giá vốn thu mua hàng đã bán', data.soldAcquisitionCost, 'Chi phí đầu vào của các món đã bán'],
      ['Giá vốn tái chế hàng đã bán', data.soldProductionCost, 'Chi phí gia công/tái chế của các món đã bán'],
      ['Lãi gộp tham khảo', data.estimatedGrossProfit, data.estimatedGrossProfit == null ? `Thiếu dữ liệu giá vốn (${data.unknownCostOrders ?? 0} đơn)` : 'Doanh thu ghi nhận trừ giá vốn hàng đã bán'],
    ];
  }, [data]);

  const statusSections = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: 'orders',
        title: 'Đơn hàng',
        subtitle: 'Phân bổ trạng thái đơn hiện tại',
        icon: ShoppingBag,
        rows: Array.isArray(data.orders) ? data.orders : [],
        labels: orderLabels,
        path: '/orders',
      },
      {
        key: 'inventory',
        title: 'Kho vòng đời',
        subtitle: 'Nguồn hàng thu mua & thành phẩm',
        icon: Boxes,
        rows: Array.isArray(data.inventory) ? data.inventory : [],
        labels: lifecycleLabels,
        path: '/inventory',
      },
      {
        key: 'projects',
        title: 'Dự án tái chế',
        subtitle: 'Tiến độ xưởng tái chế & QC',
        icon: Hammer,
        rows: Array.isArray(data.projects) ? data.projects : [],
        labels: lifecycleLabels,
        path: '/upcycling',
      },
    ];
  }, [data]);

  const totalPeriodOutflow = (Number(data?.purchasePayouts) || 0) + (Number(data?.productionSpending) || 0);
  const totalSoldCogs = (Number(data?.soldAcquisitionCost) || 0) + (Number(data?.soldProductionCost) || 0);

  return (
    <div className="ops-page ops-dashboard">
      {/* Header */}
      <div className="ops-heading">
        <div>
          <p className="editorial-sub">VẬN HÀNH REWEAR</p>
          <h1 className="editorial-title">Tổng quan kinh doanh</h1>
          <p className="ops-muted">Doanh thu, chi phí tái chế và trạng thái vận hành lấy trực tiếp từ giao dịch trong hệ thống.</p>
        </div>
        <Button
          className="ops-refresh-btn"
          icon={<RefreshCw size={15} />}
          onClick={load}
          loading={loading}
        >
          Tải lại
        </Button>
      </div>

      {/* Date Filter Bar */}
      <Card className="ops-filter-card">
        <div className="ops-filter-bar">
          <div className="ops-filter-inputs">
            <div className="ops-date-field">
              <label htmlFor="ops-date-from">
                <Calendar size={13} /> Từ ngày
              </label>
              <Input
                id="ops-date-from"
                type="date"
                aria-label="Báo cáo từ ngày"
                value={range.from}
                onChange={(e) => {
                  setPresetDays(null);
                  setRange({ ...range, from: e.target.value });
                }}
              />
            </div>
            <div className="ops-date-field">
              <label htmlFor="ops-date-to">
                <Calendar size={13} /> Đến trước ngày
              </label>
              <Input
                id="ops-date-to"
                type="date"
                aria-label="Báo cáo đến trước ngày"
                value={range.to}
                onChange={(e) => {
                  setPresetDays(null);
                  setRange({ ...range, to: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="ops-filter-presets" role="group" aria-label="Chọn nhanh khoảng thời gian">
            {[
              [7, '7 ngày'],
              [30, '30 ngày'],
              [90, '90 ngày'],
              [365, '1 năm'],
            ].map(([days, label]) => (
              <button
                key={days}
                type="button"
                className={`ops-preset-pill${presetDays === days ? ' active' : ''}`}
                onClick={() => applyPreset(days)}
              >
                {label}
              </button>
            ))}
          </div>

          <span className="ops-muted ops-filter-note">
            Tối đa 366 ngày. Các bảng trạng thái thể hiện tình hình hiện tại.
          </span>
        </div>
      </Card>

      {error && (
        <Alert
          type="error"
          showIcon
          title={error}
          action={<Button onClick={load}>Thử lại</Button>}
        />
      )}

      {!data && loading && <Card loading />}

      {data && (
        <>
          {/* Top 4 Executive Summary Cards */}
          <Row gutter={[18, 18]}>
            <Col xs={24} sm={12} xl={6}>
              <div className="ops-kpi-card ops-kpi-card--primary">
                <div className="ops-kpi-top">
                  <span className="ops-kpi-label">Thu ròng trong kỳ</span>
                  <span className="ops-kpi-icon"><Wallet size={18} /></span>
                </div>
                <div className="ops-kpi-value">{formatCurrency(data.netReceipts ?? 0)}</div>
                <div className="ops-kpi-meta">
                  <span>Nhận: {formatCurrency(data.receivedRevenue ?? 0)}</span>
                  <span>·</span>
                  <span>Hoàn: {formatCurrency(data.refundedAmount ?? 0)}</span>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} xl={6}>
              <div className="ops-kpi-card">
                <div className="ops-kpi-top">
                  <span className="ops-kpi-label">Doanh thu được ghi nhận</span>
                  <span className="ops-kpi-icon"><ArrowUpRight size={18} /></span>
                </div>
                <div className="ops-kpi-value">{formatCurrency(data.recognizedRevenue ?? 0)}</div>
                <div className="ops-kpi-meta">
                  <span>{data.paidTransactions ?? 0} giao dịch đã thanh toán</span>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} xl={6}>
              <div className="ops-kpi-card">
                <div className="ops-kpi-top">
                  <span className="ops-kpi-label">Tổng chi thu mua & tái chế</span>
                  <span className="ops-kpi-icon"><ArrowDownLeft size={18} /></span>
                </div>
                <div className="ops-kpi-value">{formatCurrency(totalPeriodOutflow)}</div>
                <div className="ops-kpi-meta">
                  <span>Thu mua: {formatCurrency(data.purchasePayouts ?? 0)}</span>
                  <span>·</span>
                  <span>Tái chế: {formatCurrency(data.productionSpending ?? 0)}</span>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} xl={6}>
              <div className={`ops-kpi-card${data.estimatedGrossProfit == null ? ' ops-kpi-card--warn' : ''}`}>
                <div className="ops-kpi-top">
                  <span className="ops-kpi-label">Lãi gộp tham khảo</span>
                  <span className="ops-kpi-icon"><TrendingUp size={18} /></span>
                </div>
                <div className="ops-kpi-value">
                  {data.estimatedGrossProfit == null ? 'Chưa đủ dữ liệu' : formatCurrency(data.estimatedGrossProfit)}
                </div>
                <div className="ops-kpi-meta">
                  <span>Giá vốn đã bán: {formatCurrency(totalSoldCogs)}</span>
                  {data.unknownCostOrders > 0 && (
                    <>
                      <span>·</span>
                      <span className="ops-text-warn">{data.unknownCostOrders} đơn thiếu giá vốn</span>
                    </>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          {/* Financial Charts Row */}
          <Row gutter={[20, 20]}>
            <Col xs={24} xl={14}>
              <Card
                className="ops-chart-card"
                title="Biểu đồ dòng tiền & doanh thu trong kỳ"
                extra={<span className="ops-card-tag">{range.from} → {range.to}</span>}
              >
                <p className="ops-chart-desc">
                  Đối chiếu tiền thực nhận, thu ròng, doanh thu ghi nhận và các khoản chi thu mua/tái chế phát sinh trong kỳ.
                </p>
                <div className="ops-chart-box" style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={cashflowChartData}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 20, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ecece6" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={compactVnd}
                        tick={{ fill: '#66665f', fontSize: 12 }}
                        axisLine={{ stroke: '#dcdcd4' }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={135}
                        tick={{ fill: '#10100f', fontSize: 12.5, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(16,16,15,0.04)' }} />
                      <Bar dataKey="value" name="Giá trị" radius={[0, 6, 6, 0]} barSize={24}>
                        {cashflowChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            <Col xs={24} xl={10}>
              <Card
                className="ops-chart-card"
                title="Cơ cấu chi phí thu mua & tái chế"
                extra={<span className="ops-card-tag">Phát sinh vs. Đã bán</span>}
              >
                <p className="ops-chart-desc">
                  Phân tách chi phí đầu vào theo nguồn thu mua đồ cũ, vật tư và nhân công tái chế.
                </p>
                <div className="ops-chart-box" style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={costBreakdownData}
                      margin={{ top: 12, right: 16, left: 8, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ecece6" vertical={false} />
                      <XAxis
                        dataKey="group"
                        tick={{ fill: '#10100f', fontSize: 12.5, fontWeight: 500 }}
                        axisLine={{ stroke: '#dcdcd4' }}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={compactVnd}
                        tick={{ fill: '#66665f', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'rgba(16,16,15,0.04)' }} />
                      <Bar dataKey="Thu mua nguồn hàng" stackId="cost" fill="#10100f" radius={[0, 0, 0, 0]} barSize={44} />
                      <Bar dataKey="Vật tư tái chế" stackId="cost" fill="#6b705c" />
                      <Bar dataKey="Nhân công tái chế" stackId="cost" fill="#b78338" />
                      <Bar dataKey="Chi tái chế khác" stackId="cost" fill="#a5a58d" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="ops-cost-legend">
                  <div className="ops-cost-legend-item">
                    <span className="ops-chart-dot" style={{ background: '#10100f' }} />
                    <span>Thu mua trong kỳ:</span>
                    <strong>{formatCurrency(data.purchasePayouts ?? 0)}</strong>
                  </div>
                  <div className="ops-cost-legend-item">
                    <span className="ops-chart-dot" style={{ background: '#6b705c' }} />
                    <span>Vật tư tái chế:</span>
                    <strong>{formatCurrency(data.materialSpending ?? 0)}</strong>
                  </div>
                  <div className="ops-cost-legend-item">
                    <span className="ops-chart-dot" style={{ background: '#b78338' }} />
                    <span>Nhân công tái chế:</span>
                    <strong>{formatCurrency(data.laborSpending ?? 0)}</strong>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Operational Status Donut Charts + Tables (Orders / Inventory / Projects) */}
          <Row gutter={[20, 20]}>
            {statusSections.map(({ key, title, subtitle, icon: Icon, rows, labels, path }) => {
              const chartRows = rows
                .map((row, index) => ({
                  state: row.state,
                  name: labels[row.state] || row.state,
                  count: Number(row.count) || 0,
                  fill: CHART_PALETTE[index % CHART_PALETTE.length],
                }))
                .filter((row) => row.count > 0);
              const totalCount = chartRows.reduce((sum, item) => sum + item.count, 0);

              return (
                <Col xs={24} lg={8} key={key}>
                  <Card
                    className="ops-status-card"
                    title={
                      <div className="ops-status-card-head">
                        <span className="ops-status-card-icon"><Icon size={16} /></span>
                        <div>
                          <div className="ops-status-card-title">{title}</div>
                          <div className="ops-status-card-sub">{subtitle}</div>
                        </div>
                      </div>
                    }
                    extra={<Link to={path} className="ops-card-link">Xem chi tiết</Link>}
                  >
                    {chartRows.length > 0 ? (
                      <div className="ops-status-visual">
                        <div className="ops-donut-wrap">
                          <ResponsiveContainer width="100%" height={170}>
                            <PieChart>
                              <Pie
                                data={chartRows}
                                dataKey="count"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={46}
                                outerRadius={70}
                                paddingAngle={2}
                              >
                                {chartRows.map((entry) => (
                                  <Cell key={entry.state} fill={entry.fill} />
                                ))}
                              </Pie>
                              <Tooltip content={<CountTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="ops-donut-center">
                            <strong>{totalCount}</strong>
                            <span>Tổng</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="ops-status-empty-chart">
                        <span>0 mục đang ghi nhận</span>
                      </div>
                    )}

                    <Table
                      size="small"
                      rowKey="state"
                      pagination={false}
                      dataSource={rows}
                      locale={{ emptyText: 'Chưa có dữ liệu' }}
                      columns={[
                        {
                          title: 'Trạng thái',
                          dataIndex: 'state',
                          render: (value, _record, index) => (
                            <span className="ops-status-cell">
                              <span
                                className="ops-chart-dot"
                                style={{ background: CHART_PALETTE[index % CHART_PALETTE.length] }}
                              />
                              <span>{labels[value] || value}</span>
                            </span>
                          ),
                        },
                        {
                          title: 'Số lượng',
                          dataIndex: 'count',
                          align: 'right',
                          render: (count) => (
                            <span className="ops-count-cell">
                              <strong>{count}</strong>
                              {totalCount > 0 && (
                                <small>{Math.round(((Number(count) || 0) / totalCount) * 100)}%</small>
                              )}
                            </span>
                          ),
                        },
                      ]}
                    />
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Reconciliation & Audit Indicators + Full 9-Metric Accounting Grid */}
          <Card
            className="ops-audit-card"
            title="Chỉ số đối soát & chi tiết hạch toán trong kỳ"
            extra={
              <Tag color={data.estimatedGrossProfit == null ? 'warning' : 'default'}>
                {data.estimatedGrossProfit == null ? 'Thiếu giá vốn ở một số đơn' : 'Đủ dữ liệu tính lãi gộp'}
              </Tag>
            }
          >
            <div className="ops-recon-strip">
              <div className="ops-recon-pill">
                <CheckCircle2 size={16} />
                <span>Giao dịch đã thu:</span>
                <strong>{data.paidTransactions ?? 0}</strong>
              </div>
              <div className={`ops-recon-pill${data.reconciliationCases > 0 ? ' is-alert' : ''}`}>
                <Scale size={16} />
                <span>Cần đối soát:</span>
                <strong>{data.reconciliationCases ?? 0}</strong>
              </div>
              <div className={`ops-recon-pill${(data.refundPendingCases ?? 0) > 0 ? ' is-alert' : ''}`}>
                <AlertTriangle size={16} />
                <span>Khoản chờ hoàn:</span>
                <strong>{data.refundPendingCases ?? 0}</strong>
              </div>
              <div className={`ops-recon-pill${data.unknownCostOrders > 0 ? ' is-alert' : ''}`}>
                <AlertTriangle size={16} />
                <span>Đơn thiếu giá vốn:</span>
                <strong>{data.unknownCostOrders ?? 0}</strong>
              </div>
              <div className="ops-recon-pill">
                <span>Bản ghi tiền lịch sử:</span>
                <strong>{data.legacyCashTransactions ?? 0}</strong>
              </div>
            </div>

            <Row gutter={[16, 16]} className="ops-detail-grid">
              {detailCards.map(([title, value, hint]) => (
                <Col xs={24} sm={12} xl={8} key={title}>
                  <div className="ops-metric-tile">
                    <span className="ops-metric-tile-title">{title}</span>
                    <strong className="ops-metric-tile-value">
                      {value == null ? 'Chưa đủ dữ liệu' : formatCurrency(value)}
                    </strong>
                    <small className="ops-metric-tile-hint">{hint}</small>
                  </div>
                </Col>
              ))}
            </Row>

            <Alert
              className="ops-accounting-note"
              type={data.estimatedGrossProfit == null ? 'warning' : 'info'}
              showIcon
              title={
                data.estimatedGrossProfit == null
                  ? 'Chưa thể tính lãi gộp đầy đủ cho kỳ này.'
                  : 'Lãi gộp tham khảo = doanh thu được ghi nhận − giá vốn thu mua và tái chế của các món đã bán.'
              }
              description={`Đơn thiếu dữ liệu giá vốn: ${data.unknownCostOrders}. Giao dịch đang cần đối soát: ${data.reconciliationCases}. Khoản chờ hoàn: ${data.refundPendingCases ?? 0}. Bản ghi tiền lịch sử chưa đủ thời điểm: ${data.legacyCashTransactions ?? 0}. Vật tư trong kỳ: ${formatCurrency(data.materialSpending ?? 0)}; nhân công: ${formatCurrency(data.laborSpending ?? 0)}. Chưa bao gồm chi phí vận hành, thuế và phí cổng thanh toán. Chi trả thu mua và chi phí tái chế phát sinh trong kỳ có thể thuộc các món chưa bán.`}
            />
          </Card>
        </>
      )}
    </div>
  );
}
