# Flow ứng dụng

> **27/10/2026 — chỉ tái chế:** Flow hiện tại chỉ thu mua → kiểm định nguyên liệu/chi trả → dự án tái chế → QC → đăng bán. /products/new chuyển tới /upcycling; preview chỉ là ý tưởng và không mở bán trực tiếp. Những flow hai nhánh hoặc xác nhận tình trạng để nâng tồn bên dưới là lịch sử. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> 25/10/2026: khi backend ghi lịch sử đơn hoặc đổi trạng thái thu mua, notification được lưu cho người liên quan; khách/nhân viên/shipper mở trung tâm thông báo, đọc item rồi đi tới màn nghiệp vụ. Món hợp gu dùng alert đã có và được gộp trong feed Member. Không thay đổi quyết định thanh toán hay giao hàng chỉ vì một item được mở. [Chi tiết](notifications-2026-10-25.md).

> Theo dõi gu đồ 25/10/2026: Member lưu ít nhất một tiêu chí loại/cỡ/màu/giá, bật thông báo tài khoản, có thể chọn thêm email; worker tạo một thông báo cho mỗi món độc bản mới phù hợp sau thời điểm bật. Tắt theo dõi ngừng báo mới; trạng thái hàng phải kiểm tra lại khi mở thông báo. [Chi tiết](style-watch-implementation-2026-10-25.md).

> Cập nhật 25/10/2026: tạo/sửa sản phẩm phải gửi tình trạng hợp lệ; Admin mở bán preview bằng chọn tình trạng, hệ thống đặt một món. Sản phẩm đã phân bổ vào đơn đang hiệu lực không thể bị ẩn. Đơn mua của Member đọc enum thanh toán dạng số/chuỗi và lọc đơn đang giao theo trạng thái đơn. Xem [rà soát nghiệp vụ](business-flow-audit-2026-10-25.md).

## Đăng bán một món độc bản — 25/10/2026

Admin mở preview, đối chiếu món đồ hiện có và thông tin/giá, chọn tình trạng thực tế rồi bấm Đăng bán 1 món. Frontend lưu thông tin sản phẩm sau đó gọi JSON `{condition}`; backend ghi người/thời gian xác nhận và tự chuyển preview tồn 0 thành sản phẩm độc bản tồn 1. Không yêu cầu ảnh trước/sau cho Upcycled, không thay ảnh đang lưu, không tự sinh sourcing/project/QC. Hàng mới tạo qua Products cũng mặc định độc bản tồn 1. Sáu preview hiện chưa được xác nhận; các flow yêu cầu nhập tồn/ảnh dưới đây là lịch sử trước thay đổi.

## Xác nhận hàng đề xuất thành hàng bán — 25/10/2026

Admin mở Sản phẩm → chỉnh sửa preview → xác nhận thông tin/giá → nhập số món đã kiểm (độc bản đúng 1), chọn tình trạng thực, ghi tham chiếu kiểm định → tải ảnh hiện vật; Upcycled thêm ảnh trước khi làm lại → xác nhận mở bán. Backend thay ảnh đề xuất, lưu người/thời gian/tham chiếu, chuyển IsPreview=false; storefront/giỏ có thể mua nếu Available và còn tồn. Lưu thông tin preview riêng vẫn giữ tồn 0/chặn mua. Hàng đang bán sửa tồn qua form khi không có phân bổ đơn. Luồng xác nhận trực tiếp không tự sinh lịch sử sourcing/project/QC.

## Thu mua → kiểm định → mở bán — 25/10/2026

Khách gửi ảnh/tình trạng/giá → nhân viên báo giá → khách đồng ý → shipper lấy hàng nếu được phân công → nhân viên kho xác nhận nhận đồ → kiểm định tình trạng và giá → khách đồng ý lại nếu giá/kết quả đổi → cửa hàng ghi nhận chi trả thủ công có chứng từ. Bán lại phải QC hiện vật đạt kèm ảnh sau xử lý; Upcycling phải có ảnh thành phẩm và QC dự án đạt. Hai nhánh xuất bản tạo sản phẩm riêng. `PickedUp` không tự thành `Received`; QC không đạt không được mở bán. [Điều kiện và giới hạn](inspection-flow-audit-2026-10-25.md).

## Xem ảnh nhiều góc — 25/10/2026

Mở chi tiết một trong sáu sản phẩm mới → gallery tự chuyển qua bốn ảnh khác nhau → phần detail mặc định cận cảnh, chọn Mặt trước/Mặt sau/Góc nghiêng/Cận cảnh để đổi đúng ảnh. Có phóng to/Escape; upcycling vẫn có ảnh nguyên liệu ở journey. Sản phẩm vẫn là preview chưa nhận đơn. [Bằng chứng](catalog-gallery-2026-10-25.md).

