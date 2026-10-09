import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Switch, message } from 'antd';
import { authFetch } from '../../services/auth';

export const CategoryModal = ({ open, onClose, onCreated, initialData }) => {
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
      const endpoint = isEdit ? `/api/Categories/${initialData.id}` : '/api/Categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await authFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          description: values.description || '',
          imageUrl: values.imageUrl || '',
          isActive: values.isActive !== false,
        }),
      });
      message.success(isEdit ? `Đã cập nhật danh mục "${values.name}"` : `Đã tạo danh mục "${values.name}"`);
      form.resetFields();
      onCreated?.(res?.data || res);
      onClose();
    } catch (err) {
      message.error(err.message || 'Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={initialData ? "Cập nhật danh mục" : "Thêm danh mục mới"} open={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
          <Input placeholder="Ví dụ: Áo thun" style={{ borderRadius: 0 }} />
        </Form.Item>
        <Form.Item name="imageUrl" label="Ảnh URL">
          <Input placeholder="https://example.com/image.png" style={{ borderRadius: 0 }} />
        </Form.Item>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} placeholder="Mô tả danh mục..." style={{ borderRadius: 0 }} />
        </Form.Item>
        {initialData && (
          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button type="button" className="pill-btn-outlined" onClick={onClose}>Hủy</button>
          <button type="submit" className="pill-btn-filled" disabled={loading}>
            {loading ? 'Đang lưu...' : (initialData ? 'Cập nhật' : 'Tạo danh mục')}
          </button>
        </div>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
