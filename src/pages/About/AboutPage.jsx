import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUpRight,
  CheckCircle2,
  PackageCheck,
  Recycle,
  Search,
  Scissors,
  ShoppingBag,
} from 'lucide-react';
import AccountMenu from '../../components/common/AccountMenu';
import { useCart } from '../../contexts/CartContext';
import '../Home/HomePage.css';
import './AboutPage.css';

const circularSteps = [
  {
    number: '01',
    title: 'Gửi đồ cũ',
    description: 'Bạn gửi những món đồ không còn sử dụng để bắt đầu một hành trình mới.',
    icon: Recycle,
  },
  {
    number: '02',
    title: 'Kiểm định',
    description: 'Mỗi sản phẩm được xem xét tình trạng và chọn hướng xử lý phù hợp.',
    icon: CheckCircle2,
  },
  {
    number: '03',
    title: 'Tái thiết kế',
    description: 'Chất liệu cũ được kết hợp, sửa đổi và tạo thành một thiết kế mang cá tính riêng.',
    icon: Scissors,
  },
  {
    number: '04',
    title: 'Trở lại tủ đồ',
    description: 'Thiết kế hoàn thiện tiếp tục được sử dụng thay vì kết thúc ở bãi rác.',
    icon: PackageCheck,
  },
];

const principles = [
  {
    number: '01',
    title: 'Ít lãng phí',
    copy: 'Ưu tiên sử dụng những gì đã tồn tại và kéo dài vòng đời của chất liệu.',
  },
  {
    number: '02',
    title: 'Nhiều cá tính',
    copy: 'Dấu vết của chất liệu cũ trở thành một phần trong ngôn ngữ của thiết kế mới.',
  },
  {
    number: '03',
    title: 'Mỗi món đồ, một câu chuyện',
    copy: 'Mỗi sản phẩm được tạo ra từ một tổ hợp chất liệu và một hành trình khác nhau.',
  },
];