## Duyệt bộ sản phẩm đề xuất — 25/10/2026

**Cập nhật sau yêu cầu thay dữ liệu:** đã đưa bản sao sáu đề xuất vào database nguồn API thật và ẩn 12 mục cũ. Khách xem bộ mới tại Home/Mới về/Nam/Nữ, mở chi tiết và ảnh trước/sau cho Upcycled; SecondHand chỉ ảnh hiện tại. Hàng chờ xác nhận hiện “Sắp mở bán”, không nhận đơn. Trang quản trị `/products/drafts` vẫn là bộ đề xuất tĩnh. [Bằng chứng](catalog-replacement-2026-10-25.md).

Admin/Staff: Sản phẩm → Bộ sản phẩm đề xuất → lọc/tìm món → mở chi tiết → xem/tải ảnh trước-sau (Upcycled) hoặc ảnh hiện tại (SecondHand), tải JSON. Đây là dữ liệu tĩnh đề xuất được người dùng yêu cầu soạn trước; không tạo stock, QC hay đơn. Bước mở bán cần đối chiếu hiện vật và thực hiện đúng quy trình vận hành thật. [Chi tiết](catalog-drafts-2026-10-25.md).

## Giao hàng local đã nối — 25/10/2026

Admin/Staff phân công đơn Paid tại Vận chuyển. Shipper đăng nhập vào cùng UI quản lý Admin, chỉ có Đơn giao của tôi → mở vận chuyển → Đã lấy hàng → Đang giao có mã vận đơn → Đã giao hoặc thất bại có lý do. Admin xử lý giao lại/nhận hàng hoàn tại chi tiết đơn sẵn có. Backend kiểm tra assignment/thứ tự, ghi lịch sử và không trừ tồn lần hai.

Member vào **Tài khoản → Đơn mua → Theo dõi đơn hàng** ngay trong thẻ, thấy thanh toán, Shipper và timeline thật; không còn Lịch sử mua hàng trùng danh sách. Chi tiết mở cập nhật 20 giây khi tab hiển thị. [Bằng chứng local và phần chưa nghiệm thu](shipping-acceptance-2026-10-25.md). Các flow/enum/mock cũ bên dưới là snapshot khi khác phần này.

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

## Mua sắm công khai

**Đối chiếu 2026-10-24:** xem `business-overview-2026-10-24.md`. Source backend đã có tại `Rewear_BackEnd/`; payment hiện commit **Sold ngay khi Paid**, rồi chuyển order Confirmed. Backend có webhook/reconcile, hủy/refund, reship/cancel-permanent nhưng FE chưa nối toàn bộ. Không xem API call là bằng chứng end-to-end; các nhận định backend ngoài workspace/enum chưa rõ trong snapshot cũ bên dưới được thay bằng đính chính này khi có xung đột.

