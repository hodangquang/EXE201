import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Drawer, Form, Image, Input, InputNumber, Modal, Select, Space, Table, Tag, Timeline, Upload, message } from 'antd';
import { operationsApi } from '../../services/operations';
import { authFetch } from '../../services/auth';
import { formatCurrency as money, formatDate } from '../../utils/formatters';
import './OperationsPage.css';

export const lifecycleLabels = {
  AwaitingInspection: 'Chờ kiểm định', AwaitingCustomerAcceptance: 'Chờ người gửi đồng ý lại', AwaitingPayout: 'Chờ chi trả',
  AvailableRaw: 'Nguyên liệu sẵn sàng', ReservedForUpcycling: 'Đã cấp cho dự án', UpcyclingInProgress: 'Đang tái chế',
  FinishedAwaitingQC: 'Thành phẩm chờ QC', ReadyRetail: 'Sẵn sàng bán lẻ', Consumed: 'Đã dùng tạo thành phẩm',
  ReturnToSenderPending: 'Chờ trả người gửi', ReturnedToSender: 'Đã trả người gửi', Pending: 'Chờ thực hiện', InProgress: 'Đang thực hiện',
  QualityCheck: 'Chờ QC', QCApproved: 'QC đạt', Rework: 'Cần làm lại', Completed: 'Hoàn tất',
  Reserved: 'Đang giữ cho đơn hàng', Sold: 'Đã bán', ReturnAwaitingInspection: 'Hàng hoàn chờ kiểm định',
  ReturnAwaitingRefund: 'Hàng hoàn chờ hoàn tiền', Quarantined: 'Cách ly, chưa được bán lại',
};
const custodyLabels = { Warehouse: 'Trong kho', Shipper: 'Người giao hàng đang giữ', Buyer: 'Đã giao người mua', Sender: 'Đã trả người gửi', Transformed: 'Đã chuyển thành thành phẩm', Unknown: 'Chưa có hồ sơ nơi giữ' };
const status = value => <Tag color={['Completed', 'QCApproved', 'AvailableRaw', 'ReadyRetail'].includes(value) ? 'green' : ['Rework', 'ReturnToSenderPending'].includes(value) ? 'orange' : 'default'}>{lifecycleLabels[value] || value}</Tag>;
const actionTitles = {
  create: 'Tạo dự án tái chế',
  progress: 'Cập nhật tiến độ',
  cost: 'Ghi nhận chi phí',
  qc: 'Kiểm định thành phẩm tái chế',
  publish: 'Đăng bán thành phẩm tái chế',
  returnSource: 'Xác nhận trả người gửi',
};

