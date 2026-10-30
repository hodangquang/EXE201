import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { usePublicProducts } from "../../hooks/usePublicProducts";
import AccountMenu from "../../components/common/AccountMenu";
import RainsFooter from "../../components/common/RainsFooter";
import { useCart } from "../../contexts/CartContext";
import "./HomePage.css";

/* â”€â”€ Hero banners â€” parallax scroll, Rains.com style â”€â”€ */
const BANNERS = [
  {
    img: "https://images.pexels.com/photos/7037978/pexels-photo-7037978.jpeg",
    title: "Bộ sưu tập\ntái thiết kế.",
    sub: "Một vòng đời mới cho những món đồ cũ.",
    cta: "Khám phá bộ sưu tập",
    href: "/product/suva-hardshell-jacket",
  },
  {
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2400&q=90",
    title: "Mặc lại,\nyêu thêm.",
    sub: "Mỗi món đồ mang một câu chuyện.",
    cta: "Khám phá câu chuyện",
    href: "/product/suva-hardshell-jacket",
  },
];





/* â”€â”€ Reusable Sticky Scrub Banner (Exact copy of first hero banner mechanics) â”€â”€ */
function StickyScrubBanner({ id, img, title, sub, buttons, titleClass = "" }) {
  const trackRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    let rafId;

    const updateParallax = () => {
      if (!trackRef.current || !imgRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const trackHeight = trackRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const totalDistance = trackHeight - windowHeight;

      if (totalDistance > 0) {
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / totalDistance, 0), 1);
        const imgHeight = imgRef.current.offsetHeight;
        const maxPan = Math.max(0, imgHeight - windowHeight);

        // Translate image up as user scrolls down â€” exact match to hero banner
        const panY = progress * maxPan;
        imgRef.current.style.transform = `translate3d(0, ${-panY}px, 0)`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="rw-hero-track" id={id} ref={trackRef}>
      <div className="rw-hero-sticky">
        <img ref={imgRef} src={img} alt={title} className="rw-hero-tall-img" />
        <div className="rw-hero-text-block">
          <h2 className={`rw-hero-big-title ${titleClass}`}>{title}</h2>
          <p className="rw-hero-big-sub">{sub}</p>
          <div className="rw-btn-pill-group">
            {buttons.map((btn, idx) => (
              <a
                key={btn.text}
                href={btn.href || "#"}
                className={`rw-hero-action-pill ${idx > 0 ? "rw-hero-action-pill--secondary" : ""}`}
              >
                {btn.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { openCart, cartItemCount } = useCart();
  const { products: PRODUCTS, loading } = usePublicProducts();
  const heroTrackRef = useRef(null);
  const imgRef = useRef(null);
  const [navHidden, setNavHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleVideoMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  /* Butter-smooth 60fps parallax controller using requestAnimationFrame */
  useEffect(() => {
    let rafId;

    const updateParallax = () => {
      const currentScrollY = window.scrollY;

      // Nav bar visibility: hide when scrolling down past 50px, show when scrolling up
      if (currentScrollY > 60 && currentScrollY > lastScrollY) {
        setNavHidden(true);
      } else {
        setNavHidden(false);
      }
      setLastScrollY(currentScrollY);

      if (!heroTrackRef.current || !imgRef.current) return;
      const rect = heroTrackRef.current.getBoundingClientRect();
      const trackHeight = heroTrackRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const totalDistance = trackHeight - windowHeight;

      if (totalDistance > 0) {
        const scrolled = -rect.top;
        const progress = Math.min(Math.max(scrolled / totalDistance, 0), 1);
        const imgHeight = imgRef.current.offsetHeight;
        const maxPan = Math.max(0, imgHeight - windowHeight);

        // Translate image up as user scrolls down
        const panY = progress * maxPan;
        imgRef.current.style.transform = `translate3d(0, ${-panY}px, 0)`;
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Initial call
    updateParallax();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [lastScrollY]);

  return (
    <div className="rw">
      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          NAV â€” exact Rains.com structure
          Logo pill left Â· links center Â· pills right
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {/* Announcement Bar */}
      <div className="rw-announcement">
        <div className="rw-announcement-inner">
          <span>Thời trang tuần hoàn, thêm vòng đời mới</span>
        </div>
      </div>

      <nav className={`rw-nav ${navHidden ? "rw-nav--hidden" : ""}`}>
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
              <a href="/men" onClick={(e) => { e.preventDefault(); navigate('/men'); }} className="rw-nav-lk">
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
            <button className="rw-nav-pill" type="button" aria-label="Tìm kiếm">
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
            <AccountMenu className="rw-nav-pill" />
          </div>
        </div>
      </nav>


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO BANNER â€” Sticky Scrub Parallax (Rains.com)
          Scroll track keeps container sticky while image pans
          from head -> torso -> feet on mouse wheel
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="rw-hero-track" style={{ marginTop: '-66px' }} ref={heroTrackRef}>
        <div className="rw-hero-sticky">
          {/* Tall editorial image */}
          <img
            ref={imgRef}
            src="https://images.pexels.com/photos/7037978/pexels-photo-7037978.jpeg"
            alt="Thời trang tuần hoàn tại REWEAR"
            className="rw-hero-tall-img"
          />

          {/* Text overlay â€” stays pinned at bottom left */}
          <div className="rw-hero-text-block">
            <h1 className="rw-hero-big-title">Mặc lại.<br />Yêu thêm.</h1>
            <p className="rw-hero-big-sub">REWEAR — Một vòng đời mới bắt đầu từ tủ đồ của bạn.</p>
            <a href="/new-in" onClick={(e) => { e.preventDefault(); navigate('/new-in'); }} className="rw-hero-action-pill">
              Khám phá bộ sưu tập
            </a>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PRODUCT GRID 1 â€” NEW IN (Directly after Hero Banner)
          Matches Rains.com exact layout
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="rw-grid-section" id="new-in">
        <div className="rw-grid-header">
          <h2 className="rw-grid-title">Mới về</h2>
          <button
            onClick={() => navigate('/new-in')}
            className="rw-view-all"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            XEM TẤT CẢ &rarr;
          </button>
        </div>

        {/* Horizontal scrollable row â€” exactly like Rains */}
        <div className="rw-prod-row">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="rw-prod-item"
              onClick={() => navigate(`/product/${p.id}`)}
              style={{ cursor: "pointer" }}
            >
              <div className="rw-prod-photo">
                <img src={p.img} alt={p.name} />
              </div>
              <div className="rw-prod-info">
                <div className="rw-prod-top">
                  <span className="rw-prod-name">{p.name}</span>
                  <span className="rw-prod-price">{p.price}</span>
                </div>
                <div className="rw-prod-colors">
                  {p.isPreview && <span className="rw-color-more">Sắp mở bán</span>}
                  {p.colors.map((c) => (
                    <span
                      key={c}
                      className="rw-color-dot"
                      style={{ background: c }}
                    />
                  ))}
                  <span className="rw-color-more">+</span>
                </div>
              </div>
            </div>
          ))}

          {/* Arrow â†’ scroll right */}
          <div className="rw-row-arrow">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          SPLIT 50/50 BANNER â€” Dành cho nữ / Dành cho nam
          Matches user reference screenshot 1
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="rw-split-section" id="women">
        <a href="#clothing" className="rw-split-card">
          <img
            src="https://images.pexels.com/photos/14991376/pexels-photo-14991376.jpeg"
            alt="Dành cho nữ"
            className="rw-split-img"
          />
          <div className="rw-split-overlay">
            <h2 className="rw-split-title">Dành cho nữ</h2>
          </div>
        </a>
        <a href="#clothing" className="rw-split-card" id="men">
          <img
            src="https://images.pexels.com/photos/32694250/pexels-photo-32694250.jpeg"
            alt="Dành cho nam"
            className="rw-split-img"
          />
          <div className="rw-split-overlay">
            <h2 className="rw-split-title">Dành cho nam</h2>
          </div>
        </a>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          JACKET VIDEO CAMPAIGN SECTION
          Video advertises waterproof jackets
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="rw-video-section">
        <div className="rw-video-container">
          <video
            ref={videoRef}
            key="jacket_video_pexel_7038135"
            src="https://www.pexels.com/download/video/7038135/"
            poster="https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=2400&q=90"
            className="rw-video-element"
            autoPlay
            muted
            loop
            playsInline
          />
          <div className="rw-video-gradient" />

          {/* Text overlay */}
          <div className="rw-video-content">
            <span className="rw-video-tag">REWEAR / VÒNG ĐỜI MỚI</span>
            <h2 className="rw-video-heading">
              Thiết kế cho hành trình tiếp theo.
            </h2>
            <p className="rw-video-desc">
              Những món đồ đã có được tiếp tục sử dụng,
              phối mới và kể thêm câu chuyện riêng.
            </p>
            <div className="rw-video-actions">
              <button
                onClick={() => navigate('/product/suva-hardshell-jacket')}
                className="rw-hero-action-pill"
                style={{ border: 'none', cursor: 'pointer' }}
              >
                Khám phá áo khoác
              </button>

              {/* Play & Mute controls */}
              <div className="rw-video-controls">
                <button
                  className="rw-ctrl-btn"
                  onClick={toggleVideoPlay}
                  title={isPlaying ? "Tạm dừng" : "Phát"}
                >
                  {isPlaying ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
                <button
                  className="rw-ctrl-btn"
                  onClick={toggleVideoMute}
                  title={isMuted ? "Bật tiếng" : "Tắt tiếng"}
                >
                  {isMuted ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          PRODUCT ROW 2 â€” 1-OF-1 PIECES (Directly below Video)
          Light grey bg, 5 items with description
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}


      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          TRAVEL BAGS BANNER (Sticky scrub scroll like hero)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <StickyScrubBanner
        id="travel-bags"
        img="https://images.pexels.com/photos/15639609/pexels-photo-15639609.jpeg"
        title="Túi đồng hành."
        sub="Những món đồ theo bạn từ ngày thường đến chuyến đi xa."
        buttons={[
          { text: "Xem túi xách", href: "#" },
          { text: "Xem ba lô", href: "#" },
        ]}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FOOTWEAR BANNER (Sticky scrub scroll like hero)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <StickyScrubBanner
        id="footwear"
        img="https://images.pexels.com/photos/25745267/pexels-photo-25745267.jpeg"
        title="Giày dép."
        titleClass="rw-hero-big-title--huge"
        sub="Tiếp bước theo cách của riêng bạn."
        buttons={[
          { text: "Khám phá bộ sưu tập", href: "#" },
          { text: "Khám phá câu chuyện", href: "#" },
        ]}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CLOTHING BANNER (Sticky scrub scroll like hero)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <StickyScrubBanner
        id="clothing"
        img="https://images.pexels.com/photos/17474399/pexels-photo-17474399.jpeg"
        title="Quần áo."
        sub="Những lớp trang phục để phối theo cách bạn muốn."
        buttons={[
          { text: "Xem quần áo", href: "#" },
          { text: "Xem áo khoác", href: "#" },
        ]}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HOME AWAY BANNER (Sticky scrub scroll like hero)
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <StickyScrubBanner
        id="homeaway"
        img="https://images.pexels.com/photos/36289404/pexels-photo-36289404.jpeg"
        title="Đi và trở về."
        sub="Phụ kiện đồng hành trong những ngày bận rộn."
        buttons={[{ text: "Khám phá phụ kiện", href: "#" }]}
      />

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FOOTER â€” Exact Rains.com Clone
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <RainsFooter />
    </div>
  );
}
