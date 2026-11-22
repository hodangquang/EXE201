import { useEffect, useState } from 'react';
import './SourcingRequestDetail.css';

const conditionLabels = {
  0: 'Như mới', 1: 'Rất tốt', 2: 'Tốt', 3: 'Khá',
  LikeNew: 'Như mới', Excellent: 'Rất tốt', Good: 'Tốt', Fair: 'Khá',
};

const money = (value) => {
  const amount = Number(value);
  return value !== null && value !== undefined && value !== '' && Number.isFinite(amount)
    ? `${amount.toLocaleString('vi-VN')} ₫` : null;
};

const dateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const valueOrDash = (value) => typeof value === 'string' && value.trim() ? value.trim() : 'Chưa cung cấp';

function DetailField({ label, children }) {
  return <div className="srd-field"><dt>{label}</dt><dd>{children}</dd></div>;
}

export default function SourcingRequestDetail({ request, statusLabel, statusTone }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const rawImages = request.imageUrls ?? request.images ?? request.sourcingImages ?? [];
  const images = (Array.isArray(rawImages) ? rawImages : [])
    .map((image) => typeof image === 'string' ? image : image?.imageUrl ?? image?.url)
    .filter((url) => typeof url === 'string' && url.trim());
  const inspectionImages = Array.isArray(request.inspectionImages) ? request.inspectionImages.filter(Boolean) : [];

  useEffect(() => {
    setSelectedImage(0);
    setImageFailed(false);
  }, [request.id]);

  const condition = (value) => value === null || value === undefined
    ? null : conditionLabels[value] ?? String(value);
  const payoutConfirmed = request.payout && String(request.payout.state ?? 'Confirmed').toLowerCase() === 'confirmed';
  const paidAt = payoutConfirmed ? dateTime(request.payout.paidAt) : null;
  const offeredPrice = money(request.offeredPrice);
  const expectedPrice = money(request.customerExpectedPrice);

  return <div className="srd">
    <div className="srd-intro">
      <div className="srd-intro-copy">
        <span className="srd-eyebrow">Yêu cầu #{String(request.id ?? '').slice(0, 8) || '—'}</span>
        <h4>{request.title || 'Món đồ chưa có tên'}</h4>
        {request.createdAt && <p>Gửi ngày {dateTime(request.createdAt) || 'chưa rõ'}</p>}
      </div>
      <span className={`pp-sourcing-status ${statusTone}`}>{statusLabel}</span>
    </div>

    <section className="srd-section" aria-labelledby="srd-item-heading">
      <h5 id="srd-item-heading">Thông tin món đồ</h5>
      <p className="srd-description">{request.description || 'Chưa có mô tả.'}</p>
      <dl className="srd-facts">
        <DetailField label="Kích cỡ">{valueOrDash(request.size)}</DetailField>
        <DetailField label="Màu sắc">{valueOrDash(request.color)}</DetailField>
        <DetailField label="Tình trạng khách khai báo">{condition(request.declaredCondition) || 'Chưa có'}</DetailField>
        {request.inspectedCondition !== null && request.inspectedCondition !== undefined &&
          <DetailField label="Tình trạng sau kiểm định">{condition(request.inspectedCondition)}</DetailField>}
      </dl>
    </section>

    <section className="srd-section" aria-labelledby="srd-price-heading">
      <h5 id="srd-price-heading">Giá thu mua</h5>
      <div className="srd-prices">
        <div><span>Giá bạn mong muốn</span><strong>{expectedPrice || 'Chưa nhập'}</strong></div>
        <div className="srd-price-offer"><span>REWEAR đề xuất</span><strong>{offeredPrice || 'Chưa có báo giá'}</strong></div>
      </div>
      {request.requiresRevisedAcceptance && <p className="srd-notice" role="status">Giá đã thay đổi sau kiểm định. Vui lòng xem báo giá mới và đồng ý lại trước khi cửa hàng chi trả.</p>}
      {request.rejectReason && <div className="srd-note"><strong>Lý do từ chối</strong><p>{request.rejectReason}</p></div>}
    </section>

    <section className="srd-section" aria-labelledby="srd-payout-heading">
      <h5 id="srd-payout-heading">Chi trả thu mua</h5>
      {payoutConfirmed ? <div className="srd-payout confirmed">
        <strong>Cửa hàng đã ghi nhận chi trả {money(request.payout.amount) || ''}</strong>
        <p>Thông tin chi trả được cửa hàng xác nhận trong hệ thống.</p>
        {(request.payout.reference || paidAt) && <dl className="srd-payout-meta">
          {request.payout.reference && <DetailField label="Mã chứng từ">{request.payout.reference}</DetailField>}
          {paidAt && <DetailField label="Thời điểm ghi nhận">{paidAt}</DetailField>}
        </dl>}
      </div> : <p className="srd-payout">Chưa có xác nhận chi trả từ cửa hàng.</p>}
    </section>

    <section className="srd-section" aria-labelledby="srd-images-heading">
      <h5 id="srd-images-heading">Ảnh món đồ {images.length > 0 && <span>({images.length})</span>}</h5>
      {images.length ? <div className="srd-gallery">
        <div className="srd-image-stage">
          {imageFailed ? <p role="status">Không tải được ảnh này.</p> : <img
            src={images[selectedImage]}
            alt={`Ảnh ${selectedImage + 1} của ${request.title || 'món đồ'}`}
            onError={() => setImageFailed(true)}
          />}
        </div>
        {images.length > 1 && <div className="srd-thumbnails" aria-label="Chọn ảnh món đồ">
          {images.map((url, index) => <button
            type="button" key={`${url}-${index}`}
            className={selectedImage === index ? 'selected' : ''}
            aria-label={`Xem ảnh ${index + 1} trong ${images.length} ảnh`}
            aria-pressed={selectedImage === index}
            onClick={() => { setSelectedImage(index); setImageFailed(false); }}
          ><img src={url} alt="" loading="lazy" /></button>)}
        </div>}
      </div> : <p className="srd-no-image">Chưa có ảnh đính kèm.</p>}
    </section>
    {inspectionImages.length > 0 && <section className="srd-section" aria-labelledby="srd-inspection-images-heading">
      <h5 id="srd-inspection-images-heading">Ảnh ghi nhận khi kiểm định ({inspectionImages.length})</h5>
      <div className="srd-evidence">
        {inspectionImages.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Ảnh kiểm định ${index + 1} của ${request.title || 'món đồ'}`} loading="lazy" />)}
      </div>
    </section>}
  </div>;
}
