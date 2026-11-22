# Routes và màn hình

> **27/10/2026 — chỉ tái chế:** /products/new redirect /upcycling; /upcycling/qc chỉ còn kiểm định thành phẩm dự án. /inventory bỏ QC/bán nguyên trạng. /products/drafts chỉ còn 2 ý tưởng tái chế; /products/edit/:id không có mở bán preview trực tiếp. Public catalog/PDP chỉ nhận Upcycled. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> 25/10/2026: `/profile?tab=notifications` là feed của Member; `/notifications` trong AdminLayout dành Admin/Staff/Shipper. Header/Sidebar và AccountMenu có badge số chưa đọc, mở item đánh dấu đã đọc rồi điều hướng. Trang gu đồ riêng vẫn tồn tại. [Chi tiết](notifications-2026-10-25.md).

> Trang `/profile?tab=style` 25/10/2026: form gu đồ và thông báo món mới từ API; AccountMenu và catalog dẫn tới đây. Không có route riêng công khai cho thông báo; khách cần đăng nhập Member. [Chi tiết](style-watch-implementation-2026-10-25.md).

> Cập nhật 25/10/2026: Staff sau đăng nhập và khi bị chặn quyền được đưa tới `/collections/sourcing` (API thật). `/collections` và `/collections/:id` chuyển về sourcing; `/collections/inspection` chuyển tới `/inventory`. Menu quản trị không dẫn tới khuyến mãi/cài đặt lưu giả hoặc thông báo mẫu; `/promotions` và `/settings` chuyển về dashboard. Xem [rà soát nghiệp vụ](business-flow-audit-2026-10-25.md).

## Bản lưu ý tưởng — 25/10/2026

`/products/drafts` vẫn là route Admin/Staff đọc JSON tĩnh; nút tại `/products` đổi nhãn thành “Bản lưu ý tưởng”. Trang nói rõ sáu mẫu đã nhập vào Danh sách sản phẩm, không đồng bộ trạng thái API và không thao tác bán. Cảnh báo/checklist không còn hướng dẫn nhập tồn hay yêu cầu ảnh trước/sau để mở bán.

## Màn đăng bán độc bản — 25/10/2026

`/products/edit/:id` với preview hiện một khối nhỏ: chọn tình trạng món đồ, bấm **Đăng bán 1 món**. Không còn nhập tồn, mã kiểm định hoặc tải ảnh trước/sau ở bước này. Form tạo mới không nhập tồn; backend đặt một món. `/products` không còn cột tồn kho. Sáu món đề xuất còn preview cho đến khi Admin xác nhận; ảnh cũ vẫn được giữ. Mục “Nhập tồn và mở bán” bên dưới là snapshot trước khi đơn giản hóa.

## Nhập tồn và mở bán — 25/10/2026

`/products` hiện cột Tồn kho và đưa Admin tới `/products/edit/:id`. Form tạo mới và hàng đang bán có ô Tồn kho có thể bán; preview có khối xác nhận số món, tình trạng thực, tham chiếu kiểm định, ảnh sau và ảnh trước riêng cho Upcycled. Nút mở bán tách nút lưu thông tin. Backend chỉ Admin được mở preview. Sáu món đề xuất chưa được mở bán vì thiếu hiện vật đã xác nhận.

## Sourcing và QC sau rà nghiệp vụ — 25/10/2026

`/collections/sourcing` kiểm định món đồ đã nhận, tải ảnh chứng cứ, ghi tình trạng thực tế/giá mới; sau chi trả dẫn sang `/inventory` để QC bán lại hoặc `/upcycling` để tạo dự án. `/inventory` có nút QC cho AvailableRaw/Rework và nút đăng bán khi QCApproved. `/upcycling/qc` xử lý QC dự án/hiện vật. `/shipping` dùng `PickedUp` cho shipper lấy đồ, không hiển thị là đã vào kho. `/profile?tab=sourcing` hiển thị ảnh kiểm định nếu có; ghi chú nội bộ không hiển thị cho khách. [Sơ đồ và bằng chứng](inspection-flow-audit-2026-10-25.md).

## Chi tiết thu mua trên Profile — 25/10/2026

`/profile?tab=sourcing` mở chi tiết qua `GET /api/Sourcing/:id` trong dialog; `SourcingRequestDetail` hiển thị đúng các giá trị và ảnh từ DTO, không sinh giá hoặc chứng từ mẫu. Đồng ý/từ chối giá giữ các PATCH hiện có. Kiểm tra UI với fixture cô lập; chưa thử giao dịch tài khoản thật.

