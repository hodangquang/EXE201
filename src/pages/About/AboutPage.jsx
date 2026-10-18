import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  PackageCheck,
  Recycle,
  Search,
  Scissors,
  ShoppingBag,
  Pause,
  Play,
} from 'lucide-react';
import AccountMenu from '../../components/common/AccountMenu';
import EditorialHero from '../../components/common/EditorialHero';
import RainsFooter from '../../components/common/RainsFooter';
import { useCart } from '../../contexts/CartContext';
import '../Home/HomePage.css';
import './AboutPage.css';

const circularSteps = [
  {
    number: '01',
    title: 'Gửi đồ cũ',
    description: 'Bạn gửi những món đồ không còn sử dụng để bắt đầu một hành trình mới.',
    icon: Recycle,
    detail: 'Bắt đầu trong mục Bán đồ cũ của tài khoản. Chuẩn bị ảnh rõ tình trạng món đồ và mô tả để gửi yêu cầu.',
    image: '/images/prod-patchwork-denim.jpg',
  },
  {
    number: '02',
    title: 'Kiểm định',
    description: 'Mỗi sản phẩm được xem xét tình trạng và chọn hướng xử lý phù hợp.',
    icon: CheckCircle2,
    detail: 'Theo dõi yêu cầu đã gửi ngay trong tài khoản. Thông tin tình trạng và hình ảnh giúp quá trình xem xét món đồ rõ ràng hơn.',
    image: '/images/prod-charcoal-wool.jpg',
  },
  {
    number: '03',
    title: 'Tái thiết kế',
    description: 'Chất liệu cũ được kết hợp, sửa đổi và tạo thành một thiết kế mang cá tính riêng.',
    icon: Scissors,
    detail: 'Khám phá cách những mảng vải, phom dáng và đường may cũ có thể tạo nên một ngôn ngữ thiết kế mới.',
    image: '/images/prod-side-profile.jpg',
  },
  {
    number: '04',
    title: 'Trở lại tủ đồ',
    description: 'Thiết kế hoàn thiện tiếp tục được sử dụng thay vì kết thúc ở bãi rác.',
    icon: PackageCheck,
    detail: 'Xem mô tả, màu và kích cỡ có sẵn trên trang sản phẩm để tìm món đồ phù hợp với tủ đồ của bạn.',
    image: '/images/prod-patchwork-denim.jpg',
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
  const [activeStep, setActiveStep] = useState(0);
  const [motionPaused, setMotionPaused] = useState(false);

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
    <main className={`rw about-page ${motionPaused ? 'about-motion-paused' : ''}`}>
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
            <Link className="rw-nav-pill" to="/new-in#catalog-tools" aria-label="Tìm kiếm sản phẩm">
              <Search size={14} aria-hidden="true" /><span>Tìm kiếm</span>
            </Link>
            <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}>
              <ShoppingBag size={14} aria-hidden="true" /><span>Giỏ hàng ({cartItemCount})</span>
            </button>
            <AccountMenu className="rw-nav-pill" withSpan />
          </div>
        </div>
      </nav>

      <EditorialHero title={'Cũ là\nkhởi đầu.'} eyebrow="GIỚI THIỆU REWEAR / THỜI TRANG TUẦN HOÀN" description="Một vòng đời mới bắt đầu từ điều đã có. Cùng nhìn lại cách chúng ta lựa chọn, gìn giữ và mặc tiếp những món đồ." primaryHref="#our-cycle" primaryLabel="Khám phá hành trình" secondaryHref="/new-in" secondaryLabel="Khám phá tủ đồ" paused={motionPaused} slides={[
        { src: '/images/editorial/wardrobe.jpg', alt: 'Những món đồ với sắc độ tự nhiên trên giá treo', companion: '/images/prod-patchwork-denim.jpg' },
        { src: '/images/prod-patchwork-denim.jpg', alt: 'Cảm hứng thiết kế từ những mảng denim khác nhau', companion: '/images/editorial/wardrobe.jpg' },
      ]} />
      <div className="about-chapters"><nav aria-label="Nội dung giới thiệu"><a href="#our-cycle">Hành trình</a><a href="#our-design">Thiết kế</a><a href="#about-help">Bắt đầu từ đâu?</a></nav><button type="button" onClick={() => setMotionPaused(value => !value)} aria-pressed={motionPaused}>{motionPaused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}<span>{motionPaused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động'}</span></button></div>

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

        <div className="about-cycle__steps" role="group" aria-label="Khám phá các bước trong hành trình">
          {circularSteps.map(({ number, title, description, icon: Icon }, index) => (
            <button type="button" className={`about-cycle__step ${activeStep === index ? 'is-active' : ''}`} key={number} onClick={() => setActiveStep(index)} aria-pressed={activeStep === index} aria-controls="about-cycle-detail">
              <span className="about-cycle__step-top">
                <span>{number}</span>
                <Icon size={30} strokeWidth={1.25} aria-hidden="true" />
              </span>
              <span className="about-cycle__step-title">{title}</span>
              <span className="about-cycle__step-copy">{description}</span>
            </button>
          ))}
        </div>
        <div className="about-cycle-detail" id="about-cycle-detail">
          <img src={circularSteps[activeStep].image} alt="Cảm hứng chất liệu và thiết kế REWEAR" loading="lazy" />
          <div aria-live="polite" aria-atomic="true"><span className="about-cycle-detail__number">BƯỚC {circularSteps[activeStep].number} / 04</span><h3>{circularSteps[activeStep].title}</h3><p>{circularSteps[activeStep].detail}</p><Link to={activeStep < 2 ? '/profile?tab=sourcing' : '/new-in'}>{activeStep < 2 ? 'Đến mục Bán đồ cũ' : 'Khám phá tủ đồ'}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
      </section>

      <section className="about-editorial" id="our-design">
        <div className="about-editorial__heading" data-about-reveal>
          <div className="about-section-label"><span>03</span><span>Ngôn ngữ thiết kế</span></div>
          <h2>Từ những gì<br />đã tồn tại.</h2>
          <p>
            Những mảng vải, đường may và bề mặt khác nhau được đặt cạnh nhau để tạo ra nhịp điệu
            mới. Sự không đồng nhất chính là dấu ấn của sản phẩm.
          </p>
        </div>

        <div className="about-editorial__gallery">
          <figure className="about-editorial__image about-editorial__image--large" data-about-reveal>
            <img src="/images/prod-charcoal-wool.jpg" alt="Cảm hứng phom áo khoác màu than" loading="lazy" decoding="async" />
            <figcaption><span>Chất liệu 01</span><span>Bề mặt / Kết cấu</span></figcaption>
          </figure>
          <figure className="about-editorial__image about-editorial__image--small" data-about-reveal>
            <img src="/images/prod-side-profile.jpg" alt="Cảm hứng phom áo khoác nhìn từ bên cạnh" loading="lazy" decoding="async" />
            <figcaption><span>Chất liệu 02</span><span>Phom dáng / Công năng</span></figcaption>
          </figure>
        </div>
      </section>

      <section className="about-principles" aria-labelledby="about-principles-title">
        <div className="about-principles__header" data-about-reveal>
          <div className="about-section-label"><span>04</span><span>Nguyên tắc của chúng tôi</span></div>
          <h2 id="about-principles-title">Những điều<br />chúng tôi tin.</h2>
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

      <section className="about-help" id="about-help" aria-labelledby="about-help-title"><div><p className="about-eyebrow">CÙNG BẮT ĐẦU</p><h2 id="about-help-title">Một bước nhỏ.<br />Một hành trình mới.</h2></div><div className="about-help__questions">
        <details><summary>Tôi muốn tìm một món đồ phù hợp <span aria-hidden="true">+</span></summary><p>Trong tủ đồ REWEAR, bạn có thể tìm theo tên, màu hoặc kích cỡ; sắp xếp theo giá và xem chi tiết từng sản phẩm.</p><Link to="/new-in">Khám phá sản phẩm <ArrowUpRight size={16} /></Link></details>
        <details><summary>Tôi muốn gửi món đồ không còn mặc <span aria-hidden="true">+</span></summary><p>Đăng nhập tài khoản, mở mục Bán đồ cũ để tạo yêu cầu và theo dõi trạng thái. Chuẩn bị hình ảnh và mô tả tình trạng món đồ.</p><Link to="/profile?tab=sourcing">Mở mục Bán đồ cũ <ArrowUpRight size={16} /></Link></details>
        <details><summary>Tôi muốn xem lại đơn mua <span aria-hidden="true">+</span></summary><p>Trong tài khoản, mục Đơn mua giúp bạn tìm đơn hàng và xem thông tin chi tiết.</p><Link to="/profile?tab=orders">Đến đơn mua <ArrowUpRight size={16} /></Link></details>
      </div></section>

      <section className="about-cta">
        <img className="about-cta__image" src="/images/editorial/wardrobe.jpg" alt="" loading="lazy" decoding="async" />
        <div className="about-cta__content" data-about-reveal>
          <p>MÓN ĐỒ TIẾP THEO CÓ THỂ ĐÃ Ở ĐÂU ĐÓ.</p>
          <h2>Mặc tiếp<br />câu chuyện.</h2>
          <div className="about-cta__actions">
            <Link to="/new-in">Khám phá sản phẩm <ArrowUpRight size={17} /></Link>
            <Link to="/profile?tab=sourcing">Gửi đồ cũ <Recycle size={17} /></Link>
          </div>
        </div>
      </section>
      <RainsFooter />
    </main>
  );
}
