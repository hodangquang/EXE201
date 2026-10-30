# Bản đồ API từ frontend

> **27/10/2026 — chỉ tái chế:** POST inventory/{id}/qc và /publish của operations, Sourcing convert-to-product, ProductService.CreateAsync và activate-preview từ chối nghiệp vụ; POST /api/Products trả 409 trước upload. Public GET Products và journey chỉ Upcycled, cart/checkout/reservation chặn loại khác. Endpoint đăng bán hợp lệ là POST /api/operations/projects/{id}/publish sau QCApproved. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> API thông báo từ backend source local 25/10/2026: JWT Member/Admin/Staff/Shipper gọi `GET /api/notifications` → `{data: [{id,kind,title,body,link,createdAt,readAt}], unreadCount}` (50 item mới nhất); `POST /api/notifications/{id}/read` → 204 hoặc 404 nếu không thuộc quyền. Member nhận thêm item gu đồ ID có tiền tố `style:`; không ghi nhận thanh toán từ browser. [Chi tiết](notifications-2026-10-25.md).

> API theo dõi gu đồ 25/10/2026 (từ source): JWT Member cho `GET/PUT /api/style-watch`, `GET /api/style-watch/notifications`, `POST /api/style-watch/notifications/{id}/read`. PUT nhận `categoryIds`, `sizes`, `colors`, `minPrice`, `maxPrice`, `isEnabled`, `emailEnabled`; owner lấy từ JWT, không từ body. Chỉ món mới sau khi bật theo dõi mới tạo thông báo. [Chi tiết](style-watch-implementation-2026-10-25.md).

> Cập nhật từ source backend 25/10/2026: `POST/PUT /api/Products` bắt buộc `Condition` hợp lệ, không tự điền Good khi request thiếu; `DELETE /api/Products/{id}` trả 409 nếu món còn được phân bổ trong đơn và chỉ ẩn mềm khi thành công. `POST /api/Products/{id}/activate-preview` vẫn AdminOnly, yêu cầu tình trạng và đặt độc bản/tồn 1. Xem [rà soát nghiệp vụ](business-flow-audit-2026-10-25.md).

## Đăng bán đồ độc bản — contract mới từ source local 25/10/2026

`POST /api/Products/{id}/activate-preview` nay nhận JSON `{condition}` và yêu cầu AdminOnly. `condition` phải là enum hợp lệ; backend xác nhận sản phẩm đang preview/Available/tồn 0, ghi actor/thời điểm, đặt `isUnique=true`, `stockQuantity=1`, `isPreview=false`. Không nhận số lượng, mã biên bản hay ảnh mới; giữ nguyên URL ảnh, ảnh trước và `imageSource` hiện có. `POST /api/Products` tạo hàng mới với `isUnique=true`, tồn 1; form tạo/sửa không còn nhập tồn. PUT metadata vẫn gửi lại tồn hiện có để giữ contract cũ. Cart và giữ kho tiếp tục giới hạn một món; khi hết hàng trạng thái bán/giữ do backend xử lý. Đây là xác nhận thủ công của Admin, không tạo mốc QC hoặc xác thực ảnh. Các đoạn contract nhập tồn/ảnh bắt buộc bên dưới là trạng thái trước thay đổi này.

## [Lịch sử trước điều chỉnh] Tồn kho và mở bán preview — 25/10/2026

`POST /api/Products` nhận StockQuantity từ form tạo mới (mặc định 1, phải >=1). `PUT /api/Products/{id}` nhận multipart/form-data và StockQuantity từ form quản trị. Hàng đang bán phải tồn >=1, độc bản đúng 1, không đổi tồn khi có phân bổ đơn; Reserved/Sold không sửa qua form. Preview chỉ nhận tồn 0 qua PUT. `POST /api/Products/{id}/activate-preview` dùng multipart/form-data và quyền AdminOnly, nhận StockQuantity, Condition, VerificationReference, Images (2–5 ảnh hiện vật ở các góc khác nhau); Upcycled còn cần BeforeImages (1–5). Backend kiểm tra trạng thái, người xác nhận, ảnh HTTPS sau upload; thay ảnh đề xuất, lưu người/thời gian/tham chiếu, bỏ IsPreview. Cart/checkout vẫn kiểm tra IsPreview và tồn. Đây là xác nhận thủ công, không tự sinh sourcing/project/QC. Chưa thử với hiện vật/deploy; sáu món vẫn preview/tồn 0.

