import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, Form, Input, Modal, Select, Space, Table, Tag, Timeline, message } from 'antd';
import { operationsApi } from '../../services/operations';
import { authFetch } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../utils/constants';
import { orderLabel, paymentLabels, shippingLabels } from '../Operations/labels';
import { formatCurrency, formatDate } from '../../utils/formatters';
import '../Operations/OperationsPage.css';

export default function OrderDetail() {
  const { id } = useParams(); const { user } = useAuth();
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const [action, setAction] = useState(''); const [busy, setBusy] = useState(false); const [form] = Form.useForm();
  const load = useCallback(async () => { setLoading(true); setError(''); try { setData(await operationsApi.order(id)); } catch (e) { setError(e.message); } finally { setLoading(false); } }, [id]);
  useEffect(() => { load(); }, [load]);
  const submit = async values => {
    setBusy(true);
    try {
      if (action === 'reship') await authFetch(`/api/admin/shipping/${encodeURIComponent(id)}/reship`, { method: 'POST', body: JSON.stringify(values) });
      else if (action === 'receive') await authFetch(`/api/returns/orders/${encodeURIComponent(id)}/receive`, { method: 'POST', body: JSON.stringify(values) });
      else if (action === 'inspect') await authFetch(`/api/returns/orders/${encodeURIComponent(id)}/inspect`, { method: 'POST', body: JSON.stringify(values) });
      else if (action === 'refund') await operationsApi.requestRefund(id, values);
      else await authFetch(`/api/admin/payments/${encodeURIComponent(id)}/refund/confirm`, { method: 'POST', body: JSON.stringify({ ...values, amount: data.payment.receivedAmount ?? data.payment.amount }) });
      message.success('Đã lưu kết quả từ hệ thống.'); setAction(''); await load();
    } catch (e) { message.error(e.message); } finally { setBusy(false); }
  };
  const order = data?.order; const payment = data?.payment; const shipping = data?.shipping;
  const returnRecord = data?.return;
  const canConfirm = payment?.status === 'Paid' && payment.refundState === 'Requested' && ((!shipping || [0, 'Pending'].includes(shipping.status)) || returnRecord?.state === 'Inspected');
  const canRefund = payment?.status === 'Paid' && (!shipping || [0, 'Pending'].includes(shipping.status)) && (order?.status === 'Confirmed' || payment.requiresReconciliation);
  const reconcile = async () => {
    setBusy(true);
    try { await operationsApi.reconcile(id); message.success('Đã kiểm tra trạng thái thanh toán từ backend.'); await load(); }
    catch (e) { message.error(e.message); } finally { setBusy(false); }
  };
  return <div className="ops-page"><div className="ops-heading"><div><Link to="/orders">← Danh sách đơn hàng</Link><h1 className="editorial-title">{order?.orderCode || 'Chi tiết đơn hàng'}</h1></div><Button loading={loading} onClick={load}>Tải lại</Button></div>
    {error && <Alert type="error" title={error} action={<Button onClick={load}>Thử lại</Button>} />}
    {order && <><Space wrap><Tag>{orderLabel(order.status)}</Tag><Tag color={payment?.requiresReconciliation ? 'orange' : payment?.status === 'Paid' ? 'green' : 'default'}>{payment?.requiresReconciliation ? 'Cần đối soát thanh toán' : paymentLabels[payment?.status] || 'Chưa có phiên thanh toán'}</Tag><Tag>{shipping ? shippingLabels[shipping.status] : 'Chưa phân công giao hàng'}</Tag><Link to="/shipping">Mở quản lý vận chuyển</Link></Space>
      {payment?.requiresReconciliation && <Alert type="warning" title="Giao dịch cần đối soát; không cho phép giao hàng." description={payment.reconciliationReason} />}
      {payment?.refundState === 'Requested' && <Alert type="warning" title="Đang chờ hoàn tiền. Chưa xác nhận tiền đã được hoàn." />}
      <Card title="Thông tin giao hàng"><Descriptions bordered column={{ xs: 1, md: 2 }} size="small"><Descriptions.Item label="Người nhận">{order.shippingAddress.recipientName}</Descriptions.Item><Descriptions.Item label="Liên hệ">{order.shippingAddress.phoneNumber}</Descriptions.Item><Descriptions.Item label="Địa chỉ">{order.shippingAddress.fullAddress}</Descriptions.Item><Descriptions.Item label="Ngày tạo">{formatDate(order.createdAt)}</Descriptions.Item><Descriptions.Item label="Mã vận đơn">{shipping?.trackingNumber || order.trackingNumber || 'Chưa có'}</Descriptions.Item><Descriptions.Item label="Ghi chú">{order.shippingAddress.note || 'Không có'}</Descriptions.Item></Descriptions></Card>
      <Card title="Sản phẩm và tổng tiền"><Table rowKey="id" pagination={false} dataSource={order.items} scroll={{ x: 500 }} columns={[{ title: 'Sản phẩm', dataIndex: 'productTitle', render: (value, row) => <Link to={`/products/${row.productId}`}>{value}</Link> }, { title: 'Số lượng', dataIndex: 'quantity' }, { title: 'Giá chốt', dataIndex: 'unitPrice', render: formatCurrency }, { title: 'Thành tiền', dataIndex: 'lineTotal', render: formatCurrency }]} /><p style={{ marginTop: 20 }}>Tổng thanh toán: <strong>{formatCurrency(order.totalAmount)}</strong></p></Card>
      <Card title="Thanh toán và hoàn tiền"><Descriptions column={1} size="small"><Descriptions.Item label="Số tiền đã nhận">{payment?.paidAt ? formatCurrency(payment.receivedAmount ?? payment.amount) : 'Chưa xác nhận'}</Descriptions.Item><Descriptions.Item label="Ngày thanh toán">{formatDate(payment?.paidAt)}</Descriptions.Item><Descriptions.Item label="Chứng từ hoàn tiền">{payment?.refundReference || 'Chưa có'}</Descriptions.Item><Descriptions.Item label="Ngày hoàn tiền">{formatDate(payment?.refundedAt)}</Descriptions.Item></Descriptions><Space wrap><Button loading={busy} onClick={reconcile}>Đối soát thanh toán</Button>{canRefund && payment.refundState !== 'Requested' && <Button onClick={() => { form.resetFields(); setAction('refund'); }}>Yêu cầu hoàn tiền</Button>}{canConfirm && user?.role === ROLES.ADMIN && <Button onClick={() => { form.resetFields(); setAction('confirm'); }}>Xác nhận chứng từ đã hoàn tiền</Button>}</Space></Card>
      {['Failed', 'Delivered', 'ReturnRequested', 'ReturnReceived', 'Returned'].includes(order.status) && <Card title="Tiếp nhận và kiểm định hàng hoàn">
        <Alert type="info" title="Chỉ xác nhận nhận hàng sau khi đã nhận đủ toàn bộ món trong đơn. Kiểm định và hoàn tiền được ghi nhận riêng." style={{ marginBottom: 16 }} />
        <Space wrap>
          {order.status === 'Failed' && user?.role === ROLES.ADMIN && payment?.status === 'Paid' && !payment.requiresReconciliation && payment.refundState !== 'Requested' && !returnRecord?.receivedAt && <Button onClick={() => { form.resetFields(); setAction('reship'); }}>Yêu cầu giao lại</Button>}
          {['Failed', 'Delivered', 'ReturnRequested'].includes(order.status) && !returnRecord?.receivedAt && <Button onClick={() => { form.resetFields(); setAction('receive'); }}>Ghi nhận đã nhận đủ hàng hoàn</Button>}
          {returnRecord?.state === 'Received' && <Button onClick={() => { form.resetFields(); form.setFieldsValue({ items: order.items.map(item => ({ productId: item.productId, restockApproved: false, condition: 2, note: '' })) }); setAction('inspect'); }}>Kiểm định từng món</Button>}
        </Space>
        {returnRecord && <><Descriptions column={1} style={{ marginTop: 20 }}><Descriptions.Item label="Lý do">{returnRecord.reason}</Descriptions.Item><Descriptions.Item label="Chứng từ nhận hàng">{returnRecord.receiptReference || 'Chưa nhận'}</Descriptions.Item><Descriptions.Item label="Trạng thái">{{ Requested: 'Chờ nhận hàng', Received: 'Đã nhận, chờ kiểm định', Inspected: 'Đã kiểm định, chờ hoàn tiền', RefundConfirmed: 'Đã xác nhận hoàn tiền' }[returnRecord.state]}</Descriptions.Item></Descriptions>
          {returnRecord.items.map(item => <p key={item.productId}>{order.items.find(row => row.productId === item.productId)?.productTitle}: {item.restockApproved ? 'Được duyệt bán lại sau khi hoàn tiền' : 'Cách ly, chưa được bán lại'} · {item.note}</p>)}</>}
      </Card>}
      <Card title="Lịch sử đơn hàng"><Timeline items={data.history.map(event => ({ key: event.id, children: <><strong>{orderLabel(event.toStatus)}</strong><p>{event.note}</p><small>{event.changedByName || event.changedByUserId || 'Hệ thống'} · {formatDate(event.createdAt)}</small></> }))} /></Card>
    </>}
    <Modal rootClassName="rw-operations-modal" open={!!action} title={{ refund: 'Yêu cầu hoàn tiền', confirm: 'Xác nhận đã hoàn tiền', receive: 'Tiếp nhận toàn bộ hàng hoàn', inspect: 'Kiểm định hàng hoàn', reship: 'Yêu cầu giao lại' }[action]} onCancel={() => !busy && setAction('')} footer={null} destroyOnHidden>
      <Alert style={{ marginBottom: 20 }} type="info" title={action === 'confirm' ? 'Chỉ xác nhận sau khi đã hoàn tiền thực tế và có mã giao dịch. Thao tác này không tự chuyển tiền.' : 'Mọi kết quả được ghi vào lịch sử. Hàng hoàn chưa được mở bán trước khi hoàn tiền được xác nhận.'} />
      <Form form={form} layout="vertical" onFinish={submit}>
        {action === 'reship' && <Form.Item name="note" label="Lý do giao lại cho người giao hàng hiện tại" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={3} /></Form.Item>}
        {action === 'receive' && <><Form.Item name="reference" label="Mã vận đơn / chứng từ nhận đủ hàng" rules={[{ required: true, whitespace: true }, { max: 120 }]}><Input /></Form.Item><Form.Item name="reason" label="Lý do trả hàng" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={2} /></Form.Item></>}
        {['refund', 'confirm'].includes(action) && <Form.Item name={action === 'refund' ? 'reason' : 'reference'} label={action === 'refund' ? 'Lý do' : 'Mã giao dịch / phiếu hoàn tiền'} rules={[{ required: true, whitespace: true }, { max: 120 }]}><Input.TextArea rows={3} /></Form.Item>}
        {action === 'inspect' && <Form.List name="items">{fields => fields.map(({ key, name }) => <Card key={key} size="small" style={{ marginBottom: 16 }} title={order.items[name]?.productTitle}><Form.Item name={[name, 'productId']} hidden><Input /></Form.Item><Form.Item name={[name, 'restockApproved']} label="Quyết định bán lại" rules={[{ required: true }]}><Select options={[{ value: false, label: 'Cách ly — chưa được bán lại' }, { value: true, label: 'Cho phép bán lại sau hoàn tiền' }]} /></Form.Item><Form.Item name={[name, 'condition']} label="Tình trạng thực tế" rules={[{ required: true }]}><Select options={[{ value: 0, label: 'Như mới' }, { value: 1, label: 'Rất tốt' }, { value: 2, label: 'Tốt' }, { value: 3, label: 'Khá' }]} /></Form.Item><Form.Item name={[name, 'note']} label="Kết quả kiểm định" rules={[{ required: true, whitespace: true }]}><Input.TextArea rows={2} /></Form.Item></Card>)}</Form.List>}
        <Button type="primary" htmlType="submit" loading={busy}>Xác nhận</Button>
      </Form>
    </Modal>
  </div>;
}
