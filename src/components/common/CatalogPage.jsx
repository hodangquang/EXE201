import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react';
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
      <div className="catalog-section-heading"><div><p className="catalog-eyebrow">KHÁM PHÁ TỦ ĐỒ</p><h2>Phong cách tiếp theo của bạn.</h2></div><p>Lọc trong các sản phẩm đã tải{route !== '/new-in' ? ' · Chưa phân loại theo giới tính' : ''}.</p></div>
      <div className="catalog-tools" id="catalog-tools">
        <label className="catalog-search"><Search size={19} aria-hidden="true" /><span className="catalog-sr-only">Tìm sản phẩm</span><input ref={searchRef} type="search" placeholder="Tìm theo tên, màu hoặc kích cỡ…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label className="catalog-sort"><span>Sắp xếp</span><select aria-label="Sắp xếp" value={sort} onChange={e => setSort(e.target.value)}><option value="original">Thứ tự hiện tại</option><option value="price-asc">Giá: thấp đến cao</option><option value="price-desc">Giá: cao đến thấp</option><option value="name">Tên: A đến Z</option></select></label>
        <button className={`catalog-filter-toggle ${filtersOpen ? 'is-active' : ''}`} type="button" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17} aria-hidden="true" />Bộ lọc{activeFilters > 0 && <span>{activeFilters}</span>}</button>
      </div>
      <div className="catalog-filters" id="catalog-filters" hidden={!filtersOpen}>
        <label>Màu sắc<select aria-label="Màu sắc" value={color} onChange={e => setColor(e.target.value)}><option value="">Tất cả màu</option>{colors.map(c => <option key={c}>{c}</option>)}</select></label>
        <label>Kích cỡ<select aria-label="Kích cỡ" value={size} onChange={e => setSize(e.target.value)}><option value="">Tất cả kích cỡ</option>{sizes.map(s => <option key={s}>{s}</option>)}</select></label>
        <button type="button" onClick={reset}>Đặt lại lựa chọn <X size={16} aria-hidden="true" /></button>
      </div>
      <div className="catalog-results-bar"><p role="status" aria-live="polite">{loading ? 'Đang tải tủ đồ…' : <><strong>{filtered.length}</strong> sản phẩm{query.trim() && ` cho “${query.trim()}”`}</>}</p>
        <div className="new-in-layout-toggles" role="group" aria-label="Số cột sản phẩm trên màn hình lớn"><span className="toggle-group-label">Bố cục</span>{[['two', 'Hai'], ['four', 'Bốn'], ['eight', 'Tám']].map(([value, label]) => <button type="button" key={value} className={`layout-option ${columns === value ? 'active' : ''}`} aria-pressed={columns === value} onClick={() => setColumns(value)}>{label}</button>)}</div>
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
