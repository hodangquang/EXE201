# Khoảng trống và việc cần xác minh

> **27/10/2026 — chỉ tái chế:** Nhánh bán lại và đường tạo/mở preview trực tiếp đã khóa trong source. Chưa deploy hoặc migrate database live; hàng Upcycled đã có chưa được kiểm toán nguồn gốc lại. Không tự đổi loại SecondHand thành Upcycled hoặc xóa lịch sử. Các giới hạn luồng mở preview rút gọn bên dưới chỉ còn là lịch sử. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> Cập nhật thông báo 25/10/2026: source local nay có trung tâm thông báo chung cho đơn, giao hàng, thu mua và món hợp gu; Admin/Staff/Shipper có màn riêng. Ghi chú cũ bên dưới nói “chỉ có gu đồ” là snapshot trước triển khai. Chưa backfill lịch sử, chưa push/email tổng quát, chỉ đếm 50 item mới nhất; chưa nghiệm thu deploy. [Chi tiết](notifications-2026-10-25.md).

> Rà thông báo 25/10/2026: source local hiện chỉ có thông báo **món mới hợp gu** cho Member (`StyleMatchNotifications`, tab Profile và badge avatar). Chưa có hộp thư thông báo chung cho đơn hàng, thu mua, giao hàng hoặc Admin; chuông thông báo mock ở Header quản trị đã bỏ. Email OTP là luồng xác thực, email gu đồ cần opt-in và chưa nghiệm thu SMTP/deploy.

> Theo dõi gu đồ nay đã có ở source/API local (25/10/2026), ghi chú trước đó nói chưa có saved search/thông báo là snapshot. Còn mở: chưa kiểm tra browser với Member thật, SMTP email và SiteBaseUrl trên deploy; scan 60 giây có thể bỏ qua món đã bán trước khi quét; feed chỉ hiển thị 50 thông báo mới nhất. [Báo cáo](style-watch-implementation-2026-10-25.md).

> Phát hiện khi đánh giá tính năng 25/10/2026: trang hành trình hiện có ảnh và mốc từ backend nhưng chưa có số đo thật hay bản đồ vị trí lỗi; source chưa có saved search/thông báo thật hoặc luồng gửi lại chính món đã mua. Đây là cơ hội phát triển, không phải chức năng hiện có. Xem [đánh giá](feature-opportunities-2026-10-25.md).

> Hiện trạng sau rà soát 25/10/2026: API local có 1 túi tote mở bán/tồn 1 và 5 preview/tồn 0; cả 6 vẫn ghi nguồn ảnh `ai-generated`. Cần kiểm tra hiện vật, ảnh, giá và khả năng giao của món đang bán. PayOS merchant, deploy, giao vận/hoàn tiền thật chưa nghiệm thu. Các đoạn dưới đây gồm snapshot cũ (đặc biệt câu “6 preview”); ưu tiên [báo cáo mới](business-flow-audit-2026-10-25.md).

## Bản lưu ý tưởng tĩnh — 25/10/2026

`/products/drafts` không đồng bộ với API và có thể giữ giá/cỡ/ảnh lúc soạn khác bản sản phẩm đang bán. UI nay ghi rõ vai trò lưu trữ và dẫn về Danh sách sản phẩm; không dùng JSON tải từ trang này để suy trạng thái bán hiện tại. Chưa bỏ route hoặc tệp bản lưu vì vẫn hữu ích để đối chiếu ý tưởng gốc.

## Giới hạn quy trình độc bản rút gọn — 25/10/2026

Bước mở bán preview nay chỉ cần Admin chọn tình trạng, không bắt buộc tải ảnh thật hoặc ảnh trước/sau upcycling. Backend đặt tồn 1/độc bản và lưu người/thời gian xác nhận, nhưng không thể chứng minh hiện vật hay tình trạng chỉ qua thao tác này. Sáu bản ghi vẫn là preview/tồn 0; ảnh đang lưu thuộc nguồn đề xuất và được giữ nếu Admin mở bán, metadata nguồn ảnh không bị đổi. Cần Admin đối chiếu hàng, giá, ảnh và khả năng giao trước khi nhận đơn. Không tự động nâng tồn hoặc bỏ preview. Các mục về nhập tồn và ảnh bắt buộc bên dưới là snapshot cũ.