## Điều kiện kiểm định đã đối chiếu backend local — 25/10/2026

`GET /api/Sourcing/my` và `GET /api/Sourcing/{id}` trả DTO có `customerName/customerEmail`, `inspectionImages`, tình trạng khai báo/kiểm định và payout; với member, controller lược bỏ `adminNote`, `inspectedBy`, `offerHistory` và người xác nhận trong payout. Admin/Staff vẫn nhận dữ liệu nội bộ. `PATCH /api/Sourcing/{id}/inspect` nhận `images` (0–5 URL HTTPS) và kết quả; `POST /api/operations/inventory/{id}/qc` yêu cầu 1–5 ảnh khi `passed=true`. `POST /api/operations/inventory/{id}/publish` chỉ nhận inventory `QCApproved` có lượt QC đạt kèm ảnh; từ chối ảnh/tình trạng khác dữ liệu đã kiểm định. `POST /api/Sourcing/{id}/convert-to-product` dùng cùng guard backend. Phân công lấy hàng yêu cầu dữ liệu liên hệ/giờ hẹn thực tế; shipper `PickedUp` chưa là nhận kho, `PATCH /api/Sourcing/{id}/received` do nhân viên gọi riêng. Đây là contract từ source local và test, chưa xác minh deploy. [Chi tiết](inspection-flow-audit-2026-10-25.md).

## Contract shipping đã kiểm thử local — 25/10/2026

> Nội dung UI 25/10/2026: nhãn ảnh AI đã được bỏ theo yêu cầu người dùng. Adapter/renderer dùng `formatCatalogText` cho câu mô tả ghép sẵn; response API, `imageSource`, `imageLabels`, URL và dữ liệu Mongo không thay đổi. Không có mutation hoặc endpoint mới trong task bỏ nhãn.

> Gallery 25/10/2026: `GET /api/Products` và `GET /api/Products/{id}` thêm mảng tùy chọn `imageLabels`, khớp thứ tự với `imageUrls`; dữ liệu cũ không có nhãn dùng “Ảnh n” ở client. Sáu sản phẩm mới đã có bốn ảnh/nhãn, journey giữ nguyên ảnh nguyên liệu và trả bốn ảnh hiện tại. Không có endpoint import/gallery hàng loạt mới. [Áp dụng và QA](catalog-gallery-2026-10-25.md).

> Catalog 25/10/2026 đã kiểm tra API local thật: GET Products chỉ còn 6 sản phẩm mới, response thêm `isPreview`, `imageSource`, `condition` nullable cho preview. GET `/api/products/{id}/journey` trả nhãn preview/AI, ảnh trước-sau HTTPS; preview không có mốc vận hành giả. Preview bị chặn tại cart add/update/read, checkout và giữ kho. Không có endpoint nhập catalog mới; dùng CLI bảo trì có đối chiếu DB/API. [Chi tiết](catalog-replacement-2026-10-25.md).

`GET /api/orders/{id}/tracking` kiểm tra chủ đơn, trả `order`, `shipping` nullable, `deliveryHistory` (code/label/occurredAt nullable), giữ timeline tương thích. Customer không nhận ghi chú nội bộ/id Shipper/danh tính người ghi lịch sử. DTO shipment có snapshot người nhận, địa chỉ, kiện hàng, paymentStatus, assignedAt/pickedUpAt và history.

Tận dụng API cũ: queue/all/my-orders/GET shipment/POST phân công/PUT status. Staff/Admin được xem all; Shipper chỉ xem và cập nhật đúng đơn được phân công. Giữ mã 0–4, thêm **5 PickedUp**; chuyến mới 0 → 5 → 1 → 2/3. failureCode có allowlist, Other cần note; attemptCount client bị bỏ qua. POST phân công đổi người được trước pickup, không tạo shipment thứ hai. [Contract/kiểm thử/migration](shipping-acceptance-2026-10-25.md). Chưa xác minh deploy; các ghi chép cũ bên dưới là snapshot lịch sử.

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

