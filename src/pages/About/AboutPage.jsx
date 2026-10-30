import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CheckCircle2, PackageCheck, Recycle, Scissors, Search, ShoppingBag } from 'lucide-react';
import AccountMenu from '../../components/common/AccountMenu';
import EditorialHero from '../../components/common/EditorialHero';
import RainsFooter from '../../components/common/RainsFooter';
import { useCart } from '../../contexts/CartContext';
import '../Home/HomePage.css';
import './AboutPage.css';

const slides = [
  { src: '/images/editorial/wardrobe.jpg', alt: 'Những món đồ với sắc độ tự nhiên trên giá treo', companion: '/images/prod-patchwork-denim.jpg' },
  { src: '/images/prod-patchwork-denim.jpg', alt: 'Cảm hứng thiết kế từ những mảng denim khác nhau', companion: '/images/editorial/wardrobe.jpg' },
];

const circularSteps = [
  {
    number: '01', title: 'Gửi đồ cũ', icon: Recycle,
    description: 'Bắt đầu từ món đồ bạn không còn mặc.',
    detail: 'Mở mục Bán đồ cũ trong tài khoản, chuẩn bị hình ảnh rõ tình trạng món đồ và mô tả để gửi yêu cầu. Bạn có thể theo dõi yêu cầu ngay tại đây.',
    image: '/images/editorial/wardrobe.jpg', imageAlt: 'Quần áo trên giá treo, cảm hứng cho việc chọn lại những món đồ đã có',
    href: '/profile?tab=sourcing', link: 'Đến mục Bán đồ cũ',
  },
  {
    number: '02', title: 'Xem xét tình trạng', icon: CheckCircle2,
    description: 'Hiểu món đồ trước khi tiếp nối hành trình.',
    detail: 'Hình ảnh và mô tả tình trạng giúp việc xem xét món đồ rõ ràng hơn. Theo dõi thông tin và phản hồi của yêu cầu đã gửi trong tài khoản của bạn.',
    image: '/images/prod-charcoal-wool.jpg', imageAlt: 'Ảnh cảm hứng về bề mặt và phom áo khoác màu than',
    href: '/profile?tab=sourcing', link: 'Theo dõi yêu cầu',
  },
  {
    number: '03', title: 'Tái chế thành thiết kế mới', icon: Scissors,
    description: 'Tìm cảm hứng từ chất liệu và phom dáng.',
    detail: 'Nguyên liệu được đưa vào dự án tái chế để cắt ghép, may và hoàn thiện thành thiết kế mới. Thành phẩm cần được kiểm định trước khi đăng bán tại REWEAR.',
    image: '/images/prod-side-profile.jpg', imageAlt: 'Ảnh cảm hứng về phom áo khoác nhìn từ bên cạnh',
    href: '/world', link: 'Khám phá góc cảm hứng',
  },
  {
    number: '04', title: 'Mặc tiếp câu chuyện', icon: PackageCheck,
    description: 'Đưa món đồ phù hợp trở lại tủ đồ.',
    detail: 'Khám phá các sản phẩm đang có tại REWEAR. Xem hình ảnh, mô tả, màu và kích cỡ trên trang chi tiết để lựa chọn món đồ phù hợp với bạn.',
    image: '/images/prod-patchwork-denim.jpg', imageAlt: 'Ảnh cảm hứng phối áo khoác từ các mảng denim',
    href: '/new-in', link: 'Khám phá sản phẩm',
  },
];

const principles = [
  { number: '01', title: 'Chọn lại', copy: 'Nhìn thấy giá trị sử dụng trong những món đồ đã có.' },
  { number: '02', title: 'Giữ lại', copy: 'Trân trọng chất liệu, phom dáng và dấu ấn riêng của mỗi món đồ.' },
  { number: '03', title: 'Mặc tiếp', copy: 'Tìm một cách phối mới và tiếp nối câu chuyện trong tủ đồ của bạn.' },
];

const questions = [
  { title: 'Tôi muốn tìm một món đồ phù hợp', copy: 'Bạn có thể tìm theo tên, màu hoặc kích cỡ, sắp xếp theo giá và xem chi tiết từng sản phẩm trong tủ đồ REWEAR.', href: '/new-in', link: 'Khám phá sản phẩm' },
  { title: 'Tôi muốn gửi món đồ không còn mặc', copy: 'Đăng nhập tài khoản và mở mục Bán đồ cũ để tạo yêu cầu. Chuẩn bị hình ảnh, mô tả tình trạng món đồ và theo dõi phản hồi trong tài khoản.', href: '/profile?tab=sourcing', link: 'Mở mục Bán đồ cũ' },
  { title: 'Tôi muốn xem lại đơn mua', copy: 'Mở mục Đơn mua trong tài khoản để tìm đơn hàng và xem thông tin chi tiết.', href: '/profile?tab=orders', link: 'Đến đơn mua' },
];