## Gallery PDP cập nhật — 25/10/2026

`/product/:id` dùng bốn `imageUrls` và `imageLabels` từ API cho cả conveyor và detail; detail có selector tên góc, mặc định cận cảnh. `/products/drafts` đọc JSON nguồn đã có bốn ảnh mỗi sản phẩm. Không đổi route hay auth. [Bằng chứng](catalog-gallery-2026-10-25.md).

## Bộ sản phẩm đề xuất — 25/10/2026

**Cập nhật:** Home, `/new-in`, `/women`, `/men` và `/product/:id` đã đọc sáu sản phẩm mới được nhập Mongo, không phải JSON frontend thay response. Các ID cũ bị ẩn công khai và vẫn giữ trong DB. `/products/drafts` giữ trang duyệt nguồn tĩnh. [Kết quả thay dữ liệu](catalog-replacement-2026-10-25.md).

`/products/drafts` → `CatalogDrafts.jsx`, Admin/Staff trong AdminLayout; mở từ nút **Bộ sản phẩm đề xuất** tại `/products`. Đọc JSON tĩnh `public/catalog/rewear-drafts.json`, không gọi API ghi sản phẩm. Có modal/tải ảnh trước-sau cho Upcycled; SecondHand chỉ ảnh hiện tại. Tài nguyên public không có dữ liệu riêng tư. [Chi tiết](catalog-drafts-2026-10-25.md).

## Route hiện tại — shipping 25/10/2026

`/shipping` dành Admin/Staff. `/shipper/orders` và `/shipper/orders/:id` cùng dùng **AdminLayout + ShippingPage**, guard riêng cho Shipper, sidebar chỉ có Đơn giao của tôi. `/profile?tab=orders` chứa mọi đơn và theo dõi nội tuyến; bỏ HistorySection trùng dữ liệu. `?tab=history` chuyển sang orders; `/profile/orders/:id` mở đúng thẻ đơn trong cùng ProfilePage. [Chi tiết và bằng chứng](shipping-acceptance-2026-10-25.md). Bảng bên dưới là snapshot lịch sử khi khác mô tả này.

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

Nguồn dữ liệu: **API** là gọi server; **mock** là dữ liệu JS cố định; **local** là state trong component. Route tồn tại không đồng nghĩa có link từ menu.

