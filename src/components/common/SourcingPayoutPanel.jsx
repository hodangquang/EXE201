import { useState } from 'react';
import { Alert, Button, Descriptions, Form, Input, Modal, Select, message } from 'antd';
import { operationsApi } from '../../services/operations';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function SourcingPayoutPanel({ sourcing, onChanged }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const price = sourcing.acceptedOfferPrice ?? sourcing.offeredPrice;
  const eligible = [5, '5', 'Approved'].includes(sourcing.status) && !sourcing.requiresRevisedAcceptance;
  const submit = async values => {
    setBusy(true);
    try {
      await operationsApi.confirmPayout(sourcing.id, { ...values, amount: Number(price) });
      message.success('Đã ghi nhận chứng từ chi trả.'); setOpen(false); onChanged?.();
    } catch (error) { message.error(error.message); }
    finally { setBusy(false); }
  };
  return <section aria-label="Chi trả thu mua">
    <h3 style={{ marginBottom: 12 }}>Chi trả thu mua</h3>
    <Descriptions size="small" column={1} bordered>
      <Descriptions.Item label="Giá đã đồng ý">{price == null ? 'Chưa có' : formatCurrency(price)}</Descriptions.Item>
      <Descriptions.Item label="Trạng thái">{sourcing.payout ? 'Đã xác nhận chi trả' : 'Chưa xác nhận chi trả'}</Descriptions.Item>
      {sourcing.payout && <><Descriptions.Item label="Chứng từ">{sourcing.payout.reference}</Descriptions.Item><Descriptions.Item label="Thời điểm">{formatDate(sourcing.payout.paidAt)}</Descriptions.Item></>}
    </Descriptions>
    {sourcing.requiresRevisedAcceptance && <Alert style={{ marginTop: 12 }} type="warning" title="Đang chờ người gửi đồng ý lại giá/kết quả kiểm định; chưa thể chi trả." />}
    {eligible && !sourcing.payout && <Button style={{ marginTop: 12 }} type="primary" onClick={() => { form.resetFields(); setOpen(true); }}>Ghi nhận đã chi trả</Button>}
    <Modal rootClassName="rw-operations-modal" open={open} title="Xác nhận chứng từ chi trả" onCancel={() => !busy && setOpen(false)} footer={null} destroyOnHidden>
      <Alert type="info" title="Chỉ xác nhận sau khi người gửi đã được trả tiền thực tế. Thao tác này lưu chứng từ, không tự chuyển tiền." style={{ marginBottom: 20 }} />
      <p style={{ marginBottom: 16 }}>Số tiền: <strong>{formatCurrency(price)}</strong></p>
      <Form layout="vertical" form={form} onFinish={submit} initialValues={{ method: 'ManualTransfer' }}>
        <Form.Item name="method" label="Phương thức" rules={[{ required: true }]}><Select options={[{ value: 'ManualTransfer', label: 'Chuyển khoản thủ công' }, { value: 'Cash', label: 'Tiền mặt' }]} /></Form.Item>
        <Form.Item name="reference" label="Mã giao dịch / phiếu chi" rules={[{ required: true, whitespace: true, message: 'Nhập mã chứng từ thực tế.' }, { max: 120 }]}><Input /></Form.Item>
        <Form.Item name="note" label="Ghi chú"><Input.TextArea rows={2} /></Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>Xác nhận đã chi trả</Button>
      </Form>
    </Modal>
  </section>;
}