## Xác nhận tồn và hàng đề xuất — 25/10/2026

Đã có UI/Admin API nhập tồn hàng đang bán và mở preview sau xác nhận thủ công kèm ảnh hiện vật/biên bản. Sáu đề xuất chưa được xác nhận, vẫn tồn 0 và không mua được; không tự nâng tồn bằng ảnh đề xuất. Endpoint trực tiếp không liên kết bản ghi sourcing, kho hay dự án upcycling, nên timeline nguồn gốc vẫn không hoàn chỉnh (`isComplete=false`) dù có ảnh trước/sau. Cần đối chiếu hiện vật/giá/cỡ, biên bản và deploy trước khi nhận đơn thật. Chưa có luồng bổ sung tồn cho hàng Sold hoặc đã có phân bổ đơn; cần nghiệp vụ nhập lô mới.

## Luồng kiểm định còn cần nghiệm thu thực tế — 25/10/2026

Source local đã chặn bán lại trước QC có ảnh và tách shipper lấy hàng khỏi nhận kho. Vẫn cần kiểm tra hiện vật/ảnh/chứng từ bởi nhân viên; URL ảnh chưa chứng minh đúng món đồ. Hàng QC không đạt sau khi đã chi trả chỉ có `Rework`, chưa có quyết định kết thúc/chuyển mục đích được chốt. Chưa có ghi chú giải thích công khai riêng cho khách khi kết quả kiểm định làm thay đổi báo giá. Sourcing/pickup chưa có version guard cho ghi đồng thời. Sản phẩm được xuất bản trước guard mới chưa được kiểm toán lại; bản deploy/live chưa xác minh. Xem [báo cáo kiểm định](inspection-flow-audit-2026-10-25.md).

## Vị trí chỉnh tồn kho — rà source 25/10/2026

Giao diện hiện **chưa có ô tăng/chỉnh tồn** tại ProductForm hoặc trang Kho vòng đời. ProductForm chỉ đọc `stockQuantity` vào `existingStock` rồi gửi lại số đó trong PUT; không có Form.Item/InputNumber cho stock. API PUT có StockQuantity nhưng không có thao tác UI để nhập. Với sáu preview, tăng stock đơn thuần cũng không bỏ chặn IsPreview ở cart/checkout/reservation. Còn thiếu UI chỉnh tồn có kiểm soát và quy trình mở bán preview; chưa triển khai trong task giải thích vị trí này.

## Nhãn ảnh sau chỉnh nội dung — 25/10/2026

Đã bỏ nhãn/câu ảnh AI trên giao diện theo yêu cầu người dùng. Ảnh vẫn có nguồn AI trong metadata và tài liệu; việc bỏ nhãn không xác nhận đây là ảnh hiện vật hoặc hàng đã QC. Bộ sản phẩm tiếp tục preview, bốn góc và chặn mua giữ nguyên. Thay đổi chỉ phần hiển thị, không ghi lại API/database; bộ fixture bản nháp đã chỉnh assertion nhãn nhưng chưa chạy lại đầy đủ.

## Gallery nhiều góc — 25/10/2026

Đã khắc phục gallery sáu sản phẩm mới chỉ có một ảnh: hiện bốn URL/nội dung riêng mỗi món, detail cận cảnh và chọn đủ bốn góc; 168 kiểm tra qua API thật đạt. Ảnh vẫn là AI/preview. Nguồn PNG tăng lên 68,9 MB; cần responsive derivatives nếu triển khai rộng, storefront hiện dùng CDN tự tối ưu. Chưa deploy hosting/QA browser khác. [Chi tiết](catalog-gallery-2026-10-25.md).

## Bộ sản phẩm đề xuất — 25/10/2026

