import React, { useState } from 'react';
import { Table, Tabs, Input, Select, Tag, Space } from 'antd';
import { Search, Boxes, Layers, RefreshCw } from 'lucide-react';
import { mockInventory } from '../../data/mockData';
import { formatShortDate } from '../../utils/formatters';

export const InventoryList = () => {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  const filteredItems = mockInventory.filter((item) => {
    const matchesTab = activeTab === 'ALL' || item.category === activeTab;
    const matchesSearch = item.item.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchText.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchText.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const columns = [
    {
      title: 'Mã định danh',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{id}</span>,
    },
    {
      title: 'Hạng mục tồn kho',
      dataIndex: 'item',
      key: 'item',
      render: (t) => <span style={{ fontWeight: 600, color: '#10100f' }}>{t}</span>,
    },
    {
      title: 'Phân loại nguyên phụ liệu',
      dataIndex: 'type',
      key: 'type',
      render: (t) => <span style={{ fontSize: '13px' }}>{t}</span>,
    },
    {
      title: 'Khối lượng / Số lượng',
      key: 'qty_unit',
      render: (_, r) => (
        <span style={{ fontWeight: 600, color: r.quantity === 0 ? '#70706f' : '#10100f' }}>
          {r.quantity} {r.unit}
        </span>
      ),
    },
    {
      title: 'Vị trí lưu kho',
      dataIndex: 'location',
      key: 'location',
      render: (loc) => <span style={{ fontSize: '12px', color: '#555' }}>{loc}</span>,
    },
    {
      title: 'Tình trạng xử lý',
      dataIndex: 'status',
      key: 'status',
      render: (st) => (
        <span
          style={{
            display: 'inline-block',
            backgroundColor: '#f4f4f3',
            color: '#10100f',
            border: '1px solid #d4d4d3',
            borderRadius: '9999px',
            padding: '2px 8px',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {st}
        </span>
      ),
    },
    {
      title: 'Cập nhật lần cuối',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      render: (d) => <span style={{ fontSize: '12px', color: '#70706f' }}>{formatShortDate(d)}</span>,
    },
  ];

  const tabItems = [
    { key: 'ALL', label: 'Tất cả vòng đời' },
    { key: 'Collected Clothes', label: '1. Đồ cũ thu gom' },
    { key: 'Raw Materials', label: '2. Nguyên liệu sơ chế' },
    { key: 'Production', label: '3. Đang may mẫu (WIP)' },
    { key: 'Finished Products', label: '4. Thành phẩm mở bán' },
    { key: 'Sold', label: '5. Đã bán (Archived)' },
  ];

  return (
    <div className="rw-admin-page">
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
            THEO DÕI VÒNG ĐỜI VẬT LIỆU
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Quản lý Kho nguyên liệu & Thành phẩm tuần hoàn
          </h1>
        </div>
      </div>

      <div className="flat-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <Input
          prefix={<Search size={16} color="#70706f" style={{ marginRight: 6 }} />}
          placeholder="Tìm theo tên vật tư, vị trí kệ kho..."
          aria-label="Tìm kiếm trong danh sách" value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: '400px', borderRadius: 0 }}
        />
      </div>

      <div className="flat-card" style={{ padding: '0 20px 20px 20px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginBottom: '16px' }}
        />
        <Table scroll={{ x: 'max-content' }} dataSource={filteredItems} columns={columns} rowKey="id" pagination={false} />
      </div>
    </div>
  );
};

export default InventoryList;
