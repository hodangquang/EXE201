import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { authFetch } from '../services/auth';

const CartContext = createContext(null);

const readField = (source, ...fieldNames) => {
  if (!source || typeof source !== 'object') return undefined;
  const normalizedNames = new Set(fieldNames.map(name => name.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const key = Object.keys(source).find(name =>
    normalizedNames.has(name.toLowerCase().replace(/[^a-z0-9]/g, ''))
  );
  const value = key === undefined ? undefined : source[key];
  return value === '' || value === null ? undefined : value;
};

const parsePrice = value => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (value && typeof value === 'object') {
    const nested = readField(value, 'amount', 'value', 'price', 'unitPrice');
    return nested === undefined ? 0 : parsePrice(nested);
  }

  const raw = String(value ?? '').trim().replace(/[^\d,.-]/g, '');
  if (!raw || !/\d/.test(raw)) return 0;

  const lastDot = raw.lastIndexOf('.');
  const lastComma = raw.lastIndexOf(',');
  const lastSeparator = Math.max(lastDot, lastComma);
  const separator = lastSeparator < 0 ? '' : raw[lastSeparator];
  const decimalsAfterSeparator = separator ? raw.length - lastSeparator - 1 : 0;
  const hasBothSeparators = lastDot >= 0 && lastComma >= 0;
  const isDecimalSeparator = hasBothSeparators
    ? decimalsAfterSeparator > 0 && decimalsAfterSeparator < 3
    : separator && decimalsAfterSeparator > 0 && decimalsAfterSeparator < 3;

  let normalized = raw.replace(/[.,]/g, '');
  if (isDecimalSeparator) {
    const digitsBefore = raw.slice(0, lastSeparator).replace(/[.,]/g, '');
    const digitsAfter = raw.slice(lastSeparator + 1).replace(/[.,]/g, '');
    normalized = `${digitsBefore}.${digitsAfter}`;
  }

  return Number(normalized) || 0;
};

const unwrapProduct = response => {
  let product = response;
  for (let depth = 0; depth < 3 && product && typeof product === 'object' && !Array.isArray(product); depth += 1) {
    const nested = readField(product, 'data', 'result', 'product');
    if (nested === undefined || nested === product) break;
    product = Array.isArray(nested) ? nested[0] : nested;
  }
  return product;
};

const readImageUrl = source => {
  const value = readField(source, 'images', 'imageUrls', 'imageUrl', 'productImage', 'productImageUrl', 'mainImage');
  const candidates = Array.isArray(value) ? value : value === undefined ? [] : [value];
  for (const candidate of candidates) {
    const url = typeof candidate === 'string'
      ? candidate
      : readField(candidate, 'imageUrl', 'url', 'src');
    if (typeof url === 'string' && url.trim()) return url.trim();
  }
  return '';
};

const parseSelection = value => {
  if (value === undefined) return true;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return !['false', '0', 'no'].includes(String(value).trim().toLowerCase());
};

const parseCartCount = response => {
  let value = readField(response, 'data') ?? response;
  if (value && typeof value === 'object') {
    value = readField(value, 'count', 'cartCount', 'itemCount', 'totalItems', 'totalCount', 'quantity');
    if (value && typeof value === 'object') {
      value = readField(value, 'count', 'cartCount', 'itemCount', 'totalItems', 'totalCount', 'quantity');
    }
  }
  const count = Number(value);
  return Number.isFinite(count) && count >= 0 ? Math.floor(count) : null;
};

const mapCartResponse = (response, fallbackProducts, previousItems = []) => {
  const data = readField(response, 'data') ?? response;
  const items = Array.isArray(data)
    ? data
    : (readField(data, 'items', 'cartItems') || readField(readField(data, 'cart'), 'items', 'cartItems') || []);

  if (!Array.isArray(items)) return [];

  return items.map(item => {
    const nestedProduct = readField(item, 'product', 'productDetail', 'productDetails', 'productInfo', 'productDto', 'productData') || {};
    const itemId = readField(item, 'itemId', 'cartItemId', 'id');
    const productId = readField(item, 'productId') || readField(nestedProduct, 'id', 'productId');
    const previousItem = itemId
      ? previousItems.find(previous => String(previous.itemId) === String(itemId))
      : undefined;
    const selectedValue = readField(item, 'isSelected', 'selected');
    const localProduct = fallbackProducts[String(productId)] || {};
    const cartImageUrl = readImageUrl(nestedProduct) || readImageUrl(item);
    const catalogImageUrl = localProduct.hasImage ? localProduct.img : '';
    const priceFields = ['productPrice', 'unitPrice', 'price', 'currentPrice', 'sellingPrice', 'salePrice', 'priceAtPurchase', 'amount'];
    const priceCandidates = [
      localProduct.rawPrice,
      ...priceFields.flatMap(field => [readField(item, field), readField(nestedProduct, field)]),
      localProduct.price,
    ].filter(value => value !== undefined);
    const rawPrice = priceCandidates.find(value => parsePrice(value) > 0);
    const parsedPrice = rawPrice === undefined ? null : parsePrice(rawPrice);

    return {
      id: itemId || productId,
      itemId,
      productId,
      isSelected: selectedValue === undefined ? previousItem?.isSelected ?? true : parseSelection(selectedValue),
      name: localProduct.name
        || readField(item, 'productName', 'productTitle')
        || readField(nestedProduct, 'productName', 'productTitle', 'title', 'name')
        || readField(item, 'name')
        || 'Sản phẩm',
      color: readField(item, 'color', 'selectedColor')
        || readField(nestedProduct, 'color')
        || localProduct.defaultColor
        || 'Mặc định',
      size: readField(item, 'size', 'selectedSize')
        || readField(nestedProduct, 'size')
        || localProduct.defaultSize
        || 'M',
      price: parsedPrice,
      img: cartImageUrl || catalogImageUrl,
      quantity: Number(readField(item, 'quantity')) > 0 ? Number(readField(item, 'quantity')) : 1,
      isUnique: readField(item, 'isUnique') === true,
      maxQuantity: readField(item, 'isUnique') === true ? 1 : Number(readField(item, 'stockQuantity') ?? 20),
    };
  });
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCountFromApi, setCartCountFromApi] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const fallbackProducts = useRef({});
  const cartItemsRef = useRef(cartItems);

  useEffect(() => { cartItemsRef.current = cartItems; }, [cartItems]);

  const refreshCart = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setCartLoading(true);
    setCartError('');
    try {
      const response = await authFetch('/api/cart', { method: 'GET' });
      let mappedItems = mapCartResponse(response, fallbackProducts.current, cartItemsRef.current);
      const productsNeedingDetails = [...new Set(mappedItems
        .filter(item => (item.price === null || !item.img) && item.productId)
        .map(item => String(item.productId)))];
      if (productsNeedingDetails.length) {
        const productResults = await Promise.allSettled(productsNeedingDetails.map(async productId => {
          const productResponse = await authFetch(`/api/Products/${encodeURIComponent(productId)}`, { method: 'GET' });
          const product = unwrapProduct(productResponse);
          const fields = ['price', 'productPrice', 'unitPrice', 'currentPrice', 'sellingPrice', 'salePrice'];
          const rawPrice = fields.map(field => readField(product, field)).find(value => value !== undefined && parsePrice(value) > 0);
          return {
            productId,
            price: rawPrice === undefined ? null : parsePrice(rawPrice),
            imageUrl: readImageUrl(product),
          };
        }));
        const detailsByProductId = new Map(productResults
          .filter(result => result.status === 'fulfilled')
          .map(result => [result.value.productId, result.value]));
        mappedItems = mappedItems.map(item => {
          const details = detailsByProductId.get(String(item.productId));
          if (!details) return item;
          return {
            ...item,
            price: item.price ?? details.price,
            img: item.img || details.imageUrl,
          };
        });
      }
      setCartItems(mappedItems);
    } catch (error) {
      setCartError(error.message || 'Không thể tải giỏ hàng. Vui lòng thử lại.');
      console.error('Lỗi khi lấy giỏ hàng:', error);
    } finally {
      if (!silent) setCartLoading(false);
    }
  }, []);

  const refreshCartCount = useCallback(async () => {
    try {
      const response = await authFetch('/api/cart/count', { method: 'GET' });
      const count = parseCartCount(response);
      if (count === null) throw new Error('Phản hồi số lượng giỏ hàng không đúng định dạng.');
      setCartCountFromApi(count);
    } catch (error) {
      setCartCountFromApi(null);
      console.error('Lỗi khi lấy số lượng giỏ hàng:', error);
    }
  }, []);

  const registerProducts = useCallback(products => {
    products.forEach(product => {
      if (product?.id) fallbackProducts.current[String(product.id)] = product;
    });
    setCartItems(items => items.map(item => {
      const product = fallbackProducts.current[String(item.productId)] || {};
      const catalogPrice = parsePrice(product.rawPrice ?? product.price);
      return {
        ...item,
        name: product.name || item.name,
        img: item.img || (product.hasImage ? product.img : ''),
        price: catalogPrice > 0 ? catalogPrice : item.price,
      };
    }));
  }, []);

  useEffect(() => {
    refreshCart();
    refreshCartCount();
  }, [refreshCart, refreshCartCount]);

  const openCart = useCallback(() => {
    setCartOpen(true);
    refreshCart();
    refreshCartCount();
  }, [refreshCart, refreshCartCount]);

  const closeCart = useCallback(() => setCartOpen(false), []);

  const addToCart = useCallback(async product => {
    if (!product?.id) throw new Error('Không tìm thấy sản phẩm để thêm vào giỏ.');
    fallbackProducts.current[String(product.id)] = product;
    await authFetch('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId: String(product.id), quantity: 1 }),
    });
    await Promise.all([refreshCart(), refreshCartCount()]);
    setCartOpen(true);
  }, [refreshCart, refreshCartCount]);

  const clearCart = useCallback(async () => {
    await authFetch('/api/cart', { method: 'DELETE' });
    setCartItems([]);
    setCartCountFromApi(0);
    setCartError('');
    await refreshCartCount();
  }, [refreshCartCount]);

  const updateCartItemQuantity = useCallback(async (itemId, quantity) => {
    if (!itemId) throw new Error('Không tìm thấy mã mục giỏ hàng. Hãy tải lại giỏ hàng rồi thử lại.');
    const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
    await authFetch(`/api/cart/items/${encodeURIComponent(itemId)}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity: normalizedQuantity }),
    });
    setCartItems(items => items.map(item =>
      String(item.itemId) === String(itemId) ? { ...item, quantity: normalizedQuantity } : item
    ));
    setCartError('');
    await refreshCartCount();
  }, [refreshCartCount]);

  const selectCartItem = useCallback(async (itemId, isSelected) => {
    if (!itemId) throw new Error('Không tìm thấy mã mục giỏ hàng. Hãy tải lại giỏ hàng rồi thử lại.');
    await authFetch(`/api/cart/items/${encodeURIComponent(itemId)}/select`, {
      method: 'PUT',
      body: JSON.stringify({ isSelected: Boolean(isSelected) }),
    });
    setCartItems(items => items.map(item =>
      String(item.itemId) === String(itemId) ? { ...item, isSelected: Boolean(isSelected) } : item
    ));
    setCartError('');
  }, []);

  const selectAllCartItems = useCallback(async (isSelected, onlyAvailable = Boolean(isSelected)) => {
    await authFetch('/api/cart/items/select-all', {
      method: 'PUT',
      body: JSON.stringify({ isSelected: Boolean(isSelected), onlyAvailable: Boolean(onlyAvailable) }),
    });
    setCartItems(items => items.map(item => ({ ...item, isSelected: Boolean(isSelected) })));
    await refreshCart({ silent: true });
  }, [refreshCart]);

  const removeCartItem = useCallback(async itemId => {
    if (!itemId) throw new Error('Không tìm thấy mã mục giỏ hàng. Hãy tải lại giỏ hàng rồi thử lại.');
    await authFetch(`/api/cart/items/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
    setCartItems(items => items.filter(item => String(item.itemId) !== String(itemId)));
    setCartError('');
    await refreshCartCount();
  }, [refreshCartCount]);

  const cartItemCountFromItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartItemCount = cartCountFromApi ?? cartItemCountFromItems;
  const cartSubtotal = cartItems.some(item => item.price === null) ? null : cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const selectedCartItems = cartItems.filter(item => item.isSelected);
  const selectedCartItemCount = selectedCartItems.reduce((total, item) => total + item.quantity, 0);
  const hasUnpricedSelectedItems = selectedCartItems.some(item => item.price === null);
  const selectedCartSubtotal = hasUnpricedSelectedItems ? null : selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const allCartItemsSelected = cartItems.length > 0 && selectedCartItems.length === cartItems.length;
  const someCartItemsSelected = selectedCartItems.length > 0 && !allCartItemsSelected;
  const value = useMemo(() => ({
    cartItems,
    cartItemCount,
    cartSubtotal,
    selectedCartItemCount,
    selectedCartSubtotal,
    hasUnpricedSelectedItems,
    allCartItemsSelected,
    someCartItemsSelected,
    cartLoading,
    cartError,
    cartOpen,
    openCart,
    closeCart,
    refreshCart,
    refreshCartCount,
    registerProducts,
    addToCart,
    clearCart,
    updateCartItemQuantity,
    selectCartItem,
    selectAllCartItems,
    removeCartItem,
  }), [cartItems, cartItemCount, cartSubtotal, selectedCartItemCount, selectedCartSubtotal, hasUnpricedSelectedItems, allCartItemsSelected, someCartItemsSelected, cartLoading, cartError, cartOpen, openCart, closeCart, refreshCart, refreshCartCount, registerProducts, addToCart, clearCart, updateCartItemQuantity, selectCartItem, selectAllCartItems, removeCartItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart phải được dùng bên trong CartProvider.');
  return context;
}
