import { useEffect, useState } from 'react';
import { authFetch } from '../../services/auth';
import { formatCatalogText } from '../../utils/catalogText';
import './ProductJourney.css';

export default function ProductJourney({ productId }) {
  const [journey, setJourney] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [reload, setReload] = useState(0); const [showBefore, setShowBefore] = useState(true);
  useEffect(() => {
    const abort = new AbortController(); setLoading(true); setError(''); setJourney(null); setShowBefore(true);
    authFetch(`/api/products/${encodeURIComponent(productId)}/journey`, { signal: abort.signal, skipGlobalLoading: true })
      .then(response => { if (!abort.signal.aborted) setJourney(response.data); })
      .catch(error => { if (!abort.signal.aborted) setError(error.status === 404 ? 'Sản phẩm chưa có hồ sơ hành trình công khai.' : 'Chưa tải được hành trình sản phẩm.'); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [productId, reload]);
  const upcycled = journey?.productType === 'Upcycled';
  const images = (upcycled && showBefore ? journey.beforeImages : journey?.afterImages) || [];
  return <section className="rw-product-journey" aria-labelledby="product-journey-title" id="product-journey">
    <div className="rw-journey-heading"><p>VÒNG ĐỜI MÓN ĐỒ</p><h2 id="product-journey-title">Hành trình sản phẩm</h2></div>
    {loading && <p role="status">Đang tải hành trình từ REWEAR…</p>}
    {error && <div role="alert"><p>{error}</p><button type="button" onClick={() => setReload(value => value + 1)}>Thử lại</button></div>}
    {journey && <div className="rw-journey-grid"><div>
      {upcycled && <div className="rw-journey-switch" role="group" aria-label="Ảnh trước và sau tái chế">
        <button type="button" aria-pressed={showBefore} onClick={() => setShowBefore(true)}>Trước tái chế</button>
        <button type="button" aria-pressed={!showBefore} onClick={() => setShowBefore(false)}>Sau tái chế</button>
      </div>}
      <div className="rw-journey-images" aria-live="polite">{images.length ? images.map((src, index) => <img key={src} src={src} alt={`${upcycled && showBefore ? 'Món đồ trước tái chế' : 'Sản phẩm đã đăng bán'} ${index + 1}`} loading="lazy" onError={event => { event.currentTarget.hidden = true; event.currentTarget.parentElement.dataset.imageError = 'true'; }} />) : <p>Chưa có ảnh công khai cho giai đoạn này.</p>}</div>
      <p className="rw-journey-image-error">Một số ảnh chưa tải được. Bạn có thể thử tải lại trang.</p>
    </div><div>
      {journey.transformationDescription && <p className="rw-journey-description">{formatCatalogText(journey.transformationDescription)}</p>}
      {journey.isPreview ? <p className="rw-journey-incomplete">Thiết kế đang chờ xác nhận hàng thực tế trước khi mở bán. Bộ ảnh minh họa không phải hồ sơ kiểm định hay bằng chứng sản xuất.</p> : <>
        {journey.stages.length ? <ol className="rw-journey-timeline">{journey.stages.map(stage => <li key={stage.code} data-stage={stage.code}><strong>{stage.label}</strong><time dateTime={stage.occurredAt}>{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(stage.occurredAt))}</time></li>)}</ol> : <p>Hồ sơ chưa có mốc thời gian công khai.</p>}
        {!journey.isComplete && <p className="rw-journey-incomplete">Hồ sơ hiện chưa đủ tất cả các mốc. REWEAR chỉ hiển thị thông tin đã được lưu trong hệ thống.</p>}
      </>}
    </div></div>}
  </section>;
}