`/` → Home card hoặc `/new-in|women|men` → `/product/:id`. Nhóm trang storefront bọc chung `CartProvider`; nút giỏ trên Home, About, listing, World và PDP mở cùng `CartDrawer`, badge đọc `GET /api/cart/count` và đồng bộ sau các mutation ảnh hưởng số lượng; nếu endpoint lỗi, dùng tổng quantity từ GET `/api/cart`. Danh sách sản phẩm vẫn lấy từ `GET /api/cart`. Danh sách storefront hiện GET `/api/Products?IsActive=true&Status=0`, rồi lọc client-side để storefront chỉ nhận status `0` (Available). Status `1` là Reserved và `2` là Sold theo quy ước người dùng; enum backend chưa được xác minh trong repo. PDP tìm item từ **toàn bộ list** chứ chưa GET chi tiết theo id; thanh thông tin chỉ hiện title/price/description/color/size có thật trong DTO, không tự tạo fit Nam/Nữ, cỡ M/S/L, size guide, phí ship hay thông tin cửa hàng. Nút thêm giỏ gửi `POST /api/cart` với `{productId, quantity: 1}`; sau phản hồi thành công mới báo thành công và tải lại giỏ. GET `/api/cart` được mô tả trả giỏ kèm thông tin sản phẩm đầy đủ; UI chuẩn hóa dữ liệu, lấy fallback giá từ catalog và khi cần `GET /api/Products/{id}`. Nếu giá vẫn thiếu/0, hiển thị “Chưa cập nhật giá” thay vì 0 đ và khóa checkout; tổng chỉ hiển thị khi mọi dòng được chọn đều có giá. Checkbox từng dòng gửi `PUT /api/cart/items/{itemId}/select` với `{isSelected}`; checkbox chọn tất cả gửi `PUT /api/cart/items/select-all` với `{isSelected, onlyAvailable}` rồi đồng bộ lựa chọn từ GET `/api/cart`. Nút tăng/giảm gửi `PUT /api/cart/items/{itemId}` với `{quantity}`; state và tạm tính chỉ đổi sau phản hồi thành công, số lượng tối thiểu là 1. Nút xóa toàn bộ gửi `DELETE /api/cart` sau bước xác nhận; nút xóa một dòng cũng yêu cầu xác nhận trước khi gửi `DELETE /api/cart/items/{itemId}`. Hủy xác nhận không gọi API; thao tác chỉ cập nhật giao diện sau phản hồi thành công. Cấu trúc field cụ thể của GET response chưa được cung cấp. Checkout từ các dòng được chọn mở `/checkout`, tải sổ địa chỉ qua `GET /api/Profile/addresses`, rồi gửi `POST /api/orders/checkout` với `{shippingAddressId, shippingMethod: 0, note}` theo schema người dùng cung cấp. Frontend trước kiểm tra response checkout xem backend đã trả `checkoutUrl` PayOS chưa; nếu có thì dùng luôn vì checkout được mô tả tự tạo session. Chỉ khi checkout không có URL mới đọc orderId và gọi `POST /api/payments/{orderId}/session`; chỉ điều hướng khi nhận URL HTTPS PayOS hợp lệ. Nếu tạo session thất bại, cho thử lại trên cùng orderId để tránh tạo đơn trùng. Người dùng mô tả phiên/giữ hàng có thời hạn 15 phút; response thực tế chưa xác minh. Sau checkout, frontend giữ `data.order.id`, mở PayOS ở tab riêng và đi tới trang chờ để polling `GET /api/payments/{orderId}/status`; chỉ response backend Paid mới hiển thị thành công. Backend checkout hiện trả 409 nếu không tạo được link PayOS, hủy đơn/trả tồn kho nhưng đã xóa dòng giỏ; xem `payment-checkout-audit.md`. Catalog đã có tìm kiếm không dấu theo tên/màu/cỡ, sắp xếp tên/giá, lọc màu/cỡ, chip reset và xem thêm 12 mục trong tập đã tải; không thay query/status lọc bán hàng. About có mục lục, bước hành trình tương tác, FAQ và link đến catalog/tài khoản. Search Home và một số CTA editorial khác vẫn chưa hoàn thiện.

Trên PDP, sau khi hero/gallery cuộn khỏi khung nhìn, thanh mua nhanh xuất hiện cố định ở cuối màn hình; navbar vẫn ở đầu trang. Mô tả và gợi ý sản phẩm là liên kết cuộn trong trang; CTA thêm giỏ gọi lại cùng handler `CartContext`, tôn trọng trạng thái đang gửi, thành công và giá thiếu. Thanh ẩn khi mở drawer giỏ hoặc lightbox.

Ngay sau checkout, tab REWEAR lưu `data.order.id`, mở PayOS ở tab riêng và chuyển nội bộ đến `/payment/waiting?orderId=...`; polling `GET /api/payments/{orderId}/status` mỗi 3 giây tối đa 15 phút, kiểm tra thêm khi tab được focus lại. Backend được guide mô tả sẽ hỏi PayOS nếu Pending, cập nhật payment `0 → 2`, order và product `Reserved → Sold` khi Paid; hành vi live chưa kiểm chứng trong workspace. Frontend nhận `isPaid: true`, `paymentStatus: "Paid"` hoặc số `2` mới báo thành công và về `/`; Failed/Expired/Refunded/Cancelled dừng với trạng thái riêng. Trường hợp popup bị chặn có link mở PayOS. Callback PayOS có `orderCode` dạng số có thể không trùng mã đơn REWEAR, nên orderId từ checkout là nguồn để gọi status; query callback không xác nhận payment.

## Tài khoản khách hàng