**Phạm vi:** workspace frontend không chứa backend. Hầu hết contract bên dưới suy ra từ mã client; riêng flow checkout/payment đã đối chiếu mã backend chạy ngoài workspace và Swagger live ngày 2026-10-07. Ngoại lệ: người dùng đã cung cấp schema Swagger cho `PUT /api/Products/{id}` ngày 2026-10-06; các endpoint cart, orders và payment session ngày 2026-10-07. GET cart được mô tả trả giỏ kèm thông tin sản phẩm đầy đủ; response schema cart, count và một số orders vẫn chưa được kiểm thử bằng dữ liệu tài khoản thật; checkout/session đã đối chiếu mã backend, xem `payment-checkout-audit.md`. Backend đặt thời hạn session 15 phút theo cấu hình; chưa thử thành công với PayOS thật. Các response khác thường được chuẩn hóa tại page bằng `Array.isArray(res) ? res : res.data || []`, detail bằng `res.data || res`; cần xác nhận shape thật.

## Shipping (Swagger do người dùng cung cấp ngày 2026-10-18)

> **Đính chính từ source backend local 2026-10-24:** workspace có `Rewear_BackEnd/`. Ghi chú đầu tài liệu và các phần bên dưới là snapshot contract frontend cũ; khi xung đột, ưu tiên các phát hiện sau và `business-overview-2026-10-24.md`. Đây là review source, chưa xác minh response live/bản deploy.

- Sourcing backend: **6 Completed, 7 Rejected, 8 Declined**. ProfilePage hiện map đúng cả mã số và tên enum; nhận định map Profile sai là snapshot cũ. DTO `SourcingResponse` trong source có `imageUrls`, `declaredCondition`, `inspectedCondition`, `customerExpectedPrice`, `offeredPrice`, `requiresRevisedAcceptance`, `payout`. `payout` là bản ghi chi trả thủ công; chỉ state Confirmed mới hiển thị là cửa hàng đã ghi nhận chi trả. Chưa xác minh response tài khoản thật/deploy trong lượt UI này.
- Payment backend enum: 0 Pending, **1 Paid, 2 Failed**, 3 Expired, 4 Refunded. Numeric fallback FE đảo 1/2; `/status` trong source trả chuỗi và `isPaid`, nên không kết luận endpoint này chắc chắn đang hiển thị sai. Order thêm **6 Failed**. Shipping enum đủ 0 Pending/1 InTransit/2 Delivered/3 Failed/4 Returned.
- Có webhook controller và endpoint reconcile/history; không khẳng định chỉ có polling hoặc webhook production đã đăng ký. `Program.cs`/settings mặc định session 15 phút, service fallback 5 phút; runtime có thể ghi đè.
- Payment success commit Reserved → Sold ngay khi Paid; repository release không nhận Sold, xung đột với refund trả kho.
- Backend `PUT /api/Products/{id}` hiện nhận multipart/form-data qua FromForm, khác JSON ProductForm FE gửi theo Swagger cũ.
- Có cancel/tracking order, payment reconcile/history và admin shipping reship/cancel-permanent; FE chưa nối đầy đủ. Policy shipping my-orders/status là Admin/Shipper, không bao gồm Staff.

Frontend gọi qua `shippingApi` trong `src/services/auth.js`; adapter ở `src/services/shipping.js`. Các endpoint, tham số và quyền bên dưới lấy từ ảnh/mô tả Swagger người dùng gửi, **chưa kiểm chứng bằng response backend live** (localhost:5000 không phản hồi lúc kiểm tra). Response thành công được mô tả là `{success,message,data,errorCode}` nhưng schema `data` chỉ ghi `string`; client nhận JSON hoặc text JSON và chuẩn hóa một số dạng list/object có thể có. Không coi tên field suy đoán trong adapter là contract backend đã xác nhận.

| Endpoint | Sử dụng hiện tại |
| --- | --- |
| `GET /api/shipping/rates` | Checkout tải lựa chọn Standard `0`/Express `1`. REWEAR miễn phí toàn bộ nên UI hiển thị `0 ₫`; khi response thành công mà `data` chưa có shape rõ, dùng hai method đã được mô tả trong Swagger/guide. Nếu request lỗi, khóa tạo đơn và cho thử lại. |
| `GET /api/shipping/{orderId}` | Customer mở chi tiết Đơn mua; trang vận chuyển Admin/Staff/Shipper mở chi tiết. HTTP 404 hiển thị chưa có vận chuyển. Chỉ backend mới đảm bảo khách xem đúng đơn của mình. |
| `POST /api/shipping/{orderId}` | Admin/Staff phân công từ `/shipping`; query `shipperId` (bắt buộc với Admin/Staff), `method` số `0` hoặc `1` (mặc định `0`), `carrier` tùy chọn. Chỉ backend cho tạo khi đơn đã thanh toán; client không suy PAID từ order status. |
| `PUT /api/shipping/{orderId}/status` | Shipper cập nhật JSON `{status:number,note:string,trackingNumber:string,attemptCount:number}`; tải lại dữ liệu sau thành công. Backend được mô tả đồng bộ Order.Status và ghi timeline; client không tự thay payment status. |
| `GET /api/shipping/queue` | Admin/Staff lấy đơn Confirmed chưa gán shipper. |
| `GET /api/shipping/my-orders?status=&shipperId=` | Shipper lấy đơn được giao và lọc status; Admin/Staff có tab xem theo shipper ID. UI Shipper không gửi `shipperId`. Filter status cho phép mã `0–4`. |
| `GET /api/shipping/all?status=` | Admin xem toàn bộ vận chuyển, filter mã `0–4`. |

