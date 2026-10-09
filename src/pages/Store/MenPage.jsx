import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import { usePublicProducts } from "../../hooks/usePublicProducts";
import RainsFooter from "../../components/common/RainsFooter";
import { useCart } from "../../contexts/CartContext";
import "./NewInPage.css";
import "../Home/HomePage.css";

export default function MenPage() {
  const navigate = useNavigate();
  const { openCart, cartItemCount } = useCart();

  const { products: allProducts, loading } = usePublicProducts();

  const [columns, setColumns] = useState('four'); // two, four, eight
  const [showFilterBtn, setShowFilterBtn] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const showMoreElement = document.querySelector('.new-in-show-more');
      if (showMoreElement) {
        const rect = showMoreElement.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          setShowFilterBtn(false);
        } else {
          setShowFilterBtn(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="rw new-in-page">

      {/* Announcement Bar */}
      <div className="rw-announcement">
        <div className="rw-announcement-inner">
          <span>Thời trang tuần hoàn, thêm vòng đời mới</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="rw-nav">
        <div className="rw-nav-inner">
          {/* Left: Logo pill + nav links */}
          <div className="rw-nav-left">
            <a href="/" className="rw-logo-pill">
              REWEAR
            </a>
            <div className="rw-nav-menu">
              <a href="/new-in" onClick={(e) => { e.preventDefault(); navigate('/new-in'); }} className="rw-nav-lk">
                Mới về
              </a>
              <a href="/women" onClick={(e) => { e.preventDefault(); navigate('/women'); }} className="rw-nav-lk">
                Nữ
              </a>
              <a href="/men" onClick={(e) => { e.preventDefault(); navigate('/men'); }} className="rw-nav-lk active" style={{ fontWeight: 600 }}>
                Nam
              </a>
              <a href="/world" onClick={(e) => { e.preventDefault(); navigate('/world'); }} className="rw-nav-lk">
                Thế giới REWEAR
              </a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} className="rw-nav-lk">
                Giới thiệu
              </a>
            </div>
          </div>

          {/* Right: Search + Cart pills */}
          <div className="rw-nav-right">
            <button className="rw-nav-pill">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Tìm kiếm
            </button>
            <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Giỏ hàng ({cartItemCount})
            </button>
          </div>
        </div>
      </nav>

      {/* Header section */}
      <header className="new-in-header">
        <h1 className="new-in-title">Thời trang nam</h1>
        <p className="new-in-desc">
          Khám phá các sản phẩm dành cho nam tại REWEAR với nhiều phom dáng, chất liệu và cách phối đồ khác nhau.
        </p>
        <div className="new-in-categories">
          <button className="new-in-cat-pill active">Tất cả</button>
          <button className="new-in-cat-pill">Áo khoác</button>
          <button className="new-in-cat-pill">Quần áo</button>
          <button className="new-in-cat-pill">Giày dép</button>
          <button className="new-in-cat-pill">Phụ kiện</button>
        </div>
      </header>

      {/* Toolbar */}
      <div style={{ padding: '0 40px', fontSize: '11px', color: '#666', marginBottom: '-10px', marginTop: '10px' }}>
        {allProducts.length} sản phẩm
      </div>
      <div className="new-in-toolbar">
        <div className="new-in-sort">
          Sắp xếp: <strong>Đề xuất +</strong>
        </div>
        <div className="new-in-layout-toggles">
          <span className="toggle-group-label">Người mẫu</span>
          <span className="toggle-group-label active">Sản phẩm</span>
          <span style={{ margin: '0 8px', color: '#ccc' }}>|</span>
          <span className={`layout-option ${columns === 'two' ? 'active' : ''}`} onClick={() => setColumns('two')}>Hai</span>
          <span className={`layout-option ${columns === 'four' ? 'active' : ''}`} onClick={() => setColumns('four')}>Bốn</span>
          <span className={`layout-option ${columns === 'eight' ? 'active' : ''}`} onClick={() => setColumns('eight')}>Tám</span>
        </div>
      </div>


      {/* Product Grid */}
      <main className={`new-in-grid grid-${columns}`}>
        {allProducts.map((p, index) => (
          <div className="new-in-product-card" key={index} onClick={() => navigate(`/product/${p.id}`)}>
            <div className="new-in-product-img-wrapper">
              <img src={p.img} alt={p.name} />
            </div>
            <div className="new-in-product-info">
              <div className="new-in-product-details-left">
                <span className="new-in-name">{p.name}</span>
                <div className="new-in-colors">
                  {p.colors && p.colors.map((c, i) => (
                    <span key={i} className="color-swatch" style={{ backgroundColor: c }}></span>
                  ))}
                  <span style={{ fontSize: '9px', fontWeight: 600, marginLeft: '2px', alignSelf: 'center' }}>+</span>
                </div>
              </div>
              <span className="new-in-price">{p.price}</span>
            </div>
          </div>
        ))}
      </main>

      {/* Show More */}
      <div className="new-in-show-more">
        <div className="progress-text">Đang hiển thị {allProducts.length} sản phẩm</div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: '100%' }}></div>
        </div>
        <button className="btn-show-more" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Xem thêm</button>
      </div>

      {/* Floating Filter Button */}
      {showFilterBtn && (
        <button className="floating-filter-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          <span>Bộ lọc</span>
        </button>
      )}

      {/* Footer Included */}
      <RainsFooter />
    </div>
  );
}
