import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import './Editorial.css';

export default function EditorialHero({ title, description, eyebrow = 'REWEAR / MẶC TIẾP CÂU CHUYỆN', slides, primaryHref, primaryLabel, secondaryHref = '/about', secondaryLabel = 'Câu chuyện REWEAR', paused: externalPaused = false }) {
  const root = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stopped = paused || externalPaused || reduced || interacting || focused || !visible || !tabVisible;
  const motionLabel = reduced ? 'Chuyển ảnh thủ công' : externalPaused ? 'Đã tạm dừng' : paused ? 'Tiếp tục chuyển ảnh' : 'Tạm dừng chuyển ảnh';

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreference = () => setReduced(preference.matches);
    const onVisibility = () => setTabVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .1 });
    observer.observe(root.current);
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
    return () => { observer.disconnect(); preference.removeEventListener('change', onPreference); document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  useEffect(() => {
    if (stopped || slides.length < 2) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [stopped, slides.length]);

  const select = index => { setActive((index + slides.length) % slides.length); setPaused(true); };
  const togglePlayback = () => {
    if (paused) { setFocused(false); setInteracting(false); }
    setPaused(value => !value);
  };
  return (
    <header className={`editorial-hero ${stopped ? 'is-paused' : ''}`} ref={root}
      aria-label="Bộ ảnh cảm hứng REWEAR" aria-roledescription="trình chiếu ảnh"
      onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="editorial-hero__scenes">
        {slides.map((slide, index) => (
          <div className={`editorial-hero__scene ${index === active ? 'is-active' : ''} ${slide.companion ? 'has-companion' : ''}`} key={slide.src} aria-hidden={index !== active}>
            <div className="editorial-hero__frame"><img src={slide.src} alt={slide.alt} style={{ objectPosition: slide.position || 'center 40%' }} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" /></div>
            {slide.companion && <div className="editorial-hero__frame editorial-hero__companion"><img src={slide.companion} alt={slide.companionAlt || ''} decoding="async" /></div>}
          </div>
        ))}
      </div>
      <div className="editorial-hero__shade" aria-hidden="true" />
      <div className="editorial-hero__copy">
        <p className="editorial-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="editorial-hero__description">{description}</p>
        <div className="editorial-hero__actions">
          {primaryHref.startsWith('#') ? <a className="editorial-button" href={primaryHref}>{primaryLabel}<ArrowDown size={17} aria-hidden="true" /></a> : <Link className="editorial-button" to={primaryHref}>{primaryLabel}<ArrowRight size={17} aria-hidden="true" /></Link>}
          <Link className="editorial-text-link" to={secondaryHref}>{secondaryLabel}<ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="editorial-hero__footer">
        <span className="editorial-hero__caption">ẢNH CẢM HỨNG / {String(active + 1).padStart(2, '0')}</span>
        <div className="editorial-hero__controls">
          <button type="button" onClick={() => select(active - 1)} aria-label="Ảnh trước"><ArrowLeft size={17} /></button>
          <span className="editorial-hero__count" aria-live={paused ? 'polite' : 'off'}>{String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          <button type="button" onClick={() => select(active + 1)} aria-label="Ảnh tiếp theo"><ArrowRight size={17} /></button>
          <button className="editorial-hero__pause" type="button" onClick={togglePlayback} disabled={reduced || externalPaused} aria-pressed={paused || reduced || externalPaused} aria-label={motionLabel} title={reduced ? 'Đã giảm chuyển động theo cài đặt thiết bị' : undefined}>
            {paused || reduced || externalPaused ? <Play size={15} /> : <Pause size={15} />}<span>{reduced ? 'Thủ công' : externalPaused ? 'Đã dừng' : paused ? 'Tiếp tục' : 'Tạm dừng'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
