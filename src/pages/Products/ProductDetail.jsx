import React from 'react';
import { Row, Col, Typography, Space, Button, Tag, Divider, Breadcrumb } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Recycle, 
  Layers, 
  Calendar, 
  Tag as TagIcon, 
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency, formatShortDate } from '../../utils/formatters';
import { authFetch } from '../../services/auth';
import { formatCatalogText } from '../../utils/catalogText';
import { message } from 'antd';

const { Title, Text, Paragraph } = Typography;

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await authFetch(`/api/Products/${id}`);
        setProduct(res.data || res);
      } catch (err) {
        message.error('Lỗi tải sản phẩm: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>;
  if (!product) return <div style={{ padding: '40px', textAlign: 'center' }}>Không tìm thấy sản phẩm</div>;

  const imgs = product.images || product.imageUrls || [];
  const gallery = imgs.map(img => img.imageUrl || img.url || img).filter(Boolean);

  return (
    <div className="rw-admin-page">
      {/* Top Navigation & Breadcrumb */}
      <div style={{ marginBottom: '20px' }}>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="editorial-sub">HỒ SƠ SẢN PHẨM</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
                {product.title || product.name}
              </h1>
              {product.isUnique && (
                <span className="one-of-one-pill">
                  <Sparkles size={12} /> ĐỘC BẢN 1-OF-1
                </span>
              )}
              {product.productType !== 'Upcycled' ? <Tag>Ngừng kinh doanh · dữ liệu cũ</Tag> : product.isPreview ? <Tag>Ý tưởng tái chế</Tag> : <StatusBadge status={product.status} />}
            </div>
          </div>

        </div>
      </div>

      {/* Main Product Showcase: Large Images & Specifications */}
      <Row gutter={[32, 32]} style={{ marginBottom: '40px' }}>
        {/* Left Column: Product Images */}
        <Col xs={24} lg={12}>
          <div className="flat-card" style={{ padding: '0', overflow: 'hidden' }}>
            {gallery.length > 0 ? <img
              src={gallery[0]}
              alt={product.title || product.name}
              style={{
                width: '100%',
                height: '480px',
                objectFit: 'cover',
                display: 'block',
              }}
            /> : <div style={{ minHeight: 320, display: 'grid', placeItems: 'center', color: '#70706f' }}>Chưa có ảnh sản phẩm</div>}
          </div>

          {/* Sub Images Gallery */}
          {gallery.length > 1 && (
            <Row gutter={[12, 12]} style={{ marginTop: '12px' }}>
              {gallery.map((imgUrl, idx) => (
                <Col span={6} key={idx}>
                  <img
                    src={imgUrl}
                    alt={`${product.title || product.name} — góc ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '90px',
                      objectFit: 'cover',
                      border: '1px solid #e5e5e4',
                    }}
                  />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* Right Column: Specifications & Brand Story */}
        <Col xs={24} lg={12}>
          <div className="flat-card" style={{ padding: '32px', height: '100%' }}>
            <div style={{ marginBottom: '24px' }}>
              <div className="editorial-sub">GIÁ NIÊM YẾT</div>
              <div
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: '36px',
                  fontWeight: 600,
                  color: '#10100f',
                }}
              >
                {formatCurrency(product.price)}
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Spec grid */}
            <div className="rw-spec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Mã sản phẩm</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{product.id}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Khả năng bán</span>
                <span style={{ fontWeight: 600, color: !product.isPreview && [0, '0', 'Available'].includes(product.status) && product.stockQuantity > 0 ? '#1b4d2e' : '#991b1b' }}>
                  {product.productType !== 'Upcycled' ? 'Ngừng kinh doanh' : product.isPreview ? 'Ý tưởng tái chế, chưa có thành phẩm' : [2, '2', 'Sold'].includes(product.status) ? 'Đã bán' : [1, '1', 'Reserved'].includes(product.status) ? 'Đang được giữ' : product.stockQuantity > 0 ? 'Có thể mua 1 món' : 'Không còn hàng'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Danh mục</span>
                <span style={{ fontWeight: 600 }}>{product.categoryName || product.category || '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Thương hiệu</span>
                <span style={{ fontWeight: 600 }}>{product.brandName || product.brand || '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Kích cỡ</span>
                <span style={{ fontWeight: 600 }}>{product.size || '-'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#70706f', display: 'block' }}>Màu sắc</span>
                <span style={{ fontWeight: 600 }}>{product.color || '-'}</span>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            {/* Original Material Source */}
            <div style={{ marginBottom: '20px' }}>
              <div className="editorial-sub" style={{ marginBottom: '6px' }}>MÔ TẢ</div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#10100f', backgroundColor: '#f7f7f6', padding: '10px 14px', borderLeft: '3px solid #10100f' }}>
                {formatCatalogText(product.description || product.originalMaterial) || 'Không có mô tả'}
              </div>
            </div>

          </div>
        </Col>
      </Row>

    </div>
  );
};

export default ProductDetail;
