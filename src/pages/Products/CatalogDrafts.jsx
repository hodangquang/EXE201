import { useEffect, useState } from 'react';
import { Alert, Button, Empty, Input, Modal } from 'antd';
import { ArrowLeft, ArrowUpRight, Download, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { formatCatalogText } from '../../utils/catalogText';
import './CatalogDrafts.css';

const filters = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Upcycled', label: 'Tái chế sáng tạo' },
];
const kindLabel = product => 'Tái chế sáng tạo';

function DraftImage({ src, alt, ...props }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="rw-drafts-image-error" role="status">Chưa tải được ảnh minh họa.</div>;
  return <img src={src} alt={alt} onError={() => setFailed(true)} {...props} />;
}

export default function CatalogDrafts() {
  const [catalog, setCatalog] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const visibleProducts = (catalog?.products ?? []).filter(product =>
    (filter === 'all' || product.productType === filter) &&
    `${product.title} ${product.sku} ${product.color}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi'))
  );
  useEffect(() => {
    const abort = new AbortController();
    setLoadError('');
    setCatalog(null);
    fetch('/catalog/rewear-drafts.json', { signal: abort.signal })
      .then(response => {
        if (!response.ok) throw new Error('Không tải được bộ sản phẩm đề xuất.');
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data.products)) throw new Error('Dữ liệu đề xuất chưa hợp lệ.');
        if (!abort.signal.aborted) setCatalog({ ...data, products: data.products.filter(product => product.productType === 'Upcycled') });
      })
      .catch(() => { if (!abort.signal.aborted) setLoadError('Chưa tải được bộ sản phẩm đề xuất. Vui lòng thử lại.'); });
    return () => abort.abort();
  }, [revision]);
  useEffect(() => {
    const previous = document.title;
    document.title = 'Bản lưu ý tưởng sản phẩm | REWEAR';
    return () => { document.title = previous; };
  }, []);

  if (loadError) return <div className="rw-admin-page rw-drafts" role="alert"><h1>Chưa tải được bộ sản phẩm</h1><p>{loadError}</p><Button onClick={() => setRevision(value => value + 1)}>Thử lại</Button></div>;
  if (!catalog) return <div className="rw-admin-page rw-drafts" role="status">Đang tải bộ sản phẩm đề xuất…</div>;

  return <div className="rw-admin-page rw-drafts">
    <Link className="rw-drafts-back" to="/products"><ArrowLeft size={16} /> Danh sách sản phẩm</Link>
    <header className="rw-drafts-header">
      <div><p className="editorial-sub">REWEAR / BẢN LƯU Ý TƯỞNG</p>
        <h1 className="editorial-title">{catalog.title}</h1>
        <p className="rw-drafts-intro">Nội dung và bộ ảnh lưu các ý tưởng sản phẩm tái chế. Trạng thái bán hiện tại được quản lý ở Danh sách sản phẩm.</p>
      </div>
      <Button href="/catalog/rewear-drafts.json" download="rewear-san-pham-de-xuat.json" icon={<Download size={16} />}>Tải bản lưu JSON</Button>
    </header>
    <Alert type="info" showIcon title="Bản lưu ý tưởng — không phải trạng thái bán" description="Trang này chỉ giữ ý tưởng tái chế ban đầu, không cập nhật theo API. Đăng bán thành phẩm từ dự án tái chế đã hoàn thiện và đạt kiểm định." />
    <div className="rw-drafts-stats" aria-label="Tổng quan bộ sản phẩm">
      <p><strong>{catalog.products.length}</strong> ý tưởng tái chế</p><p><strong>{catalog.products.filter(product => product.beforeImages?.length).length}</strong> mẫu có ảnh nguyên liệu</p>
    </div>
    <div className="rw-drafts-tools">
      <div className="rw-drafts-filters" role="group" aria-label="Lọc loại sản phẩm">{filters.map(item =>
        <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item.label}</button>
      )}</div>
      <Input allowClear prefix={<Search size={16} />} aria-label="Tìm trong bộ sản phẩm đề xuất" placeholder="Tìm tên, mã hoặc màu sắc" value={search} onChange={event => setSearch(event.target.value)} />
    </div>
    <p className="rw-drafts-count" role="status">{visibleProducts.length} sản phẩm · Giá đề xuất</p>
    {visibleProducts.length ? <div className="rw-drafts-grid">{visibleProducts.map(product =>
      <article className="rw-drafts-card" key={product.sku}>
        <button type="button" className="rw-drafts-photo" onClick={() => setSelected(product)} aria-label={`Xem ${product.title}`}>
          <DraftImage src={product.imageUrls[0]} alt={product.title} loading="lazy" width="1024" height="1536" />
          <span className="rw-drafts-kind">{kindLabel(product)}</span>
        </button>
        <div className="rw-drafts-card-body"><p className="rw-drafts-sku">{product.sku} · {product.categoryName}</p>
          <h2><button type="button" onClick={() => setSelected(product)}>{product.title}<ArrowUpRight size={18} /></button></h2>
          <div className="rw-drafts-price"><strong>{formatCurrency(product.proposedPrice)}</strong><span>{product.color}</span></div>
          <p className="rw-drafts-caption">{product.productType === 'Upcycled' ? 'Xem ảnh nguyên liệu và thiết kế thành phẩm' : 'Xem ảnh và nội dung sản phẩm'}</p>
        </div>
      </article>
    )}</div> : <Empty description="Không có sản phẩm phù hợp. Thử đổi từ khóa hoặc bộ lọc." />}
    <section className="rw-drafts-checklist" aria-labelledby="drafts-checklist-title">
      <h2 id="drafts-checklist-title">Cách dùng bản lưu</h2>
      <ol><li>Xem lại ý tưởng, giá dự kiến và ảnh đã chuẩn bị ban đầu.</li>
        <li>Quản lý thông tin và trạng thái bán của từng món tại Danh sách sản phẩm.</li>
        <li>Tạo dự án tái chế và kiểm định thành phẩm trước khi đăng bán.</li>
      </ol>
      <p>Trang này đọc tệp JSON tĩnh; mọi thao tác xem hoặc tải dữ liệu tại đây không thay đổi sản phẩm, tồn kho hay đơn hàng.</p>
    </section>
    <Modal open={!!selected} title={selected?.title} onCancel={() => setSelected(null)} footer={null} width={980} destroyOnHidden rootClassName="rw-drafts-modal">
      {selected && <div className="rw-drafts-detail">
        <p className="rw-drafts-detail-status">{selected.sku} · {kindLabel(selected)} · Bản lưu ý tưởng</p>
        <div className={`rw-drafts-comparison ${selected.productType === 'Upcycled' ? '' : 'rw-drafts-comparison--single'}`}>
          {selected.beforeImages.map(src => <figure key={src}><DraftImage src={src} alt={`Nguyên liệu trước tái chế: ${selected.proposedSourceMaterial}`} width="1024" height="1536" /><figcaption>Trước tái chế · Nguyên liệu đề xuất</figcaption><a href={src} download>Tải ảnh trước tái chế</a></figure>)}
          {selected.imageUrls.map((src, index) => <figure key={src}><DraftImage src={src} alt={`${selected.title} — ${selected.imageLabels?.[index] || `Ảnh ${index + 1}`}`} width="1024" height="1536" /><figcaption>{selected.productType === 'Upcycled' ? 'Sau tái chế' : 'Sản phẩm'} · {selected.imageLabels?.[index] || `Ảnh ${index + 1}`}</figcaption><a href={src} download>Tải ảnh {selected.imageLabels?.[index]?.toLocaleLowerCase('vi') || index + 1}</a></figure>)}
        </div>
        <dl className="rw-drafts-specs"><div><dt>Giá đề xuất</dt><dd>{formatCurrency(selected.proposedPrice)}</dd></div><div><dt>Cỡ đề xuất</dt><dd>{selected.proposedSize}</dd></div><div><dt>Màu thiết kế</dt><dd>{selected.color}</dd></div><div><dt>Tình trạng lúc soạn</dt><dd>Chưa xác nhận</dd></div></dl>
        <h3>Nội dung mô tả đề xuất</h3><p>{selected.description}</p>
        {selected.transformationDescription && <><h3>Ý tưởng tái chế</h3><p>{formatCatalogText(selected.transformationDescription)}</p></>}
      </div>}
    </Modal>
  </div>;
}
