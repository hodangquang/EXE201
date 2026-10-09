const STORAGE_KEY = 'auth_session';
const EVENT = 'auth-changed';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const apiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

let activeRequests = 0;

const emitLoading = (isLoading) => {
  window.dispatchEvent(new CustomEvent('global-loading', { detail: isLoading }));
};

export const incrementRequest = () => {
  activeRequests++;
  if (activeRequests === 1) emitLoading(true);
};

export const decrementRequest = () => {
  activeRequests = Math.max(0, activeRequests - 1);
  if (activeRequests === 0) emitLoading(false);
};

export const getAvatarUrl = (u) => u?.avatarUrl || u?.avatar || u?.profilePicture || '';

export const getSession = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    if (s?.token && isExpired(stripBearer(s.token))) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
};

const stripBearer = (t) => (typeof t === 'string' ? t.replace(/^Bearer\s+/i, '').trim() : null);

export const extractToken = (data = {}) =>
  stripBearer(data.token || data.accessToken || data.jwt || data.data?.token || data.data?.accessToken || null);

/** true if JWT `exp` has passed */
const isExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp ? payload.exp * 1000 < Date.now() : false;
  } catch {
    return false;
  }
};

export const saveSession = (data) => {
  const session = { ...data, token: extractToken(data) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(EVENT));
};

export const updateSessionUser = (patch) => {
  const s = getSession();
  if (!s) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, ...patch }));
  window.dispatchEvent(new Event(EVENT));
};

export const clearSession = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
};

export const onAuthChange = (cb) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export const authFetch = async (url, options = {}) => {
  const { skipGlobalLoading = false, ...requestOptions } = options;
  if (!skipGlobalLoading) incrementRequest();
  try {
    const session = getSession();
    const token = session?.token ? stripBearer(session.token) : null;
    const isForm = requestOptions.body instanceof FormData;
    const res = await fetch(apiUrl(url), {
      ...requestOptions,
      headers: {
        ...(isForm ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...requestOptions.headers,
      },
    });

    const contentType = res.headers.get('content-type')?.toLowerCase() || '';
    const isJson = contentType.includes('application/json')
      || contentType.includes('+json')
      || contentType.includes('text/json');

    // Đọc dưới dạng text trước để tránh lỗi "Unexpected end of JSON input"
    const text = await res.text();
    let data;
    try {
      data = (isJson && text) ? JSON.parse(text) : text;
    } catch {
      data = text;
    }

    if (res.status === 401) {
      clearSession();
      const error = new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      error.status = 401;
      throw error;
    }
    
    if (!res.ok) {
      const errorMessage = (data && typeof data === 'object') 
        ? (data.message || data.title || data.detail) 
        : (typeof data === 'string' && data.trim() ? data : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      const error = new Error(errorMessage || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      error.status = res.status;
      throw error;
    }
    return data;
  } finally {
    if (!skipGlobalLoading) decrementRequest();
  }
};

export const profileApi = {
  get: () => authFetch('/api/Profile'),
  update: (body) => authFetch('/api/Profile', { method: 'PUT', body: JSON.stringify(body) }),
  uploadAvatar: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return authFetch('/api/Profile/avatar', { method: 'PUT', body: fd });
  },
  addresses: () => authFetch('/api/Profile/addresses'),
  addAddress: (body) => authFetch('/api/Profile/addresses', { method: 'POST', body: JSON.stringify(body) }),
  updateAddress: (id, body) =>
    authFetch(`/api/Profile/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAddress: (id) => authFetch(`/api/Profile/addresses/${id}`, { method: 'DELETE' }),
  setDefault: (id) => authFetch(`/api/Profile/addresses/${id}/default`, { method: 'PUT' }),
};

export const ordersApi = {
  list: ({ status, page = 1, pageSize = 10 } = {}) => {
    const query = new URLSearchParams({ Page: String(page), PageSize: String(pageSize) });
    if (status !== '' && status !== null && status !== undefined) query.set('Status', String(status));
    return authFetch(`/api/orders?${query.toString()}`);
  },
  get: id => authFetch(`/api/orders/${encodeURIComponent(id)}`),
  getByCode: orderCode => authFetch(`/api/orders/code/${encodeURIComponent(orderCode)}`),
};

export const paymentsApi = {
  createSession: orderId => authFetch(`/api/payments/${encodeURIComponent(orderId)}/session`, { method: 'POST' }),
  getStatus: (orderId, options = {}) => authFetch(`/api/payments/${encodeURIComponent(orderId)}/status?_t=${Date.now()}`, { ...options, skipGlobalLoading: true }),
};
