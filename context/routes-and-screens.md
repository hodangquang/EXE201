# Routes và màn hình

Nguồn dữ liệu: **API** là gọi server; **mock** là dữ liệu JS cố định; **local** là state trong component. Route tồn tại không đồng nghĩa có link từ menu.

| Route | Màn hình | Nguồn và hành động chính |
| --- | --- | --- |
| `/` | HomePage | API products qua `usePublicProducts`; hero/campaign/banner tĩnh; card mở PDP; nút giỏ mở drawer dùng chung. |
| `/about` | AboutPage | Hero ảnh chuyển cảnh, mục lục, hành trình 4 bước chọn tương tác, FAQ và pause motion; kết thúc ở CTA nền ảnh và RainsFooter dùng chung với Home. |
| `/new-in`, `/women`, `/men` | Listing storefront | API products qua hook cũ; CatalogPage dùng chung, tìm tên/màu/cỡ không dấu, sort tên/giá, lọc màu/cỡ, xóa bộ lọc, xem thêm 12 mục, layout 2/4/8 cột có giới hạn mobile. Tất cả lọc trên tập đã tải. Women/Men chưa lọc giới tính và ghi rõ trên UI. |
| `/product/:id`, `/store/:id` | StoreProductPage | API products từ hook, tìm theo id trong list; gallery; chỉ hiện màu/cỡ nếu DTO có; thêm giỏ qua `CartContext`. Drawer giỏ dùng chung với storefront. `/product` redirect tới slug demo cũ. |
| `/checkout` | CheckoutPage | Địa chỉ từ `GET /api/Profile/addresses`, dòng và tạm tính từ cart; thiếu giá thì khóa tạo đơn. Gửi `POST /api/orders/checkout`, lấy `data.order.id` và ưu tiên checkoutUrl PayOS trong response; chỉ tạo session riêng khi thiếu URL. URL phải là HTTPS PayOS. Lưu orderId/checkoutUrl, mở PayOS ở tab riêng và chuyển tab REWEAR nội bộ đến `/payment/waiting?orderId=...` để polling; nếu popup bị chặn, trang chờ có link mở PayOS. Nếu session lỗi, thử lại cùng orderId. Audit PayOS cũ là snapshot trước giao dịch người dùng báo đã thanh toán. |
| `/payment/waiting?orderId=...` | PaymentWaitingPage | Tab REWEAR tới route này ngay sau checkout; PayOS mở ở tab riêng. Lấy orderId từ URL/sessionStorage, polling `GET /api/payments/{orderId}/status` mỗi 3 giây trong tối đa 15 phút, kiểm tra ngay khi tab được focus lại. Nhận `isPaid: true`, `paymentStatus: "Paid"` hoặc số `2` là đã trả tiền; sau đó về home. Pending tiếp tục polling; Failed/Expired/Refunded/Cancelled có trạng thái riêng. Có link mở PayOS nếu popup bị chặn và nút kiểm tra lại khi cần. Callback PayOS chỉ có orderCode có thể thử tra đơn theo code, nhưng mã PayOS có thể không phải mã đơn REWEAR. |
| `/world` | RainsWorldPage (tên file nội bộ), hiển thị “Thế giới REWEAR” | Hero ảnh chuyển cảnh, bộ ảnh cảm hứng local liên kết Nữ/Nam/About, CTA gửi đồ và RainsFooter dùng chung với Home; giữ StoreLocator với địa chỉ 124 Đường 160, Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM do người dùng cung cấp. Bản đồ tile ArcGIS định tâm gần khu vực phường; liên kết Google Maps tìm theo địa chỉ. Chưa lấy địa chỉ/tọa độ từ API. |
| `/profile?tab=profile|addresses|orders|history|sourcing` | ProfilePage | Profile/addresses/sourcing dùng API; orders/history gọi `GET /api/orders`; nút Chi tiết ưu tiên `GET /api/orders/code/{orderCode}`, fallback theo ID qua `GET /api/orders/{id}` khi không có orderCode. Tab Đơn mua có loading/error/empty, tìm kiếm cục bộ, lọc trạng thái và phân trang. Response schema chưa xác minh. Page tự kiểm tra session và redirect home nếu thiếu. |
| `/login` | Login admin/staff | POST Auth/login qua `AuthContext`; admin tới dashboard, staff tới collections. |
| `/admin` | Shortcut | Redirect `/login`. |
| `/dashboard` | Dashboard | ADMIN; toàn bộ KPI, biểu đồ, bảng gần đây là mock. |
| `/products` | ProductList | ADMIN/STAFF; API list/filter/search, đổi publish status, xóa/restore. Quyền ghi chủ yếu ẩn bằng UI, cần backend kiểm soát. |
| `/products/:id` | ProductDetail | ADMIN/STAFF; API detail, có import mock còn dư. |
| `/products/new`, `/products/edit/:id` | ProductForm | ADMIN; API create FormData và update JSON. |
| `/products/categories` | Categories | ADMIN/STAFF; API list/detail/create/update/delete/restore. |
| `/products/brands` | Brands | ADMIN; API list/detail/create/update/delete/restore. |
| `/collections/sourcing` | SourcingRequests | ADMIN/STAFF; API review, định giá, reject, received, inspect, convert. |
| `/collections`, `/collections/:id`, `/collections/inspection` | Thu gom/kiểm định cũ | ADMIN/STAFF; mock và thay state local. |
| `/upcycling`, `/upcycling/:id`, `/upcycling/qc` | Upcycling/QC | ADMIN/STAFF; mock và thay state local. Sidebar hiện không có mục Upcycling dù route có. |
| `/orders`, `/orders/:id` | Đơn hàng admin | ADMIN/STAFF; mock và thay state local. |
| `/customers`, `/customers/:id` | Khách hàng | ADMIN; API `/api/admin/users`; list có detail modal, route detail vẫn tồn tại. |
| `/inventory` | Kho | ADMIN/STAFF; mock. |
| `/promotions` | Khuyến mãi | ADMIN; mock. |
| `/settings` | Cài đặt | ADMIN; UI form/switch, save chỉ hiện thông báo, chưa persist. |

`ReportsPage` và `StaffList` được import trong router nhưng **chưa có route**. `*` NotFound chỉ nằm trong nhánh được bảo vệ của admin; URL public không khớp route không có catch-all riêng. Sidebar admin chỉ hiển thị một phần route đã khai báo.


Navbar listing, About, World, Profile và PDP dùng class `rw-nav`/kiểu Home từ `HomePage.css`; CSS responsive ngoài Home nằm ở `StorefrontQuality.css`. Checkout giữ header bước đặt hàng; admin/login có shell riêng, trang chờ thanh toán không có navbar storefront.
