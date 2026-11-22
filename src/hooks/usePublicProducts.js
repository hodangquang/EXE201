import { useState, useEffect } from 'react';
import { authFetch } from '../services/auth';
import { useCart } from '../contexts/CartContext';
import { formatCatalogText } from '../utils/catalogText';

const getColorHex = (colorName) => {
  if (!colorName) return '#1b1b1b';
  const name = colorName.toLowerCase();
  const map = {
    'black': '#1b1b1b',
    'white': '#ffffff',
    'beige': '#d3c8b4',
    'blue': '#4b5d6f',
    'slate blue': '#4b5d6f',
    'indigo': '#1c2e4a',
    'green': '#2e4a2c',
    'red': '#8b0000',
    'xanh chàm': '#1c2e4a',
    'xanh sọc phối kem': '#9eafc5',
    'kem': '#e6dfcc',
    'xanh lá dịu': '#939d84',
    'xám than': '#4b4c49',
  };
  return map[name] || '#70706f';
};

const readProductField = (product, ...fieldNames) => {
  if (!product || typeof product !== 'object') return undefined;
  const normalizedNames = new Set(fieldNames.map(name => name.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const key = Object.keys(product).find(name =>
    normalizedNames.has(name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  const value = key === undefined ? undefined : product[key];
  return value === '' || value === null ? undefined : value;
};

const parseProductPrice = value => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === undefined) return null;
  const raw = String(value).trim().replace(/[^\d,.-]/g, '');
  if (!raw || !/\d/.test(raw)) return null;
  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');
  const lastSeparator = Math.max(lastDot, lastComma);
  const separator = lastSeparator < 0 ? '' : raw[lastSeparator];
  const decimalsAfterSeparator = separator ? raw.length - lastSeparator - 1 : 0;
  const hasBothSeparators = lastDot >= 0 && lastComma >= 0;
  const isDecimalSeparator = hasBothSeparators
    ? decimalsAfterSeparator > 0 && decimalsAfterSeparator < 3
    : Boolean(separator && decimalsAfterSeparator > 0 && decimalsAfterSeparator < 3);
  let normalized = raw.replace(/[.,]/g, '');
  if (isDecimalSeparator) {
    normalized = `${raw.slice(0, lastSeparator).replace(/[.,]/g, '')}.${raw.slice(lastSeparator + 1).replace(/[.,]/g, '')}`;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapApiProductToStoreProduct = (p) => {
  const productId = readProductField(p, 'id', 'productId');
  const productName = readProductField(p, 'title', 'name');
  const categoryName = readProductField(p, 'categoryName', 'category');
  const description = formatCatalogText(readProductField(p, 'description'));
  const rawPrice = parseProductPrice(readProductField(p, 'price'));
  const color = readProductField(p, 'color');
  const size = readProductField(p, 'size');
  const rawImages = readProductField(p, 'images', 'imageUrls');
  const imageLabels = readProductField(p, 'imageLabels') || [];
  const imgs = Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : [];
  const getImageUrl = image => typeof image === 'string'
    ? image
    : readProductField(image, 'imageUrl', 'url', 'src');
  const validImgs = [...new Set(imgs.map(getImageUrl).filter(Boolean))];
  const hasCustomImage = validImgs.length > 0;
  const mainImg = validImgs[0] || '';
  
  const mappedImages = hasCustomImage
    ? validImgs.map((src, idx) => ({ 
        id: `img-${idx}`, 
        src, 
        label: imageLabels[idx] || `Ảnh ${idx + 1}`,
        alt: `${productName || 'Sản phẩm REWEAR'} — ${imageLabels[idx] || `Ảnh ${idx + 1}`}`
      }))
    : [];

  const colorHex = getColorHex(color);

  return {
    id: productId,
    status: readProductField(p, 'status'),
    stockQuantity: Number(readProductField(p, 'stockQuantity') ?? 0),
    productType: readProductField(p, 'productType'),
    isPreview: readProductField(p, 'isPreview') === true,
    imageSource: readProductField(p, 'imageSource') || '',
    isUnique: readProductField(p, 'isUnique') === true,
    name: productName,
    price: rawPrice === null ? null : `${rawPrice.toLocaleString('vi-VN')} ₫`,
    rawPrice,
    currency: "₫",
    color: color ?? '',
    size: size ?? '',
    colors: color ? [
      {
        id: 'color-1',
        name: color,
        hex: colorHex,
        swatchClass: "swatch--black",
        filter: "none",
        thumb: mainImg,
      }
    ] : [],
    features: [],
    images: mappedImages,
    hasImage: Boolean(mainImg),
    hasCustomImage,
    description: description ?? '',
    subtitle: description ?? '',
    originalMaterial: readProductField(p, 'originalMaterial') || '',
    // for listing cards:
    img: mainImg,
    colorsArray: [colorHex]
  };
};

export const usePublicProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { registerProducts } = useCart();

  useEffect(() => {
    // Chỉ sản phẩm đang hoạt động và có trạng thái 0 (Available) được bán công khai.
    authFetch('/api/Products?IsActive=true&Status=0')
      .then(res => {
        const data = Array.isArray(res) ? res : res.data || [];
        const mappedProducts = data
          .filter(product => {
            const status = product.status ?? product.Status;
            return readProductField(product, 'productType') === 'Upcycled' && (status === 0 || status === '0' || status === 'Available');
          })
          .map(mapApiProductToStoreProduct);
        setProducts(mappedProducts);
        registerProducts(mappedProducts);
      })
      .catch(err => {
        console.error('Lỗi tải danh sách sản phẩm public:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getProductById = (id) => products.find(p => p.id === id);

  return { products, loading, getProductById };
};

export const usePublicProduct = id => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const abort = new AbortController(); setLoading(true); setError(''); setProduct(null);
    authFetch('/api/Products/' + encodeURIComponent(id), { signal: abort.signal, skipGlobalLoading: true })
      .then(response => { if (!abort.signal.aborted) { const data = response.data ?? response; setProduct(readProductField(data, 'productType') === 'Upcycled' ? mapApiProductToStoreProduct(data) : null); } })
      .catch(e => { if (!abort.signal.aborted && e.status !== 404) setError('Chưa tải được sản phẩm. Vui lòng thử lại.'); })
      .finally(() => { if (!abort.signal.aborted) setLoading(false); });
    return () => abort.abort();
  }, [id, revision]);
  return { product, loading, error, retry: () => setRevision(value => value + 1) };
};
