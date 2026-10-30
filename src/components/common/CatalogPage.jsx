import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
import { usePublicProducts } from '../../hooks/usePublicProducts';
import { useCart } from '../../contexts/CartContext';
import AccountMenu from './AccountMenu';
import ProductListingGrid from './ProductListingGrid';
import RainsFooter from './RainsFooter';
import EditorialHero from './EditorialHero';
import EditorialJournal from './EditorialJournal';
import '../../pages/Home/HomePage.css';
import '../../pages/Store/NewInPage.css';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLocaleLowerCase('vi').trim();
const navigation = [['/new-in', 'Mới về'], ['/women', 'Nữ'], ['/men', 'Nam'], ['/world', 'Thế giới REWEAR'], ['/about', 'Giới thiệu']];

const LAYOUT_OPTIONS = [
  {
    id: 'two',
    label: '2 cột',
    shortLabel: '2',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <rect x="1" y="2" width="6" height="12" rx="1" />
        <rect x="9" y="2" width="6" height="12" rx="1" />
      </svg>
    ),
  },
  {
    id: 'four',
    label: '4 cột',
    shortLabel: '4',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <rect x="0.5" y="2" width="2.5" height="12" rx="0.5" />
        <rect x="4.5" y="2" width="2.5" height="12" rx="0.5" />
        <rect x="8.5" y="2" width="2.5" height="12" rx="0.5" />
        <rect x="12.5" y="2" width="2.5" height="12" rx="0.5" />
      </svg>
    ),
  },
  {
    id: 'eight',
    label: '8 cột',
    shortLabel: '8',
    icon: (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <rect x="0" y="2" width="1.2" height="12" rx="0.4" />
        <rect x="2.1" y="2" width="1.2" height="12" rx="0.4" />
        <rect x="4.2" y="2" width="1.2" height="12" rx="0.4" />
        <rect x="6.3" y="2" width="1.2" height="12" rx="0.4" />
        <rect x="8.4" y="2" width="1.2" height="12" rx="0.4" />
        <rect x="10.5" y="2" width="1.2" height="12" rx="0.4" />
        <rect x="12.6" y="2" width="1.2" height="12" rx="0.4" />
        <rect x="14.7" y="2" width="1.2" height="12" rx="0.4" />
      </svg>
    ),
  },
];