**Đính chính sau thay catalog:** đã ghi Mongo nguồn API và upload Cloudinary thật, ẩn 12 sản phẩm cũ; storefront nhận 6 preview mới. Hook đã bỏ fallback ảnh Unsplash. Các ghi chú chưa ghi DB/Cloudinary bên dưới mô tả task soạn trước đó. Còn mở: xác nhận hàng thật/tồn và quy trình mở bán, deploy hosting, thiết bị/browser khác. [Bằng chứng](catalog-replacement-2026-10-25.md).

Đã soạn sáu bản nháp với tám ảnh AI tại `/products/drafts` theo lựa chọn của người dùng. Chưa có hàng/tồn/tình trạng thực tế được xác nhận, chưa ghi MongoDB, upload Cloudinary hoặc deploy; không đưa bản nháp vào cart/checkout. Ảnh PNG cần tối ưu trước khi dùng storefront. Hook bán hàng hiện vẫn dùng ảnh Unsplash khi thiếu ảnh API; bộ đề xuất không thay thế fallback đó. [Chi tiết và QA](catalog-drafts-2026-10-25.md).

## Shipping/Profile local — 25/10/2026

Đã bỏ Lịch sử trùng Đơn mua, thêm tracking ngay trong thẻ, dùng lại UI Admin cho Shipper và kiểm tra assignment/pickup/history phía server. [Kết quả hiện tại](shipping-acceptance-2026-10-25.md) thay thế các ghi chú cũ liên quan bên dưới.

Còn mở: deploy API/frontend đồng bộ, migration database thật, merchant payOS/Cloudinary/SMTP live, legacy data đại diện và Final Audit rộng hơn. Browser dùng API/Mongo local, gateway test double. Build còn cảnh báo bundle lớn, lint chưa có cấu hình ESLint. Không kết luận API deploy đã có tracking mới.

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

Danh sách này là phát hiện từ frontend tại 2026-10-06, không phải lỗi backend đã xác nhận. Cập nhật hoặc xóa mục khi mã thay đổi.

## Dữ liệu và flow

### Đối chiếu FE/BE ngày 2026-10-24

Source backend hiện có tại `Rewear_BackEnd/`; các nhận định cũ không có backend/enum chưa rõ bên dưới là lịch sử. Xem `business-overview-2026-10-24.md`. Chỉ review source, chưa kiểm chứng build/backend/live:

- Snapshot cũ báo Profile map sai sourcing 6/7/8; source ProfilePage hiện đã map đúng. Chưa kiểm tra lại nhãn ở SourcingRequests admin trong lượt này. Payment enum Paid=1/Failed=2 khác numeric fallback FE (status endpoint source trả chuỗi/isPaid); order Failed=6 là nhận định snapshot cũ, cần đối chiếu lại code hiện hành trước khi xử lý.
- Payment đã chốt Sold ngay khi Paid, nhưng release chỉ nhận Available/Reserved; refund không tự phục hồi sản phẩm Sold. Cần thống nhất multi-quantity/1-of-1, rollback và idempotency liên tài liệu.
- Product PUT backend multipart, FE JSON. Staff có UI shipping nhưng policy my-orders/status backend không bao gồm Staff. Checkout DTO có ShippingMethod nhưng BuildOrder chưa lưu lựa chọn; tạo shipping nhận method riêng.
- Backend có webhook/reconcile và admin reship/cancel-permanent; FE chưa nối đầy đủ. Cancel-permanent không hoàn tiền/trả kho trong code; không coi là chính sách đã duyệt. Sourcing có bản ghi chi trả thủ công PurchasePayout, chưa tích hợp chuyển khoản tự động.
- `AuthService.RegisterAsync` nhận role từ request; product write action chưa gắn Authorize; shipping status kiểm assignment/enum nhưng chưa guard đầy đủ thứ tự. Chưa thử khai thác/gọi API không quyền.
- Dashboard, đơn quản trị, thu gom/kiểm định cũ, upcycling/QC, kho, khuyến mãi và cài đặt vẫn mock/local; API call không chứng minh end-to-end.

