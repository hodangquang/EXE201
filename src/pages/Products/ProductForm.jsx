import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Row, Col, message, Upload } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Upload as UploadIcon } from 'lucide-react';
import { authFetch } from '../../services/auth';

const { Option } = Select;
const { TextArea } = Input;

export const ProductForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
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
            Description: product.description,
            BrandId: product.brandId || product.brand?.id,
            CategoryId: product.categoryId || product.category?.id || product.category,
            Price: product.price,
            Condition: product.condition ?? 1,
            Size: product.size,
            Color: product.color,
          });
          const imgs = product.images || product.imageUrls || [];
          setExistingImages(imgs.map(img => img.imageUrl || img.url || img));
          setProductLoaded(true);
        })
        .catch(err => {
          setProductLoadError(true);
          message.error('Lỗi tải sản phẩm: ' + err.message);
        });
    }
  }, [id, isEdit, form]);

  const onFinish = async (values) => {
    if (isEdit) {
      const imageUrls = existingImages.map(url => url.trim()).filter(Boolean);

      try {
        setLoading(true);
        // Keep the PUT body aligned with PUT /api/Products/{id}.
        const payload = {
          title: values.Title,
          description: values.Description || '',
          brandId: values.BrandId,
          categoryId: values.CategoryId,
          price: Number(values.Price),
          condition: Number(values.Condition ?? 1),
          size: values.Size ?? '',
          color: values.Color ?? '',
          imageUrls,
        };
        await authFetch(`/api/Products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        message.success(`Đã cập nhật sản phẩm "${values.Title}" thành công!`);
        navigate('/products');
      } catch (error) {
        message.error(error.message || 'Lỗi khi cập nhật sản phẩm');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (fileList.length === 0) {
      message.error('Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm!');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('Title', values.Title);
      formData.append('Description', values.Description || '');
      formData.append('BrandId', values.BrandId);
      formData.append('CategoryId', values.CategoryId);
      formData.append('Price', values.Price);
      formData.append('Condition', values.Condition || 1);
      formData.append('Status', 0);

      if (values.Size) formData.append('Size', values.Size);
      if (values.Color) formData.append('Color', values.Color);

      fileList.forEach(file => {
        formData.append('Images', file.originFileObj);
      });

      await authFetch('/api/Products', {
        method: 'POST',
        body: formData
      });

      message.success(`Đã tạo sản phẩm "${values.Title}" thành công!`);
      navigate('/products');
    } catch (error) {
      message.error(error.message || 'Lỗi khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <div>
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

        <div className="editorial-sub">{isEdit ? 'EDIT RELEASE' : 'NEW RELEASE CREATION'}</div>
        <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
          {isEdit ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm thời trang tái chế'}
        </h1>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          Condition: 1,
          Size: 'L',
        }}
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
                <Col span={12}>
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
                <Col span={12}>
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
                <Col span={8}>
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
                <Col span={8}>
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
                <Col span={8}>
                  <Form.Item
                    name="Color"
                    label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Màu sắc</span>}
                  >
                    <Input placeholder="Indigo, Rêu, Kem..." style={{ borderRadius: 0 }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="Condition"
                label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Tình trạng đồ cũ (Condition)</span>}
                rules={[{ required: true, message: 'Vui lòng chọn tình trạng!' }]}
              >
                <Select>
                  <Option value={1}>1 - Như mới</Option>
                  <Option value={2}>2 - Tốt</Option>
                  <Option value={3}>3 - Khá</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="Description"
                label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Mô tả sản phẩm</span>}
              >
                <TextArea rows={4} placeholder="Mô tả phom dáng, xuất xứ vải..." style={{ borderRadius: 0 }} />
              </Form.Item>
            </div>
          </Col>

          <Col xs={24} lg={9}>
            {!isEdit && (
              <div className="flat-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <div className="editorial-sub" style={{ marginBottom: '12px' }}>HÌNH ẢNH SẢN PHẨM</div>

                <div style={{ backgroundColor: '#f7f7f6', padding: '10px 12px', borderLeft: '3px solid #10100f', fontSize: '12px', color: '#555', marginBottom: '16px' }}>
                  <b>Lưu ý:</b> Bạn có thể tải lên từ 1 đến 5 hình ảnh cho mỗi sản phẩm. Ảnh đầu tiên sẽ là ảnh đại diện.
                </div>

                <Form.Item
                  label={<span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Tải ảnh lên (Tối đa 5 ảnh)</span>}
                  required
                >
                  <Upload
                    customRequest={dummyRequest}
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    multiple
                    maxCount={5}
                    accept="image/*"
                  >
                    {fileList.length >= 5 ? null : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#70706f' }}>
                        <UploadIcon size={20} />
                        <div style={{ marginTop: 8, fontSize: '12px' }}>Tải ảnh lên</div>
                      </div>
                    )}
                  </Upload>
                </Form.Item>
              </div>
            )}

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
