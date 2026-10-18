import React, { useState } from 'react';
import { Table, Input, Select, Space, Button, Modal, message, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, Globe, Sparkles, RefreshCcw } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { mockProducts, mockCategories } from '../../data/mockData';
import { PRODUCT_STATUS } from '../../utils/constants';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';
import { authFetch } from '../../services/auth';

const { Option } = Select;

export const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [isActiveFilter, setIsActiveFilter] = useState('true');

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === ROLES.ADMIN;

  React.useEffect(() => {
    authFetch('/api/Brands?isActive=true').then(res => setBrands(Array.isArray(res) ? res : res.data || []));
    authFetch('/api/Categories?isActive=true').then(res => setCategories(Array.isArray(res) ? res : res.data || []));
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.append('CategoryId', categoryFilter);
      if (brandFilter) params.append('BrandId', brandFilter);
      if (statusFilter) params.append('Status', statusFilter);
      if (conditionFilter) params.append('Condition', conditionFilter);
      if (isActiveFilter) params.append('IsActive', isActiveFilter);
      if (searchText) params.append('Search', searchText);
      
      const res = await authFetch(`/api/Products?${params.toString()}`);
      setProducts(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      message.error('Lỗi tải sản phẩm: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, brandFilter, statusFilter, conditionFilter, isActiveFilter]);

  // Chuyển Available <-> Reserved; sản phẩm Sold không được mở bán lại từ nút này.
  const handleTogglePublish = async (record) => {
    const status = Number(record.status);
    if (status !== PRODUCT_STATUS.AVAILABLE && status !== PRODUCT_STATUS.RESERVED) return;
    const newStatusInt = status === PRODUCT_STATUS.AVAILABLE
      ? PRODUCT_STATUS.RESERVED
      : PRODUCT_STATUS.AVAILABLE;
    try {
      await authFetch(`/api/Products/${record.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatusInt })
      });
      message.success(`Đã chuyển sản phẩm sang trạng thái ${newStatusInt === PRODUCT_STATUS.AVAILABLE ? 'Có sẵn để bán' : 'Đã đặt trước'}`);
      fetchProducts();
    } catch (err) {
      message.error('Lỗi khi cập nhật trạng thái: ' + err.message);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    try {
      await authFetch(`/api/Products/${id}`, { method: 'DELETE' });
      message.success('Đã xóa sản phẩm thành công');
      fetchProducts();
    } catch (err) {
      message.error('Lỗi khi xóa sản phẩm: ' + err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      await authFetch(`/api/Products/${id}/restore`, { method: 'PATCH' });
      message.success('Đã khôi phục sản phẩm thành công');
      fetchProducts();
    } catch (err) {
      message.error('Lỗi khi khôi phục: ' + err.message);
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'image',
      width: 80,
      render: (images, record) => {
        const imgs = images || record.imageUrls || [];
        const firstImg = imgs.length > 0 ? (imgs[0].imageUrl || imgs[0].url || imgs[0]) : 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100';
        return (
          <img
            src={firstImg}
            alt="product"
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 0, border: '1px solid #e5e5e4' }}
          />
        );
      },
    },
    {
      title: 'Thông tin sản phẩm',
      key: 'product_info',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontWeight: 600, color: '#10100f', fontSize: '14px' }}>{record.title || record.name}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#70706f' }}>
            ID: <span style={{ fontFamily: 'monospace' }}>{record.id}</span> • Size: <b>{record.size || '-'}</b> • Màu: {record.color || '-'}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (_, record) => <span style={{ fontSize: '13px' }}>{record.categoryName || record.category || '-'}</span>,
    },
    {
      title: 'Thương hiệu',
      key: 'brand',
      render: (_, record) => <span style={{ fontSize: '13px' }}>{record.brandName || record.brand || '-'}</span>,
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ fontWeight: 600, color: '#10100f' }}>
          {formatCurrency(price)}
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
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Eye size={15} />}
            title="Xem chi tiết"
            onClick={() => navigate(`/products/${record.id}`)}
          />
          {isAdmin && (
            isActiveFilter === 'false' || record.isActive === false ? (
              <Button
                type="text"
                icon={<RefreshCcw size={15} color="#52c41a" />}
                title="Khôi phục sản phẩm"
                onClick={() => handleRestore(record.id)}
              />
            ) : (
              <>
                <Button
                  type="text"
                  icon={<Edit size={15} />}
                  title="Chỉnh sửa sản phẩm"
                  onClick={() => navigate(`/products/edit/${record.id}`)}
                />
                {(Number(record.status) === PRODUCT_STATUS.AVAILABLE || Number(record.status) === PRODUCT_STATUS.RESERVED) && (
                  <Button
                    type="text"
                    icon={<Globe size={15} color={Number(record.status) === PRODUCT_STATUS.AVAILABLE ? '#1b4d2e' : '#70706f'} />}
                    title={Number(record.status) === PRODUCT_STATUS.AVAILABLE ? 'Đánh dấu đã đặt trước' : 'Đưa về trạng thái có sẵn để bán'}
                    onClick={() => handleTogglePublish(record)}
                  />
                )}
                <Popconfirm
                  title="Xóa sản phẩm?"
                  description="Bạn có chắc muốn xóa sản phẩm tái chế này?"
                  onConfirm={() => handleDelete(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button type="text" danger aria-label={`Xóa sản phẩm ${record.title || record.name || ''}`} icon={<Trash2 size={15} />} />
                </Popconfirm>
              </>
            )
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="rw-admin-page">
      {/* Header */}
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
            QUẢN LÝ SẢN PHẨM
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Tất cả sản phẩm tái chế
          </h1>
        </div>

        {isAdmin && (
          <button 
            className="pill-btn-filled" 
            style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/products/new')}
          >
            <Plus size={16} />
            <span>Thêm sản phẩm mới</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div 
        className="flat-card" 
        style={{ 
          padding: '16px 20px', 
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 'min(240px, 100%)', display: 'flex', gap: 8 }}>
          <Input
            prefix={<Search size={16} color="#70706f" />}
            placeholder="Tìm theo tên sản phẩm hoặc mã ID..."
            aria-label="Tìm kiếm trong danh sách" value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={fetchProducts}
            style={{ borderRadius: 0 }}
          />
          <Button onClick={fetchProducts} type="primary" style={{ borderRadius: 0 }}>Tìm</Button>
        </div>

        <Select
          aria-label="Lọc danh mục" value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 140 }}
        >
          <Option value="">Tất cả danh mục</Option>
          {categories.map((c) => (
            <Option key={c.id} value={c.id}>{c.name}</Option>
          ))}
        </Select>

        <Select
          aria-label="Lọc thương hiệu" value={brandFilter}
          onChange={setBrandFilter}
          style={{ width: 140 }}
        >
          <Option value="">Tất cả thương hiệu</Option>
          {brands.map((b) => (
            <Option key={b.id} value={b.id}>{b.name}</Option>
          ))}
        </Select>

        <Select
          aria-label="Lọc tình trạng" value={conditionFilter}
          onChange={setConditionFilter}
          style={{ width: 140 }}
        >
          <Option value="">Tất cả tình trạng</Option>
          <Option value="1">1 - Như mới</Option>
          <Option value="2">2 - Tốt</Option>
          <Option value="3">3 - Khá</Option>
        </Select>

        <Select
          aria-label="Lọc trạng thái sản phẩm" value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 140 }}
        >
          <Option value="">Tất cả trạng thái</Option>
          <Option value="0">Có sẵn để bán</Option>
          <Option value="1">Đã đặt trước</Option>
          <Option value="2">Đã bán</Option>
        </Select>

        <Select
          aria-label="Lọc trạng thái hoạt động" value={isActiveFilter}
          onChange={setIsActiveFilter}
          style={{ width: 150 }}
        >
          <Option value="true">Đang hoạt động</Option>
          <Option value="false">Đã xóa (Thùng rác)</Option>
          <Option value="">Tất cả (Hoạt động & Xóa)</Option>
        </Select>
      </div>

      {/* Products Table */}
      <div className="flat-card" style={{ padding: '0px' }}>
        <Table scroll={{ x: 'max-content' }}
          dataSource={products}
          loading={loading}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
        />
      </div>
    </div>
  );
};

export default ProductList;