- **About sau chỉnh UI 2026-10-24:** đã bỏ các section/hiệu ứng riêng gây lệch storefront và dọn CSS cũ; bốn bước/FAQ/anchor/giỏ được QA trên Chromium 320–1440px, không xác nhận backend. Newsletter/link placeholder của footer chung vẫn giữ hành vi demo sẵn có. Chưa QA Safari/Firefox, thiết bị thật hoặc toàn bộ screen reader/contrast; các vấn đề Catalog/PDP/Profile trong audit vẫn còn.

- **Audit UI 2026-10-24:** `usePublicProducts` hiện thay ảnh API thiếu bằng Unsplash theo từ khóa; listing/PDP không ghi nhãn minh họa. Vì vậy phát biểu “không thay ảnh bán hàng bằng ảnh stock” ở ghi chép ngày 18 bên dưới không còn phản ánh mã hiện tại sau cập nhật ngày 23. Cần dùng placeholder hoặc nhãn minh họa rõ ràng; chưa thay mã trong task audit. Hook còn không trả error riêng, GlobalLoader che toàn trang tối thiểu 2,5 giây. Xem `ui-audit-2026-10-24.md`.
- **UI còn mở, đã kiểm tra bằng fixture:** lưới catalog nằm sâu dưới banner; chọn 8 cột mobile vẫn hiển thị 2 cột; PDP lặp ảnh khi chỉ có một ảnh; Profile/Checkout lệch radius/mật độ; CTA “Quay lại cửa hàng” ở checkout empty chưa dùng style nút chung. Đề xuất cải thiện chưa triển khai, không phải lỗi backend đã xác nhận.

- Cập nhật UI 2026-10-18: ảnh banner/cảm hứng Mới về/Nam/Nữ đã tách thành ba bộ, nhưng sản phẩm thật vẫn lấy cùng nguồn API và chưa có phân loại giới tính trong adapter. Vì vậy ảnh/sản phẩm trong lưới có thể vẫn giống nhau giữa ba trang; không thay ảnh bán hàng bằng ảnh stock. Footer dùng mẫu Home, còn link `#` và nút newsletter thông báo tính năng đang hoàn thiện. Chưa có chức năng đăng ký nhận tin thật. Bộ ảnh local mới chưa có biến thể responsive/WebP/AVIF; xác minh UI bằng Chromium với fixture, chưa xác minh dữ liệu/backend live.

0. Store locator ở `/world` hiện hiển thị địa chỉ 124 Đường 160, Tăng Nhơn Phú A, TP. Thủ Đức theo người dùng cung cấp. Tọa độ nhúng là tâm khu vực phường, chưa phải geocode chính xác số nhà; liên kết Google Maps mở truy vấn theo địa chỉ. Chưa có store directory API/geocoding trong app; map tiles tải từ ArcGIS bên ngoài và cần mạng.

1. Product hook gọi list trên mỗi mount, không GET detail; deep link sản phẩm phụ thuộc danh sách. PDP chỉ render `description` từ API; adapter cũng giữ màu/cỡ và đọc tùy chọn `originalMaterial` nhưng mục này chưa có trong schema xác nhận và chưa hiển thị. `brandId/categoryId`, `condition`, `stockQuantity` có trong schema PUT do người dùng cung cấp nhưng hiện không được adapter PDP đưa ra; cần map tên/enum rõ trước khi hiển thị. SKU, cấu tạo/chất liệu đầy đủ, thông số, hướng dẫn bảo quản, đổi trả/vận chuyển và size chart chưa có trong contract hiện biết. Không có cache/abort. Public hook qua `authFetch`, nên HTTP 401 từ một request public có thể clear session.
   Storefront hiện lọc `IsActive=true` và status `0` (Available); `1` Reserved, `2` Sold theo quy ước người dùng. Query/status mutation chưa được đối chiếu backend vì repo không chứa server/OpenAPI.
