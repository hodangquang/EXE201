export const shippingField = (value, ...names) => {
  if (!value || typeof value !== 'object') return undefined;
  const key = Object.keys(value).find(candidate => names.some(name => candidate.toLowerCase() === name.toLowerCase()));
  return key === undefined ? undefined : value[key];
};

export const shippingData = response => {
  let value = response;
  for (let i = 0; i < 3; i += 1) {
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { return value; }
    }
    const nested = shippingField(value, 'data', 'result');
    if (nested === undefined || nested === value) break;
    value = nested;
  }
  return value;
};

export const shippingRows = response => {
  const data = shippingData(response);
  if (Array.isArray(data)) return data;
  const rows = shippingField(data, 'items', 'shipments', 'shippings', 'orders', 'records', 'results');
  return Array.isArray(rows) ? rows : [];
};

export const shippingOrderId = row => {
  const order = shippingField(row, 'order');
  return shippingField(row, 'orderId', 'orderID') ?? shippingField(order, 'id', 'orderId') ?? '';
};

export const shippingStatus = row => shippingField(row, 'status', 'shippingStatus');

export const shippingStatusLabel = status => {
  const labels = { Pending: 'Chờ giao', InTransit: 'Đang giao', Delivered: 'Đã giao', Failed: 'Giao thất bại' };
  if (status === undefined || status === null || status === '') return 'Chưa có trạng thái';
  return labels[status] || `Mã trạng thái ${status}`;
};

export const shippingRates = response => {
  const data = shippingData(response);
  const rows = Array.isArray(data) ? data : shippingField(data, 'rates', 'items', 'methods', 'shippingRates');
  if (Array.isArray(rows)) {
    if (rows.length === 0) return [];
    const options = rows.map((row, index) => {
      const rawMethod = shippingField(row, 'method', 'shippingMethod', 'methodId', 'id');
      const method = typeof rawMethod === 'string' && /^(standard|express)$/i.test(rawMethod)
        ? (rawMethod.toLowerCase() === 'standard' ? 0 : 1)
        : Number(rawMethod ?? index);
      return { method, label: method === 0 ? 'Giao tiêu chuẩn' : 'Giao nhanh' };
    }).filter(row => Number.isInteger(row.method) && row.method >= 0 && row.method <= 1);
    if (options.length) return [...new Map(options.map(option => [option.method, option])).values()];
  }
  if (data && typeof data === 'object') {
    const methods = [0, 1].filter(method => shippingField(data, method === 0 ? 'standard' : 'express') !== undefined);
    if (methods.length) return methods.map(method => ({ method, label: method === 0 ? 'Giao tiêu chuẩn' : 'Giao nhanh' }));
  }
  // Contract hiện mô tả Standard/Express và phí 0, nhưng chưa công bố shape data chi tiết.
  return [{ method: 0, label: 'Giao tiêu chuẩn' }, { method: 1, label: 'Giao nhanh' }];
};
