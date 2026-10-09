import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  ArrowLeft,
  X,
  Plus,
  Minus,
  Check,
  Maximize2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { usePublicProducts } from "../../hooks/usePublicProducts";
import RainsFooter from "../../components/common/RainsFooter";
import AccountMenu from "../../components/common/AccountMenu";
import { useCart } from "../../contexts/CartContext";
import { toast } from 'react-toastify';
import "./StoreProductPage.css";

export default function StoreProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { products, loading, getProductById } = usePublicProducts();
  const { addToCart, openCart, cartOpen, cartItemCount } = useCart();

  // RECOMMENDED_PRODUCTS
  const RECOMMENDED_PRODUCTS = products.slice(0, 4).map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    img: p.images && p.images.length > 0 ? p.images[0].src : '',
    colors: p.colors ? p.colors.map(c => c.hex) : [],
  }));

  // Load product
  const product = getProductById(id);

  // States
  const [isPlaying, setIsPlaying] = useState(true);
  const [conveyorSpeed, setConveyorSpeed] = useState(36); // seconds per loop
  const [hotspotOpen, setHotspotOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);
  const [manualOffset, setManualOffset] = useState(0);

  const [descriptionOpen, setDescriptionOpen] = useState(true);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const [detailImage, setDetailImage] = useState(product?.images?.[2]?.src || product?.images?.[0]?.src || "");

  const conveyorTrackRef = useRef(null);
  const heroSectionRef = useRef(null);
  const [showQuickBar, setShowQuickBar] = useState(false);

  useEffect(() => {
    const updateQuickBarVisibility = () => {
      const heroBottom = heroSectionRef.current?.getBoundingClientRect().bottom;
      setShowQuickBar(typeof heroBottom === "number" && heroBottom <= 0);
    };

    updateQuickBarVisibility();
    window.addEventListener("scroll", updateQuickBarVisibility, { passive: true });
    window.addEventListener("resize", updateQuickBarVisibility);
    return () => {
      window.removeEventListener("scroll", updateQuickBarVisibility);
      window.removeEventListener("resize", updateQuickBarVisibility);
    };
  }, [product?.id]);

  // If product changes, reset defaults
  useEffect(() => {
    if (product) {
      setDetailImage(product?.images?.[2]?.src || product?.images?.[0]?.src || "");
    }
  }, [product?.id]);

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!product?.id || isAdding || !Number.isFinite(product.rawPrice)) return;

    setIsAdding(true);
    try {
      await addToCart(product);

      setAddedSuccess(true);
      toast.success('Đã thêm sản phẩm vào giỏ hàng.');
      
      setTimeout(() => {
        setAddedSuccess(false);
      }, 2000); // keep the success message for 2 seconds in case they close the drawer quickly
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Không thể thêm vào giỏ hàng. Vui lòng đăng nhập hoặc thử lại sau.');
    } finally {
      setIsAdding(false);
    }
  };

  // Nudge conveyor
  const nudgeConveyor = (direction) => {
    if (!conveyorTrackRef.current) return;
    const delta = direction === "left" ? 380 : -380;
    setManualOffset((prev) => prev + delta);
  };

  const scrollToProductSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Duplicate images for infinite seamless loop
  const galleryImages = product?.images || [];
  const baseImages = galleryImages.length <= 3 ? [...galleryImages, ...galleryImages] : galleryImages;
  const loopedImages = [...baseImages, ...baseImages];

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e5e5e4' }}>Đang tải sản phẩm...</div>;
  if (!product) return <div style={{ padding: '100px', textAlign: 'center' }}>Không tìm thấy sản phẩm</div>;

  return (
    <div className={`rains-pdp ${showQuickBar && !cartOpen && !zoomImage ? "rains-pdp--quickbar-visible" : ""}`}>
      {/* ══════════════════════════════════════════
          TOP NAVIGATION — Rains.com exact clone
      ══════════════════════════════════════════ */}
      {/* Announcement Bar — hidden when cart is open */}
      {!cartOpen && (
        <div className="rw-announcement" style={{ zIndex: 300, position: 'relative' }}>
          <div className="rw-announcement-inner">
            <span>Thời trang tuần hoàn, thêm vòng đời mới</span>
          </div>
        </div>
      )}
      <nav className="rains-top-nav">
        <div className="rains-top-nav-inner">
          {/* Left: Brand pill & Menu links */}
          <div className="rains-top-nav-left">
            <Link to="/" className="rains-logo-pill" title="Về trang chủ">
              REWEAR
            </Link>

            <div className="rains-nav-menu">
              <Link to="/#new-in" className="rains-nav-link">
                Mới về
              </Link>
              <Link to="/women" className="rains-nav-link">
                Nữ
              </Link>
              <Link to="/men" className="rains-nav-link">
                Nam
              </Link>
              <Link to="/world" className="rains-nav-link">
                Thế giới REWEAR
              </Link>
              <Link to="/about" className="rains-nav-link rains-nav-link--about">
                Giới thiệu
              </Link>
            </div>
          </div>

          {/* Right: Search & Cart pills */}
          <div className="rains-top-nav-right">
            <Link to="/about" className="rains-nav-link rains-nav-about-mobile">
              Giới thiệu
            </Link>
            <Link to="/" className="rains-back-pill" title="Quay lại trang chủ">
              <ArrowLeft size={13} />
              <span>Quay lại</span>
            </Link>

            <button
              className="rains-pill-btn"
              onClick={() => alert("Tính năng tìm kiếm đang được hoàn thiện.")}
              title="Tìm trong bộ sưu tập"
            >
              <Search size={14} />
              <span>Tìm kiếm</span>
            </button>

            <button
              className="rains-pill-btn rains-pill-btn--cart"
              onClick={openCart}
              title="Xem giỏ hàng"
            >
              <ShoppingBag size={14} />
              <span>Giỏ hàng ({cartItemCount})</span>
            </button>

            <AccountMenu className="rains-pill-btn" withSpan />
          </div>
        </div>
      </nav>

      {showQuickBar && !cartOpen && !zoomImage && (
        <div className="rains-product-quickbar" role="region" aria-label="Thanh mua nhanh">
          <nav className="rains-product-quickbar-nav" aria-label="Điều hướng nội dung sản phẩm">
            {product.description && (
              <button type="button" onClick={() => scrollToProductSection("product-description")}>
                Mô tả
              </button>
            )}
            <button type="button" onClick={() => scrollToProductSection("product-recommendations")}>
              Gợi ý sản phẩm
            </button>
          </nav>

          <div className="rains-product-quickbar-purchase">
            <div className="rains-product-quickbar-summary">
              <span className="rains-product-quickbar-name">{product.name}</span>
              {product.price && <span className="rains-product-quickbar-price">{product.price}</span>}
            </div>
            <button
              type="button"
              className="rains-product-quickbar-button"
              onClick={handleAddToCart}
              disabled={isAdding || !Number.isFinite(product.rawPrice)}
            >
              {isAdding ? "ĐANG THÊM..." : addedSuccess ? "ĐÃ THÊM VÀO GIỎ" : "THÊM VÀO GIỎ"}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          HERO STAGE: CONTINUOUS CONVEYOR BELT + FLOATING CARD
      ══════════════════════════════════════════ */}
      <section className="rains-hero-viewport" ref={heroSectionRef}>
        <main className="rains-conveyor-viewport">
          {/* Conveyor Track Container */}
          <div
            className={`rains-conveyor-track ${!isPlaying ? "rains-conveyor-track--paused" : ""}`}
            ref={conveyorTrackRef}
            style={{
              animationDuration: `${conveyorSpeed}s`,
              transform: manualOffset !== 0 ? `translateX(${manualOffset}px)` : undefined,
            }}
          >
            {loopedImages.map((imgItem, idx) => (
              <div
                key={`${imgItem.id}-${idx}`}
                className="rains-conveyor-item"
              >
                <div className="rains-img-card">
                  <img
                    src={imgItem.src}
                    alt={imgItem.alt}
                    className="rains-conveyor-img"
                    loading={idx < 4 ? "eager" : "lazy"}
                    onClick={() => setZoomImage(imgItem)}
                  />

                  {/* Fullscreen zoom hint on hover */}
                  <button
                    className="rains-zoom-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomImage(imgItem);
                    }}
                    title="Phóng to ảnh"
                  >
                    <Maximize2 size={14} />
                  </button>

                  {/* Interactive Hotspot '+' Button */}
                  {imgItem.hasHotspot && (
                    <div className="rains-hotspot-wrapper" style={{ top: imgItem.hotspot.y, left: imgItem.hotspot.x }}>
                      <button
                        className={`rains-hotspot-btn ${hotspotOpen ? "rains-hotspot-btn--active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHotspotOpen(!hotspotOpen);
                        }}
                        title="Xem chi tiết sản phẩm"
                        aria-label="Điểm xem chi tiết sản phẩm"
                      >
                        <Plus size={16} />
                        <span className="rains-hotspot-ping" />
                      </button>

                      {/* Hotspot Floating Tooltip */}
                      {hotspotOpen && (
                        <div className="rains-hotspot-tooltip">
                          <div className="rains-hotspot-tt-header">
                            <span className="rains-hotspot-tt-title">{imgItem.hotspot.title}</span>
                            <span className="rains-hotspot-tt-badge">{imgItem.hotspot.badge}</span>
                          </div>
                          <p className="rains-hotspot-tt-desc">{imgItem.hotspot.desc}</p>
                          <div className="rains-hotspot-tt-footer">
                            <span className="rains-hotspot-tt-tag">CHI TIẾT SẢN PHẨM</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Scroll hint to discover the lower details */}
        <a
          href="#product-details"
          className="rains-scroll-down-hint"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("product-details")?.scrollIntoView({ behavior: "smooth" });
          }}
          title="Cuộn để xem chi tiết sản phẩm"
        >
          <span>Xem chi tiết</span>
          <ChevronDown size={14} />
        </a>

        {/* ══════════════════════════════════════════
            FLOATING PRODUCT SELECTION WIDGET CARD
        ══════════════════════════════════════════ */}
        <aside className="rains-floating-widget" aria-label="Tùy chọn sản phẩm">
          {/* Module 1: Title, Price, Description, Fit Selector */}
          <div className="rains-glass-card rains-glass-card--header">
            <div className="rains-title-price-row">
              <h1 className="rains-product-name">{product.name}</h1>
              {product.price && <span className="rains-product-price">{product.price}</span>}
            </div>

            {product.description && <p className="rains-product-subtitle">{product.description}</p>}
          </div>

          {product.color && (
            <div className="rains-glass-card rains-glass-card--colors">
              <div className="rains-color-header">
                <span className="rains-label-bold">Màu sắc</span>
                <span className="rains-label-val">{product.color}</span>
              </div>
            </div>
          )}

          {product.size && (
            <div className="rains-glass-card rains-glass-card--size">
              <div className="rains-size-header">
                <span className="rains-label-bold">Kích cỡ</span>
              </div>
              <div className="rains-size-options">
                <span className="rains-readonly-variant">{product.size}</span>
              </div>
            </div>
          )}

          {/* Module 4: Add to Cart CTA */}
          <div className="rains-glass-card rains-glass-card--action">
            <button
              className={`rains-add-to-cart-btn ${isAdding ? "rains-add-to-cart-btn--loading" : ""} ${addedSuccess ? "rains-add-to-cart-btn--success" : ""
                }`}
              onClick={handleAddToCart}
              disabled={isAdding || !Number.isFinite(product.rawPrice)}
            >
              {addedSuccess ? (
                <span className="rains-btn-content">
                  <Check size={16} /> ĐÃ THÊM VÀO GIỎ
                </span>
              ) : isAdding ? (
                <span className="rains-btn-content">ĐANG CẬP NHẬT GIỎ...</span>
              ) : (
                <span className="rains-btn-content">
                  {product.price ? `${product.price} — THÊM VÀO GIỎ` : 'Chưa có giá từ API'}
                </span>
              )}
            </button>

          </div>
        </aside>
      </section>

      {/* ══════════════════════════════════════════
          WARRANTY BANNER
      ══════════════════════════════════════════ */}
      <div className="rains-warranty-banner">
        <span>REWEAR — thời trang tuần hoàn.</span>
        <span>Mỗi món đồ, một hành trình mới.</span>
      </div>

      {/* ══════════════════════════════════════════
          LOWER SECTION: 2-COLUMN DETAIL
          "ở dưới 1 bên là hình 1 bên là như hình"
          Matches Screenshots 1, 2, 3:
          Left: Close-up product image
          Right: Breadcrumbs + Expandable Accordions
      ══════════════════════════════════════════ */}
      <section className="rains-detail-section" id="product-details">
        <div className="rains-detail-container">
          {/* Left Column: Product Image (Dài bằng 100% form bên cạnh) */}
          <div className="rains-detail-left">
            <div className="rains-detail-img-card">
              <img
                src={detailImage}
                alt={product.name}
                className="rains-detail-img"
              />
              <div className="rains-detail-view-switches">
                {product?.images?.slice(0, 3).map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`rains-detail-switch-btn ${detailImage === img.src ? "rains-detail-switch-btn--active" : ""}`}
                    onClick={() => setDetailImage(img.src)}
                  >
                    {idx === 0 ? "Ảnh 1" : idx === 1 ? "Ảnh 2" : "Ảnh 3"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Breadcrumbs & Accordion Sections (matches Screenshots 2 & 3) */}
          <div className="rains-detail-right">
            {/* Breadcrumb Navigation */}
            <div className="rains-detail-breadcrumb">
              <Link to="/" className="rains-bc-link">Trang chủ</Link>
              <span className="rains-bc-current">{product.name}</span>
            </div>

            {product.description && (
              <div className="rains-accordion-group" id="product-description">
                <div className="rains-accordion-item">
                <button
                  type="button"
                  className="rains-accordion-header"
                  onClick={() => setDescriptionOpen(value => !value)}
                >
                  <span className="rains-acc-title rains-acc-title--main">Mô tả</span>
                  <span className="rains-acc-icon">
                    {descriptionOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                {descriptionOpen && (
                  <div className="rains-accordion-content">
                    <p>{product.description}</p>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          YOU MAY ALSO LIKE SECTION (Screenshot 1)
      ══════════════════════════════════════════ */}
      <section className="rains-rec-section" id="product-recommendations">
        <div className="rains-rec-header">
          <h2 className="rains-rec-title">Có thể bạn thích</h2>
        </div>

        <div className="rains-rec-slider-wrap">
          <div className="rains-rec-grid">
            {RECOMMENDED_PRODUCTS.map((item, idx) => (
              <div key={item.id} className="rains-rec-card">
                <div className="rains-rec-img-container">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="rains-rec-img"
                    loading="lazy"
                  />
                  <div className="rains-rec-card-badge">Xem nhanh</div>
                </div>

                <div className="rains-rec-info">
                  <div className="rains-rec-info-top">
                    <h3 className="rains-rec-name">{item.name}</h3>
                    <span className="rains-rec-price">{item.price}</span>
                  </div>
                  <div className="rains-rec-info-bottom">
                    <div className="rains-rec-colors">
                      {item.colors.slice(0, 3).map((c, i) => (
                        <span
                          key={i}
                          className="rains-rec-color-dot"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      {item.colors.length > 3 && (
                        <span className="rains-rec-color-plus">
                          <Plus size={8} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Chevron Next Button (matches Screenshot 1) */}
          <button
            className="rains-rec-next-btn"
            title="Gợi ý tiếp theo"
            onClick={() => alert("Các gợi ý tiếp theo đang được cập nhật.")}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER — Exact Rains.com Clone (Screenshot 2)
      ══════════════════════════════════════════ */}
      <RainsFooter />

      {/* ══════════════════════════════════════════
          FULLSCREEN ZOOM LIGHTBOX
      ══════════════════════════════════════════ */}
      {zoomImage && (
        <div className="rains-lightbox-backdrop" onClick={() => setZoomImage(null)}>
          <button
            className="rains-lightbox-close"
            onClick={() => setZoomImage(null)}
            title="Đóng ảnh xem trước"
          >
            <X size={24} />
          </button>
          <img
            src={zoomImage.src}
            alt={zoomImage.alt}
            className="rains-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