export default function AboutPage() {
  const { openCart, cartItemCount } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const step = circularSteps[activeStep];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Giới thiệu — REWEAR';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <div className="rw about-page">
      <div className="rw-announcement">
        <div className="rw-announcement-inner"><span>Thời trang tuần hoàn, thêm vòng đời mới</span></div>
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
            <Link className="rw-nav-pill" to="/new-in#catalog-tools" aria-label="Tìm kiếm sản phẩm"><Search size={14} aria-hidden="true" /><span>Tìm kiếm</span></Link>
            <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}><ShoppingBag size={14} aria-hidden="true" /><span>Giỏ hàng ({cartItemCount})</span></button>
            <AccountMenu className="rw-nav-pill" withSpan />
          </div>
        </div>
      </nav>

      <main>
        <EditorialHero
          title={'Cũ là\nkhởi đầu.'}
          eyebrow="GIỚI THIỆU REWEAR / THỜI TRANG TUẦN HOÀN"
          description="Một vòng đời mới bắt đầu từ điều đã có. Cùng lựa chọn, gìn giữ và mặc tiếp những món đồ."
          primaryHref="#our-story" primaryLabel="Câu chuyện của chúng tôi"
          secondaryHref="/new-in" secondaryLabel="Khám phá tủ đồ" slides={slides}
        />

        <nav className="about-chapters" aria-label="Nội dung giới thiệu">
          <a href="#our-story">Về REWEAR <ArrowUpRight size={16} aria-hidden="true" /></a>
          <a href="#our-cycle">Hành trình món đồ <ArrowUpRight size={16} aria-hidden="true" /></a>
          <a href="#about-help">Cùng bắt đầu <ArrowUpRight size={16} aria-hidden="true" /></a>
        </nav>

        <section className="about-story about-section" id="our-story" aria-labelledby="about-story-title">
          <div className="about-story__layout">
            <div className="about-story__copy">
              <p className="about-kicker">VỀ REWEAR</p>
              <h2 id="about-story-title">Một món đồ cũ.<br />Một khởi đầu mới.</h2>
              <p>Một chiếc áo cũ vẫn có chất liệu, ký ức và giá trị để được sử dụng tiếp. REWEAR bắt đầu từ cách nhìn đó.</p>
              <p>Chúng tôi hướng đến một tủ đồ có nhiều lựa chọn hơn từ những gì đã tồn tại — qua việc thu gom nguyên liệu, tái chế và tạo nên thiết kế mới.</p>
              <Link className="about-text-link" to="/world">Bước vào thế giới REWEAR <ArrowRight size={18} aria-hidden="true" /></Link>
            </div>
            <figure className="about-story__image" id="our-design">
              <img src="/images/prod-patchwork-denim.jpg" alt="Ảnh cảm hứng về những sắc độ denim trong một thiết kế áo khoác" loading="lazy" decoding="async" />
              <figcaption>CẢM HỨNG REWEAR / CHẤT LIỆU VÀ PHOM DÁNG</figcaption>
            </figure>
          </div>
          <div className="about-principles" aria-label="Tinh thần REWEAR">
            {principles.map(principle => (
              <article className="about-principle" key={principle.number}>
                <span className="about-principle__number">{principle.number}</span>
                <div><h3>{principle.title}</h3><p>{principle.copy}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-journey about-section" id="our-cycle" aria-labelledby="about-cycle-title">
          <div className="about-section-heading">
            <div><p className="about-kicker">HÀNH TRÌNH TIẾP NỐI</p><h2 id="about-cycle-title">Thêm một vòng đời.</h2></div>
            <p>Từ món đồ không còn mặc đến một cách nhìn mới. Chọn từng bước để khám phá.</p>
          </div>
          <div className="about-steps" role="group" aria-label="Các bước trong hành trình món đồ">
            {circularSteps.map(({ number, title, icon: Icon }, index) => (
              <button className={`about-step ${activeStep === index ? 'is-active' : ''}`} key={number} type="button" aria-pressed={activeStep === index} aria-controls="about-cycle-detail" onClick={() => setActiveStep(index)}>
                <span className="about-step__number">{number}</span><span>{title}</span><Icon size={20} strokeWidth={1.5} aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="about-step-detail" id="about-cycle-detail">
            <img src={step.image} alt={step.imageAlt} loading="lazy" decoding="async" />
            <div className="about-step-detail__copy" aria-live="polite" aria-atomic="true">
              <p className="about-kicker">BƯỚC {step.number} / 04</p>
              <h3>{step.title}</h3><p className="about-step-detail__lead">{step.description}</p><p>{step.detail}</p>
              <Link to={step.href} className="about-button">{step.link}<ArrowUpRight size={18} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>

        <section className="about-help about-section" id="about-help" aria-labelledby="about-help-title">
          <div className="about-help__heading"><p className="about-kicker">CÙNG BẮT ĐẦU</p><h2 id="about-help-title">Bạn muốn<br /> bắt đầu từ đâu?</h2><p>Một vài gợi ý để tìm đúng điều bạn cần tại REWEAR.</p></div>
          <div className="about-help__questions">
            {questions.map(question => (
              <details key={question.title}>
                <summary>{question.title}<span aria-hidden="true">+</span></summary>
                <div className="about-help__answer"><p>{question.copy}</p><Link to={question.href} className="about-text-link">{question.link}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
              </details>
            ))}
          </div>
        </section>

        <section className="about-cta" aria-labelledby="about-cta-title">
          <img className="about-cta__image" src="/images/editorial/wardrobe.jpg" alt="" loading="lazy" decoding="async" />
          <div className="about-cta__content"><p className="about-kicker">MỘT TỦ ĐỒ, NHIỀU HÀNH TRÌNH</p><h2 id="about-cta-title">Mặc tiếp câu chuyện.</h2><p>Tìm một món đồ phù hợp. Hoặc mở ra hành trình mới cho món đồ của bạn.</p>
            <div className="about-cta__actions"><Link to="/new-in" className="editorial-button">Khám phá sản phẩm<ArrowUpRight size={18} aria-hidden="true" /></Link><Link to="/profile?tab=sourcing" className="editorial-text-link">Gửi đồ cũ<ArrowRight size={18} aria-hidden="true" /></Link></div>
          </div>
        </section>
      </main>
      <RainsFooter />
    </div>
  );
}