export default function AboutPage() {
  const { openCart, cartItemCount } = useCart();

  useEffect(() => {
    const revealElements = document.querySelectorAll('[data-about-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14 },
    );

    revealElements.forEach((element) => observer.observe(element));
    const previousTitle = document.title;
    document.title = 'Giới thiệu — REWEAR';

    return () => {
      observer.disconnect();
      document.title = previousTitle;
    };
  }, []);

  return (
    <main className="rw about-page">
      <div className="rw-announcement">
        <div className="rw-announcement-inner">
          <span>REWEAR — Thời trang tuần hoàn, khởi đầu mới</span>
        </div>
      </div>

      <nav className="rw-nav" aria-label="Điều hướng chính">
        <div className="rw-nav-inner">
          <div className="rw-nav-left">
            <Link to="/" className="rw-logo-pill">REWEAR</Link>
            <div className="rw-nav-menu">
              <Link to="/new-in" className="rw-nav-lk">Mới về</Link>
              <Link to="/women" className="rw-nav-lk">Nữ</Link>
              <Link to="/men" className="rw-nav-lk">Nam</Link>
              <Link to="/world" className="rw-nav-lk">Thế giới REWEAR</Link>
              <Link to="/about" className="rw-nav-lk active" aria-current="page">Giới thiệu</Link>
            </div>
          </div>

          <div className="rw-nav-right">
            <button className="rw-nav-pill" type="button" aria-label="Tìm kiếm">
              <Search size={14} aria-hidden="true" /> Tìm kiếm
            </button>
            <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}>
              <ShoppingBag size={14} aria-hidden="true" /> Giỏ hàng ({cartItemCount})
            </button>
            <AccountMenu className="rw-nav-pill" />
          </div>
        </div>
      </nav>

      <section className="about-hero" aria-labelledby="about-hero-title">
        <div className="about-hero__glow about-hero__glow--one" aria-hidden="true" />
        <div className="about-hero__glow about-hero__glow--two" aria-hidden="true" />

        <div className="about-hero__copy">
          <p className="about-eyebrow" data-about-reveal>THỜI TRANG TUẦN HOÀN</p>
          <h1 id="about-hero-title" data-about-reveal>CŨ LÀ<br />KHỞI ĐẦU.</h1>
          <div className="about-hero__intro" data-about-reveal>
            <p>
              REWEAR kết nối hành trình thu gom, tuyển chọn và tái thiết kế quần áo đã qua sử
              dụng thành những sản phẩm thời trang mang cá tính riêng.
            </p>
            <a className="about-arrow-link" href="#our-cycle">
              Khám phá hành trình <ArrowDown size={18} />
            </a>
          </div>
        </div>

        <div className="about-hero__visual" data-about-reveal>
          <figure className="about-hero__image-wrap">
            <img
              className="about-hero__image"
              src="/images/prod-patchwork-denim.jpg"
              alt="Thiết kế denim patchwork của REWEAR"
            />
            <figcaption>Denim tái thiết kế / độc bản</figcaption>
          </figure>

          <div className="about-orbit" aria-hidden="true">
            <div className="about-orbit__text">
              <span>MẶC</span><span>LẠI</span><span>YÊU</span><span>THÊM</span>
            </div>
            <Recycle size={28} strokeWidth={1.3} />
          </div>
        </div>

        <div className="about-hero__index" aria-hidden="true">
          <span>GIỚI THIỆU</span><span>001—006</span>
        </div>
      </section>

      <div className="about-marquee" aria-hidden="true">
        <div className="about-marquee__track">
          <span>NGHĨ LẠI</span><i>✦</i><span>SỬA LẠI</span><i>✦</i><span>LÀM MỚI</span><i>✦</i><span>REWEAR</span><i>✦</i>
          <span>NGHĨ LẠI</span><i>✦</i><span>SỬA LẠI</span><i>✦</i><span>LÀM MỚI</span><i>✦</i><span>REWEAR</span><i>✦</i>
        </div>
      </div>

      <section className="about-manifesto">
        <div className="about-section-label" data-about-reveal>
          <span>01</span><span>Vì sao có REWEAR</span>
        </div>

        <div className="about-manifesto__statement" data-about-reveal>
          <p className="about-manifesto__lead">THỜI TRANG KHÔNG CẦN BẮT ĐẦU TỪ CON SỐ 0.</p>
          <p className="about-manifesto__body">
            Một chiếc áo cũ vẫn chứa chất liệu, ký ức và khả năng để trở thành điều mới. REWEAR
            được xây dựng để đưa những giá trị đó trở lại vòng chuyển động — qua thiết kế có chủ
            đích và một cách mua sắm có ý thức hơn.
          </p>
        </div>

        <div className="about-manifesto__word" aria-hidden="true">TÁI DÙNG</div>
      </section>

      <section className="about-cycle" id="our-cycle" aria-labelledby="about-cycle-title">
        <header className="about-cycle__header" data-about-reveal>
          <div className="about-section-label about-section-label--light">
            <span>02</span><span>Hành trình tiếp nối</span>
          </div>
          <h2 id="about-cycle-title">MỘT VÒNG ĐỜI KHÁC.</h2>
          <p>Từ món đồ không còn được mặc đến một thiết kế sẵn sàng bước tiếp.</p>
        </header>

        <div className="about-cycle__line" aria-hidden="true"><span /></div>

        <div className="about-cycle__steps">
          {circularSteps.map(({ number, title, description, icon: Icon }) => (
            <article className="about-cycle__step" key={number} data-about-reveal>
              <div className="about-cycle__step-top">
                <span>{number}</span>
                <Icon size={30} strokeWidth={1.25} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-editorial">
        <div className="about-editorial__heading" data-about-reveal>
          <div className="about-section-label"><span>03</span><span>Ngôn ngữ thiết kế</span></div>
          <h2>TỪ NHỮNG GÌ<br />ĐÃ TỒN TẠI.</h2>
          <p>
            Những mảng vải, đường may và bề mặt khác nhau được đặt cạnh nhau để tạo ra nhịp điệu
            mới. Sự không đồng nhất chính là dấu ấn của sản phẩm.
          </p>
        </div>

        <div className="about-editorial__gallery">
          <figure className="about-editorial__image about-editorial__image--large" data-about-reveal>
            <img src="/images/prod-charcoal-wool.jpg" alt="Thiết kế áo khoác màu than của REWEAR" />
            <figcaption><span>Chất liệu 01</span><span>Bề mặt / Kết cấu</span></figcaption>
          </figure>
          <figure className="about-editorial__image about-editorial__image--small" data-about-reveal>
            <img src="/images/prod-side-profile.jpg" alt="Chi tiết phom dáng sản phẩm REWEAR" />
            <figcaption><span>Chất liệu 02</span><span>Phom dáng / Công năng</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="about-principles" aria-labelledby="about-principles-title">
        <div className="about-principles__header" data-about-reveal>
          <div className="about-section-label"><span>04</span><span>Nguyên tắc của chúng tôi</span></div>
          <h2 id="about-principles-title">NHỮNG ĐIỀU<br />CHÚNG TÔI TIN.</h2>
        </div>

        <div className="about-principles__list">
          {principles.map((principle) => (
            <article className="about-principle" key={principle.number} data-about-reveal>
              <span className="about-principle__number">{principle.number}</span>
              <h3>{principle.title}</h3>
              <p>{principle.copy}</p>
              <ArrowUpRight size={28} strokeWidth={1.2} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <div className="about-cta__rings" aria-hidden="true"><span /><span /><span /></div>
        <div className="about-cta__content" data-about-reveal>
          <p>MÓN ĐỒ TIẾP THEO CÓ THỂ ĐÃ Ở ĐÂU ĐÓ.</p>
          <h2>MẶC TIẾP<br />CÂU CHUYỆN.</h2>
          <div className="about-cta__actions">
            <Link to="/new-in">Khám phá sản phẩm <ArrowUpRight size={17} /></Link>
            <Link to="/profile?tab=sourcing">Gửi đồ cũ <Recycle size={17} /></Link>
          </div>
        </div>
      </section>

    </main>
  );
}
