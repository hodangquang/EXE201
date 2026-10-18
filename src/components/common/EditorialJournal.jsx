import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import './Editorial.css';

const defaultStories = [
  { image: '/images/editorial/city-fashion.jpg', alt: 'Cảm hứng phối áo khoác xanh trong thành phố', number: '01', label: 'GÓC NHÌN / PHỐ THỊ', title: 'Ra phố, theo cách bạn.', to: '/women', link: 'Khám phá góc nữ' },
  { image: '/images/prod-charcoal-wool.jpg', alt: 'Cảm hứng phom áo khoác và sắc xám trung tính', number: '02', label: 'GÓC NHÌN / PHOM DÁNG', title: 'Ít chi tiết. Nhiều cá tính.', to: '/men', link: 'Khám phá góc nam' },
  { image: '/images/editorial/wardrobe.jpg', alt: 'Những món đồ với chất liệu và sắc độ khác nhau trên giá treo', number: '03', label: 'GÓC NHÌN / VÒNG ĐỜI', title: 'Một khởi đầu từ điều cũ.', to: '/about', link: 'Câu chuyện REWEAR' },
];

export default function EditorialJournal({ id = 'editorial-journal', stories = defaultStories }) {
  const rail = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: true });
  useEffect(() => {
    const node = rail.current;
    const update = () => setEdges({ start: node.scrollLeft < 4, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 4 });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); node.removeEventListener('scroll', update); };
  }, []);
  const scroll = direction => rail.current.scrollBy({ left: direction * rail.current.clientWidth * .85, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  return <section className="editorial-journal" id={id} aria-label="Cảm hứng mặc đẹp">
    <div className="editorial-journal__heading editorial-reveal"><div><p className="editorial-kicker">GÓC CẢM HỨNG REWEAR</p><h2>Một tủ đồ.<br />Nhiều cách mặc.</h2></div><p>Khám phá những góc nhìn mới về phom dáng, chất liệu và món đồ bạn chọn giữ lại.</p></div>
    <div className="editorial-journal__rail" ref={rail}>
      {stories.map(story => <Link className="editorial-story editorial-reveal" to={story.to} key={story.number}>
        <div className="editorial-story__image"><img src={story.image} alt={story.alt} loading="lazy" decoding="async" /><span className="editorial-story__number" aria-hidden="true">{story.number}</span><span className="editorial-story__arrow" aria-hidden="true"><ArrowUpRight size={24} /></span></div>
        <p className="editorial-kicker">{story.label}</p><h3>{story.title}</h3><span className="editorial-story__link">{story.link}<ArrowRight size={16} aria-hidden="true" /></span>
      </Link>)}
    </div>
    {(!edges.start || !edges.end) && <div className="editorial-journal__controls"><span>Khám phá thêm góc nhìn</span><button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Xem góc nhìn trước"><ArrowLeft size={18} /></button><button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="Xem góc nhìn tiếp theo"><ArrowRight size={18} /></button></div>}
  </section>;
}