Swagger còn hiển thị `PUT /api/shipping/{orderId}` nhưng người dùng chưa cung cấp request body/ý nghĩa cập nhật nên frontend chưa gọi endpoint này. Mô tả status nêu `Pending / InTransit / Delivered / Failed`, nhưng filter chấp nhận **5 mã 0–4**; chưa đủ căn cứ để gán tên cho từng mã. UI giữ mã số nguyên và chỉ dịch tên khi backend trả string đã rõ. Cần backend xác nhận enum, response shape của rates/list/detail và quyền update trước khi dùng các nhãn trạng thái đầy đủ.

## Cơ chế chung

Orders: `GET /api/orders` do người dùng cung cấp với query `Status` (0–5), `PageSize`, `Page`; `GET /api/orders/{id}` và `GET /api/orders/code/{orderCode}` do người dùng cung cấp để lấy chi tiết đơn của customer hiện tại. Người dùng cũng cung cấp mapping từ `OrderStatus.cs`: 0 AwaitingPayment, 1 Confirmed, 2 Shipping, 3 Delivered, 4 Cancelled, 5 PaymentExpired. Frontend gọi qua `ordersApi`/`authFetch`; nút Chi tiết ưu tiên tra bằng orderCode, dùng id nội bộ khi danh sách không có mã. Response schema chưa được cung cấp; wrapper/field alias trong adapter chỉ là giả định cần đối chiếu backend. Đơn mua phân trang 10 bản ghi/request; Lịch sử đọc tối đa 50 bản ghi/request. Trạng thái thanh toán vẫn là field riêng, không suy ra từ status đơn.

- Dev proxy: `/api`, `/uploads` → `http://localhost:5000` (`vite.config.js`). Deploy cần proxy tương đương hoặc base URL phù hợp.
- `authFetch(url, options)` ở `src/services/auth.js`: gắn Bearer token từ `auth_session`; JSON `Content-Type` mặc định, bỏ header này với FormData; parse JSON theo content-type `application/json`, `+json`, `text/json` hoặc đọc text; HTTP 401 clear session và giữ `error.status = 401`; response lỗi lấy `message`, `title` hoặc `detail`. Mặc định phát sự kiện cho `GlobalLoader`, riêng payment status polling dùng `skipGlobalLoading` vì trang chờ có state riêng. Không có retry/cache/timeout chung; payment waiting tự lên lịch request, dùng AbortController và cache busting query.
- Admin login trong `AuthContext` và các thao tác auth ở `AuthModal` dùng `fetch` trực tiếp. `AuthModal` không phát global loading. `axios` chưa được dùng.

## Endpoint đang được gọi