export default function CatalogPage({ title, description, route, slides, stories, circularImage }) {
  const { products, loading } = usePublicProducts();
  const { openCart, cartItemCount } = useCart();
  const [params] = useSearchParams();
  const { hash } = useLocation();
  const [query, setQuery] = useState(params.get('q') || '');
  const [sort, setSort] = useState('original');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [columns, setColumns] = useState('four');
  const [limit, setLimit] = useState(12);
  const searchRef = useRef(null);
  useEffect(() => {
    if (hash === '#catalog-tools' && !loading) {
      searchRef.current?.focus({ preventScroll: true });
      searchRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
    }
  }, [hash, loading]);
  useEffect(() => { setQuery(params.get('q') || ''); }, [params]);
  useEffect(() => { setLimit(12); }, [query, sort, color, size]);
  useEffect(() => {
    const previous = document.title;
    document.title = `${title.replace(/\n/g, ' ')} — REWEAR`;
    return () => { document.title = previous; };
  }, [title]);
  const colors = useMemo(() => [...new Set(products.map(p => p.color).filter(Boolean))].sort(), [products]);
  const sizes = useMemo(() => [...new Set(products.map(p => p.size).filter(Boolean))].sort(), [products]);
  const filtered = useMemo(() => {
    const items = products.filter(p => (!query.trim() || normalize(`${p.name} ${p.color} ${p.size}`).includes(normalize(query))) && (!color || p.color === color) && (!size || p.size === size));
    if (sort === 'name') items.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'vi'));
    if (sort === 'price-asc' || sort === 'price-desc') items.sort((a, b) => {
      if (a.rawPrice === null) return b.rawPrice === null ? 0 : 1;
      if (b.rawPrice === null) return -1;
      return sort === 'price-asc' ? a.rawPrice - b.rawPrice : b.rawPrice - a.rawPrice;
    });
    return items;
  }, [products, query, color, size, sort]);
  const reset = () => { setQuery(''); setColor(''); setSize(''); setSort('original'); };
  const activeFilters = Number(Boolean(color)) + Number(Boolean(size));
  const focusSearch = () => { searchRef.current?.focus(); searchRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' }); };

  return <div className="rw new-in-page">
    <div className="rw-announcement"><div className="rw-announcement-inner"><span>Thời trang tuần hoàn, thêm vòng đời mới</span></div></div>
    <nav className="rw-nav" aria-label="Điều hướng chính">
      <div className="rw-nav-inner">
        <div className="rw-nav-left"><Link to="/" className="rw-logo-pill">REWEAR</Link>
          <div className="rw-nav-menu">{navigation.map(([href, label]) => <Link key={href} to={href} className={`rw-nav-lk ${route === href ? 'active' : ''}`} aria-current={route === href ? 'page' : undefined}>{label}</Link>)}</div>
        </div>
        <div className="rw-nav-right">
          <button className="rw-nav-pill catalog-nav-search" type="button" onClick={focusSearch} aria-label="Tìm kiếm"><Search size={15} aria-hidden="true" /><span className="catalog-nav-label">Tìm kiếm</span></button>
          <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}><ShoppingBag size={15} aria-hidden="true" /><span className="catalog-nav-label">Giỏ hàng ({cartItemCount})</span></button>
          <AccountMenu className="rw-nav-pill" withSpan />
        </div>
      </div>
    </nav>
    <EditorialHero key={route} title={title} description={description} slides={slides} primaryHref="#catalog-tools" primaryLabel="Khám phá tủ đồ" />
    <div className="catalog-intro-strip"><span>CHỌN LẠI. MẶC TIẾP.</span><p>Một món đồ quen. Một góc nhìn mới.</p><a href="#catalog-tools">Tìm phong cách của bạn <ArrowUpRight size={18} aria-hidden="true" /></a></div>
    <section className="catalog-workspace" aria-label="Khám phá sản phẩm">
      <div className="catalog-section-heading"><div><p className="catalog-eyebrow">KHÁM PHÁ TỦ ĐỒ</p><h2>Phong cách tiếp theo của bạn.</h2></div><p>Lọc trong các sản phẩm đã tải{route !== '/new-in' ? ' · Chưa phân loại theo giới tính' : ''}. <Link to="/profile?tab=style">Theo dõi gu đồ của bạn →</Link></p></div>
      <div className="catalog-tools" id="catalog-tools">
        <label className="catalog-search">
          <Search size={17} className="catalog-search-icon" aria-hidden="true" />
          <span className="catalog-sr-only">Tìm sản phẩm</span>
          <input
            ref={searchRef}
            type="search"
            placeholder="Tìm theo tên, màu hoặc kích cỡ…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="catalog-search-clear"
              onClick={() => setQuery('')}
              aria-label="Xóa tìm kiếm"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>
        <div className="catalog-tools-actions">
          <label className="catalog-sort">
            <span className="catalog-sort-label">Sắp xếp:</span>
            <div className="catalog-select-box">
              <select aria-label="Sắp xếp" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="original">Thứ tự hiện tại</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
                <option value="name">Tên: A đến Z</option>
              </select>
              <ChevronDown size={14} className="catalog-select-chevron" aria-hidden="true" />
            </div>
          </label>
          <button
            className={`catalog-filter-toggle ${filtersOpen ? 'is-active' : ''}`}
            type="button"
            aria-expanded={filtersOpen}
            aria-controls="catalog-filters"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            <span>Bộ lọc</span>
            {activeFilters > 0 && <span className="catalog-filter-badge">{activeFilters}</span>}
          </button>
        </div>
      </div>
      <div className={`catalog-filters ${filtersOpen ? 'is-open' : ''}`} id="catalog-filters" hidden={!filtersOpen}>
        <div className="catalog-filters-grid">
          <label className="catalog-filter-field">
            <span className="catalog-filter-field-label">Màu sắc</span>
            <div className="catalog-select-box">
              <select aria-label="Màu sắc" value={color} onChange={e => setColor(e.target.value)}>
                <option value="">Tất cả màu</option>
                {colors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="catalog-select-chevron" aria-hidden="true" />
            </div>
          </label>
          <label className="catalog-filter-field">
            <span className="catalog-filter-field-label">Kích cỡ</span>
            <div className="catalog-select-box">
              <select aria-label="Kích cỡ" value={size} onChange={e => setSize(e.target.value)}>
                <option value="">Tất cả kích cỡ</option>
                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="catalog-select-chevron" aria-hidden="true" />
            </div>
          </label>
          {(color || size) && (
            <button type="button" className="catalog-filter-reset-action" onClick={reset}>
              <X size={14} aria-hidden="true" /> Đặt lại lựa chọn
            </button>
          )}
        </div>
      </div>
      <div className="catalog-results-bar">
        <p className="catalog-count" role="status" aria-live="polite">
          {loading ? (
            'Đang tải tủ đồ…'
          ) : (
            <>
              <span className="catalog-count-num">{filtered.length}</span> sản phẩm
              {query.trim() && <span className="catalog-count-query"> cho “{query.trim()}”</span>}
            </>
          )}
        </p>
        <div className="new-in-layout-toggles" role="group" aria-label="Số cột sản phẩm trên màn hình lớn">
          <span className="toggle-group-label">Bố cục</span>
          <div className="layout-segmented-control">
            {LAYOUT_OPTIONS.map(opt => (
              <button
                type="button"
                key={opt.id}
                className={`layout-option ${columns === opt.id ? 'active' : ''}`}
                aria-pressed={columns === opt.id}
                onClick={() => setColumns(opt.id)}
                title={`Bố cục ${opt.label}`}
                aria-label={`Hiển thị ${opt.label}`}
              >
                <span className="layout-option-icon" aria-hidden="true">{opt.icon}</span>
                <span className="layout-option-label">{opt.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {(query || color || size) && <div className="catalog-active-filters">{[[query, () => setQuery(''), 'Tìm kiếm'], [color, () => setColor(''), 'Màu'], [size, () => setSize(''), 'Cỡ']].map(([value, clear, label]) => value && <button type="button" key={label} onClick={clear} aria-label={`Bỏ ${label.toLowerCase()}: ${value}`}>{label}: {value}<X size={14} aria-hidden="true" /></button>)}<button type="button" onClick={reset}>Xóa tất cả</button></div>}
      {!loading && filtered.length === 0 && (query || color || size) ? <div className="catalog-empty"><Search size={32} aria-hidden="true" /><h3>Chưa tìm thấy món đồ phù hợp</h3><p>Thử từ khóa khác hoặc bỏ bớt bộ lọc để xem thêm lựa chọn.</p><button type="button" className="catalog-cta" onClick={reset}>Xem tất cả sản phẩm <ArrowUpRight size={18} /></button></div> : <ProductListingGrid products={filtered.slice(0, limit)} loading={loading} columns={columns} />}
      {!loading && filtered.length > 0 && <div className="new-in-show-more"><p className="progress-text">Đang xem {Math.min(limit, filtered.length)} / {filtered.length} sản phẩm</p><div className="progress-bar-bg" aria-hidden="true"><div className="progress-bar-fill" style={{ width: `${Math.min(limit / filtered.length, 1) * 100}%` }} /></div>{limit < filtered.length ? <button type="button" className="btn-show-more" onClick={() => setLimit(n => n + 12)}>Xem thêm sản phẩm</button> : <a href="#catalog-tools" className="catalog-back">Quay lại bộ lọc ↑</a>}</div>}
    </section>
    <EditorialJournal stories={stories} />
    <aside className="catalog-circular"><img src={circularImage} alt="" loading="lazy" decoding="async" /><div className="catalog-circular__copy"><p className="catalog-eyebrow">MỘT TỦ ĐỒ, NHIỀU HÀNH TRÌNH</p><h2>Không mặc nữa?<br />Mở một vòng đời mới.</h2><Link to="/profile?tab=sourcing" className="editorial-button">Gửi đồ cũ của bạn <ArrowUpRight size={20} aria-hidden="true" /></Link></div></aside>
    <RainsFooter />
  </div>;
}
