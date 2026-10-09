import React, { useState } from 'react';
import { Row, Col, Typography, Select, Button, Space, Table } from 'antd';
import { 
  BarChart3, 
  Leaf, 
  TrendingUp, 
  DollarSign, 
  Recycle, 
  Users, 
  ArrowUpRight,
  Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import KPICard from '../../components/common/KPICard';
import { mockKPIs, mockRevenueTrends } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

const { Option } = Select;

export const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('month');

  // Sustainability fabric impact breakdown
  const fabricImpactData = [
    { name: 'Denim tái sinh', savedKg: 92.5 },
    { name: 'Vải Cotton áo thun', savedKg: 46.2 },
    { name: 'Vải Kaki quân phục', savedKg: 31.8 },
    { name: 'Len & Flannel dạ', savedKg: 14.9 },
  ];

  // Best selling products
  const topProducts = [
    { id: 'PRD-001', name: 'Patchwork Denim Jacket #001', sales: '890,000 ₫', category: 'Outerwear', status: 'Sold' },
    { id: 'PRD-003', name: 'Asymmetric Flannel Shirt #003', sales: '520,000 ₫', category: 'Reworked Tops', status: 'Sold' },
    { id: 'PRD-002', name: 'Military Cargo Tote Bag #002', sales: '450,000 ₫', category: 'Tote & Bags', status: 'Published' },
  ];

  const topColumns = [
    {
      title: 'Sản phẩm tiêu biểu',
      dataIndex: 'name',
      key: 'name',
      render: (n) => <span style={{ fontWeight: 600, color: '#10100f' }}>{n}</span>,
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Doanh thu ghi nhận',
      dataIndex: 'sales',
      key: 'sales',
      render: (s) => <span style={{ fontWeight: 600 }}>{s}</span>,
    },
  ];

  return (
    <div>
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e5e4'
        }}
      >
        <div>
          <div className="editorial-sub" style={{ marginBottom: '6px' }}>
            SUSTAINABILITY & FINANCIAL AUDIT
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Báo cáo Doanh số & Tác động Môi trường
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 160 }}
          >
            <Option value="today">Hôm nay</Option>
            <Option value="week">Tuần này</Option>
            <Option value="month">Tháng này</Option>
            <Option value="year">Năm 2026</Option>
          </Select>

          <button 
            className="pill-btn-outlined" 
            style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => window.print()}
          >
            <Download size={14} />
            <span>Xuất dữ liệu ESG</span>
          </button>
        </div>
      </div>

      {/* Sustainability Metrics (Req #21) */}
      <div 
        style={{ 
          backgroundColor: '#10100f', 
          color: '#ffffff', 
          padding: '32px', 
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#fffb85' }}>
              REWEAR ENVIRONMENTAL, SOCIAL & GOVERNANCE (ESG)
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '24px', fontWeight: 600 }}>
              Chỉ số Giảm thiểu Rác thải Thời trang
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fffb85' }}>
            <Leaf size={22} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Tuần hoàn 100%</span>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={6}>
            <div style={{ borderLeft: '2px solid #26292a', paddingLeft: '16px' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b2' }}>Tổng vải cứu khỏi bãi rác</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: '#fffb85' }}>
                185.4 <span style={{ fontSize: '16px' }}>KG</span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={6}>
            <div style={{ borderLeft: '2px solid #26292a', paddingLeft: '16px' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b2' }}>Quần áo cũ thu nhận</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700 }}>
                {mockKPIs.collectedClothes} <span style={{ fontSize: '16px' }}>chiếc</span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={6}>
            <div style={{ borderLeft: '2px solid #26292a', paddingLeft: '16px' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b2' }}>Đã tái chế thành sản phẩm</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700 }}>
                {mockKPIs.upcycledProducts} <span style={{ fontSize: '16px' }}>mẫu</span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={6}>
            <div style={{ borderLeft: '2px solid #26292a', paddingLeft: '16px' }}>
              <div style={{ fontSize: '12px', color: '#b3b3b2' }}>Điểm thưởng đã tri ân</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '32px', fontWeight: 700, color: '#fffb85' }}>
                4,820 <span style={{ fontSize: '16px' }}>PTS</span>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Charts and Tables */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <div className="flat-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <div className="editorial-sub">THU HỒI CHẤT LIỆU</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#10100f' }}>
                Khối lượng vải cứu vãn theo chất liệu (Kg)
              </div>
            </div>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fabricImpactData}>
                  <XAxis dataKey="name" stroke="#70706f" fontSize={12} tickLine={false} />
                  <YAxis stroke="#70706f" fontSize={12} tickLine={false} />
                  <Tooltip 
                    formatter={(val) => [`${val} Kg`, 'Khối lượng cứu']}
                    contentStyle={{ backgroundColor: '#10100f', color: '#fff', border: 'none' }}
                  />
                  <Bar dataKey="savedKg" fill="#26292a" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div className="flat-card" style={{ padding: '24px', height: '100%' }}>
            <div style={{ marginBottom: '16px' }}>
              <div className="editorial-sub">NHÓM NỔI BẬT</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#10100f' }}>
                Sản phẩm độc bản dẫn đầu
              </div>
            </div>
            <Table dataSource={topProducts} columns={topColumns} rowKey="id" pagination={false} size="small" />
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ReportsPage;