Nav/account mở `AuthModal`: register → verify OTP → login, hoặc forgot password → reset password. Session dùng chung `auth_session` với admin. `/profile` có 5 tab qua query string: hồ sơ/ảnh đại diện (API), sổ địa chỉ (API), đơn mua/lịch sử (`GET /api/orders`) và bán đồ cũ (API). Đơn mua hỗ trợ lọc `Status` 0–5, phân trang và tìm kiếm trong trang hiện tại; mapping do người dùng cung cấp: 0 Chờ thanh toán, 1 Đã xác nhận, 2 Đang giao, 3 Đã giao, 4 Đã hủy, 5 Hết hạn thanh toán. Nút Chi tiết tải `GET /api/orders/{id}` và hiện các field nhận diện được từ response; cả request đều có loading/lỗi/thử lại. Không có thao tác hủy giả lập. Response schema vẫn chưa xác nhận. Lịch sử đọc tối đa 50 đơn/request; chưa lọc riêng đơn hoàn tất vì endpoint hiện chỉ được cung cấp bộ lọc status chung. Tab hồ sơ có trạng thái tải/lỗi/thử lại; chỉ họ tên và giới tính được sửa qua `PUT /api/Profile`, hủy thì trở về giá trị đã tải/lưu; avatar tải lên qua endpoint riêng. Sổ địa chỉ có thêm/sửa/xóa/đặt mặc định, tải/lỗi/thử lại. Tab sourcing: lấy brand/category → gửi FormData kèm 1–5 ảnh → `/api/Sourcing/my` → xem detail → accept/decline offer; list có tải/lỗi/thử lại. Màn profile redirect home khi không có session.

Khi lấy chi tiết, nút ưu tiên `GET /api/orders/code/{orderCode}` nếu response danh sách có mã đơn; nếu không có thì gọi `GET /api/orders/{id}`. Field chi tiết tùy response backend và chỉ hiển thị khi nhận diện được.

## Admin/staff

`/login` → role từ response, ADMIN vào `/dashboard`, STAFF vào `/collections`; sidebar hiển thị mục theo role. `ProtectedRoute` bảo vệ chung. Dashboard dùng mock nên KPI chưa phản ánh sản phẩm/sourcing API. Product flow thực: list/filter → detail hoặc create/edit → publish/unpublish, soft delete/restore; categories/brands có CRUD API. Customer list/detail lấy API.

## Nguồn hàng và vòng đời sản phẩm

Luồng API hiện có: khách gửi yêu cầu bán đồ cũ từ profile → staff/admin xem `SourcingRequests` → review → offer hoặc reject → khách accept/decline giá → received → inspect. Tại bước kiểm định, nhân viên chọn định hướng xử lý: Resale (Bán lại Second-hand) hoặc Upcycling (Chuyển sang xưởng tái chế). Sau khi chi trả (Payout), giao diện cung cấp hai nhánh hành động:
- **Resale**: Nhập giá bán niêm yết và xuất bản sản phẩm second-hand trực tiếp lên sàn (`convert-to-product`).
- **Upcycling**: Điều hướng sang phân hệ tái chế (`/upcycling?inventory=...`), tự động khởi tạo dự án tái chế từ nguyên liệu đã duyệt để qua các chặng thi công xưởng → kiểm định chất lượng (QC) → xuất bản sản phẩm thời trang tuần hoàn độc bản.

Trạng thái trong màn Sourcing có map 0 Pending, 1 UnderReview, 2 Priced, 3 Accepted, 4 Received, 5 Approved, 6 Rejected, 7 Declined, 8 Completed. Phân hệ Upcycling (`OperationsPage`) quản lý các giai đoạn `Pending → InProgress → QualityCheck → QCApproved → Completed`. Các màn cũ như `/collections/inspection` bằng mockData vẫn tồn tại độc lập. Tương tự Orders/Promotions/Settings chưa nối backend.

## Định hướng chưa triển khai

Định hướng shipper/giao hàng và trách nhiệm backend payOS được ghi tại `future-plan-delivery-payment.md`. Frontend đã có client checkout/payment-status như mô tả phía trên; repo không chứa triển khai backend hoặc webhook. Từ 2026-10-18, frontend có route `/shipper/orders` và thao tác `PUT /api/shipping/{orderId}/status` theo Swagger người dùng cung cấp; quyền/response server chưa kiểm chứng live.

Checkout tải `GET /api/shipping/rates`, hiển thị Standard/Express với phí vận chuyển 0 ₫ và gửi method đã chọn khi tạo order; lỗi rates cho thử lại và khóa tạo đơn. Customer mở chi tiết Đơn mua sẽ gọi `GET /api/shipping/{orderId}`, 404 nghĩa là chưa có shipping. Admin/Staff vào `/shipping` xem queue, nhập shipper ID rồi POST tạo shipping; ADMIN còn xem all. Shipper đăng nhập bằng role SHIPPER và vào `/shipper/orders` để xem my-orders, lọc status, đọc chi tiết và PUT cập nhật status/note/tracking/attemptCount. Sau mutation frontend tải lại server. Trang `/orders` admin vẫn mock, không đại diện dữ liệu shipping thật.
