import React, { useState, useEffect } from 'react';
import { Table, Tag, Select, Space, message, Modal, Popconfirm } from 'antd';
import { Plus } from 'lucide-react';
import { authFetch } from '../../services/auth';
import BrandModal from './BrandModal';

export const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [detailModal, setDetailModal] = useState({ open: false, data: null, loading: false });

  const load = async () => {
    setLoading(true);
    try {
      const url = filter === 'all' ? '/api/Brands' : `/api/Brands?isActive=${filter}`;
      const res = await authFetch(url);
      setBrands(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      message.error('Lỗi tải thương hiệu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleViewDetail = async (id) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const res = await authFetch(`/api/Brands/${id}`);
      setDetailModal({ open: true, data: res.data || res, loading: false });
    } catch (err) {
      message.error('Lỗi tải chi tiết: ' + err.message);
      setDetailModal({ open: false, data: null, loading: false });
    }
  };

  const handleDelete = async (id) => {
    try {
      await authFetch(`/api/Brands/${id}`, { method: 'DELETE' });
      message.success('Đã xóa thương hiệu (soft delete)');
      load();
    } catch (err) {
      message.error('Lỗi khi xóa: ' + err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      await authFetch(`/api/Brands/${id}/restore`, { method: 'PATCH' });
      message.success('Đã khôi phục thương hiệu');
      load();
    } catch (err) {
      message.error('Lỗi khi khôi phục: ' + err.message);
    }
  };

  const columns = [
    {
      title: 'Thương hiệu',
      key: 'name',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {r.logoUrl && <img src={r.logoUrl} alt={r.name} style={{ width: 36, height: 36, objectFit: 'contain' }} />}
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
          <button type="button" className="rw-table-action" style={{ color: 'var(--color-graphite)', fontWeight: 500, textDecoration: 'underline' }} onClick={() => handleViewDetail(r.id)}>
            Chi tiết
          </button>
          <button type="button" className="rw-table-action" style={{ color: '#0055ff', fontWeight: 500, textDecoration: 'underline' }} onClick={() => { setEditingBrand(r); setOpen(true); }}>
            Sửa
          </button>
          {(!r.isDeleted && r.isActive !== false) && (
            <Popconfirm title="Bạn có chắc muốn xóa thương hiệu này?" onConfirm={() => handleDelete(r.id)} okText="Xóa" cancelText="Hủy">
              <button type="button" className="rw-table-action" style={{ color: '#991b1b', fontWeight: 500, textDecoration: 'underline' }}>Xóa</button>
            </Popconfirm>
          )}
          {(r.isDeleted || r.isActive === false) && (
            <Popconfirm title="Bạn có chắc muốn khôi phục thương hiệu này?" onConfirm={() => handleRestore(r.id)} okText="Khôi phục" cancelText="Hủy">
              <button type="button" className="rw-table-action" style={{ color: '#287447', fontWeight: 500, textDecoration: 'underline' }}>Khôi phục</button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="rw-admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #e5e5e4' }}>
        <div>
          <div className="editorial-sub" style={{ marginBottom: 6 }}>DANH MỤC THƯƠNG HIỆU</div>
          <h1 className="editorial-title" style={{ fontSize: 32, margin: 0 }}>Thương hiệu</h1>
        </div>
        <Space>
          <Select
            aria-label="Lọc trạng thái thương hiệu" value={filter}
            onChange={setFilter}
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'true', label: 'Đang hoạt động' },
              { value: 'false', label: 'Đã ẩn' },
            ]}
          />
          <button
            className="pill-btn-filled"
            style={{ height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => { setEditingBrand(null); setOpen(true); }}
          >
            <Plus size={16} /><span>Thêm thương hiệu</span>
          </button>
        </Space>
      </div>

      <div className="flat-card">
        <Table scroll={{ x: 'max-content' }} dataSource={brands} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
      </div>

      <BrandModal open={open} onClose={() => setOpen(false)} onCreated={load} initialData={editingBrand} />

      {/* Detail Modal */}
      <Modal rootClassName="rw-admin-modal"
        title="Chi tiết thương hiệu"
        open={detailModal.open}
        onCancel={() => setDetailModal({ ...detailModal, open: false })}
        footer={null}
      >
        {detailModal.loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>Đang tải...</div>
        ) : detailModal.data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {detailModal.data.logoUrl && (
              <div style={{ textAlign: 'center' }}>
                <img src={detailModal.data.logoUrl} alt={detailModal.data.name} style={{ maxWidth: 100, maxHeight: 100, objectFit: 'contain' }} />
              </div>
            )}
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>ID</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{detailModal.data.id}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Tên thương hiệu</p>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{detailModal.data.name}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Mô tả</p>
              <p style={{ margin: 0 }}>{detailModal.data.description || 'Không có mô tả'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Trạng thái</p>
              <Tag color={detailModal.data.isActive ? 'green' : 'default'}>
                {detailModal.data.isActive ? 'Đang hoạt động' : 'Ẩn'}
              </Tag>
            </div>
            <div style={{ display: 'flex', gap: 32 }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Ngày tạo</p>
                <p style={{ margin: 0 }}>{new Date(detailModal.data.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#888' }}>Cập nhật lần cuối</p>
                <p style={{ margin: 0 }}>{new Date(detailModal.data.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>Không tìm thấy dữ liệu.</div>
        )}
      </Modal>
    </div>
  );
};

export default Brands;
