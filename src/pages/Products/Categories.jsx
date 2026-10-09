import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Space, message, Modal, Popconfirm, Button } from 'antd';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { authFetch } from '../../services/auth';
import CategoryModal from './CategoryModal';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });

  const load = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/Categories' : `/api/Categories?isActive=${filter}`;
      const res = await authFetch(url);
      setCategories(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      message.error('Lỗi tải danh mục: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleViewDetail = async (id) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await authFetch(`/api/Categories/${id}`);
      setDetailModal({ open: true, data: res.data || res, loading: false });
    } catch (err) {
      message.error('Lỗi tải chi tiết: ' + err.message);
      setDetailModal({ open: false, data: null, loading: false });
    }
  };

  const handleDelete = async (id) => {
    try {
      await authFetch(`/api/Categories/${id}`, { method: 'DELETE' });
      message.success('Đã xóa danh mục (soft delete)');
      load();
    } catch (err) {
      message.error('Lỗi khi xóa: ' + err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      await authFetch(`/api/Categories/${id}/restore`, { method: 'PATCH' });
      message.success('Đã khôi phục danh mục');
      load();
    } catch (err) {
      message.error('Lỗi khi khôi phục: ' + err.message);
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      key: 'name',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {r.imageUrl && <img src={r.imageUrl} alt={r.name} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />}
          <span style={{ fontWeight: 600, color: '#10100f' }}>{r.name}</span>
        </div>
      ),
    },
    { title: 'Trạng thái', dataIndex: 'isActive', render: (a) => <Tag color={a ? 'green' : 'default'}>{a ? 'Đang hoạt động' : 'Ẩn'}</Tag> },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, r) => (
        <Space size="middle">
          <a style={{ color: 'var(--color-graphite)', fontWeight: 500, textDecoration: 'underline' }} onClick={() => handleViewDetail(r.id)}>
            Chi tiết
          </a>
          <a style={{ color: '#0055ff', fontWeight: 500, textDecoration: 'underline' }} onClick={() => { setEditingCategory(r); setOpen(true); }}>
            Sửa
          </a>
          {(!r.isDeleted && r.isActive !== false) && (
            <Popconfirm title="Bạn có chắc muốn xóa danh mục này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
              <a style={{ color: '#ff4d4f', fontWeight: 500, textDecoration: 'underline' }}>Xóa</a>
            </Popconfirm>
          )}
          {(r.isDeleted || r.isActive === false) && (
            <Popconfirm title="Bạn có chắc muốn khôi phục danh mục này?" onConfirm={() => handleRestore(r.id)} okText="Khôi phục" cancelText="Hủy">
              <a style={{ color: '#52c41a', fontWeight: 500, textDecoration: 'underline' }}>Khôi phục</a>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e5e5e4' }}>
        <div>
          <div className="editorial-sub" style={{ marginBottom: 8, color: '#70706f' }}>DANH MỤC SẢN PHẨM</div>
          <h1 className="editorial-title" style={{ margin: 0, fontSize: 32 }}>Quản lý Danh Mục</h1>
        </div>
        <Space>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bộ lọc trạng thái</span>
            <Select value={filter} onChange={setFilter} style={{ width: 140, borderRadius: 0 }} options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'true', label: 'Đang hoạt động' },
              { value: 'false', label: 'Đã ẩn' }
            ]} />
          </div>
          <button
            className="pill-btn-filled"
            style={{ height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { setEditingCategory(null); setOpen(true); }}
          >
            <Plus size={16} /><span>Thêm danh mục</span>
          </button>
        </Space>
      </div>

      <div className="flat-card">
        <Table dataSource={categories} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </div>

      <CategoryModal open={open} onClose={() => setOpen(false)} onCreated={load} initialData={editingCategory} />

      {/* Detail Modal */}
      <Modal
        title="Chi tiết danh mục"
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, data: null, loading: false })}
        footer={null}
        destroyOnClose
      >
        {detailModal.loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>Đang tải...</div>
        ) : detailModal.data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {detailModal.data.imageUrl && (
              <div style={{ marginBottom: 8 }}>
                <img src={detailModal.data.imageUrl} alt={detailModal.data.name} style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 4 }} />
              </div>
            )}
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Tên danh mục</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{detailModal.data.name}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Mô tả</p>
              <p style={{ margin: 0 }}>{detailModal.data.description || 'Không có mô tả'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Trạng thái</p>
              <p style={{ margin: 0 }}><Tag color={detailModal.data.isActive ? 'green' : 'default'}>{detailModal.data.isActive ? 'Đang hoạt động' : 'Đã ẩn'}</Tag></p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Ngày tạo</p>
              <p style={{ margin: 0 }}>{detailModal.data.createdAt ? new Date(detailModal.data.createdAt).toLocaleString('vi-VN') : '-'}</p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>Không tìm thấy dữ liệu</div>
        )}
      </Modal>
    </div>
  );
};

export default Categories;
