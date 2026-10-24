# Kiến trúc frontend

## Nền tảng và entry

- Vite 8, React 19, React Router 7, Ant Design 6, lucide-react, recharts. `axios` có trong dependencies nhưng mã hiện gọi `fetch` qua `authFetch` hoặc gọi trực tiếp.
- `src/main.jsx` mount `App` trong `StrictMode`; `src/App.jsx` bọc `ConfigProvider` → `AuthProvider` → `GlobalLoader` → `BrowserRouter` → `AppRoutes`. Nhóm route storefront dùng `StorefrontCartLayout` với `CartProvider` và `CartDrawer` dùng chung giữa các trang.
- `vite.config.js` proxy `/api` và `/uploads` về backend local port 5000 trong dev. Repo không có backend, test API live phụ thuộc dịch vụ ngoài repo.
- `src/routes/AppRoutes.jsx` khai báo route; `ProtectedRoute` dựa trên session trong `AuthContext`. `AdminLayout` bọc sidebar, header và outlet. Các route storefront dùng `StorefrontCartLayout` để cung cấp chung trạng thái giỏ; phần nội dung/header còn được dựng riêng tại từng page.

## Xác thực và state

- `src/services/auth.js`: session trong `localStorage` key `auth_session`, phát event `auth-changed`; `getSession` kiểm tra JWT `exp` nếu token đọc được. `authFetch` thêm Bearer token, JSON header trừ FormData, parse JSON/text, xóa session khi HTTP 401, ném lỗi khi response không OK.
- `src/contexts/AuthContext.jsx`: cổng vận hành POST `/api/Auth/login`, nhận role `ADMIN`, `STAFF` hoặc `SHIPPER` từ response. `ProtectedRoute` chưa đăng nhập → `/login`; `/shipper/orders` chỉ cho SHIPPER, các route trong `AdminLayout` chỉ cho ADMIN/STAFF, route dashboard vẫn chỉ ADMIN. Đây là guard UI; quyền API phải được backend kiểm tra. Public modal `AuthModal` có đăng ký/login/OTP/reset và lưu session nhưng không kiểm tra role như cổng vận hành.
- `GlobalLoader` nghe event `global-loading` từ `authFetch`; mặc định mỗi request tăng/giảm bộ đếm. Loader giữ tối thiểu 2,5 giây, kể cả request ngắn. Payment status polling dùng `skipGlobalLoading` và trạng thái riêng ở PaymentWaitingPage để không che trang sau mỗi 3 giây; `AuthModal` có loading riêng.
- Không có query cache cho sản phẩm; mỗi lần `usePublicProducts` được mount, hook tự gọi GET products. Giỏ hàng có state dùng chung trong `src/contexts/CartContext.jsx` cho các route storefront; admin không mount cart provider. Phần lớn state khác là `useState` tại page, mất khi reload.

## Cấu trúc dữ liệu

- `src/data/mockData.js`: KPI, biểu đồ, sản phẩm mẫu, thu gom, kiểm định, upcycling, đơn hàng, khách hàng, kho, khuyến mãi, nhân sự, thông báo. Không phải dữ liệu server.
- `src/data/storeProducts.js`: catalog demo/editorial cũ dùng ảnh tham khảo bên ngoài, hiện không được dùng trực tiếp ở store page; `src/data/customerOrders.js` dựa vào nó để tạo đơn hàng demo cho profile.
- `src/utils/constants.js`: role và enum trạng thái dạng chuỗi cho nhiều màn mock. Sourcing API trong `SourcingRequests` dùng status số 0–8. Không đồng nhất 2 hệ trạng thái nếu chưa xác minh backend.
- `src/utils/formatters.js`: định dạng VND/ngày theo `vi-VN`.

## Quan hệ thư mục

`pages/Home`, `pages/Store`, `pages/Profile`, `components/common` chứa public UI. `pages/Auth` là login admin. Các module admin ở `pages/Dashboard`, `Products`, `Collections`, `Upcycling`, `Orders`, `Customers`, `Inventory`, `Promotions`, `Reports`, `Staff`, `Settings`. `styles/theme.js` cấu hình token Ant Design; `index.css` chứa token CSS toàn cục; CSS lớn theo từng public page. `public/images` và `src/assets` chứa ảnh tĩnh; nhiều ảnh khác tải từ URL bên ngoài.