| Nhóm | Endpoint và method | Nơi gọi / mục đích |
| --- | --- | --- |
| Auth | `POST /api/Auth/login` | Cổng vận hành và customer modal; body `{email,password}`. Cổng `/login` nhận ADMIN/STAFF/SHIPPER theo role response; quyền thật do backend kiểm tra. |
| Auth | `POST /api/Auth/register`, `/forgot-password`, `/verify-otp`, `/reset-password` | `AuthModal`; payload từ từng form. |
| Products | `GET /api/Products?IsActive=true&Status=0` | `usePublicProducts`; chỉ trạng thái 0 được đưa lên storefront. |
| Products | `GET /api/Products` với `CategoryId`, `BrandId`, `Status`, `Condition`, `IsActive`, `Search` | ProductList admin. |
| Products | `GET /api/Products/:id` | ProductDetail, ProductForm edit; `CartContext` dùng để đối chiếu giá khi giỏ API thiếu hoặc trả giá 0. |
| Products | `POST /api/Products` | ProductForm create; `FormData` gồm Title, Description, BrandId, CategoryId, Price, Condition, Size, Color, Images. |
| Products | `PUT /api/Products/{id}` | ProductForm edit; **schema Swagger do người dùng cung cấp**: JSON `{title, description, brandId, categoryId, price, condition, size, color, imageUrls, stockQuantity}`. `id` là string path parameter. |
| Products | `PATCH /api/Products/:id/status` | Đổi trạng thái; ProductList frontend hiện chỉ gửi status `0` hoặc `1` để đổi Available ↔ Reserved và không gọi endpoint này từ flow thanh toán. Theo quy ước người dùng cung cấp: 0 Available, 1 Reserved, 2 Sold; backend/API chưa có trong repo để xác minh enum. Việc chuyển product trong order sang Sold khi backend xác minh payment PAID cần được thực hiện phía server, không dựa vào redirect/browser. |
| Products | `DELETE /api/Products/:id`, `PATCH /api/Products/:id/restore` | Xóa mềm/khôi phục. |
| Cart | `POST /api/cart` | `StoreProductPage`; **schema Swagger do người dùng cung cấp**: JSON `{productId: string, quantity: number}`. `authFetch` gửi session Bearer nếu có; thành công 2xx mới hiện xác nhận. |
| Cart | `GET /api/cart` | `CartContext`; endpoint do người dùng cung cấp, trả giỏ kèm thông tin sản phẩm đầy đủ. Response shape/field cụ thể chưa có schema; client hỗ trợ mảng/object bọc, tên field camelCase/PascalCase và thông tin sản phẩm lồng nhau; thumbnail ưu tiên ảnh trên dòng/cart product API, chỉ fallback sang ảnh catalog khi có ảnh thật, không dùng ảnh mock túi cho mọi sản phẩm. Giá và ảnh từ catalog storefront cùng ID dùng làm fallback; nếu giá vẫn thiếu/bằng 0 hoặc thumbnail chưa có ảnh thật, client lấy chi tiết qua `GET /api/Products/{id}` để bổ sung cả giá lẫn ảnh. Nếu vẫn không có giá hợp lệ, UI hiện “Chưa cập nhật giá”, không giả hiện 0 đ và khóa checkout. Chuỗi giá có phân cách hàng nghìn được chuẩn hóa trước khi format VND. |
| Cart | `GET /api/cart/count` | `CartContext`; endpoint lấy số lượng mục do người dùng cung cấp. Client chuẩn hóa scalar hoặc object có `count`, `cartCount`, `itemCount`, `totalItems`, `totalCount` hoặc `quantity`; nếu response không đọc được/lỗi thì badge fallback về tổng quantity từ GET cart. |
| Cart | `PUT /api/cart/items/{itemId}` | `CartDrawer` qua `CartContext`; endpoint, `itemId` kiểu string và JSON body `{quantity: number}` do người dùng cung cấp. Chỉ cập nhật số lượng trong state sau phản hồi thành công; mã dòng đọc từ `itemId`, `cartItemId` hoặc `id` trong GET response. UI giữ số lượng tối thiểu là 1. |
| Cart | `PUT /api/cart/items/{itemId}/select` | `CartDrawer` qua `CartContext`; endpoint, `itemId` kiểu string và JSON body `{isSelected: boolean}` do người dùng cung cấp. Chỉ cập nhật checkbox sau phản hồi thành công. |
| Cart | `PUT /api/cart/items/select-all` | `CartDrawer` qua `CartContext`; body `{isSelected: boolean, onlyAvailable: boolean}` do người dùng cung cấp. Sau khi API thành công, tải lại GET cart để hiển thị trạng thái chọn do server quyết định; khi chọn tất cả client gửi `onlyAvailable: true`, khi bỏ chọn tất cả gửi `false`. |
| Cart | `DELETE /api/cart` | `StoreProductPage`; xóa toàn bộ giỏ, endpoint do người dùng cung cấp. UI yêu cầu xác nhận; chỉ xóa state hiển thị sau khi API thành công. |
| Cart | `DELETE /api/cart/items/{itemId}` | `CartDrawer` qua `CartContext`; endpoint và `itemId` dạng string do người dùng cung cấp. Xóa một dòng; client lấy mã dòng từ `itemId`, `cartItemId` hoặc `id` của response GET và chỉ cập nhật state sau khi API thành công. Nếu response không có mã dòng, UI giữ nguyên dòng và báo lỗi. |
| Orders | `POST /api/orders/checkout` | `CheckoutPage`; schema `{shippingAddressId: string, shippingMethod: number, note: string}`; `shippingMethod: 0` là mặc định. Theo `FE_INTEGRATION_GUIDE.md`, response thành công chứa `data.order.id` và `data.payment.checkoutUrl`. Frontend phải giữ orderId, mở PayOS ở tab riêng rồi chuyển tab REWEAR đến `/payment/waiting?orderId=...` để polling; nếu checkout chưa có URL mới gọi payment session endpoint, tránh tạo trùng. Backend `OrdersController` từng được đối chiếu trả `data: {order, payment}`; khi tạo link thất bại có thể trả 409, hủy đơn/trả tồn kho. Response production vẫn cần kiểm chứng. |
| Payments | `POST /api/payments/{orderId}/session` | Endpoint tạo phiên PayOS cho orderId; response mô tả có `checkoutUrl`, `qrCode`, thời hạn phiên; Swagger có `{success,message,data,errorCode}` với `data` không định kiểu. Frontend chỉ dùng endpoint này khi checkout response thiếu URL, rồi mở URL HTTPS PayOS ở tab riêng và poll cùng orderId; lỗi session cho thử lại mà không tạo order khác. Audit cũ ghi upstream chưa tạo link, nhưng người dùng nay báo đã thanh toán; trạng thái live cần xác minh bằng `/status`. HTTP 200 tạo session không chứng minh khách đã trả tiền. |
| Payments | `GET /api/payments/{orderId}/status` | `FE_INTEGRATION_GUIDE.md` quy định frontend dùng `data.order.id` từ checkout để gọi mỗi 3 giây; khi DB còn Pending, backend hỏi PayOS, đồng bộ payment `0 → 2`, order và product `Reserved → Sold` theo mô tả, xử lý idempotent. Response mẫu có `data.paymentStatus: "Paid"`, `isPaid: true`, `isExpired`, `expiresInSeconds`; enum payment `0 Pending`, `1 Failed`, `2 Paid`, `3 Expired`, `4 Refunded`. Frontend chấp nhận string/number và chỉ báo thành công khi response backend cho biết Paid. Polling chạy ở tab REWEAR ngay sau checkout, dừng theo trạng thái terminal hoặc giới hạn 15 phút; callback `orderCode` PayOS chỉ là fallback, không dùng làm bằng chứng. Chưa kiểm thử response/logic backend live trong workspace. |
| Orders | `GET /api/orders` | Danh sách đơn của customer hiện tại; query `Status` (0–5), `PageSize`, `Page` do người dùng cung cấp. Gọi tại tab Đơn mua/Lịch sử. Response schema chưa có; adapter alias tạm. |
| Orders | `GET /api/orders/{id}` | Chi tiết một đơn của customer hiện tại; endpoint/path id dạng string do người dùng cung cấp. Gọi khi mở Chi tiết đơn hàng; response schema chưa có, các field hiển thị lấy từ alias nhận diện được. |
| Orders | `GET /api/orders/code/{orderCode}` | Chi tiết đơn của customer hiện tại theo mã đơn; endpoint/path parameter do người dùng cung cấp. Gọi trước khi mở chi tiết nếu orderCode có trong danh sách. Response schema chưa có. |
| Brands/Categories | `GET /api/Brands`, `/api/Categories` với tùy chọn `isActive`; `GET /:id`; `POST`; `PUT`; `DELETE`; `PATCH /:id/restore` | Danh sách, form, profile sourcing. Payload create/update là JSON; brand có `logoUrl`, category có `imageUrl`. |
| Admin users | `GET /api/admin/users`, `GET /api/admin/users/:id` | CustomerList/CustomerDetail. |
| Profile | `GET /api/Profile`, `PUT /api/Profile`, `PUT /api/Profile/avatar` | Hồ sơ; update hiện gửi fullName/gender; avatar dùng FormData key `file`. |
| Addresses | `GET /api/Profile/addresses`; `POST`; `PUT /:id`; `DELETE /:id`; `PUT /:id/default` | Tab địa chỉ profile. |
| Sourcing customer | `GET /api/Sourcing/my`, `POST /api/Sourcing` FormData, `GET /api/Sourcing/:id`, `PATCH /:id/accept`, `PATCH /:id/decline` | Tab bán đồ cũ. FormData gồm Title, Description, BrandId, CategoryId, DeclaredCondition, Size, Color, CustomerExpectedPrice, Images. |
| Sourcing admin | `GET /api/Sourcing` với tùy chọn `status`; `GET /:id`; `PATCH /:id/review`, `/offer`, `/reject`, `/received`, `/inspect`; `POST /:id/convert-to-product` | `SourcingRequests`; offer `{offeredPrice,adminNote}`, reject `{rejectReason}`, inspect `{inspectedCondition,adminNote}`, convert `{sellingPrice}`. |