2. `colors` object từ hook: listing đã dùng hex, Home còn cách tô cũ và được giữ nguyên theo phạm vi. Catalog đã có tìm kiếm/sort/lọc màu-cỡ/xem thêm cục bộ trên tập đã tải; Women/Men chưa filter giới tính và đã ghi rõ trên UI. Hook chưa trả error nên empty và lỗi request dùng chung fallback; chưa có pagination server. Cart drawer và số lượng được chia sẻ trên các route storefront; PDP thêm sản phẩm qua POST `/api/cart`, tải danh sách từ GET `/api/cart`, badge lấy count qua GET `/api/cart/count`, cập nhật số lượng qua PUT `/api/cart/items/{itemId}`, chọn/bỏ chọn dòng và chọn tất cả qua hai PUT selection endpoint, xóa toàn bộ qua DELETE `/api/cart` và xóa từng dòng qua DELETE `/api/cart/items/{itemId}` (cả hai thao tác xóa đều có xác nhận). Response GET thật chưa có mẫu để đối chiếu; client đang mong field `isSelected` để hiển thị selection đã lưu và mặc định selected nếu field thiếu. Mapper count hỗ trợ scalar hoặc một số tên field phổ biến, nếu không thì badge fallback từ GET cart; contract response vẫn cần đối chiếu backend. Các mutation theo dòng cần GET response có mã (`itemId`, `cartItemId` hoặc `id`); API thật chưa được thử từ workspace. Checkout ưu tiên checkoutUrl từ POST order vì backend tự tạo phiên; mã backend xác nhận response thành công có `data: {order, payment}`. Lỗi toast hiện tại phát sinh ngay trong POST checkout khi PayOS link thất bại; xem `payment-checkout-audit.md`. Tab REWEAR nay poll `GET /api/payments/{orderId}/status` ngay sau checkout mỗi 3 giây, hiểu status chuỗi/số/object; theo guide người dùng cung cấp, khi Pending backend tra PayOS và đồng bộ DB. Callback không cập nhật sản phẩm; ProductList chỉ có thao tác Available ↔ Reserved. Người dùng báo đã thanh toán thành công nhưng món vẫn chưa ở trạng thái Sold; chưa thể kết luận nguyên nhân backend vì backend không nằm trong workspace. Cần xác minh status handler khi chốt `PAID` có chuyển các product trong order sang Sold (status 2) và cập nhật tồn kho nguyên tử hay không. Response live và `GET /api/orders/code/{orderCode}` chưa được kiểm thử end-to-end. Render Static Site cần rewrite SPA `/*` → `/index.html`, chưa xác minh rule live. Audit cũ ghi upstream chưa tạo link, nhưng người dùng nay báo đã thanh toán; cần kiểm tra status response live để biết DB đã chốt chưa.
2.2. Backend checkout xóa các dòng đã chọn khỏi giỏ trước khi gọi PayOS; nếu tạo link thất bại, backend hủy đơn/trả tồn kho nhưng không khôi phục dòng giỏ. Cấu hình PayOS Development đang để trống các khóa và REST request không khớp tài liệu payOS hiện hành. Xem `payment-checkout-audit.md`; sửa ở backend ngoài workspace frontend này.
2.3. `FE_INTEGRATION_GUIDE.md` cho thấy flow cũ của frontend rời cùng tab sang PayOS nên không gọi `/status` khi khách thanh toán; route callback trước còn phải suy orderId từ PayOS orderCode, có thể khác mã đơn REWEAR. Frontend nay mở PayOS ở tab riêng, giữ orderId từ checkout và poll ngay trong tab REWEAR; hiểu `paymentStatus` số `2`/chuỗi `Paid`/`isPaid`. Chưa có transaction live hoặc Network log để xác nhận bundle production đã deploy và backend status handler thực sự chuyển product `1 Reserved → 2 Sold`. Browser có thể giảm tần suất timer ở tab nền; trang kiểm tra ngay khi tab được focus lại. Nếu khách đóng cả tab REWEAR, thiết kế không webhook có thể chậm đồng bộ cho đến khi có lần gọi status sau.
2.1. Cart API có thể thiếu giá hoặc ảnh; CartContext thử lấy cả hai từ `GET /api/Products/{id}`. Backend response chưa kiểm thử; nếu server/catalog đều không có ảnh, UI dùng placeholder, còn thiếu giá thì hiện trạng thái chưa cập nhật và khóa checkout thay vì hiển thị 0 đ.
3. Profile Đơn mua/Lịch sử gọi `GET /api/orders`; chi tiết ưu tiên `GET /api/orders/code/{orderCode}` hoặc dùng `GET /api/orders/{id}` khi danh sách thiếu mã. Người dùng đã cung cấp mapping order status 0–5. Response schema còn thiếu nên adapter alias cần đối chiếu backend; Lịch sử chỉ tải tối đa 50 bản ghi/request và chưa lọc riêng đơn hoàn tất. Chưa có API hủy đơn được cung cấp. Admin orders (`mockOrders`) và các module dashboard/collections cũ/inspection/upcycling/inventory/promotions/staff/settings vẫn chủ yếu mock/local; reload mất thay đổi. `ReportsPage` và `StaffList` chưa gắn route.
   Form hồ sơ hiện chỉ gửi `fullName` và `gender`; email, số điện thoại, ngày sinh là dữ liệu hiển thị, chưa có flow sửa tại đây. Ảnh đại diện dùng endpoint riêng.
