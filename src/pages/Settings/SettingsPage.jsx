import React from 'react';
import { Tabs, Form, Input, Button, Switch, Divider, message, Row, Col } from 'antd';
import { Store, Bell, CreditCard, Truck, Shield, Save } from 'lucide-react';

export const SettingsPage = () => {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success('Đã lưu cấu hình hệ thống REWEAR thành công!');
  };

  const generalTab = (
    <div style={{ maxWidth: 640 }}>
      <Form layout="vertical" onFinish={handleSave} initialValues={{
        storeName: 'REWEAR — Circular Fashion Vietnam',
        email: 'contact@rewear.vn',
        phone: '1900 8822',
        address: '45 Lê Duẩn, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        currency: 'VND (₫)',
        brandTagline: 'Tái sinh quần áo cũ thành tác phẩm thời trang độc bản 1-of-1',
      }}>
        <Form.Item name="storeName" label={<span style={{ fontWeight: 600, fontSize: '12px' }}>TÊN THƯƠNG HIỆU & HỆ THỐNG</span>}>
          <Input style={{ borderRadius: 0 }} />
        </Form.Item>
        <Form.Item name="brandTagline" label={<span style={{ fontWeight: 600, fontSize: '12px' }}>SLOGAN / THÔNG ĐIỆP BỀN VỮNG</span>}>
          <Input style={{ borderRadius: 0 }} />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="email" label={<span style={{ fontWeight: 600, fontSize: '12px' }}>EMAIL LIÊN HỆ</span>}>
              <Input style={{ borderRadius: 0 }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="phone" label={<span style={{ fontWeight: 600, fontSize: '12px' }}>HOTLINE TỔNG ĐÀI</span>}>
              <Input style={{ borderRadius: 0 }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="address" label={<span style={{ fontWeight: 600, fontSize: '12px' }}>ĐỊA CHỈ TRỤ SỞ & XƯỞNG MAY</span>}>
          <Input style={{ borderRadius: 0 }} />
        </Form.Item>

        <button type="submit" className="pill-btn-filled" style={{ height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Save size={15} />
          <span>Lưu thông tin cửa hàng</span>
        </button>
      </Form>
    </div>
  );

  const paymentShippingTab = (
    <div style={{ maxWidth: 640 }}>
      <div className="editorial-sub" style={{ marginBottom: '16px' }}>CỔNG THANH TOÁN TÍCH HỢP</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0ef' }}>
        <div>
          <div style={{ fontWeight: 600 }}>Cổng VietQR / Chuyển khoản ngân hàng tự động</div>
          <div style={{ fontSize: '12px', color: '#70706f' }}>Quét mã QR thanh toán nhanh qua Napas247</div>
        </div>
        <Switch aria-label="Bật hoặc tắt cấu hình minh họa" defaultChecked />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f0f0ef' }}>
        <div>
          <div style={{ fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</div>
          <div style={{ fontSize: '12px', color: '#70706f' }}>Thu tiền mặt trực tiếp khi shipper giao đến</div>
        </div>
        <Switch aria-label="Bật hoặc tắt cấu hình minh họa" defaultChecked />
      </div>

      <Divider style={{ margin: '24px 0' }} />

      <div className="editorial-sub" style={{ marginBottom: '16px' }}>ĐỐI TÁC GIAO HÀNG & THU GOM QUẦN ÁO</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontWeight: 600 }}>Giao Hàng Tiết Kiệm (GHTK)</div>
          <div style={{ fontSize: '12px', color: '#70706f' }}>Tự động bắn đơn sang app đối tác khi chuyển sang trạng thái Shipping</div>
        </div>
        <Switch aria-label="Bật hoặc tắt cấu hình minh họa" defaultChecked />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ fontWeight: 600 }}>Viettel Post (Thu gom ngoại tỉnh)</div>
          <div style={{ fontSize: '12px', color: '#70706f' }}>Đến tận nhà khách nhận kiện quần áo cũ</div>
        </div>
        <Switch aria-label="Bật hoặc tắt cấu hình minh họa" defaultChecked />
      </div>

      <button onClick={handleSave} className="pill-btn-filled" style={{ height: '40px', cursor: 'pointer' }}>
        Lưu cấu hình vận chuyển & thanh toán
      </button>
    </div>
  );

  const rolesTab = (
    <div className="rw-table-scroll" tabIndex={0} role="region" aria-label="Bảng phân quyền" style={{ maxWidth: 720 }}>
      <div className="editorial-sub" style={{ marginBottom: '16px' }}>MA TRẬN PHÂN QUYỀN HỆ THỐNG</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #10100f', textAlign: 'left' }}>
            <th style={{ padding: '8px 12px' }}>Chức năng</th>
            <th style={{ padding: '8px 12px' }}>QUẢN TRỊ VIÊN</th>
            <th style={{ padding: '8px 12px' }}>NHÂN VIÊN</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: '1px solid #e5e5e4' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Bảng điều khiển & Doanh thu</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Toàn quyền</td>
            <td style={{ padding: '10px 12px', color: '#991b1b' }}>Không có quyền truy cập</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e5e4' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Thu gom đồ cũ & Kiểm định (Inspection)</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Toàn quyền</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Toàn quyền</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e5e4' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Dự án tái chế & QC</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Toàn quyền</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Toàn quyền</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e5e4' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Quản lý đơn hàng & Kho</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Toàn quyền</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Xem & Cập nhật trạng thái</td>
          </tr>
          <tr style={{ borderBottom: '1px solid #e5e5e4' }}>
            <td style={{ padding: '10px 12px', fontWeight: 500 }}>Khách hàng, Điểm thưởng, Cài đặt & Nhân sự</td>
            <td style={{ padding: '10px 12px', color: '#1b4d2e', fontWeight: 600 }}>Toàn quyền</td>
            <td style={{ padding: '10px 12px', color: '#991b1b' }}>Không có quyền truy cập</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="rw-admin-page">
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e5e4'
        }}
      >
        <div>
          <div className="editorial-sub" style={{ marginBottom: '6px' }}>
            CÀI ĐẶT HỆ THỐNG
          </div>
          <h1 className="editorial-title" style={{ fontSize: '32px', margin: 0 }}>
            Cài đặt hệ thống REWEAR
          </h1>
        </div>
      </div>

      <div className="flat-card" style={{ padding: '24px 32px' }}>
        <Tabs
          defaultActiveKey="general"
          items={[
            {
              key: 'general',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Store size={15} /> Thông tin thương hiệu
                </span>
              ),
              children: generalTab,
            },
            {
              key: 'payment-shipping',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Truck size={15} /> Thanh toán & Vận chuyển
                </span>
              ),
              children: paymentShippingTab,
            },
            {
              key: 'roles',
              label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={15} /> Bảng phân quyền Role
                </span>
              ),
              children: rolesTab,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default SettingsPage;