export default function OperationsPage({ mode = 'projects' }) {
  const { id } = useParams(); const [params] = useSearchParams(); const navigate = useNavigate();
  const [data, setData] = useState({ inventory: [], projects: [], operators: [], brands: [], categories: [] });
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [query, setQuery] = useState(''); const [filter, setFilter] = useState('');
  const [detail, setDetail] = useState(null); const [detailBusy, setDetailBusy] = useState(false);
  const [action, setAction] = useState(null); const [busy, setBusy] = useState(false); const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]); const [form] = Form.useForm();
  const [autoOpened, setAutoOpened] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [inventory, projects, operators, brands, categories] = await Promise.all([
        operationsApi.inventory(), operationsApi.projects(), operationsApi.operators(),
        authFetch('/api/Brands?isActive=true', { skipGlobalLoading: true }),
        authFetch('/api/Categories?isActive=true', { skipGlobalLoading: true }),
      ]);
      setData({ inventory, projects, operators, brands: brands.data ?? brands, categories: categories.data ?? categories });
    } catch (e) { setError(e.message || 'Chưa tải được dữ liệu vận hành.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const view = useCallback(async recordId => {
    setDetailBusy(true);
    try {
      if (mode === 'inventory') {
        const [movements, inspections] = await Promise.all([
          operationsApi.movements(recordId).catch(() => []),
          operationsApi.inventoryInspections(recordId).catch(() => []),
        ]);
        setDetail({
          inventory: data.inventory.find(i => i.id === recordId),
          movements,
          inspections,
        });
      } else {
        setDetail(await operationsApi.project(recordId));
      }
    }
    catch (e) { message.error(e.message); }
    finally { setDetailBusy(false); }
  }, [mode, data.inventory]);
  useEffect(() => { if (id && mode !== 'inventory') view(id); }, [id, mode, view]);

  useEffect(() => {
    const invId = params.get('inventory');
    if (invId && mode === 'projects' && !action && !autoOpened && data.operators.length > 0) {
      const titleParam = params.get('title') ? decodeURIComponent(params.get('title')) : '';
      form.resetFields(); setUploaded([]);
      form.setFieldsValue({
        responsibleStaffId: data.operators[0]?.id,
        inventoryIds: [invId],
        state: 'InProgress',
        kind: 'Material',
        passed: true,
        title: titleParam ? `Tái chế: ${titleParam}` : 'Dự án tái chế mới',
        concept: 'Tái thiết kế và nâng cấp từ nguyên liệu thời trang tuần hoàn.',
        idempotencyKey: crypto.randomUUID()
      });
      setAction({ type: 'create', record: null });
      setAutoOpened(true);
    }
  }, [params, mode, action, autoOpened, data.operators, form]);

  const openAction = (type, record) => {
    form.resetFields(); setUploaded([]);
    const nextState = record?.state === 'InProgress' ? 'QualityCheck' : 'InProgress';
    form.setFieldsValue({
      responsibleStaffId: data.operators[0]?.id,
      inventoryIds: params.get('inventory') ? [params.get('inventory')] : [],
      state: nextState,
      kind: 'Material',
      passed: true,
      title: record?.title,
      description: '',
      idempotencyKey: crypto.randomUUID()
    });
    setAction({ type, record });
  };

  const submit = async values => {
    setBusy(true);
    try {
      const recordId = action.record?.id;
      if (action.type === 'create') await operationsApi.createProject({ ...values, plannedCompletion: values.plannedCompletion ? new Date(values.plannedCompletion + 'T00:00:00').toISOString() : null });
      if (action.type === 'progress') await operationsApi.updateProject(recordId, { ...values, ...(uploaded.length ? { afterImages: uploaded } : {}) });
      if (action.type === 'cost') await operationsApi.addCost(recordId, values);
      if (action.type === 'qc') await operationsApi.inspectProject(recordId, { ...values, images: uploaded });
      if (action.type === 'publish') await operationsApi.publish(recordId, values);
      if (action.type === 'returnSource') await operationsApi.returnSource(recordId, values);
      message.success('Đã lưu kết quả từ hệ thống.'); setAction(null); await load();
      if (detail?.project?.id === recordId || detail?.inventory?.id === recordId) await view(recordId);
    } catch (e) { message.error(e.message); }
    finally { setBusy(false); }
  };

  const upload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const body = new FormData(); body.append('file', file);
      const response = await authFetch('/api/operations/images', { method: 'POST', body });
      const url = response.data?.url; if (!url) throw new Error('Hệ thống chưa trả về ảnh.');
      setUploaded(previous => [...previous, url]); onSuccess({ url });
    } catch (e) { message.error(e.message); onError(e); }
    finally { setUploading(false); }
  };

  const imageUpload = <Form.Item label="Ảnh thành phẩm / bằng chứng (JPEG, PNG, WebP, tối đa 5 MB/ảnh)">
    <Upload key={action?.type + action?.record?.id} customRequest={upload} accept="image/jpeg,image/png,image/webp" maxCount={5} multiple={false}
      beforeUpload={file => { if (file.size > 5 * 1024 * 1024 || uploaded.length >= 5) { message.error('Tối đa 5 ảnh, mỗi ảnh không quá 5 MB.'); return Upload.LIST_IGNORE; } return true; }}
      onRemove={file => setUploaded(previous => previous.filter(url => url !== file.response?.url))}><Button loading={uploading}>Tải ảnh lên</Button></Upload>
  </Form.Item>;

  const projectActions = p => <Space wrap>
    <Button size="small" onClick={() => view(p.id)}>Chi tiết</Button>
    {['Pending', 'InProgress', 'Rework'].includes(p.state) && <><Button size="small" onClick={() => openAction('progress', p)}>{p.state === 'InProgress' ? 'Gửi QC' : 'Bắt đầu thực hiện'}</Button><Button size="small" onClick={() => openAction('cost', p)}>Thêm chi phí</Button></>}
    {p.state === 'QualityCheck' && <Button type="primary" size="small" onClick={() => openAction('qc', p)}>Kiểm định QC</Button>}
    {p.state === 'QCApproved' && <Button type="primary" size="small" onClick={() => openAction('publish', p)}>Đăng bán</Button>}
    {p.productId && <Link to={`/products/${p.productId}`}>Sản phẩm</Link>}
  </Space>;

  const inventoryMode = mode === 'inventory'; const qcMode = mode === 'qc';
  const effectiveIsInventory = inventoryMode;

  const rows = (effectiveIsInventory ? data.inventory : data.projects).filter(row => {
    if (qcMode && !['QualityCheck', 'QCApproved', 'Rework', 'Completed'].includes(row.state)) return false;
    if (filter && row.state !== filter) return false;
    return `${row.title} ${row.id} ${row.sourcingId || ''}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi'));
  });

  const columns = effectiveIsInventory ? [
    { title: 'Món đồ', dataIndex: 'title', render: (text, row) => <><strong>{text}</strong><div className="ops-muted">Nguồn: {row.sourcingId}</div></> },
    { title: 'Trạng thái', dataIndex: 'state', render: status },
    { title: 'Giá thu mua', dataIndex: 'acquisitionCost', render: money },
    { title: 'Vị trí', dataIndex: 'location' },
    { title: 'Nơi giữ thực tế', dataIndex: 'custody', render: value => custodyLabels[value] || custodyLabels.Unknown },
    {
      title: 'Thao tác',
      render: (_, row) => <Space wrap>
        <Button size="small" onClick={() => view(row.id)}>Lịch sử</Button>
        {['AvailableRaw', 'QCApproved', 'Rework'].includes(row.state) && !row.projectId && !row.productId &&
          <Button type="primary" size="small" onClick={() => navigate(`/upcycling?inventory=${row.id}&title=${encodeURIComponent(row.title)}`)}>Tạo dự án tái chế</Button>}
        {row.state === 'ReturnToSenderPending' && <Button size="small" onClick={() => openAction('returnSource', row)}>Ghi nhận trả đồ</Button>}
        {row.projectId && <Link to={`/upcycling/${row.projectId}`}>Dự án</Link>}
        {row.productId && <Link to={`/products/${row.productId}`}>Sản phẩm</Link>}
      </Space>
    },
  ] : [
    { title: 'Dự án', dataIndex: 'title', render: (text, row) => <><strong>{text}</strong><div className="ops-muted">{row.concept}</div></> },
    { title: 'Trạng thái', dataIndex: 'state', render: status },
    { title: 'Nguyên liệu', dataIndex: 'inventoryIds', render: ids => ids.length },
    { title: 'Chi phí đã ghi nhận', render: (_, row) => money(row.acquisitionCost + row.costs.reduce((sum, cost) => sum + cost.amount, 0)) },
    { title: 'Thao tác', render: (_, row) => projectActions(row) },
  ];

  const p = detail?.project;
  return <div className="ops-page">
    <div className="ops-heading">
      <div>
        <p className="editorial-sub">VÒNG ĐỜI QUẦN ÁO</p>
        <h1 className="editorial-title">{inventoryMode ? 'Kho vòng đời' : qcMode ? 'Kiểm định & Nghiệm thu QC' : 'Dự án tái chế'}</h1>
        <p className="ops-muted">{inventoryMode ? 'Theo dõi nguyên liệu, thành phẩm và trạng thái hàng hoàn.' : qcMode ? 'Kiểm định chất lượng thành phẩm tái chế trước khi mở bán.' : 'Từ nguyên liệu đã chi trả đến thành phẩm được kiểm định.'}</p>
      </div>
      <Space wrap>
        <Button onClick={load} loading={loading}>Tải lại</Button>
        {!inventoryMode && !qcMode && <Button type="primary" onClick={() => openAction('create')}>Tạo dự án</Button>}
      </Space>
    </div>
    {error && <Alert type="error" title={error} action={<Button onClick={load}>Thử lại</Button>} />}
    <Card>
      <Space wrap style={{ marginBottom: 20 }}>
        <Input.Search aria-label="Tìm món đồ hoặc dự án" placeholder="Tìm theo tên, mã hoặc nguồn hàng" value={query} onChange={e => setQuery(e.target.value)} style={{ width: 'min(320px, 100%)' }} />
        <Select aria-label="Lọc trạng thái" value={filter} onChange={setFilter} style={{ minWidth: 190 }} options={[{ value: '', label: 'Tất cả trạng thái' }, ...[...new Set((effectiveIsInventory ? data.inventory : data.projects).map(row => row.state))].map(value => ({ value, label: lifecycleLabels[value] || value }))]} />
      </Space>
      <Table rowKey="id" dataSource={rows} columns={columns} loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} locale={{ emptyText: error ? 'Chưa tải được dữ liệu' : effectiveIsInventory ? 'Chưa có món đồ phù hợp trong kho' : 'Chưa có dự án phù hợp' }} />
    </Card>
    <Drawer rootClassName="rw-operations-drawer" title={p?.title || detail?.inventory?.title || 'Chi tiết'} open={!!detail || detailBusy} onClose={() => { setDetail(null); if (id) navigate('/upcycling'); }} size="large" loading={detailBusy}>
      {p && <>
        <Space wrap style={{ marginBottom: 20 }}>{status(p.state)}{projectActions(p)}</Space>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Ý tưởng">{p.concept}</Descriptions.Item>
          <Descriptions.Item label="Phụ trách">{data.operators.find(o => o.id === p.responsibleStaffId)?.fullName || p.responsibleStaffId}</Descriptions.Item>
          <Descriptions.Item label="Chi phí thu mua">{money(p.acquisitionCost)}</Descriptions.Item>
          <Descriptions.Item label="Nguyên liệu nguồn">{p.inventoryIds.join(', ')}</Descriptions.Item>
          <Descriptions.Item label="Ngày dự kiến">{formatDate(p.plannedCompletion)}</Descriptions.Item>
          {p.productId && <Descriptions.Item label="Sản phẩm">{<Link to={`/products/${p.productId}`}>Xem trên Storefront</Link>}</Descriptions.Item>}
        </Descriptions>
        <h3>Trước tái chế</h3><Image.PreviewGroup>{p.beforeImages.map((src, i) => <Image key={src + i} src={src} width={110} height={140} style={{ objectFit: 'cover', marginRight: 8 }} />)}</Image.PreviewGroup>
        <h3>Sau tái chế</h3>{p.afterImages.length ? <Image.PreviewGroup>{p.afterImages.map(src => <Image key={src} src={src} width={110} height={140} style={{ objectFit: 'cover', marginRight: 8 }} />)}</Image.PreviewGroup> : <p className="ops-muted">Chưa có ảnh thành phẩm.</p>}
        <h3>Chi phí vật tư và nhân công</h3><Table size="small" pagination={false} rowKey="idempotencyKey" dataSource={p.costs} columns={[{ title: 'Loại', dataIndex: 'kind', render: v => v === 'Labor' ? 'Nhân công' : 'Vật tư' }, { title: 'Số tiền', dataIndex: 'amount', render: money }, { title: 'Ghi chú', dataIndex: 'note' }]} />
        <h3>Lịch sử dự án</h3><Timeline items={p.timeline.map((event, i) => ({ key: i, children: <><strong>{lifecycleLabels[event.to] || event.to}</strong><p>{event.note}</p><small>{formatDate(event.at)}</small></> }))} />
        <h3>Kết quả QC</h3>{detail.inspections?.length ? detail.inspections.map(q => <Alert key={q.id} style={{ marginBottom: 12 }} type={q.passed ? 'success' : 'warning'} title={`${q.passed ? 'Đạt' : 'Cần làm lại'} · ${formatDate(q.createdAt)}`} description={q.note} />) : <p className="ops-muted">Chưa kiểm định.</p>}
      </>}
      {detail?.inventory && <>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Trạng thái">{status(detail.inventory.state)}</Descriptions.Item>
          <Descriptions.Item label="Nguồn tiếp nhận / dự án">{detail.inventory.sourcingId}</Descriptions.Item>
          <Descriptions.Item label="Chi phí thu mua">{money(detail.inventory.acquisitionCost)}</Descriptions.Item>
          {detail.inventory.productId && <Descriptions.Item label="Sản phẩm">{<Link to={`/products/${detail.inventory.productId}`}>Xem trên Storefront</Link>}</Descriptions.Item>}
        </Descriptions>
        {detail.inventory.images?.length > 0 && <>
          <h3>Ảnh hiện vật</h3>
          <Image.PreviewGroup>{detail.inventory.images.map((src, idx) => <Image key={src + idx} src={src} width={100} height={130} style={{ objectFit: 'cover', marginRight: 8 }} />)}</Image.PreviewGroup>
        </>}
        <h3>Kết quả nghiệm thu QC</h3>
        {detail.inspections?.length ? detail.inspections.map(q => <Alert key={q.id} style={{ marginBottom: 12 }} type={q.passed ? 'success' : 'warning'} title={`${q.passed ? 'QC Đạt' : 'Cần làm lại'} · ${formatDate(q.createdAt)}`} description={q.note} />) : <p className="ops-muted">Chưa có lượt kiểm định QC nào.</p>}
        <h3>Biến động kho</h3>
        <Timeline items={detail.movements?.map(m => ({ key: m.id, children: <><strong>{m.toCustody ? custodyLabels[m.toCustody] : lifecycleLabels[m.toState] || m.toState}</strong><p>{m.reason}</p><small>{formatDate(m.createdAt)}</small></> }))} />
      </>}
    </Drawer>
    <Modal rootClassName="rw-operations-modal" open={!!action} title={actionTitles[action?.type]} onCancel={() => !busy && setAction(null)} footer={null} destroyOnHidden width={600}>
      <Form form={form} layout="vertical" onFinish={submit} disabled={busy}>
        {action?.type === 'create' && <>
          <Form.Item name="title" label="Tên dự án" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
          <Form.Item name="concept" label="Ý tưởng thiết kế" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="inventoryIds" label="Nguyên liệu đã chi trả" rules={[{ required: true, type: 'array', min: 1 }]}><Select mode="multiple" options={data.inventory.filter(i => ['AvailableRaw', 'QCApproved', 'Rework'].includes(i.state) && !i.projectId && !i.productId).map(i => ({ value: i.id, label: `${i.title} · ${money(i.acquisitionCost)}` }))} /></Form.Item>
          <Form.Item name="responsibleStaffId" label="Nhân viên phụ trách" rules={[{ required: true }]}><Select options={data.operators.map(o => ({ value: o.id, label: o.fullName }))} /></Form.Item>
          <Form.Item name="plannedCompletion" label="Ngày dự kiến hoàn thành"><Input type="date" /></Form.Item>
        </>}
        {action?.type === 'progress' && <>
          <Form.Item name="state" label="Bước tiếp theo" rules={[{ required: true }]}><Select options={[{ value: action.record.state === 'InProgress' ? 'QualityCheck' : 'InProgress', label: action.record.state === 'InProgress' ? 'Gửi kiểm định thành phẩm' : 'Bắt đầu thực hiện' }]} /></Form.Item>
          {action.record.state === 'InProgress' && imageUpload}
          <Form.Item name="note" label="Ghi chú tiến độ"><Input.TextArea rows={3} /></Form.Item>
        </>}
        {action?.type === 'cost' && <>
          <Form.Item name="idempotencyKey" hidden><Input /></Form.Item>
          <Form.Item name="kind" label="Loại chi phí"><Select options={[{ value: 'Material', label: 'Vật tư bổ sung' }, { value: 'Labor', label: 'Nhân công' }]} /></Form.Item>
          <Form.Item name="amount" label="Số tiền (đồng)" rules={[{ required: true }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="note" label="Nội dung chi phí" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} /></Form.Item>
        </>}
        {action?.type === 'qc' && <>
          <Form.Item name="passed" label="Kết quả QC" rules={[{ required: true }]}><Select options={[{ value: true, label: 'Đạt — cho phép bước đăng bán' }, { value: false, label: 'Không đạt — trả lại làm lại' }]} /></Form.Item>
          <Form.Item name="note" label="Kết quả / lý do cần sửa" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} /></Form.Item>
          {imageUpload}
        </>}
        {action?.type === 'publish' && <>
          <Alert type="info" title="Ảnh thành phẩm đã gửi QC sẽ được dùng cho sản phẩm độc bản." style={{ marginBottom: 16 }} />
          <Form.Item name="title" label="Tên sản phẩm" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="brandId" label="Thương hiệu" rules={[{ required: true }]}><Select options={data.brands.map(b => ({ value: b.id, label: b.name }))} /></Form.Item>
          <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true }]}><Select options={data.categories.map(c => ({ value: c.id, label: c.name }))} /></Form.Item>
          <Form.Item name="sellingPrice" label="Giá bán (đồng)" rules={[{ required: true }]}><InputNumber min={1} precision={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="size" label="Kích cỡ"><Input /></Form.Item>
          <Form.Item name="color" label="Màu sắc"><Input /></Form.Item>
        </>}
        {action?.type === 'returnSource' && <Form.Item name="reference" label="Mã vận đơn / chứng từ trả đồ" rules={[{ required: true, whitespace: true }]}><Input /></Form.Item>}
        <Button type="primary" htmlType="submit" loading={busy} disabled={uploading}>Lưu kết quả</Button>
      </Form>
    </Modal>
  </div>;
}
