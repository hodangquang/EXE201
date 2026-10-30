# Kiến trúc frontend

> **27/10/2026 — chỉ tái chế:** Chốt nghiệp vụ chỉ Upcycled ở public Products/journey, CartService, OrderService, ProductRepository reservation và StyleWatch scan. Service bán nguyên trạng, tạo sản phẩm trực tiếp và activate-preview đã bị khóa; nguồn được cấp vào dự án tái chế. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> 25/10/2026: `NotificationWriter` trong Infrastructure ghi `NotificationEvents` tại repository lịch sử đơn và thu mua; `NotificationService` lọc người nhận/vai trò, gộp style alerts và lưu `NotificationReads` theo user. `NotificationsController` cung cấp feed/read; React `NotificationCenter`/badge dùng `authFetch`. Đây là source local, chưa xác minh deploy. [Chi tiết](notifications-2026-10-25.md).

> Theo dõi gu đồ 25/10/2026: `StyleWatches` lưu một bộ tiêu chí/Member, `StyleMatchNotifications` giữ thông báo duy nhất cho từng cặp user/product. `StyleWatchScanService` quét Product mới đang bán mỗi 60 giây; `StyleWatchService` so khớp và bảo vệ owner, `StyleAlertEmailSender` gửi SMTP tùy opt-in. Không sửa Product/tồn; xem [triển khai](style-watch-implementation-2026-10-25.md).

## Gallery nhiều góc — 25/10/2026

`CatalogGalleryUpdate` cập nhật ảnh/nhãn trên sáu Product hiện có bằng transaction và revision riêng; không tạo lại sản phẩm hay reset giá/tồn. DTO `imageLabels` khớp thứ tự `imageUrls`; adapter dùng nhãn cho selector và alt. PDP hiển thị đủ bốn ảnh và mặc định cận cảnh. Nguồn API local đã cập nhật Cloudinary thật; build chạy tại `.artifacts/gallery-api/`. [Báo cáo](catalog-gallery-2026-10-25.md).

## Catalog thay dữ liệu thật — 25/10/2026

Storefront tiếp tục đọc API; đã thay catalog trong Mongo nguồn API local: 12 bản ghi cũ ẩn, 6 preview mới, 8 ảnh Cloudinary. Domain/DTO có metadata preview/AI; journey phục vụ ảnh trước/sau không bịa timeline. Preview không được cart/checkout/reserve dù có stock dương. `CatalogReplacement` và CLI bảo trì nhập theo batch tường minh/idempotent, không startup seed. Hook bỏ fallback ảnh Unsplash theo tên. [Bằng chứng và giới hạn](catalog-replacement-2026-10-25.md).

## Shipping/Profile local — 25/10/2026

Route Shipper được bảo vệ riêng nhưng cùng dùng AdminLayout và ShippingPage như Admin/Staff. Sidebar/Header đọc role để giới hạn UI, server kiểm tra identity/assignment/bước giao. Profile chỉ có OrdersSection/OrderCard; tracking dùng một endpoint thay vì gọi riêng order/shipping/timeline. Bỏ HistorySection trùng dữ liệu; DeliveryTimeline dùng chung; response cũ sau khi đóng không ghi đè state.

Đối chiếu lại trong task bộ sản phẩm đề xuất 25/10/2026: vite.config.js hiện proxy cả `/api` và `/uploads` về `http://localhost:5000`. Browser acceptance đặt VITE_API_BASE_URL về đúng test host local. [Chi tiết và bằng chứng shipping](shipping-acceptance-2026-10-25.md); cấu hình proxy ở snapshot shipping cũ khác source hiện tại.

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

## Nền tảng và entry

**Bổ sung 2026-10-24:** `Rewear_BackEnd/` hiện có source ASP.NET Core với Domain/Application/Infrastructure/API, MongoDB repositories, webhook và worker hết hạn. Đã review source local, chưa build/chạy backend hoặc kiểm chứng deploy. Xem `business-overview-2026-10-24.md`; ghi chép backend ngoài workspace trong snapshot cũ không còn đúng với workspace hiện tại.

- Vite 8, React 19, React Router 7, Ant Design 6, lucide-react, recharts. `axios` có trong dependencies nhưng mã hiện gọi `fetch` qua `authFetch` hoặc gọi trực tiếp.
- `src/main.jsx` mount `App` trong `StrictMode`; `src/App.jsx` bọc `ConfigProvider` → `AuthProvider` → `GlobalLoader` → `BrowserRouter` → `AppRoutes`. Nhóm route storefront dùng `StorefrontCartLayout` với `CartProvider` và `CartDrawer` dùng chung giữa các trang.
- `vite.config.js` proxy `/api` và `/uploads` về backend local port 5000 trong dev. Có source backend tại `Rewear_BackEnd/`, nhưng gọi live vẫn cần chạy/cấu hình đúng dịch vụ và tích hợp ngoài.
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
