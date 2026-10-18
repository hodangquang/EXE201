import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Shirt } from 'lucide-react';

// Presentation only: catalog selection and loading still belong to the existing hook.
export default function ProductListingGrid({ products, loading, columns }) {
  return (
    <main className={`new-in-grid grid-${columns}`} aria-label="Danh sách sản phẩm" aria-busy={loading}>
      {loading ? <p className="new-in-state" role="status">Đang tải sản phẩm…</p>
        : products.length === 0 ? <p className="new-in-state" role="status">Chưa có sản phẩm để hiển thị. Bạn có thể thử tải lại trang.</p>
        : products.map(p => (
          <Link className="new-in-product-card" key={p.id} to={`/product/${p.id}`}>
            <div className="new-in-product-img-wrapper">
              {p.hasImage ? <><img src={p.img} alt={p.name} loading="lazy" decoding="async" />{p.images?.[1]?.src && p.images[1].src !== p.img && <img className="catalog-product-alternate" src={p.images[1].src} alt="" aria-hidden="true" loading="lazy" decoding="async" />}</> : <div className="catalog-image-placeholder"><Shirt size={32} aria-hidden="true" /><span>Ảnh đang cập nhật</span></div>}
              <span className="catalog-card-arrow" aria-hidden="true"><ArrowUpRight size={18} /></span>
            </div>
            <div className="new-in-product-info">
              <div className="new-in-product-details-left">
                <span className="new-in-name">{p.name}</span>
                <div className="new-in-colors">
                  {p.colors?.map((color, i) => <span key={color.id ?? i} className="color-swatch" title={color.name} style={{ backgroundColor: color.hex }} />)}
                  {p.size && <span className="catalog-card-size">Cỡ {p.size}</span>}
                </div>
              </div>
              <span className="new-in-price">{p.price || 'Chưa cập nhật giá'}</span>
            </div>
          </Link>
        ))}
    </main>
  );
}
