import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, message } from 'antd';
import { authFetch } from '../../services/auth';

/** Modal tạo/sửa thương hiệu – POST/PUT /api/Brands (JSON). */
export const BrandModal = ({ open, onClose, onCreated, initialData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue(initialData);
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [open, initialData, form]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const isEdit = !!initialData;
      const endpoint = isEdit ? `/api/Brands/${initialData.id}` : '/api/Brands';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description || '',
          logoUrl: values.logoUrl || '',
          isActive: values.isActive !== false,
        }),
      });
      message.success(isEdit ? `Đã cập nhật "${values.name}"` : `Đã tạo thương hiệu "${values.name}"`);
      form.resetFields();
      onCreated?.(res?.data || res);
      onClose();
    } catch (err) {
      message.error(err.message || 'Lỗi khi tạo thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal rootClassName="rw-admin-modal" title={initialData ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"} open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Tên thương hiệu" rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}>
          <Input placeholder="Ví dụ: Nike" style={{ borderRadius: 0 }} />
        </Form.Item>
        <Form.Item name="logoUrl" label="Logo URL">
          <Input placeholder="https://example.com/logo.png" style={{ borderRadius: 0 }} />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Mô tả thương hiệu..." style={{ borderRadius: 0 }} />
        </Form.Item>
        {initialData && (
          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button type="button" className="pill-btn-outlined" onClick={onClose}>Hủy</button>
          <button type="submit" className="pill-btn-filled" disabled={loading}>
            {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo thương hiệu')}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default BrandModal;
