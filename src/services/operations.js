import { authFetch } from './auth';

const request = async (path, method = 'GET', body) => {
  const result = await authFetch(`/api/operations${path}`, { method, skipGlobalLoading: true, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  if (result?.success === false) throw new Error(result.message || 'Chưa thực hiện được thao tác.');
  return result?.data ?? result;
};

export const operationsApi = {
  orders: query => request(`/orders?${new URLSearchParams(Object.entries(query).filter(([, v]) => v !== '' && v != null))}`),
  order: id => request(`/orders/${encodeURIComponent(id)}`),
  requestRefund: (id, body) => request(`/orders/${encodeURIComponent(id)}/refund`, 'POST', body),
  reconcile: id => request(`/orders/${encodeURIComponent(id)}/reconcile`, 'POST'),
  metrics: query => request(`/metrics?${new URLSearchParams(query)}`),
  inventory: () => request('/inventory'),
  movements: id => request(`/inventory/${encodeURIComponent(id)}/movements`),
  inventoryInspections: id => request(`/inventory/${encodeURIComponent(id)}/inspections`),
  payouts: () => request('/payouts'),
  operators: () => request('/operators'),
  shippers: () => request('/shippers'),
  confirmPayout: (id, body) => request(`/sourcing/${encodeURIComponent(id)}/payout`, 'POST', body),
  returnSource: (id, body) => request(`/inventory/${encodeURIComponent(id)}/return-to-sender`, 'POST', body),
  projects: () => request('/projects'),
  project: id => request(`/projects/${encodeURIComponent(id)}`),
  createProject: body => request('/projects', 'POST', body),
  updateProject: (id, body) => request(`/projects/${encodeURIComponent(id)}/status`, 'PATCH', body),
  addCost: (id, body) => request(`/projects/${encodeURIComponent(id)}/costs`, 'POST', body),
  inspectProject: (id, body) => request(`/projects/${encodeURIComponent(id)}/qc`, 'POST', body),
  publish: (id, body) => request(`/projects/${encodeURIComponent(id)}/publish`, 'POST', body),

};