| Route | Màn hình | Nguồn và hành động chính |
| --- | --- | --- |
| `/` | HomePage | API products qua `usePublicProducts`; hero/campaign/banner tĩnh; card mở PDP; nút giỏ mở drawer dùng chung. |
| `/about` | AboutPage | Hero ảnh chuyển cảnh dùng chung storefront, mục lục đến câu chuyện/hành trình/FAQ, nội dung sáng với ảnh và ba nguyên tắc, hành trình 4 bước chọn bằng nút, FAQ native; CTA nền ảnh và RainsFooter chung. Pause/reduced motion ở hero; không còn marquee/reveal hay pause toàn trang. Dữ liệu nội dung tĩnh, giỏ dùng state chung. |
| `/new-in`, `/women`, `/men` | Listing storefront | API products qua hook cũ; CatalogPage dùng chung, tìm tên/màu/cỡ không dấu, sort tên/giá, lọc màu/cỡ, xóa bộ lọc, xem thêm 12 mục, layout 2/4/8 cột có giới hạn mobile. Tất cả lọc trên tập đã tải. Women/Men chưa lọc giới tính và ghi rõ trên UI. |
| `/product/:id`, `/store/:id` | StoreProductPage | API products từ hook, tìm theo id trong list; gallery; chỉ hiện màu/cỡ nếu DTO có; thêm giỏ qua `CartContext`. Drawer giỏ dùng chung với storefront. `/product` redirect tới slug demo cũ. |
| `/checkout` | CheckoutPage | Địa chỉ từ `GET /api/Profile/addresses`, dòng và tạm tính từ cart; thiếu giá thì khóa tạo đơn. Gửi `POST /api/orders/checkout`, lấy `data.order.id` và ưu tiên checkoutUrl PayOS trong response; chỉ tạo session riêng khi thiếu URL. URL phải là HTTPS PayOS. Lưu orderId/checkoutUrl, mở PayOS ở tab riêng và chuyển tab REWEAR nội bộ đến `/payment/waiting?orderId=...` để polling; nếu popup bị chặn, trang chờ có link mở PayOS. Nếu session lỗi, thử lại cùng orderId. Audit PayOS cũ là snapshot trước giao dịch người dùng báo đã thanh toán. |
| `/payment/waiting?orderId=...` | PaymentWaitingPage | Tab REWEAR tới route này ngay sau checkout; PayOS mở ở tab riêng. Lấy orderId từ URL/sessionStorage, polling `GET /api/payments/{orderId}/status` mỗi 3 giây trong tối đa 15 phút, kiểm tra ngay khi tab được focus lại. Nhận `isPaid: true`, `paymentStatus: "Paid"` hoặc số `2` là đã trả tiền; sau đó về home. Pending tiếp tục polling; Failed/Expired/Refunded/Cancelled có trạng thái riêng. Có link mở PayOS nếu popup bị chặn và nút kiểm tra lại khi cần. Callback PayOS chỉ có orderCode có thể thử tra đơn theo code, nhưng mã PayOS có thể không phải mã đơn REWEAR. |
| `/world` | RainsWorldPage (tên file nội bộ), hiển thị “Thế giới REWEAR” | Hero ảnh chuyển cảnh, bộ ảnh cảm hứng local liên kết Nữ/Nam/About, CTA gửi đồ và RainsFooter dùng chung với Home; giữ StoreLocator với địa chỉ 124 Đường 160, Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM do người dùng cung cấp. Bản đồ tile ArcGIS định tâm gần khu vực phường; liên kết Google Maps tìm theo địa chỉ. Chưa lấy địa chỉ/tọa độ từ API. |
| `/profile?tab=profile|addresses|orders|history|sourcing` | ProfilePage | Profile/addresses/sourcing dùng API; orders/history gọi `GET /api/orders`; nút Chi tiết ưu tiên `GET /api/orders/code/{orderCode}`, fallback theo ID qua `GET /api/orders/{id}` khi không có orderCode. Tab Đơn mua có loading/error/empty, tìm kiếm cục bộ, lọc trạng thái và phân trang. Response schema chưa xác minh. Page tự kiểm tra session và redirect home nếu thiếu. |
| `/login` | Cổng vận hành | POST Auth/login qua `AuthContext`; ADMIN tới dashboard, STAFF tới collections, SHIPPER tới `/shipper/orders`. |
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
| `/shipping` | ShippingPage | ADMIN/STAFF; API `queue` để xem đơn chờ và tạo shipping với shipper ID, method, carrier; tab theo shipper ID dùng `my-orders`. ADMIN có thêm `all`; hai tab danh sách đã phân công có filter status. GET chi tiết theo order ID; POST thành công tải lại danh sách. Dữ liệu shipping là server, màn `/orders` vẫn mock riêng. |
| `/shipper/orders` | ShippingPage | SHIPPER; `GET /api/shipping/my-orders`, lọc mã status, GET chi tiết, PUT status/note/trackingNumber/attemptCount rồi tải lại. Cổng login đọc role từ response backend. |

| `/customers`, `/customers/:id` | Khách hàng | ADMIN; API `/api/admin/users`; list có detail modal, route detail vẫn tồn tại. |
| `/inventory` | Kho | ADMIN/STAFF; mock. |
| `/promotions` | Khuyến mãi | ADMIN; mock. |
| `/settings` | Cài đặt | ADMIN; UI form/switch, save chỉ hiện thông báo, chưa persist. |

Checkout còn gọi `GET /api/shipping/rates` trước khi cho tạo đơn; tab Đơn mua gọi `GET /api/shipping/{orderId}` khi mở chi tiết. Các response shipping live vẫn chưa đối chiếu vì backend ngoài workspace không phản hồi trong lần kiểm tra.

`ReportsPage` và `StaffList` được import trong router nhưng **chưa có route**. `*` NotFound chỉ nằm trong nhánh được bảo vệ của admin; URL public không khớp route không có catch-all riêng. Sidebar admin chỉ hiển thị một phần route đã khai báo.


Navbar listing, About, World, Profile và PDP dùng class `rw-nav`/kiểu Home từ `HomePage.css`; CSS responsive ngoài Home nằm ở `StorefrontQuality.css`. Checkout giữ header bước đặt hàng; admin/login có shell riêng, trang chờ thanh toán không có navbar storefront.
