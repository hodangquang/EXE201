import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, ShoppingBag } from 'lucide-react';
import RainsFooter from '../../components/common/RainsFooter';
import StoreLocator from '../../components/common/StoreLocator';
import AccountMenu from '../../components/common/AccountMenu';
import EditorialHero from '../../components/common/EditorialHero';
import EditorialJournal from '../../components/common/EditorialJournal';
import { useCart } from '../../contexts/CartContext';
import '../Home/HomePage.css';
import './RainsWorldPage.css';
import '../../components/common/StoreLocator.css';

const navigation = [['/new-in', 'Mới về'], ['/women', 'Nữ'], ['/men', 'Nam'], ['/world', 'Thế giới REWEAR'], ['/about', 'Giới thiệu']];
const scenes = [
  { src: '/images/editorial/city-fashion.jpg', alt: 'Một góc nhìn thời trang giữa không gian thành phố', companion: '/images/prod-patchwork-denim.jpg' },
  { src: '/images/editorial/wardrobe.jpg', alt: 'Chất liệu và sắc màu của những món đồ đã có', companion: '/images/editorial/city-fashion.jpg' },
];

export default function RainsWorldPage() {
  const { openCart, cartItemCount } = useCart();
  useEffect(() => {
    const previous = document.title;
    document.title = 'Thế giới REWEAR — Cảm hứng mặc tiếp';
    return () => { document.title = previous; };
  }, []);

  return <div className="rw world-page">
    <div className="rw-announcement"><div className="rw-announcement-inner"><span>Thời trang tuần hoàn, thêm vòng đời mới</span></div></div>
    <nav className="rw-nav" aria-label="Điều hướng chính"><div className="rw-nav-inner">
      <div className="rw-nav-left"><Link to="/" className="rw-logo-pill">REWEAR</Link><div className="rw-nav-menu">{navigation.map(([href, label]) => <Link to={href} key={href} className="rw-nav-lk" aria-current={href === '/world' ? 'page' : undefined}>{label}</Link>)}</div></div>
      <div className="rw-nav-right">
        <Link to="/new-in#catalog-tools" className="rw-nav-pill" aria-label="Tìm kiếm sản phẩm"><Search size={14} aria-hidden="true" /><span>Tìm kiếm</span></Link>
        <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}><ShoppingBag size={14} aria-hidden="true" /><span>Giỏ hàng ({cartItemCount})</span></button>
        <AccountMenu className="rw-nav-pill" withSpan />
      </div>
    </div></nav>
    <EditorialHero title={'Cảm hứng\nkhông kết thúc.'} eyebrow="THẾ GIỚI REWEAR / GÓC NHÌN MỚI" description="Từ một góc phố đến một nếp vải. Những điều quen thuộc luôn có một cách nhìn khác." slides={scenes} primaryHref="#world-journal" primaryLabel="Khám phá góc cảm hứng" />
    <EditorialJournal id="world-journal" />
    <section className="world-feature" aria-labelledby="world-feature-title">
      <div className="world-feature__image editorial-reveal"><img src="/images/editorial/wardrobe.jpg" alt="Tủ đồ với những gam màu trung tính và nhiều chất liệu" loading="lazy" /></div>
      <div className="world-feature__copy editorial-reveal"><p className="editorial-kicker">CHỌN LẠI / GIỮ LẠI / MẶC TIẾP</p><h2 id="world-feature-title">Phong cách có thể mới.<br />Món đồ thì không cần.</h2><p>Thử một cách phối khác. Giữ lại một chất liệu bạn thích. Hoặc đưa món đồ không còn mặc đến một hành trình mới.</p><Link to="/profile?tab=sourcing">Gửi đồ cũ của bạn <ArrowUpRight size={20} aria-hidden="true" /></Link><span className="world-feature__word" aria-hidden="true">REWEAR</span></div>
    </section>
    <StoreLocator />
    <RainsFooter />
  </div>;
}
