import React, { useState } from 'react';
import { Table, Input, Select, Space, Button, Modal, message, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Edit, Trash2, Globe, Sparkles, RefreshCcw } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
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

  // Delete product
  const handleDelete = async (id) => {
    try {
      await authFetch(`/api/Products/${id}`, { method: 'DELETE' });
      message.success('Đã ẩn sản phẩm khỏi cửa hàng');
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
        const firstImg = imgs.length > 0 ? (imgs[0].imageUrl || imgs[0].url || imgs[0]) : '';
        return firstImg ? (
          <img
            src={firstImg}
            alt="product"
            style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 0, border: '1px solid #e5e5e4' }}
          />
        ) : <span style={{ display: 'inline-grid', width: 56, height: 56, placeItems: 'center', color: '#70706f', border: '1px solid #e5e5e4', fontSize: 11 }}>Chưa có ảnh</span>;
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
      render: (status, record) => record.productType !== 'Upcycled' ? <span>Ngừng kinh doanh · dữ liệu cũ</span> : record.isPreview ? <span>Ý tưởng tái chế</span> : <StatusBadge status={status} />,
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
                  title={record.isPreview ? 'Chỉnh sửa bản xem trước' : [1, 2, '1', '2', 'Reserved', 'Sold'].includes(record.status) ? 'Sản phẩm đang được giữ hoặc đã bán; không thể chỉnh sửa' : 'Chỉnh sửa sản phẩm'}
                  disabled={[1, 2, '1', '2', 'Reserved', 'Sold'].includes(record.status)}
                  onClick={() => navigate(`/products/edit/${record.id}`)}
                />
                <Popconfirm
                  title="Ẩn sản phẩm?"
                  description="Sản phẩm sẽ không còn hiển thị trên cửa hàng. Đơn đang giữ hàng không thể bị ẩn."
                  onConfirm={() => handleDelete(record.id)}
                  okText="Ẩn"
                  cancelText="Hủy"
                >
                  <Button type="text" danger disabled={[1, '1', 'Reserved'].includes(record.status)} aria-label={`Ẩn sản phẩm ${record.title || record.name || ''}`} icon={<Trash2 size={15} />} />
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
            Tất cả sản phẩm
          </h1>
        </div>

        <Space wrap>
          <Button icon={<Sparkles size={16} />} onClick={() => navigate('/products/drafts')}>Bản lưu ý tưởng</Button>
        {isAdmin && (
          <button 
            className="pill-btn-filled" 
            style={{ height: '38px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => navigate('/upcycling')}
          >
            <Plus size={16} />
            <span>Tạo sản phẩm từ dự án tái chế</span>
          </button>
        )}
        </Space>
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
          <Option value="0">Như mới</Option>
          <Option value="1">Rất tốt</Option>
          <Option value="2">Tốt</Option>
          <Option value="3">Khá</Option>
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
