> Đính chính theo source local 25/10/2026: payment numeric là 0 Pending, **1 Paid, 2 Failed**, 3 Expired, 4 Refunded. Status endpoint trả chuỗi và requiresReconciliation; không suy trạng thái từ returnUrl. Sourcing accept cần offerVersion. Order thêm 7 ReturnRequested, 8 ReturnReceived, 9 Returned. Product PUT multipart. Hướng dẫn cũ bên dưới được giữ để đối chiếu; contract mới ở [báo cáo triển khai](context/implementation-report-2026-10-25.md). Chưa xác nhận backend deploy đã chạy bản này.

# 📘 HƯỚNG DẪN TÍCH HỢP THANH TOÁN CHO FRONTEND

> **Tài liệu này dành cho FE Developer (bạn tôi của bạn).**
> Mục tiêu: từ lúc thêm sản phẩm vào giỏ → checkout → nhận URL thanh toán → polling trạng thái → xác nhận thành công (`paymentStatus = 2`).

**Base URL (production):** `https://rewear-wyb0.onrender.com`
**Base URL (Swagger UI):** `https://rewear-wyb0.onrender.com/swagger`

> ⚠️ **Tất cả các endpoint bên dưới đều yêu cầu Bearer Token** ở header `Authorization` (trừ đăng ký/đăng nhập).
> Chuẩn response xem [Section 0](#-0-cấu-trúc-response-chuẩn).

---

## 🧭 FLOW TỔNG QUAN

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. Đăng nhập  → lấy accessToken                                    │
│  2. Thêm sản phẩm vào giỏ   POST /api/cart                          │
│  3. Lấy giỏ hàng             GET  /api/cart                          │
│  4. Tick chọn sản phẩm       PUT  /api/cart/items/{itemId}/select    │
│  5. Checkout tạo đơn + phiên POST /api/orders/checkout               │
│  6. Mở checkoutUrl trong tab mới                                    │
│  7. Người dùng thanh toán trên PayOS                                │
│  8. PayOS redirect về returnUrl (404 OK – không quan trọng)         │
│  9. ⭐ FE bắt đầu POLLING mỗi 3 giây                                │
│       GET /api/payments/{orderId}/status                             │
│ 10. BE tự hỏi PayOS → thấy PAID → tự update DB                      │
│       (paymentStatus: 0 → 2, orderStatus, product → Sold)            │
│ 11. API trả về { isPaid: true, paymentStatus: 2 } → FE dừng polling  │
│ 12. Hiển thị "Thanh toán thành công 🎉"                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 0. Cấu trúc response chuẩn

**Mọi response thành công** đều có dạng:

```json
{
  "success": true,
  "message": "Mô tả ngắn (có thể rỗng)",
  "data": { ... payload tuỳ endpoint ... }
}
```

**Mọi response lỗi** đều có dạng:

```json
{
  "success": false,
  "message": "Thông báo lỗi tổng quát",
  "errors": ["Chi tiết lỗi 1", "Chi tiết lỗi 2"],
  "errorCode": "MÃ_LỖI_NGHIỆP_VỤ"
}
```

**HTTP status codes dùng:**

| Code | Ý nghĩa |
|---|---|
| `200` | OK |
| `400` | Request sai (thiếu field, dữ liệu không hợp lệ) |
| `401` | Thiếu / sai Bearer Token |
| `404` | Không tìm thấy (sản phẩm, đơn, địa chỉ...) |
| `409` | Xung đột tồn kho / đơn đã được xử lý |

---

## 1. 🔐 Đăng nhập (lấy Bearer Token)

### `POST /api/auth/login`

**Body:**

```json
{
  "email": "buyer@example.com",
  "password": "Matkhau123!"
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Đăng nhập thành công.",
  "data": {
    "accessToken": "eyJhbGciOi... (JWT)",
    "refreshToken": "rK7...",
    "expiresIn": 3600,
    "user": {
      "id": "65f1a2b3c4d5e6f7a8b9c0d1",
      "email": "buyer@example.com",
      "fullName": "Nguyễn Văn A",
      "role": "Buyer"
    }
  }
}
```

> 🔑 **Lưu `data.accessToken`** → dùng cho header `Authorization: Bearer <accessToken>` của tất cả các API phía dưới.

---

## 2. 🛒 Thêm sản phẩm vào giỏ hàng

### `POST /api/cart`

**Headers:** `Authorization: Bearer <accessToken>`

**Body:**

```json
{
  "productId": "6ac6299aa86844c1f8b50201",
  "quantity": 1
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `productId` | string | ✅ | Id sản phẩm lấy từ `GET /api/products` |
| `quantity` | int | ❌ (mặc định 1) | Số lượng mua |

**Response 200:**

```json
{
  "success": true,
  "message": "Đã thêm sản phẩm vào giỏ hàng.",
  "data": null
}
```

**Response 400 (lỗi sản phẩm không khả dụng / hết hàng):**

```json
{
  "success": false,
  "message": "Sản phẩm đã được bán hoặc không còn khả dụng.",
  "errors": ["Sản phẩm 'Áo thun vintage' đã được bán."],
  "errorCode": "PRODUCT_UNAVAILABLE"
}
```

---

## 3. 📋 Lấy giỏ hàng hiện tại

### `GET /api/cart`

**Headers:** `Authorization: Bearer <accessToken>`

**Response 200:**

```json
{
  "success": true,
  "message": null,
  "data": {
    "id": "cart-65f1a2b3",
    "items": [
      {
        "itemId": "item-1",
        "productId": "6ac6299aa86844c1f8b50201",
        "productName": "Áo thun vintage band T-shirt",
        "productImage": "https://...jpg",
        "unitPrice": 150000,
        "quantity": 1,
        "isSelected": true,
        "subtotal": 150000,
        "status": "Available"
      },
      {
        "itemId": "item-2",
        "productId": "6ac6299aa86844c1f8b50202",
        "productName": "Quần jeans denim",
        "productImage": "https://...jpg",
        "unitPrice": 250000,
        "quantity": 2,
        "isSelected": false,
        "subtotal": 500000,
        "status": "Available"
      }
    ],
    "totalItems": 3,
    "totalAmount": 650000,
    "selectedAmount": 150000
  }
}
```

> 💡 Chỉ những item có `isSelected: true` mới được checkout. FE nên hiển thị checkbox cho user chọn.

---

## 4. ☑️ Tick chọn sản phẩm để thanh toán

### `PUT /api/cart/items/{itemId}/select`

**Headers:** `Authorization: Bearer <accessToken>`

**Body:**

```json
{
  "isSelected": true
}
```

**Response 200:**

```json
{
  "success": true,
  "message": "Đã cập nhật.",
  "data": null
}
```

### Tick chọn tất cả: `PUT /api/cart/items/select-all`

**Body:**

```json
{
  "isSelected": true
}
```

---

## 5. 🏠 Chuẩn bị địa chỉ giao hàng

### Lấy danh sách địa chỉ đã lưu: `GET /api/profile/addresses`

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "addr-001",
      "recipientName": "Nguyễn Văn A",
      "phone": "0901234567",
      "street": "123 Nguyễn Trãi",
      "ward": "Phường Thanh Xuân Trung",
      "district": "Quận Thanh Xuân",
      "city": "Hà Nội",
      "isDefault": true
    }
  ]
}
```

> 💡 Lấy `id` của địa chỉ muốn giao → dùng làm `shippingAddressId` khi checkout.

### Tạo địa chỉ mới (nếu chưa có): `POST /api/profile/addresses`

**Body:**

```json
{
  "recipientName": "Nguyễn Văn A",
  "phone": "0901234567",
  "street": "123 Nguyễn Trãi",
  "ward": "Phường Thanh Xuân Trung",
  "district": "Quận Thanh Xuân",
  "city": "Hà Nội",
  "isDefault": true
}
```

**Response 200:**

```json
{
  "success": true,
  "data": {
    "id": "addr-002",
    "recipientName": "Nguyễn Văn A",
    "phone": "0901234567",
    "street": "123 Nguyễn Trãi",
    "ward": "Phường Thanh Xuân Trung",
    "district": "Quận Thanh Xuân",
    "city": "Hà Nội",
    "isDefault": true
  }
}
```

---

## 6. 💳 CHECKOUT – Tạo đơn hàng + Phiên thanh toán ⭐⭐⭐

> **Đây là API quan trọng nhất.** Gọi 1 lần → nhận ngay `checkoutUrl` để chuyển hướng user sang PayOS.

### `POST /api/orders/checkout`

**Headers:** `Authorization: Bearer <accessToken>`

**Body:**

```json
{
  "shippingAddressId": "addr-001",
  "shippingMethod": 0,
  "note": "Gọi trước khi giao"
}
```

| Field | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `shippingAddressId` | string | ✅ | Id địa chỉ giao từ `GET /api/profile/addresses` |
| `shippingMethod` | int | ❌ (mặc định `0`) | `0` = Standard (3-5 ngày), `1` = Express (1-2 ngày) |
| `note` | string | ❌ | Ghi chú cho đơn (tuỳ chọn) |

**Response 200 (THÀNH CÔNG):**

```json
{
  "success": true,
  "message": "Đặt hàng thành công.",
  "data": {
    "order": {
      "id": "6ac62c2fa86844c1f8b50261",
      "orderCode": "RW-20261007-A1B2C3",
      "userId": "65f1a2b3c4d5e6f7a8b9c0d1",
      "status": 1,
      "statusName": "PendingPayment",
      "totalAmount": 150000,
      "shippingFee": 0,
      "shippingMethod": 0,
      "note": "Gọi trước khi giao",
      "createdAt": "2026-10-07T11:30:00Z",
      "items": [
        {
          "productId": "6ac6299aa86844c1f8b50201",
          "productName": "Áo thun vintage band T-shirt",
          "productImage": "https://...jpg",
          "unitPrice": 150000,
          "quantity": 1,
          "subtotal": 150000
        }
      ],
      "shippingAddress": {
        "recipientName": "Nguyễn Văn A",
        "phone": "0901234567",
        "street": "123 Nguyễn Trãi",
        "ward": "Phường Thanh Xuân Trung",
        "district": "Quận Thanh Xuân",
        "city": "Hà Nội"
      }
    },
    "payment": {
      "orderId": "6ac62c2fa86844c1f8b50261",
      "orderCode": "RW-20261007-A1B2C3",
      "totalAmount": 150000,
      "checkoutUrl": "https://pay.payos.vn/web/abc123...",
      "qrCode": "iVBORw0KGgoAAAANSUhEUgAA...",
      "paymentLinkId": "abc123-def456",
      "expiresAt": "2026-10-07T11:35:00Z",
      "expiresInSeconds": 300
    }
  }
}
```

> 🎯 **FE lấy `data.payment.checkoutUrl` để chuyển hướng user sang trang PayOS.**
> Đồng thời lưu `data.order.id` (`orderId`) và `data.payment.expiresAt` để dùng cho bước polling.

**Cách mở checkoutUrl:**

```javascript
// Mở trong tab mới (khuyến nghị - user vẫn có thể thấy giỏ hàng cũ)
const checkoutTab = window.open(
  data.payment.checkoutUrl,
  '_blank',
  'noopener,noreferrer'
);

// Hoặc chuyển hướng luôn (nếu muốn)
window.location.href = data.payment.checkoutUrl;
```

**Các lỗi có thể gặp:**

| Status | errorCode | Nguyên nhân | FE xử lý |
|---|---|---|---|
| 400 | `CART_EMPTY` | Giỏ hàng rỗng | Hiển thị "Vui lòng thêm sản phẩm vào giỏ." |
| 400 | `CART_NO_SELECTION` | Không tick chọn sản phẩm nào | Hiển thị "Vui lòng chọn sản phẩm muốn thanh toán." |
| 404 | `ADDRESS_NOT_FOUND` | Sai `shippingAddressId` | Hiển thị "Vui lòng chọn lại địa chỉ giao hàng." |
| 409 | `INVENTORY_CONFLICT` | Có sản phẩm đã bị người khác mua | Hiển thị "Sản phẩm X đã được bán, vui lòng xoá khỏi giỏ." |

---

## 7. ⭐ POLLING – Kiểm tra trạng thái thanh toán ⭐⭐⭐

> **ĐÂY LÀ BƯỚC BẮT BUỘC – không có polling = không tự động cập nhật DB!**
>
> **Logic:** Sau khi user thanh toán xong trên PayOS và quay về, FE gọi API này **mỗi 3-5 giây**.
> BE sẽ **tự gọi PayOS hỏi trạng thái thật** → nếu PAID → tự update DB → trả về `paymentStatus = 2`.
>
> (Không cần lo về webhook – hệ thống thiết kế để hoạt động hoàn toàn qua polling.)

### `GET /api/payments/{orderId}/status`

**Headers:** `Authorization: Bearer <accessToken>`

**Path params:**

| Tên | Kiểu | Mô tả |
|---|---|---|
| `orderId` | string | `data.order.id` lấy từ response của `POST /api/orders/checkout` |

**Response 200:**

```json
{
  "success": true,
  "message": null,
  "data": {
    "orderId": "6ac62c2fa86844c1f8b50261",
    "orderCode": "RW-20261007-A1B2C3",
    "paymentStatus": "Paid",
    "orderStatus": "Confirmed",
    "isPaid": true,
    "isExpired": false,
    "expiresInSeconds": 0
  }
}
```

### 📖 Bảng giá trị `paymentStatus`

| Giá trị số | Tên enum | Ý nghĩa | FE hiển thị |
|---|---|---|---|
| **`0`** | `Pending` | Chờ thanh toán | "Đang chờ thanh toán..." (đang polling) |
| **`1`** | `Failed` | Thanh toán thất bại | "Thanh toán thất bại." |
| **`2`** | `Paid` | **ĐÃ THANH TOÁN THÀNH CÔNG** ⭐ | **"Thanh toán thành công 🎉"** (dừng polling) |
| **`3`** | `Expired` | Phiên hết hạn (>5 phút) | "Đơn đã hết hạn, vui lòng đặt lại." |
| **`4`** | `Refunded` | Đã hoàn tiền | "Đơn đã được hoàn tiền." |

> 🔑 **Mục tiêu của FE: phát hiện `paymentStatus === "Paid"` (số `2`) HOẶC `isPaid === true` → dừng polling + hiển thị success.**

---

## 8. 💻 Code mẫu Frontend (đầy đủ flow)

### 📦 Biến môi trường

```env
# .env.production
VITE_API_BASE_URL=https://rewear-wyb0.onrender.com

# hoặc với Next.js:
NEXT_PUBLIC_API_BASE_URL=https://rewear-wyb0.onrender.com
```

### 🧰 API client (TypeScript / JavaScript)

```typescript
// api/rewear.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  errorCode?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('accessToken');

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    const err: any = new Error(data.message || 'API error');
    err.status = res.status;
    err.errorCode = data.errorCode;
    err.errors = data.errors;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Cart
  getCart: () => request<any>('/api/cart'),
  addToCart: (productId: string, quantity = 1) =>
    request<null>('/api/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    }),
  toggleCartItem: (itemId: string, isSelected: boolean) =>
    request<null>(`/api/cart/items/${itemId}/select`, {
      method: 'PUT',
      body: JSON.stringify({ isSelected }),
    }),

  // Profile
  getAddresses: () => request<any[]>('/api/profile/addresses'),
  addAddress: (address: any) =>
    request<any>('/api/profile/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    }),

  // Checkout & Payment
  checkout: (body: {
    shippingAddressId: string;
    shippingMethod?: number;
    note?: string;
  }) =>
    request<any>('/api/orders/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getPaymentStatus: (orderId: string) =>
    request<{
      orderId: string;
      orderCode: string;
      paymentStatus: 'Pending' | 'Failed' | 'Paid' | 'Expired' | 'Refunded';
      orderStatus: string;
      isPaid: boolean;
      isExpired: boolean;
      expiresInSeconds: number;
    }>(`/api/payments/${orderId}/status`),
};
```

### 🛒 Component Cart → Checkout

```tsx
// pages/CartPage.tsx
import { useState, useEffect } from 'react';
import { api } from './api/rewear';

export function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCart().then((r) => setCart(r.data));
    api.getAddresses().then((r) => {
      setAddresses(r.data || []);
      const def = r.data?.find((a: any) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
    });
  }, []);

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    try {
      const response = await api.checkout({
        shippingAddressId: selectedAddressId,
        shippingMethod: 0, // Standard
      });

      const { order, payment } = response.data!;

      // 💾 Lưu orderId để polling sau
      sessionStorage.setItem('pendingOrderId', order.id);
      sessionStorage.setItem('paymentExpiresAt', payment.expiresAt);

      // 🌐 Mở PayOS trong tab mới
      window.open(payment.checkoutUrl, '_blank', 'noopener,noreferrer');

      // 🚀 Chuyển sang trang "Đang chờ thanh toán" để bắt đầu polling
      window.location.href = `/payment/waiting?orderId=${order.id}`;
    } catch (err: any) {
      if (err.errorCode === 'INVENTORY_CONFLICT') {
        alert(
          'Có sản phẩm đã được mua bởi người khác. Vui lòng xoáy giỏ và thử lại.'
        );
        api.getCart().then((r) => setCart(r.data));
      } else {
        alert(err.message || 'Đặt hàng thất bại');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return <div>Đang tải...</div>;

  const selectedItems = cart.items.filter((i: any) => i.isSelected);

  return (
    <div>
      <h1>Giỏ hàng</h1>

      {cart.items.map((item: any) => (
        <div key={item.itemId} className="cart-item">
          <input
            type="checkbox"
            checked={item.isSelected}
            onChange={(e) =>
              api
                .toggleCartItem(item.itemId, e.target.checked)
                .then(() => api.getCart().then((r) => setCart(r.data)))
            }
          />
          <img src={item.productImage} alt="" />
          <div>
            <h3>{item.productName}</h3>
            <p>{item.unitPrice.toLocaleString('vi-VN')} đ</p>
            <p>Số lượng: {item.quantity}</p>
          </div>
        </div>
      ))}

      <div>
        <h3>Địa chỉ giao hàng</h3>
        <select
          value={selectedAddressId}
          onChange={(e) => setSelectedAddressId(e.target.value)}
        >
          {addresses.map((a) => (
            <option key={a.id} value={a.id}>
              {a.recipientName} - {a.street}, {a.ward}, {a.district}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h2>Tổng: {cart.selectedAmount.toLocaleString('vi-VN')} đ</h2>
        <button onClick={handleCheckout} disabled={loading || selectedItems.length === 0}>
          {loading ? 'Đang xử lý...' : 'Thanh toán'}
        </button>
      </div>
    </div>
  );
}
```

### ⭐ Component Polling – Trang "Đang chờ thanh toán"

```tsx
// pages/PaymentWaiting.tsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from './api/rewear';

const POLL_INTERVAL_MS = 3000;       // 3 giây
const MAX_DURATION_MS = 15 * 60 * 1000; // timeout 15 phút

export function PaymentWaitingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('orderId')!;

  const [status, setStatus] = useState<{
    paymentStatus: string;
    orderStatus: string;
    isPaid: boolean;
    isExpired: boolean;
    expiresInSeconds: number;
  } | null>(null);

  const [countdown, setCountdown] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!orderId) {
      navigate('/cart');
      return;
    }

    // ⭐ Bắt đầu polling mỗi 3 giây
    const poll = async () => {
      try {
        const res = await api.getPaymentStatus(orderId);
        const s = res.data!;

        setStatus(s);
        setCountdown(s.expiresInSeconds);

        // 🎉 THÀNH CÔNG
        if (s.isPaid) {
          clearInterval(intervalRef.current);
          clearTimeout(timeoutRef.current);
          // Chuyển sang trang success sau 1.5s cho user thấy thông báo
          setTimeout(() => navigate(`/orders/${orderId}/success`), 1500);
          return;
        }

        // ⏰ HẾT HẠN
        if (s.isExpired || s.paymentStatus === 'Expired') {
          clearInterval(intervalRef.current);
          clearTimeout(timeoutRef.current);
          alert('Đơn đã hết hạn thanh toán. Vui lòng đặt lại.');
          navigate('/cart');
          return;
        }
      } catch (err) {
        console.error('Polling error:', err);
        // Không clear - tiếp tục retry cho đến khi timeout
      }
    };

    poll(); // gọi ngay 1 lần
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    // Hard timeout 15 phút
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current);
      alert('Hết thời gian chờ. Vui lòng thử lại.');
      navigate('/cart');
    }, MAX_DURATION_MS);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [orderId, navigate]);

  // Đếm ngược giây
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1>Đang chờ thanh toán...</h1>

      {!status ? (
        <p>Đang kiểm tra trạng thái...</p>
      ) : status.isPaid ? (
        <div style={{ color: 'green' }}>
          <h2>✅ Thanh toán thành công!</h2>
          <p>Đơn hàng <code>{orderId}</code> đã được thanh toán.</p>
          <p>Đang chuyển hướng...</p>
        </div>
      ) : (
        <>
          <p>
            Vui lòng hoàn tất thanh toán trên cửa sổ PayOS.
            <br />
            Trang này sẽ tự động cập nhật khi thanh toán xong.
          </p>
          <h2 style={{ color: countdown < 60 ? 'red' : '#333' }}>
            ⏱️ {formatTime(countdown)}
          </h2>
          <p>Trạng thái: <strong>{status.paymentStatus}</strong></p>
          <button onClick={() => navigate('/cart')}>Huỷ</button>
        </>
      )}
    </div>
  );
}
```

### 🎉 Component trang Success

```tsx
// pages/OrderSuccess.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from './api/rewear';

export function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!orderId) return;
    api.getPaymentStatus(orderId).then((r) => setOrder(r.data));
  }, [orderId]);

  if (!order) return <div>Đang tải...</div>;

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <h1 style={{ color: 'green' }}>🎉 Thanh toán thành công!</h1>
      <p>Mã đơn hàng: <strong>{order.orderCode}</strong></p>
      <p>Trạng thái thanh toán: <strong>{order.paymentStatus}</strong></p>
      <p>Trạng thái đơn hàng: <strong>{order.orderStatus}</strong></p>
      <a href={`/orders/${orderId}`}>Xem chi tiết đơn hàng</a>
    </div>
  );
}
```

---

## 9. 📋 Checklist cho Frontend Developer

```
□  Đăng nhập → lưu accessToken
□  Gọi GET /api/cart khi mở trang giỏ
□  Cho phép tick chọn sản phẩm qua PUT /api/items/{id}/select
□  Nút Trang checkout mở form chọn địa chỉ
□  Bấm "Thanh toán" → gọi POST /api/orders/checkout
□  Lưu data.order.id vào sessionStorage / URL
□  Mở data.payment.checkoutUrl trong tab mới
□  Chuyển sang trang /payment/waiting
□  Bắt đầu polling GET /api/payments/{orderId}/status mỗi 3 giây
□  Hiển thị đồng hồ đếm ngược (data.payment.expiresAt)
□  Khi isPaid === true → dừng polling → chuyển trang success
□  Khi isExpired === true → dừng polling → báo lỗi
□  Sau 15 phút mà chưa xong → timeout, chuyển về giỏ
□  (Tuỳ chọn) Hiển thị QR code từ data.payment.qrCode nếu không muốn mở tab mới
```

---

## 10. ❓ Câu hỏi thường gặp

### Q1: Tại sao không có webhook để tự động update?

**A:** Hệ thống được thiết kế **không dùng webhook** (để tránh phức tạp với CSRF + signature). Thay vào đó, mỗi lần FE gọi `GET /api/payments/{orderId}/status`:
- Nếu DB đang `Pending` → BE tự gọi PayOS server hỏi trạng thái thật
- Nếu PayOS trả `PAID` → BE tự update DB (`paymentStatus = 2`, order → `Confirmed`, product → `Sold`)
- Trả về status mới nhất cho FE

→ **Đây là polling thông minh**, FE chỉ cần gọi đều đặn là đủ.

### Q2: returnUrl localhost:5173 bị 404 có sao không?

**A:** **Không sao.** returnUrl chỉ phục vụ UX (đưa khách về trang nào đó sau khi thanh toán). Nếu 404 thì cứ kệ – quan trọng là FE vẫn đang polling `/status` ở tab cũ.

### Q3: Có thể gọi `/status` liên tục không? Có bị rate limit không?

**A:** Mỗi 3 giây là OK. PayOS không rate limit mức này. Backend cũng có cache nhẹ để tránh spam PayOS.

### Q4: Sau khi thanh toán thành công, gọi lại `/status` có sao không?

**A:** **Khng – idempotent.** Gọi bao nhiêu lần cũng OK, status chỉ là `Paid`.

### Q5: polling sau 5 phút mà user chưa thanh toán thì sao?

**A:** Phiên thanh toán tự expire (5 phút). API sẽ trả `isExpired: true` và `paymentStatus: "Expired"`. Sản phẩm tự động trở lại cửa hàng.

### Q6: User bấm F5 / đóng tab trong lúc polling thì sao?

**A:** Đơn vẫn được kết thúc ở backend (qua webhook sẽ hết hạn sau 5 phút hoặc admin đối soát). User có thể vào "Đơn hàng của tôi" để check.

---

## 11. 🆘 Support

Nếu gặp vấn đề, khi báo lỗi vui lòng cung cấp:

1. **Endpoint** đang gọi
2. **Request body** đã gửi
3. **Response status + body** nhận được
4. **Console log** phía FE (nếu có)
5. **Network tab screenshot** (nếu liên quan CORS / 401)

Swagger UI đầy đủ: [https://rewear-wyb0.onrender.com/swagger](https://rewear-wyb0.onrender.com/swagger)