## Shape mà UI đang mong đợi

- Products: `id`, `title|name`, `price`, `description`, `images|imageUrls` (mỗi ảnh là string hoặc `{imageUrl|url}`), `color`, `size`, `brandId|brand`, `categoryId|category`, `condition`, `stockQuantity|quantity`, `status`, `isActive`.
- PDP chỉ hiển thị tên/giá/mô tả/màu/cỡ có trong product DTO; mapper chấp nhận camelCase/PascalCase. Giới tính, cỡ bổ sung, bảng đo, phí giao hàng và thông tin cửa hàng không có trong schema sản phẩm đã biết nên không tự tạo ở thanh thông tin. Giá thiếu/không parse được thì ẩn và khóa thao tác thêm giỏ.
- `usePublicProducts` hiện đọc thêm khóa `originalMaterial` nếu response có, nhưng khóa này không nằm trong schema Swagger PUT do người dùng cung cấp, chưa được xác nhận ở GET và hiện chưa render. Không coi đây là contract đã xác nhận.
- Trạng thái product theo quy ước sản phẩm do người dùng xác nhận cho frontend: `0 = Available` (được bán công khai), `1 = Reserved`, `2 = Sold`. Storefront gửi query `Status=0` và lọc lại response ở client; ý nghĩa enum/khả năng lọc phía server chưa được xác minh độc lập.
- Cart POST nhận `{productId, quantity}` theo schema người dùng cung cấp. UI hiện gửi `quantity: 1`; danh sách và thông tin sản phẩm lấy từ GET `/api/cart` theo mô tả endpoint. Do chưa có mẫu response, các tên field cụ thể và wrapper vẫn là giả định client.
- Checkbox cart dùng field `isSelected` từ GET `/api/cart`; nếu field chưa có trong response, client mặc định dòng được chọn để giữ tương thích với giỏ hiện tại. Response GET và hành vi `onlyAvailable` chưa được xác minh độc lập ngoài schema request người dùng cung cấp.
- `usePublicProducts` biến đổi dữ liệu API thành `{id,name,price,rawPrice,currency,fits,colors,sizes,images,img,...}`. `colors` là mảng object `{id,name,hex,...}`, không phải mảng CSS color string.
- Auth: login có thể trả `{data:{role,token,...}}` hoặc flat object. `extractToken` nhận `token|accessToken|jwt` tại top-level hoặc `data` (trừ `jwt` trong nested data). Role admin được uppercase ở `AuthContext`.
- Profile/sourcing/detail thường chấp nhận object trực tiếp hoặc wrapper `{data: ...}`. Chưa có schema xác nhận, nên tránh viết code dựa vào một shape mới khi chưa kiểm tra response/backend.

## Khi phát triển API tiếp

Xác nhận method, payload, status và response từ backend. Dùng một lớp API client/adapter để normalize response và lỗi, đặt state loading/empty/error sát màn hình, hủy request cũ khi unmount hoặc filter đổi nhanh, tránh refetch toàn catalog cho mỗi PDP. Với mutation, khóa submit khi pending, xác nhận kết quả server rồi cập nhật/invalidate dữ liệu hiển thị. Không tự tạo số liệu demo cho chức năng đã công bố là kết nối API.

## Deploy frontend Render

- `vite.config.js` proxy `/api` và `/uploads` tới `localhost:5000` chỉ hoạt động local. Frontend production dùng `apiUrl()` từ `src/services/auth.js`, đọc `VITE_API_BASE_URL`; đăng nhập admin, `AuthModal` và `authFetch` dùng chung helper này.
- Domain backend production chưa được cung cấp/xác minh. Render frontend cần đặt `VITE_API_BASE_URL` bằng backend origin rồi redeploy; backend source đã allow origin `https://rewear-wyb0.onrender.com` qua CORS, cần deploy thay đổi. Xem `render-deployment.md`.

