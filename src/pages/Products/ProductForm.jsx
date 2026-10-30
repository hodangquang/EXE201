import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { authFetch } from '../../services/auth';
import { formatCatalogText } from '../../utils/catalogText';

const { Option } = Select;
const { TextArea } = Input;

export const ProductForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [existingStock, setExistingStock] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [productType, setProductType] = useState('');
  const [productLoaded, setProductLoaded] = useState(!isEdit);
  const [productLoadError, setProductLoadError] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    authFetch('/api/Brands?isActive=true')
      .then(res => setBrands(Array.isArray(res) ? res : res.data || []))
      .catch(err => message.error('Lỗi tải thương hiệu: ' + err.message));

    authFetch('/api/Categories?isActive=true')
      .then(res => setCategories(Array.isArray(res) ? res : res.data || []))
      .catch(err => message.error('Lỗi tải danh mục: ' + err.message));

    if (isEdit) {
      setProductLoaded(false);
      setProductLoadError(false);
      authFetch(`/api/Products/${id}`)
        .then(res => {
          const product = res.data || res;
          form.setFieldsValue({
            Title: product.title || product.name,
            Description: formatCatalogText(product.description),
            BrandId: product.brandId || product.brand?.id,
            CategoryId: product.categoryId || product.category?.id || product.category,
            Price: product.price,
            Condition: product.condition ?? 1,
            Size: product.size,
            Color: product.color,
          });
          const imgs = product.images || product.imageUrls || [];
          setExistingImages(imgs.map(img => img.imageUrl || img.url || img));
          setExistingStock(product.stockQuantity ?? 1);
          setIsPreview(Boolean(product.isPreview));
          setProductType(product.productType || '');
          setProductLoaded(true);
        })
        .catch(err => {
          setProductLoadError(true);
          message.error('Lỗi tải sản phẩm: ' + err.message);
        });
    }
  }, [id, isEdit, form]);

  const saveEdits = async (values) => {
      const imageUrls = existingImages.map(url => url.trim()).filter(Boolean);
        // Keep the PUT body aligned with PUT /api/Products/{id}.
        const formData = new FormData();
        for (const [key, value] of Object.entries({ Title: values.Title, Description: values.Description || '', BrandId: values.BrandId,
          CategoryId: values.CategoryId, Price: Number(values.Price), StockQuantity: existingStock, Condition: Number(values.Condition), Size: values.Size ?? '', Color: values.Color ?? '' })) {
          formData.append(key, String(value));
        }
        imageUrls.forEach(url => formData.append('KeepImageUrls', url));
        return authFetch(`/api/Products/${id}`, { method: 'PUT', body: formData });
  };

  const onFinish = async values => {
    try {
      setLoading(true);
      await saveEdits(values);
      message.success('Đã cập nhật thông tin sản phẩm.');
      navigate('/products');
    } catch (error) {
      message.error(error.message || 'Không cập nhật được sản phẩm.');
    } finally { setLoading(false); }
  };

  return (
    <div className="rw-admin-page">
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/products')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '13px',
            color: '#70706f',
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách sản phẩm
        </button>

        <div className="editorial-sub">{isEdit ? 'CẬP NHẬT SẢN PHẨM' : 'TẠO SẢN PHẨM MỚI'}</div>
        <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
          {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={15}>
            <div className="flat-card" style={{ padding: '32px', marginBottom: '24px' }}>
              <div className="editorial-sub" style={{ marginBottom: '16px' }}>THÔNG TIN CHÍNH</div>

              <Form.Item
                name="Title"
                label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Tiêu đề sản phẩm</span>}
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề sản phẩm!' }]}
              >
                <Input placeholder="Ví dụ: Patchwork Denim Jacket #004" style={{ borderRadius: 0 }} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="CategoryId"
                    label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Danh mục</span>}
                    rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn danh mục"
                      optionFilterProp="label"
                      options={categories.map(category => ({ value: category.id, label: category.name }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="BrandId"
                    label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Thương Hiệu</span>}
                    rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn thương hiệu"
                      optionFilterProp="label"
                      options={brands.map(b => ({ value: b.id, label: b.name }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="Price"
                    label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Giá bán (VND)</span>}
                    rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%', borderRadius: 0 }}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      placeholder="890000"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="Size"
                    label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Kích cỡ</span>}
                  >
                    <Select>
                      <Option value="XS">XS</Option>
                      <Option value="S">S</Option>
                      <Option value="M">M</Option>
                      <Option value="L">L</Option>
                      <Option value="XL">XL</Option>
                      <Option value="Free Size">Một cỡ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                  <Form.Item
                    name="Color"
                    label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Màu sắc</span>}
                  >
                    <Input placeholder="Indigo, Rêu, Kem..." style={{ borderRadius: 0 }} />
                  </Form.Item>
                </Col>
              </Row>

              {!isPreview && <Form.Item
                name="Condition"
                label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Tình trạng món đồ</span>}
                rules={[{ required: true, message: 'Vui lòng chọn tình trạng!' }]}
              >
                <Select>
                  <Option value={0}>Như mới</Option>
                  <Option value={1}>Rất tốt</Option>
                  <Option value={2}>Tốt</Option>
                  <Option value={3}>Khá</Option>
                </Select>
              </Form.Item>}

              <Form.Item
                name="Description"
                label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Mô tả sản phẩm</span>}
              >
                <TextArea rows={4} placeholder="Mô tả phom dáng, xuất xứ vải..." style={{ borderRadius: 0 }} />
              </Form.Item>
            </div>
          </Col>

          <Col xs={24} lg={9}>
            {productLoaded && productType !== 'Upcycled' && <div className="flat-card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="editorial-sub" style={{ marginBottom: 12 }}>DỮ LIỆU CŨ · NGỪNG KINH DOANH</div>
              <p>Món đồ này không thuộc sản phẩm tái chế. Thông tin được giữ để đối soát; món đồ không xuất hiện trên cửa hàng và không thể mua.</p>
            </div>}
            {isEdit && isPreview && productType === 'Upcycled' && <div className="flat-card" style={{ padding: 24, marginBottom: 24 }}>
              <div className="editorial-sub" style={{ marginBottom: 12 }}>Ý TƯỞNG TÁI CHẾ</div>
              <p>Bản xem trước chưa phải thành phẩm được kiểm định. Tạo dự án từ nguyên liệu đã thu mua, hoàn thiện và kiểm định thành phẩm để đăng bán.</p>
              <button type="button" className="pill-btn-filled" onClick={() => navigate('/upcycling')}>Đến dự án tái chế</button>
            </div>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className="pill-btn-outlined"
                onClick={() => navigate('/products')}
                style={{ flex: 1, height: '42px', cursor: 'pointer' }}
                disabled={loading}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="pill-btn-filled"
                disabled={loading || (isEdit && !productLoaded)}
                style={{ flex: 1, height: '42px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Sparkles size={16} />
                <span>{loading ? 'Đang lưu...' : (isEdit && !productLoaded ? (productLoadError ? 'Không tải được sản phẩm' : 'Đang tải...') : (isEdit ? 'Lưu cập nhật' : 'Lưu & Mở bán'))}</span>
              </button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductForm;