4. ProductForm create dùng FormData có Images; edit gửi JSON theo schema Swagger `PUT /api/Products/{id}` đã được người dùng cung cấp, giữ nguyên `imageUrls` tải từ sản phẩm. UI chỉnh/thêm/xóa URL ảnh đang tạm ẩn theo yêu cầu. Upload file mới khi edit chưa hỗ trợ. Create chưa append StockQuantity, dù edit có; schema POST chưa được xác nhận.
5. Các page API normalize response riêng lẻ và giả định `res.data || res`; chưa có schema/type, pagination, cache hay invalidation thống nhất. `AuthModal`/admin login gọi `fetch` trực tiếp, xử lý lỗi và loading không đồng nhất `authFetch`.

## Điều hướng, UX và kỹ thuật

- Shipping đã có client/màn hình từ Swagger người dùng cung cấp nhưng chưa có mẫu `data` thực tế hoặc backend live để xác nhận parser, enum 0–4, quyền shipper được phân công, bước status hợp lệ, timeline và điều kiện PAID khi tạo. `GET rates` dùng fallback Standard/Express khi response 200 có shape lạ vì hai method và phí 0 đã được mô tả. `PUT /api/shipping/{orderId}` trong ảnh chưa có body nên chưa tích hợp. Admin order pages vẫn mock riêng và chưa nối với shipping thật; không dùng trạng thái thanh toán mock để tạo shipping.

1. Route `/product` redirect tới slug demo `suva-hardshell-jacket`, nhưng PDP hiện chỉ tìm ID trong API list nên có thể hiện Product not found. Public unknown URL chưa có 404 route riêng.
2. Session admin và customer dùng chung key; role check admin dựa vào dữ liệu `localStorage` ở client. Quyền thật phải được backend xác thực. Không lưu token/response thật trong tài liệu.
3. Đã bỏ mục “Chuyển quyền” và lời gọi switchRole không tồn tại trong Header; chỉ hiển thị role của phiên. Tích hợp shipping đã thêm SHIPPER trong AuthContext và guard route theo role. Đây là điều hướng/ẩn UI, không thay thế kiểm quyền server.
4. `GlobalLoader` giữ overlay tối thiểu 2,5 giây cho phần lớn `authFetch`; payment status polling dùng loading riêng và không bật overlay. Listing/filter vẫn có thể chậm. React StrictMode dev có thể gọi effect hai lần.
5. Build thành công nhưng JS bundle khoảng 1.9 MB (warning >500 KB). `npm.cmd run lint` lỗi vì thiếu cấu hình ESLint flat config. Không có test suite trong package scripts.
6. Đã có backend source và DTO sourcing trong `Rewear_BackEnd/`; modal Profile đã đối chiếu source. Response tài khoản thật và bản deploy vẫn cần kiểm tra khi thay đổi contract.
7. Tên/mô tả/màu sản phẩm lấy từ API có thể vẫn là tiếng Anh hoặc chứa thương hiệu cũ; frontend không tự viết lại dữ liệu catalog thật. Một số ảnh tham khảo và tên file/class kỹ thuật cũ còn được giữ để tránh đứt asset hoặc selector. Cần chuẩn hóa catalog tại nguồn khi backend/data được chốt.

