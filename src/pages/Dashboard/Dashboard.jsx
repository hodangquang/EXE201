import React from 'react';
import { Row, Col, Typography, Table, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Inbox,
  Recycle,
  Sparkles,
  Users,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar 
} from 'recharts';
import KPICard from '../../components/common/KPICard';
import StatusBadge from '../../components/common/StatusBadge';
import { 
  mockKPIs, 
  mockRevenueTrends, 
  mockCategoryStats, 
  mockOrders, 
  mockCollectionRequests 
} from '../../data/mockData';
import { formatCurrency, formatDate, formatShortDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export const Dashboard = () => {
  const navigate = useNavigate();

  // Recent orders columns
  const orderColumns = [
    {
      title: 'Mã đơn',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, color: '#10100f' }}>{id}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer) => (
        <div>
          <div style={{ fontWeight: 500 }}>{customer.name}</div>
          <div style={{ fontSize: '11px', color: '#70706f' }}>{customer.phone}</div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <span style={{ fontSize: '12px' }}>
          {items[0]?.name} {items.length > 1 && `+${items.length - 1}`}
        </span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (val) => <span style={{ fontWeight: 600 }}>{formatCurrency(val)}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Ngày',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span style={{ fontSize: '12px', color: '#70706f' }}>{formatShortDate(date)}</span>,
    },
  ];

  // Recent collection requests columns
  const collectionColumns = [
    {
      title: 'Mã đợt',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, color: '#10100f' }}>{id}</span>,
    },
    {
      title: 'Người quyên góp',
      dataIndex: 'customer',
      key: 'customer',
      render: (cust) => cust.name,
    },
    {
      title: 'Số lượng',
      dataIndex: 'clothesCount',
      key: 'clothesCount',
      render: (count) => (
        <span style={{ fontWeight: 600 }}>{count} món</span>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'collectionMethod',
      key: 'collectionMethod',
      render: (method) => (
        <span style={{ fontSize: '12px', color: '#555' }}>
          {method.split('(')[0]}
        </span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge status={status} />,
    },
    {
      title: 'Ngày hẹn',
      dataIndex: 'pickupDate',
      key: 'pickupDate',
      render: (date) => <span style={{ fontSize: '12px', color: '#70706f' }}>{formatShortDate(date)}</span>,
    },
  ];

  return (
    <div className="rw-admin-page">
      {/* Editorial Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '32px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e5e4'
        }}
      >
        <div>
          <div className="editorial-sub" style={{ marginBottom: '6px' }}>
            TỔNG QUAN & PHÂN TÍCH
          </div>
          <h1 
            className="editorial-title"
            style={{ fontSize: '32px', margin: 0 }}
          >
            Bảng điều khiển REWEAR
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="pill-btn-outlined" 
            style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => window.print()}
          >
            <Download size={14} />
            <span>Xuất báo cáo PDF</span>
          </button>
          <button 
            className="pill-btn-filled" 
            style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/products/new')}
          >
            <Sparkles size={14} />
            <span>Tạo sản phẩm 1-of-1</span>
          </button>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={8} xxl={4}>
          <KPICard
            title="Doanh thu"
            value={formatCurrency(mockKPIs.revenue)}
            trend={14.8}
            icon={DollarSign}
            subtitle="so với tháng trước"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xxl={4}>
          <KPICard
            title="Đơn hàng"
            value={mockKPIs.ordersCount}
            trend={8.2}
            icon={ShoppingBag}
            subtitle="128 đơn hoàn tất"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xxl={4}>
          <KPICard
            title="Đồ cũ thu gom"
            value={mockKPIs.collectedClothes}
            suffix="chiếc"
            trend={22.5}
            icon={Inbox}
            subtitle="từ 84 lượt đóng góp"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xxl={4}>
          <KPICard
            title="Sản phẩm tái chế"
            value={mockKPIs.upcycledProducts}
            suffix="SP"
            trend={11.0}
            icon={Recycle}
            subtitle="đã qua kiểm duyệt QC"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xxl={4}>
          <KPICard
            title="Sản phẩm đã bán"
            value={mockKPIs.productsSold}
            suffix="SP"
            trend={9.5}
            icon={Sparkles}
            subtitle="tỷ lệ bán 80.8%"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xxl={4}>
          <KPICard
            title="Khách hàng"
            value={mockKPIs.customersCount}
            suffix="người"
            trend={16.2}
            icon={Users}
            subtitle="320 khách có điểm thưởng"
          />
        </Col>
      </Row>

      {/* Charts Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        {/* Revenue Trends */}
        <Col xs={24} lg={16}>
          <div className="flat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="editorial-sub">XU HƯỚNG VÀ TĂNG TRƯỞNG</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#10100f' }}>
                  Doanh thu & Số lượng đồ thu gom theo tháng
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#70706f' }}>Nửa đầu 2026</span>
            </div>

            <div style={{ height: 280, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#26292a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#26292a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#70706f" fontSize={12} tickLine={false} />
                  <YAxis stroke="#70706f" fontSize={12} tickLine={false} tickFormatter={(v) => `${v / 1000000}M`} />
                  <Tooltip 
                    formatter={(val, name) => [
                      name === 'revenue' ? formatCurrency(val) : `${val} chiếc`, 
                      name === 'revenue' ? 'Doanh thu' : 'Đồ thu gom'
                    ]}
                    contentStyle={{ backgroundColor: '#10100f', color: '#fff', border: 'none', borderRadius: 0, fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10100f" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Sales by Category Donut */}
        <Col xs={24} lg={8}>
          <div className="flat-card" style={{ padding: '24px', height: '100%' }}>
            <div style={{ marginBottom: '16px' }}>
              <div className="editorial-sub">CƠ CẤU SẢN PHẨM</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#10100f' }}>
                Cơ cấu bán theo danh mục
              </div>
            </div>

            <div style={{ height: 200, width: '100%', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategoryStats}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mockCategoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [`${val}%`, 'Thị phần']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '12px', borderTop: '1px solid #f0f0ef', paddingTop: '12px' }}>
              {mockCategoryStats.map((item) => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, backgroundColor: item.color, borderRadius: '9999px' }} />
                    <span style={{ fontSize: '12px', color: '#555554' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      {/* Split Tables: Recent Orders & Recent Collection Requests */}
      <Row gutter={[24, 24]}>
        {/* Recent Orders */}
        <Col xs={24} xl={13}>
          <div className="flat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div className="editorial-sub">GIAO DỊCH</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#10100f' }}>
                  Đơn hàng gần đây
                </div>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/orders')}
                style={{ color: '#10100f', fontWeight: 600, padding: 0 }}
              >
                Xem tất cả đơn →
              </Button>
            </div>

            <Table scroll={{ x: 'max-content' }}
              dataSource={mockOrders}
              columns={orderColumns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </div>
        </Col>

        {/* Recent Collection Requests */}
        <Col xs={24} xl={11}>
          <div className="flat-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div className="editorial-sub">TIẾP NHẬN QUYÊN GÓP</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#10100f' }}>
                  Yêu cầu thu gom mới nhất
                </div>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/collections')}
                style={{ color: '#10100f', fontWeight: 600, padding: 0 }}
              >
                Chi tiết thu gom →
              </Button>
            </div>

            <Table scroll={{ x: 'max-content' }}
              dataSource={mockCollectionRequests}
              columns={collectionColumns}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