## Ưu tiên gợi ý khi được giao triển khai

Thống nhất API client/adapter và trạng thái request; nối cart/order thật; đồng bộ các màn mock với server; hợp nhất public layout/listing; cải thiện responsive và accessibility; sau đó code splitting/lint. Mỗi task chỉ sửa phạm vi được yêu cầu và cập nhật context tương ứng.

## Ghi chú deploy Render (2026-10-07)

Bản frontend `https://rewear-wyb0.onrender.com/index.html` cần `VITE_API_BASE_URL` trỏ tới backend public; Vite proxy `localhost:5000` chỉ chạy local. Backend production URL và CORS origin chưa được cung cấp/xác minh. Khi backend local dừng, Vite proxy trả 502 cho API; favicon 404 là lỗi asset riêng.

Backend source đã thêm CORS allowlist cho `https://rewear-wyb0.onrender.com`; cần deploy backend và kiểm tra cấu hình live.


Backend deployment handoff: backend owner needs to commit and deploy the Dockerfile/CORS changes to a Render Web Service, provide its public HTTPS URL, and configure production MongoDB/JWT/Cloudinary plus PayOS credentials if needed. Frontend owner then sets `VITE_API_BASE_URL` and redeploys the static site. The local `docker-compose.yml` database is not part of a standalone Render Web Service deployment.

## Giới hạn QA 2026-10-17

- Browser QA dùng Chromium và API intercept với fixture tổng hợp, không xác nhận backend hoặc giao dịch thật. Chưa kiểm thử PayOS live, upload, auth/role thật, mutation lưu server, bản đồ/asset remote trên production.
- ReportsPage/StaffList chưa có route: chỉ đọc/sửa source responsive, chưa render qua router. Chi tiết đơn admin giữ hành vi fallback về mock đầu tiên khi ID không khớp; không đổi nghiệp vụ demo.
- AuthModal/CartDrawer/AccountMenu dùng chung Home được giữ nguyên nguồn; chưa coi đã hoàn tất kiểm thử accessibility cho mọi trạng thái của chúng. Login đã bỏ mật khẩu khởi tạo mẫu; checkbox ghi nhớ chưa có persistence riêng.
- Không tuyên bố đạt WCAG đầy đủ: chưa audit screen reader, mọi contrast, mọi tổ hợp dữ liệu, Safari/Firefox hoặc thiết bị thật. Bundle ~1.96 MB và lint thiếu flat config còn mở.
- Navbar Home gốc ở viewport 375px ép vùng menu chỉ còn khoảng 10px; các route ngoài Home dùng hàng menu cuộn riêng để giữ link sử dụng được. Task đồng bộ navbar không sửa Home theo phạm vi đã thống nhất; nếu muốn đồng nhất cả hành vi mobile, cần sửa responsive của Home ở task riêng.

## Sau triển khai commerce 25/10/2026

Những lỗi public role/catalog writes, reservation owner, paid-refund stock, mapping enum và mock vận hành trọng tâm được sửa trong source local; không tiếp tục coi chúng là trạng thái hiện tại chỉ dựa trên audit cũ. Còn live staging/payOS/Cloudinary/SMTP, đối chiếu dữ liệu cũ, partial/excess refunds, worker hosting ngủ, pagination vòng đời khi dữ liệu lớn và regression toàn storefront/16 phân hệ. Xem chi tiết ở implementation-report-2026-10-25.md.
