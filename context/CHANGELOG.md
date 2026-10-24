# Lịch sử context

## 2026-10-23 — Sửa hiển thị ảnh sản phẩm catalog và thiết kế lại cụm nút bố cục lưới

- **Khắc phục ảnh sản phẩm ở trang tổng quát (Catalog/NewIn)**: Phát hiện các sản phẩm có `imageUrls: []` từ API (như Levi's 501 Vintage Jeans, Filter Test Product Updated) trên trang chi tiết PDP vẫn hiển thị ảnh sản phẩm (nhờ fallback vào ảnh mặc định theo phong cách editorial), nhưng tại listing `ProductListingGrid` bị logic `p.hasImage ? ... : placeholder` chặn lại khiến thẻ chỉ hiện khung xám "Ảnh đang cập nhật". Đã cập nhật `usePublicProducts.js` với `getFallbackProductImage` phân bổ ảnh minh họa chuẩn theo danh mục/tên (quần jeans/denim, áo khoác, áo thun, túi xách) và gán `hasImage: true`, `img: mainImg`. Cập nhật `ProductListingGrid.jsx` với component `ProductCardImage` có cơ chế `onError` tự động bắt lỗi ảnh tải thất bại để fallback an toàn.
- **Thiết kế lại cụm nút chọn bố cục lưới (Layout Toggles)**: Thay thế 3 nút chữ đơn điệu "Hai", "Bốn", "Tám" bằng segmented pill control thanh lịch mang phong cách editorial tối giản (`.layout-segmented-control`). Mỗi tùy chọn gồm icon SVG minh họa số cột trực quan (2 cột, 4 cột, 8 cột) kèm con số tương ứng (2, 4, 8) và thuộc tính `title`/`aria-label` đầy đủ ("Bố cục 2 cột", "Bố cục 4 cột", "Bố cục 8 cột"). Nút active chuyển sang nền đen mờ nhám `#10100f` với đổ bóng nhẹ; hiệu ứng hover và transition mượt mà; responsive thu gọn trên mobile.
- **Bằng chứng kiểm tra**: `npm run build` thành công (4024 modules, 0 lỗi cú pháp). Browser subagent đã truy cập `http://localhost:5173/new-in#catalog-tools`, chụp ảnh màn hình xác nhận: các sản phẩm đầu (Levi's 501, Filter Test Product) hiển thị ảnh editorial sắc nét, đồng bộ với trang chi tiết; thanh chọn bố cục hiển thị segmented control đẹp mắt với icon + số và chuyển đổi các chế độ lưới 2 cột, 4 cột chuẩn xác.
- **Việc còn mở**: Backend hiện vẫn trả `imageUrls: []` cho 2 sản phẩm đầu (cần cập nhật URL ảnh thực tế trên Cloudinary/S3 qua API sản phẩm); bundle JS production vẫn có cảnh báo >500 kB cần code-splitting trong tương lai.

## 2026-10-18 — Đối chiếu hướng dẫn sử dụng shipping

- Không đổi chức năng. Đối chiếu route, checkout, màn Admin/Staff/Shipper và adapter với code hiện tại để hướng dẫn thao tác; xác nhận `/shipping` dùng API, còn `/orders` admin vẫn là mock.
- Bằng chứng: đọc `AppRoutes.jsx`, `ShippingPage.jsx`, `CheckoutPage.jsx`, `ProfilePage.jsx` và API contract; chưa có backend live để thao tác thử. Còn mở: mapping enum status 0–4, body `PUT /api/shipping/{orderId}` và kiểm thử end-to-end.

## 2026-10-18 — Tích hợp API shipping vào checkout, khách hàng và vận hành

- Thêm `shippingApi` cho bảy endpoint được cung cấp: rates, chi tiết, tạo, cập nhật status, queue, my-orders, all; parser hỗ trợ envelope JSON/text JSON và giữ mã status khi chưa có enum. Checkout tải lựa chọn Standard/Express, hiển thị miễn phí 0 ₫ và gửi method được chọn. Chi tiết Đơn mua đọc shipping/timeline riêng.
- Thêm `/shipping` cho Admin/Staff (queue, xem theo shipper ID, all cho Admin) và `/shipper/orders` cho SHIPPER; cổng login nhận role SHIPPER, guard tách quyền màn vận hành, mutation chỉ báo thành công sau phản hồi API rồi tải lại dữ liệu. Bỏ nút “Giao hàng” chỉ đổi state mock trong OrderList, thay bằng link sang quản lý vận chuyển. Không lấy payment state từ shipping và không dùng dữ liệu mock của `/orders` để phân công.
- Kiểm tra: `npm.cmd run build` đạt (4027 modules, cảnh báo bundle khoảng 1.99 MB); adapter smoke test cho unwrap/list/rates/status đạt; `git diff --check` không thấy lỗi whitespace. Thử `localhost:5000/swagger/v1/swagger.json` bị timeout nên chưa thử request với backend hoặc xác nhận shape live.
- Còn mở: schema `data` thực của shipping, mapping enum 0–4, quyền/trình tự backend và body cho `PUT /api/shipping/{orderId}` trong ảnh Swagger chưa được cung cấp; admin order pages vẫn mock. Đã hỏi người dùng phần body/enum còn thiếu.

## 2026-10-18 — Đồng bộ footer Home và tách bộ ảnh Mới về/Nam/Nữ

- Hoàn thiện giao diện ảnh lớn/chuyển cảnh cho Catalog/About/World: điều khiển ảnh, pause/reduced motion, journal cuộn mobile, CTA nền ảnh. Giữ các bộ lọc, flow API và business logic hiện tại.
- Theo yêu cầu mới nhất, năm trang dùng lại `RainsFooter` của Home thay footer thử nghiệm; PDP/Profile đã dùng cùng component. Sửa reset CSS About ảnh hưởng footer và ngắt chữ Profile khiến logo lớn xuống dòng. Không thay Home hoặc component/CSS footer chung.
- Thêm chín ảnh local, ba ảnh riêng cho mỗi trang Mới về/Nam/Nữ ở banner/journal/CTA; nội dung cảm hứng riêng, không trùng bộ ảnh giữa ba trang. Không thay ảnh sản phẩm API bằng ảnh stock. Nguồn ảnh lưu trong `editorial-ui-2026-10-18.md`.
- Kiểm tra: production build đạt (4024 modules); 24 ca Chromium ở 375/768/1440px dùng Home làm chuẩn, bảy route storefront không tràn ngang/pageerror, footer không khác thuộc tính đã so sánh. Ảnh tải đủ, tập ảnh ba catalog không giao nhau; các thao tác slideshow/pause/reduced motion, tìm kiếm/reset, giỏ, About steps/FAQ, journal và link footer đạt với fixture. Chi tiết trong báo cáo editorial.
- Còn mở: lint thiếu `eslint.config.*`; JS bundle khoảng 1,97 MB; sản phẩm thật có thể trùng giữa ba listing do chưa phân loại giới tính; footer mẫu còn placeholder/newsletter demo; chưa thử backend live, trình duyệt khác, thiết bị thật hoặc audit WCAG đầy đủ.

## 2026-10-17 — QA toàn bộ UI ngoài Home và nâng cấp trải nghiệm

- Hợp nhất ba listing thành CatalogPage: hero/editorial, thẻ sản phẩm, tìm không dấu, sort giá/tên, lọc màu/cỡ từ dữ liệu tải sẵn, chip/reset, xem thêm và empty recovery. About thêm hành trình tương tác, FAQ, mục lục và pause motion.
- Sửa tràn ngang Profile, nav/PDP mobile, dialog/focus/bàn phím, checkout placeholder/thứ tự form, spinner payment; thống nhất admin table/form/modal/font/tiếng Việt và nhãn demo. Bỏ switchRole không tồn tại.
- Không đổi Home, API services/hooks, CartContext/AuthContext, routes/guards hoặc logic tạo đơn/thanh toán.
- Kiểm tra build thành công 4021 modules; 148 ca render (37 màn × 4 chiều rộng) không lỗi JS/tràn ngang với fixture; 15 ca tương tác nền tảng đạt. Các ca tương tác catalog/About và giới hạn chi tiết nằm trong ui-qa-2026-10-17.md. Home computed styles/geometry 261 phần tử ở bốn chiều rộng không thay đổi.
- Còn mở: lint thiếu eslint.config.*, bundle lớn, backend/live mutation và payment chưa thử, màn Reports/Staff chưa có route, chưa audit WCAG/screen reader hoặc browser khác.


## 2026-10-07 — Đối chiếu guide thanh toán và khởi động polling từ checkout

- Đọc `FE_INTEGRATION_GUIDE.md`: checkout trả `data.order.id` và checkoutUrl; tab REWEAR phải giữ orderId, mở PayOS ở tab riêng và gọi `GET /api/payments/{orderId}/status` mỗi 3 giây. Trước sửa frontend chuyển cùng tab sang PayOS, nên không còn component polling; callback phải suy ID từ PayOS orderCode và bỏ sót `paymentStatus: 2` dạng số.
- Nay checkout mở PayOS ở tab mới và chuyển nội bộ tới `/payment/waiting?orderId=...`; trang chờ poll tối đa 15 phút, đọc enum payment số/chuỗi/bool, thử ngay khi tab được focus và có nút mở PayOS nếu popup bị chặn. Chỉ backend response Paid mới báo thành công; backend theo guide sẽ chuyển payment và product sang Paid/Sold idempotent.
- Payment status polling bỏ GlobalLoader toàn màn hình để request mỗi 3 giây không khóa nút của trang chờ; `authFetch` nay giữ HTTP status 401 để dừng polling khi phiên đăng nhập hết hạn.
- Guide ghi API/Swagger production cùng origin với frontend, trái giả định cũ về backend riêng; cập nhật tài liệu deploy theo hai khả năng, chưa xác minh cấu hình live. Guide cũng có mapping order status khác context cũ; frontend không dựa vào mã order để xác nhận payment.
- Kiểm tra: `npm.cmd run build` thành công (4008 modules; cảnh báo bundle JS khoảng 1,95 MB); chưa thử giao dịch thật hoặc đọc response live vì host không truy cập được từ môi trường này.

## 2026-10-07 — Đọc đủ response status polling PayOS

- Cập nhật callback đọc trạng thái từ `data` dạng chuỗi (Swagger mẫu) hoặc object; khi còn Pending tiếp tục gọi `GET /api/payments/{orderId}/status` mỗi 3 giây. Backend contract người dùng cung cấp tự hỏi PayOS và đồng bộ DB; `CANCELLED`/`EXPIRED` hiện trạng thái tương ứng, chỉ `PAID` mới redirect home.
- Ghi rõ response/logic backend live chưa được kiểm chứng. Kiểm tra `npm.cmd run build` thành công (4008 modules; còn cảnh báo JS bundle khoảng 1.95 MB); chưa gọi API payment live.

## 2026-10-07 — Ghi nhận sản phẩm chưa chuyển Sold sau thanh toán

- Người dùng báo giao dịch đã thanh toán thành công nhưng sản phẩm vẫn chưa ở trạng thái “Đã bán”. Source frontend xác nhận callback chỉ đọc payment status rồi quay về home; ProductList chỉ cho đổi Available ↔ Reserved, không có luồng bán tự động. Backend không nằm trong workspace nên chưa kết luận được webhook/payment handler live có thiếu cập nhật hay không.
- Ghi rõ yêu cầu backend cần kiểm tra: khi xác minh PAID, chuyển sản phẩm thuộc order sang Sold (status 2) và cập nhật tồn kho một cách nguyên tử/idempotent; khi pending giữ Reserved, khi hủy/hết hạn giải phóng theo chính sách. Chưa có cách kiểm tra backend hoặc giao dịch thật trong task này.

## 2026-10-07 — Xử lý callback PayOS bị 404 và quay về trang chủ

- Thêm route `/payment/waiting`; callback tra đơn qua orderCode, poll payment status tối đa 10 lần và chỉ tự điều hướng home khi API backend xác nhận `isPaid: true` hoặc `paymentStatus: PAID`. Query params `status/code/cancel` không được dùng làm bằng chứng thanh toán.
- Render Static Site cần cấu hình rule Redirects/Rewrites: `/*` → `/index.html`, Action Rewrite, để route SPA không trả 404 trước khi React chạy. Chưa thể cấu hình dashboard Render trong workspace.
- Bằng chứng: route `/payment/waiting` trước đây chưa tồn tại trong AppRoutes; API contract đã ghi GET order by code và GET payment status. `npm.cmd run build` thành công (4008 modules; còn cảnh báo bundle JS khoảng 1.95 MB). Chưa test transaction thật hay status backend live.

## 2026-10-07 — Chẩn đoán link frontend Render

- Xác nhận từ source `BrowserRouter`, Vite SPA entry ở `/`, proxy `/api` và `/uploads` chỉ dành cho local, và API production phụ thuộc `VITE_API_BASE_URL`; repo không có `render.yaml` để chứng minh cấu hình Static Site live.
- Kiểm tra `https://rewear-wyb0.onrender.com/index.html` không lấy được phản hồi qua web tool; `curl.exe` gặp lỗi TLS của môi trường. Vì vậy chưa xác định được mã HTTP hay nguyên nhân live cụ thể. Cần xem lỗi cụ thể trong trình duyệt/Render dashboard nếu trang không mở; nếu trang mở nhưng dữ liệu/hành động lỗi thì xác minh backend URL và CORS.

## 2026-10-07 — Truy nguyên lỗi tạo phiên PayOS

- Đối chiếu Swagger live, mã backend ngoài workspace và tài liệu payOS: toast đang thấy do `POST /api/orders/checkout` tự gọi PayOS thất bại rồi trả HTTP 409; không phải lỗi gọi session trùng đã suy đoán trước đó. Backend hủy đơn, trả tồn kho nhưng đã xóa dòng giỏ. Cấu hình PayOS Development để trống các khóa; REST request hiện sai header, orderCode, signature, expiredAt và return/cancel URL so với tài liệu payOS.
- Bổ sung `payment-checkout-audit.md`, cập nhật API contract/future plan/known gaps. Kiểm tra: Swagger `localhost:5000` trả 200; đọc mã backend và tài liệu chính thức. Không gọi checkout thật, không có upstream log/response PayOS để xác nhận mã lỗi cụ thể. Chỉ sửa tài liệu, không thay đổi mã nguồn frontend/backend.

## 2026-10-07 — Tránh tạo phiên PayOS lặp ở checkout

- `POST /api/orders/checkout` được mô tả tự tạo phiên và trả response cùng checkout, nhưng frontend luôn gọi thêm `POST /api/payments/{orderId}/session`; trường hợp checkout đã trả URL có thể gây 409 phiên trùng. Nay ưu tiên checkoutUrl hợp lệ từ checkout response, chỉ gọi endpoint session riêng khi chưa có URL.
- Cập nhật flow/API/UI/future-plan context. Kiểm tra: `npm.cmd run build` thành công (4006 modules; bundle JS khoảng 1.95 MB, còn cảnh báo >500 kB); không có backend trong workspace để xác nhận response thực tế hoặc mã lỗi phát sinh.

## 2026-10-07 — Lấy ảnh chi tiết khi giỏ hàng thiếu thumbnail

- Ảnh giữ chỗ xuất hiện vì cả cart API lẫn catalog không có ảnh sản phẩm hợp lệ. Khi thiếu ảnh hoặc giá, CartContext giờ gọi `GET /api/Products/{id}` một lần cho mỗi product ID và dùng response bổ sung ảnh/giá; chỉ giữ placeholder nếu detail API cũng không có ảnh.
- Cập nhật API contract, design-ui và known-gaps. Kiểm tra: `npm.cmd run build` thành công (4006 modules; bundle JS khoảng 1.95 MB, còn cảnh báo >500 kB). API backend chưa có trong workspace nên response detail chưa xác minh.

## 2026-10-07 — Đồng nhất ảnh sản phẩm trong giỏ và checkout

- Cart thumbnail trước đây ưu tiên ảnh dự phòng catalog, có thể là ảnh túi mock dùng chung, nên ảnh không khớp tên sản phẩm. Ưu tiên ảnh từ cart API, fallback sang ảnh catalog chỉ khi catalog xác nhận có ảnh thật; thiếu ảnh thì hiển thị placeholder ở drawer và checkout.
- Cập nhật API contract và ghi chú UI. Kiểm tra: `npm.cmd run build` thành công (4006 modules; bundle JS khoảng 1.94 MB, còn cảnh báo >500 kB); backend/API response thực tế không có trong workspace để đối chiếu.

## 2026-10-07 — Tạo phiên thanh toán PayOS sau khi đặt đơn

- Nối `POST /api/payments/{orderId}/session` sau khi `POST /api/orders/checkout`; client lấy orderId từ response, kiểm tra checkoutUrl thuộc HTTPS PayOS rồi mới điều hướng. Nếu tạo session lỗi, cho thử lại session với cùng orderId để tránh tạo trùng đơn. `authFetch` đọc thêm `+json`/`text/json` để hiển thị lỗi Problem Details 404/409.
- Cập nhật API contract, flow, route, UI và khoảng trống. Kiểm tra: `npm.cmd run build` thành công (4006 modules; bundle JS khoảng 1.94 MB, còn cảnh báo >500 kB); backend không có trong workspace nên chưa xác minh response thật. QR code có trong mô tả endpoint nhưng hiện không render vì giao diện chuyển khách sang checkoutUrl.

## 2026-10-07 — Tra chi tiết đơn bằng mã đơn

- Thêm `ordersApi.getByCode` cho `GET /api/orders/code/{orderCode}`; nút Chi tiết ưu tiên endpoint này, còn dùng `GET /api/orders/{id}` khi list không có orderCode.
- Cập nhật API contract, flow, route và known gaps. Kiểm tra: `npm.cmd run build` thành công; chưa gọi API thật vì backend không có trong workspace.

## 2026-10-07 — Sửa giá checkout và tải chi tiết đơn hàng

- CartContext đọc thêm alias/giá dạng object, dùng `GET /api/Products/{id}` khi dòng giỏ thiếu giá hợp lệ; nếu vẫn thiếu thì hiển thị “Chưa cập nhật giá”, tổng là dấu gạch ngang và khóa thanh toán. CartDrawer/Checkout có nút thử tải lại.
- Thêm `GET /api/orders/{id}` vào orders service; nút Chi tiết ở Đơn mua/Lịch sử tải thêm địa chỉ, vận đơn, ghi chú, phí và lịch sử nếu response có các field tương ứng.
- Cập nhật API contract, route, flow, design UI, future plan và known gaps. Kiểm tra: `npm.cmd run build` thành công (JS khoảng 1.94 MB, còn warning >500 kB); backend không có trong workspace nên chưa xác minh response API thật.

## 2026-10-07 — Nối danh sách đơn mua khách hàng

- Tab Đơn mua và Lịch sử đọc `GET /api/orders` bằng Bearer session; thêm lọc `Status`, phân trang 10 đơn, tìm kiếm trong trang và trạng thái tải/lỗi/thử lại/empty. Bỏ nội dung hủy đơn giả lập và số liệu lịch sử tính từ mock.
- Người dùng cung cấp mapping 0–5: Chờ thanh toán, Đã xác nhận, Đang giao, Đã giao, Đã hủy, Hết hạn thanh toán; UI map cả mã số và enum string. Response schema còn thiếu, history tải tối đa 50 đơn/request, adapter alias cần xác minh với backend. Payment status vẫn là field riêng, chỉ render nếu response có.
- Cập nhật API contract, route, flow, UI, future plan và known gaps. Kiểm tra: `npm.cmd run build` thành công, cảnh báo bundle JS lớn khoảng 1.94 MB. Chưa xác minh API thật vì backend không nằm trong workspace.

## 2026-10-07 — Tạo checkout REWEAR nối PayOS

- Thêm `/checkout` với địa chỉ từ `GET /api/Profile/addresses`, ghi chú và summary các dòng được chọn; gửi `POST /api/orders/checkout` theo schema người dùng cung cấp, dùng `shippingMethod: 0` mặc định đã xác nhận, và chuyển hướng đến HTTPS URL PayOS nếu response hợp lệ.
- Nối nút Thanh toán trong cart drawer tới checkout. Thêm loading/error/empty state; không báo đã thanh toán sau khi tạo đơn, nêu rõ thời hạn giữ hàng 15 phút từ backend. Response URL chưa có schema, API thật chưa kiểm chứng.
- Cập nhật route, API contract, flow, future plan, known gaps và design UI. Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.97 MB. Chưa gọi API thật vì backend không có trong workspace.

## 2026-10-07 — Rà soát dữ liệu có thể dùng trong mô tả PDP

- Xác nhận trang hiện hiển thị `description`; mapper có đọc tùy chọn `originalMaterial` nhưng field này chưa được xác nhận trong schema và chưa render. Ghi rõ các field tiềm năng và khoảng trống như SKU/specs/care/shipping vào API contract/known gaps.
- Kiểm tra: rà mã `usePublicProducts`, StoreProductPage và schema/API context. Backend/OpenAPI GET không có trong workspace.

## 2026-10-07 — Giảm nhẹ kích thước thanh mua nhanh

- Giữ thanh full-width vuông sát mép; giảm chiều cao từ 82px xuống 72px desktop, thu nhỏ chữ và CTA. Breakpoint giảm tiếp nhẹ, giữ nút mobile tối thiểu 44px.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB.

## 2026-10-07 — Cho thanh mua nhanh tràn sát hai mép

- Bỏ lề ngang và bo góc trên thanh đáy PDP; thanh giờ sát mép trái/phải và vuông góc như ảnh. Trên mobile giữ khoảng safe-area ở dưới.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB.

## 2026-10-07 — Thu ngắn thanh mua nhanh

- Chừa lề ngang 8–18px cho thanh ở đáy desktop/tablet, bo góc; mobile chừa lề 8px. Điều chỉnh khoảng đệm đáy theo kích thước để nội dung vẫn không bị che.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB.

## 2026-10-07 — Đặt thanh mua nhanh dưới đáy màn hình

- Theo ảnh người dùng gửi, chuyển thanh PDP từ đầu xuống cuối viewport và giữ navbar storefront hiển thị. Thêm safe-area trên thiết bị di động và khoảng đệm cuối trang để thanh không che nội dung.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa kiểm tra trực quan trên trình duyệt.

## 2026-10-07 — Thêm thanh mua nhanh khi cuộn PDP

- Thêm thanh cố định đầu trang sau khi gallery cuộn khỏi màn hình, gồm điều hướng Mô tả/Gợi ý, tên/giá từ sản phẩm và nút thêm giỏ tái sử dụng handler hiện có. Ẩn khi drawer/lightbox mở; bố cục mobile rút gọn.
- Cập nhật flow mua sắm và design UI. Không thêm API mới hay dữ liệu mock.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa kiểm tra trực quan trên browser/backend.

## 2026-10-07 — Thu gọn và căn bảng PDP sát mép phải

- Đối chiếu trang Sarna Puffer của Rains và chỉnh bảng thông tin desktop còn 330–430px, lề phải co giãn 10–28px; giữ nguyên layout tablet/mobile và giới hạn thông tin theo dữ liệu API.
- Cập nhật mô tả route PDP để không còn ghi các lựa chọn biến thể giả.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa xác minh hiển thị trực quan trên nhiều kích thước trình duyệt.

## 2026-10-07 — Tăng hiệu ứng kính mờ trên PDP

- Giảm độ đục nền thẻ thông tin và thêm gradient ngà, blur/saturation để ảnh gallery xuyên qua rõ hơn; thẻ mobile vẫn đục hơn nhằm giữ độ dễ đọc.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS lớn khoảng 1.96 MB. Chưa kiểm tra trực quan trên trình duyệt.

## 2026-10-07 — Tinh chỉnh UI trang chi tiết sản phẩm

- Làm rõ gallery toàn màn hình và bảng thông tin kính mờ: tăng độ rộng/độ tương phản, định dạng typography/CTA, cuộn riêng cho bảng trên desktop/tablet và chuyển bố cục gọn trên mobile; thêm focus-visible và dừng chuyển động băng chuyền theo `prefers-reduced-motion`.
- Giữ nguyên giới hạn dữ liệu API đã thống nhất; không thêm biến thể, giao hàng hay thông tin cửa hàng giả.
- Kiểm tra: `npm.cmd run build` thành công; CSS 130.71 kB, JS 1.96 MB và còn cảnh báo bundle JS lớn. Chưa kiểm tra trực quan trên trình duyệt; backend/API không có trong workspace.

## 2026-10-07 — Bỏ dữ liệu tự tạo khỏi thanh thông tin sản phẩm

- Bỏ lựa chọn Nam/Nữ, cỡ S/M/L và M mặc định, chọn màu/cỡ giả lập, size guide với số đo mẫu, mô tả giữ chỗ, thông tin giao hàng/đổi trả và bảo quản chưa có nguồn API, dòng phí giao hàng và nhãn cửa hàng khỏi PDP. Chỉ render description/color/size/price khi DTO API có dữ liệu; giá thiếu thì không cho thêm giỏ.
- Bổ sung đọc key camelCase/PascalCase và chuẩn hóa giá trước khi hiển thị; cập nhật API contract, flow, khoảng trống và UI context. Không thay dữ liệu catalog thật.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. GET sản phẩm backend chưa có trong repo để xác minh response thực tế.

## 2026-10-07 — Lấy badge giỏ hàng từ API count

- Nối `GET /api/cart/count` trong `CartContext`; dùng số từ endpoint cho badge trên các trang storefront và đồng bộ lại sau thêm/xóa/đổi số lượng. Khi API lỗi hoặc response không nhận diện được, fallback sang tổng quantity của GET cart.
- Ghi endpoint do người dùng cung cấp vào API contract, flow và known gaps; response thực tế chưa có schema nên client hỗ trợ scalar và một số tên field phổ biến.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.97 MB. Chưa gọi API thật vì backend không có trong repo.

## 2026-10-07 — Chọn sản phẩm trong giỏ hàng qua API

- Thêm checkbox từng dòng và chọn tất cả; gọi hai PUT selection endpoint với payload người dùng cung cấp. Chọn tất cả tải lại giỏ sau phản hồi để dùng trạng thái server, còn chọn một dòng cập nhật cục bộ sau 2xx.
- Tạm tính/footer tính theo số lượng và giá của dòng được chọn; cập nhật API contract, flow, design UI và ghi rõ giả định `isSelected` của GET response.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa gọi API thật vì backend không có trong repo.

## 2026-10-07 — Cập nhật số lượng từng dòng giỏ hàng qua API

- Nối nút tăng/giảm trong drawer với `PUT /api/cart/items/{itemId}` và JSON `{quantity}`. Mã dòng lấy từ các alias được hỗ trợ của GET cart; chỉ cập nhật state sau phản hồi thành công, khóa thao tác khi chờ, giữ số lượng tối thiểu là 1 và báo lỗi nếu request thất bại.
- Ghi schema người dùng cung cấp vào API contract; cập nhật flow giỏ hàng, khoảng trống backend chưa kiểm chứng và nguyên tắc UI.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa gọi API thật vì backend không có trong repo.

## 2026-10-07 — Hiển thị xác nhận xóa dạng popup giữa màn hình

- Đổi xác nhận xóa từng món và xóa toàn bộ từ panel trong drawer sang modal phủ màn hình, có lớp nền tối, hai nút Hủy/Xóa, đóng bằng Escape hoặc chạm lớp phủ và khóa khi request đang chạy.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa kiểm tra trực quan bằng browser.

## 2026-10-07 — Xác nhận trước khi xóa từng sản phẩm trong giỏ

- Thêm hộp xác nhận tại cart drawer cho từng dòng sản phẩm; nút Hủy không gửi request, nút Xóa sản phẩm mới gọi API. Giữ xác nhận mở nếu API lỗi và khóa thao tác xung đột trong khi chờ.
- Cập nhật mô tả flow giỏ hàng và nguyên tắc UI.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa kiểm tra API thật vì backend không có trong repo.

## 2026-10-07 — Xóa một mục khỏi giỏ hàng qua API

- Nối nút xóa từng dòng trong `CartDrawer` với `DELETE /api/cart/items/{itemId}`; chuẩn hóa và giữ riêng mã dòng từ `itemId`, `cartItemId` hoặc `id` trong response GET. Chỉ bỏ dòng khỏi state sau phản hồi thành công; khóa thao tác trùng trong lúc chờ và báo lỗi/giữ nguyên dòng khi thiếu mã hoặc API thất bại.
- Cập nhật API contract, flow giỏ hàng và known gaps. Response GET thật chưa có mẫu nên tên trường mã dòng là các alias client hỗ trợ, chưa xác nhận backend.
- Kiểm tra: `npm.cmd run build` thành công (4006 modules); Vite còn cảnh báo bundle JS khoảng 1.96 MB. Chưa gọi API thật vì backend không có trong repo.

## 2026-10-07 — Sửa giá và ảnh hiển thị trong giỏ hàng

- Sửa parser giá để đọc chuỗi có dấu chấm/phẩy phân cách hàng nghìn, tránh giá hợp lệ bị chuyển thành `0 ₫`; chia sẻ catalog từ cùng `usePublicProducts` sang CartContext để tên/ảnh/giá trên drawer khớp product cards, và ưu tiên ảnh catalog cùng ID.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa có response backend thực để đối chiếu các field.

## 2026-10-07 — Dùng chung giỏ hàng giữa các trang storefront

- Thêm `CartProvider`/`CartDrawer` trong layout route storefront; nút giỏ tại Home, About, New In, Nữ, Nam, Thế giới REWEAR và PDP mở cùng drawer, số lượng dùng chung.
- Chuyển thêm sản phẩm/xóa toàn bộ/tải giỏ sang CartContext, giữ tương tác đổi số lượng/xóa từng dòng hiện tại ở local state.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa chạy API backend thật.

## 2026-10-07 — Sửa tên và giá sản phẩm trong cart drawer

- Mở rộng adapter GET `/api/cart` để đọc field camelCase/PascalCase và các biến thể product DTO; dùng catalog đã tải làm fallback khi DTO thiếu giá/tên/ảnh, đồng thời chờ catalog tải xong rồi mới gọi cart.
- API response thực chưa được cung cấp nên mapping cần đối chiếu lại nếu backend dùng tên field khác.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa gọi backend thật.

## 2026-10-07 — Xóa toàn bộ giỏ hàng qua API

- Thêm nút xóa tất cả trong drawer, có bước xác nhận và trạng thái đang xóa; gọi `DELETE /api/cart` và chỉ làm trống UI sau khi server xác nhận thành công.
- Ghi endpoint vào API contract, cập nhật flow giỏ hàng và phần còn mở (xóa từng dòng/đổi số lượng vẫn local).
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa gọi API thật vì backend không có trong repo.

## 2026-10-07 — Đọc giỏ hàng kèm thông tin sản phẩm

- Chuẩn hóa kết quả `GET /api/cart` để xử lý list hoặc wrapper phổ biến và thông tin sản phẩm lồng nhau; drawer hiển thị tên, ảnh, màu, size, giá, số lượng, trạng thái tải/lỗi/rỗng và tạm tính theo dữ liệu nhận được.
- Ghi nhận endpoint được người dùng xác nhận là trả kèm sản phẩm; cấu trúc field cụ thể vẫn chưa có mẫu response.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Chưa gọi API thật vì backend không có trong repo.

## 2026-10-07 — Gửi thao tác thêm giỏ hàng lên API

- Xác nhận handler PDP gửi `POST /api/cart` với `{productId, quantity}`; kiểm tra mã sản phẩm, khóa gửi lặp khi đang xử lý và hiện toast/nhãn thành công sau phản hồi thành công.
- Ghi schema POST do người dùng cung cấp vào API context; GET cart và response của nó vẫn được đánh dấu là giả định từ frontend.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Backend không có trong repo nên chưa gọi API thật.

## 2026-10-07 — Chỉ đăng bán sản phẩm Available

- Cập nhật storefront từ `Status=1` sang `Status=0` và lọc bổ sung trên client; status 0 là Available, 1 Reserved, 2 Sold theo quy ước người dùng.
- Đồng bộ nhãn badge, bộ lọc quản trị và chuyển trạng thái Available ↔ Reserved; không hiện thao tác mở bán lại cho sản phẩm Sold. Cập nhật mock catalog và tài liệu API/flow.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle JS khoảng 1.96 MB. Backend không có trong repo nên enum/query phía server chưa được xác minh độc lập.

## 2026-10-06 — Thống nhất thương hiệu REWEAR và nội dung tiếng Việt

- Đổi logo, navbar, footer, About, Home, listing, World, profile và phần chữ tĩnh ở trang sản phẩm sang REWEAR/tiếng Việt; đặt `lang="vi"`, tiêu đề trình duyệt REWEAR và tên package npm `rewear`. Footer trang chủ dùng chung component footer; README gốc được thay bằng hướng dẫn dự án.
- Viết lại giới thiệu `/world`; gỡ thông số, ưu đãi và đánh giá mẫu từ giao diện sản phẩm tham khảo để tránh gán cam kết của thương hiệu khác cho REWEAR. Cập nhật tài liệu thiết kế và rule cho task sau.
- Kiểm tra: `npm.cmd run build` thành công. Chưa xác minh ảnh trực quan trên trình duyệt hoặc dữ liệu từ backend; tên/mô tả sản phẩm lấy từ API giữ nguyên theo nguồn.

## 2026-10-06 — Đồng bộ thiết kế toàn bộ khu vực tài khoản

- Làm lại sổ địa chỉ, đơn mua, lịch sử mua hàng và bán đồ cũ theo thiết kế cùng tab hồ sơ: header editorial, card/form rõ ràng, responsive, trạng thái tải/lỗi/empty và điều hướng bằng bàn phím. Tab đơn/lịch sử ghi rõ dữ liệu minh họa; hủy đơn chỉ cập nhật trong phiên.
- Giữ nguyên endpoint profile/address/sourcing hiện có; chuẩn hóa nhãn trạng thái sourcing theo enum frontend admin, cải thiện preview ảnh và modal chi tiết.
- Kiểm tra: `npm.cmd run build` thành công; còn cảnh báo bundle khoảng 1.9 MB. Chưa chạy trực tiếp với backend hoặc kiểm tra ảnh chụp trình duyệt vì backend không nằm trong workspace.

## 2026-10-06 — Thiết kế lại màn hồ sơ cá nhân

- Nâng cấp bố cục trang hồ sơ: sidebar thành panel, header rõ thứ bậc, thông tin dạng ô hai cột, ảnh đại diện thành khối riêng; responsive một cột ở mobile và có focus/reduced motion.
- Thêm trạng thái tải/lỗi/thử lại; hủy chỉnh sửa khôi phục giá trị đã lưu, avatar có nút bàn phím và chỉ nhận JPEG/PNG tối đa 5MB. Flow API lưu họ tên/giới tính và upload ảnh giữ nguyên.
- `npm.cmd run build` thành công; Vite vẫn cảnh báo bundle JS vượt 500 kB. Chưa kiểm tra trực quan bằng browser; điện thoại/ngày sinh vẫn chỉ đọc do form/API hiện tại chưa hỗ trợ sửa.

## 2026-10-06 — Đồng bộ màu sắc và font chữ trang About

- Chuyển đổi toàn bộ mã màu cứng và font chữ riêng rẽ trên trang About sang dùng biến toàn cục (`--color-fog`, `--color-ink`, `--color-butter-cream`, `--font-ui`, `--font-display`) từ `index.css`.
- Đảm bảo màu nền và font chữ đồng nhất 100% với các trang storefront khác (Home, New In, Product, v.v.).

## 2026-10-06 — Đặt địa chỉ cửa hàng Thủ Đức

- Thay địa điểm thành địa chỉ người dùng cung cấp: 124 Đường 160, phường Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM; liên kết ngoài mở Google Maps với truy vấn đầy đủ địa chỉ.
- Nominatim không truy cập được từ môi trường kể cả lần thử có quyền mạng; pin trong map nhúng tạm đặt ở tâm khu vực Tăng Nhơn Phú A (10.8424, 106.7936; [Mapcarta](https://mapcarta.com/31635790)), không khẳng định là tọa độ số nhà.
- `npm.cmd run build` thành công; Vite vẫn cảnh báo bundle JS vượt 500 kB. Để pin đúng số nhà, cần tọa độ chính xác hoặc link ghim trên bản đồ.

## 2026-10-06 — Hoàn thiện tính rõ ràng và nguồn dữ liệu của map

- Thêm attribution cho tile ArcGIS/OSM, link mở vị trí ngoài bản đồ, và trạng thái báo tile lỗi; bỏ nút Info chưa có hành động.
- Hiển thị vị trí như “Ho Chi Minh City” kèm ghi chú pin trung tâm gần đúng/địa chỉ shop chưa xác nhận; làm thẻ địa điểm dùng được bằng bàn phím.
- `npm.cmd run build` thành công, còn cảnh báo bundle JS vượt 500 kB; chưa kiểm tra trực tiếp trong browser. Địa chỉ cửa hàng thật vẫn cần xác minh.

## 2026-10-06 — Đổi địa điểm Store Locator sang TP. Hồ Chí Minh

- Thay hai fixture Bordeaux/Milano bằng một địa điểm “Rains Store Ho Chi Minh City”, địa chỉ cấp thành phố tại Việt Nam và pin mặc định ở khu vực trung tâm TP.HCM. Không hiển thị liên hệ/giờ mở cửa châu Âu không còn phù hợp.
- Search, chọn cửa hàng, marker, link bản đồ và nút định tâm đều dùng tọa độ TP.HCM; địa chỉ shop cụ thể chưa được xác minh nên fixture không khẳng định một địa chỉ đường thật.
- `npm.cmd run build` thành công, còn cảnh báo bundle JS vượt 500 kB. Vị trí shop cụ thể chưa được xác minh; pin dùng điểm trung tâm TP.HCM.

## 2026-10-06 — Chỉnh sửa Store Locator theo thiết kế

- Cập nhật giao diện sidebar và marker trên bản đồ giống ảnh thiết kế: marker hình tròn có số, thiết kế lại list cửa hàng.
- Thêm thông tin giờ mở cửa cho các cửa hàng fixture.
- Đổi base map sang ArcGIS Light Gray Base để có sẵn giao diện xám tối giản giống hệt thiết kế mà không gặp lỗi "API KEY REQUIRED" (CARTO) hoặc bị chặn request (OpenStreetMap).
- Kiểm tra tĩnh JSX/CSS; chưa chạy build/test.

## 2026-10-06 — Sửa bản đồ Rains World không kết nối

- Bỏ iframe `openstreetmap.org` đang bị môi trường từ chối; render các tile ảnh chỉ trong vùng nhìn thấy từ `tile.openstreetmap.org`, có thể kéo bản đồ, zoom/reset, chọn cửa hàng để định tâm và mở địa điểm trên OSM.
- Hiển thị ghi công OpenStreetMap trên bản đồ theo chính sách tile; fixture hai cửa hàng vẫn chỉ phục vụ giao diện và cần mạng tới tile server.
- `npm.cmd run build` thành công; Vite cảnh báo bundle JS hiện có vượt 500 kB. Chưa kiểm tra trực tiếp trên browser với tile server.

## 2026-10-06 — Store locator trên Rains World

- Thêm section tìm kiếm/list cửa hàng và bản đồ OpenStreetMap tương tác ngay trước footer Rains World; chọn location đổi viewport/pin, có link mở bản đồ lớn.
- Dùng hai cửa hàng Bordeaux/Milano có trong ảnh người dùng cung cấp; chưa có API store locator nên dữ liệu là fixture, responsive list/map và có trạng thái không tìm thấy.
- Kiểm tra tĩnh import/route/asset (map tải từ OpenStreetMap khi chạy trang); chưa chạy build/test.

## 2026-10-06 — Sửa chữ tiêu đề About bị đè

- Nới `letter-spacing` và `line-height` cho tiêu đề hero và CTA, bao gồm breakpoint mobile, để chữ lớn và dấu tiếng Việt không chồng lên nhau.
- Kiểm tra tĩnh các quy tắc desktop/mobile; chưa chạy build/test hoặc đối chiếu screenshot sau sửa.

## 2026-10-06 — Thay nhãn đầu hero About

- Điền vị trí trên tiêu đề bằng nhãn “THỜI TRANG TUẦN HOÀN”, giữ kiểu chữ nhấn nhỏ đồng bộ hero.
- Kiểm tra tĩnh JSX/CSS; chưa chạy build/test.

## 2026-10-06 — Bỏ nhãn mở đầu About

- Xóa dòng “A second beginning” và icon khỏi hero About để tiêu đề chính mở trang trực tiếp.
- Font vẫn theo hệ thống storefront: Barlow Condensed cho tiêu đề, Inter cho nội dung.
- Kiểm tra tĩnh text/import/CSS liên quan; chưa chạy build/test.

## 2026-10-06 — Đồng bộ màu và sticky nav About

- Đưa nền hero/CTA About về fog xám của storefront, giữ butter cream làm màu nhấn.
- Thêm announcement và các nút Search/Cart/Account theo storefront; chuyển root `.rw` lên bao trọn trang và dùng `overflow-x: clip` để nav sticky không bị giới hạn bởi wrapper ngắn/overflow hidden.
- Kiểm tra tĩnh JSX/CSS và cấu trúc sticky; chưa chạy build/test.

## 2026-10-06 — Hiển thị About trên mọi trang storefront

- Thêm mục About vào nav của New In, Women, Men, Rains World và PDP; Home/About đã có sẵn.
- Điều chỉnh breakpoint nav dùng chung để không ẩn mục About (link thứ năm) trên màn hình nhỏ.
- Kiểm tra tĩnh nav markup/route `/about` trên các trang storefront; chưa chạy build/test.

## 2026-10-06 — Gỡ các mục nav không dùng

- Xóa Bags, Footwear, Accessories và Home Away khỏi thanh nav trên Home, About, New In, Women, Men và trang sản phẩm.
- Giữ nội dung/banner và category pills trong thân trang; thao tác chỉ áp dụng cho navigation.
- Kiểm tra tĩnh selector/nav markup trên các trang storefront; chưa chạy build/test.

## 2026-10-06 — Đồng bộ navigation và bỏ footer About

- Thay nav tự thiết kế của About bằng pill nav storefront hiện có; tại thời điểm đó thanh nav còn có các mục Bags, Footwear, Accessories, Home Away.
- Gỡ footer riêng ở cuối About theo yêu cầu.
- Kiểm tra tĩnh JSX và route links; chưa chạy build/test.

## 2026-10-06 — Trang About REWEAR

- Thêm route public `/about` với bố cục editorial giới thiệu mục tiêu dự án, vòng đời circular fashion, ngôn ngữ thiết kế và nguyên tắc REWEAR.
- Dùng palette hiện có `ink/paper/fog/butter cream`, font Barlow Condensed + Inter, ảnh local và nhiều motion có chế độ giảm chuyển động; bổ sung responsive cho tablet/mobile.
- Nối About từ nav trang chủ; CTA trên About dẫn tới `/new-in` và `/profile?tab=sourcing`.
- Kiểm tra tĩnh đường dẫn route, import và ba asset local. Không chạy build/test theo yêu cầu phiên làm việc.

## 2026-10-06 — Tạm ẩn chỉnh sửa ảnh trong form edit

- Ẩn khu vực preview/chỉnh/thêm/xóa URL ảnh trong chế độ sửa sản phẩm; form vẫn giữ và gửi lại `imageUrls` hiện tại để PUT không xóa ảnh.
- Nút lưu bị khóa cho tới khi tải xong dữ liệu sản phẩm, tránh gửi mảng ảnh rỗng trước khi response về.
- Kiểm tra: rà soát code form và payload. Chưa gọi API thật trong workspace hiện tại.

## 2026-10-06 — Hoàn thiện form sửa sản phẩm

- Thay ô nhập Category ID bằng dropdown danh mục lấy từ `/api/Categories?isActive=true`, cùng kiểu chọn thương hiệu.
- Form sửa hỗ trợ chỉnh sửa URL ảnh, thêm/xóa URL, preview và giới hạn 5 URL; gửi mảng `imageUrls` theo PUT schema đã xác nhận.
- Kiểm tra: rà soát JSX, state handlers và payload. Chưa gọi API thật trong workspace hiện tại.

## 2026-10-06 — Đồng bộ field PUT product

- Đối chiếu schema người dùng cung cấp cho `PUT /api/Products/{id}`; form edit giữ đúng JSON keys và bảo toàn giá trị `condition: 0` / `stockQuantity: 0`.
- Danh sách sản phẩm đọc tồn kho từ `stockQuantity`, có fallback `quantity` cho response cũ.
- Kiểm tra: rà field trong payload và mapping list/form. Chưa gọi API thật vì backend không có trong workspace.

## 2026-10-06 — Future plan giao hàng và payOS

- Bổ sung rule trong `AGENTS.md` và `future-plan-delivery-payment.md`: trang shipper cập nhật tiến độ, state thanh toán/giao hàng tách biệt, backend xác minh payOS trước khi customer thấy thành công.
- Đối chiếu hiện trạng OrderList/OrderDetail, profile orders và PDP checkout: hiện mock/local, chưa có order/payment/shipment API. Đối chiếu tài liệu payOS chính thức về payment link, return URL và webhook signature.
- Kiểm tra: tài liệu và liên kết context; không thay mã ứng dụng. Chưa xác minh backend/contract; COD, bằng chứng giao và quy trình giao lại là quyết định sản phẩm còn mở.

## 2026-10-06 — Khởi tạo

- Đọc cấu trúc, route, service, hook, component, page, data mock, CSS và design system; ghi kiến trúc, flow, bản đồ API, UI, bản đồ file và khoảng trống. Đối chiếu lại Home/listing swatch và menu đổi role của admin để ghi đúng các vấn đề đang có.
- Tạo 2 skill trong `context/skills` và `AGENTS.md` để các task sau đọc lại context, cập nhật tài liệu liên quan sau khi hoàn tất.
- Kiểm tra: `npm.cmd run build` thành công, có cảnh báo bundle lớn; `npm.cmd run lint` dừng vì thiếu `eslint.config.*`.
- Chưa xác minh: API backend không nằm trong repo; contract ghi lại từ frontend, không coi là tài liệu backend chính thức.

## 2026-10-07 — Đối chiếu môi trường PayOS giữa hai máy

- Bổ sung bằng chứng rằng PayOS hoạt động trên máy người tạo; điều này chuyển ưu tiên chẩn đoán sang kiểm tra chênh lệch cấu hình hoặc phiên bản backend trước khi kết luận lỗi thuộc nền tảng PayOS.
- Ghi rõ shell local không có biến PayOS/User Secrets, nhưng không đọc được environment riêng của process backend do CIM Access Denied. Không lưu giá trị bí mật.
- Kiểm tra: rà lại `PayOsService` và `PaymentService`, xác nhận checkout lỗi được backend chuyển thành 409; chưa gọi thanh toán thật, chưa sửa backend.
- Còn mở: đối chiếu commit/binary, nguồn cấu hình PayOS và log upstream đã lược bỏ bí mật trên máy người tạo và máy đang lỗi.

## 2026-10-07 — Cấu hình API cho frontend deploy Render

- Thêm `apiUrl()` đọc `VITE_API_BASE_URL` để `authFetch`, đăng nhập quản trị và `AuthModal` gọi API qua backend host production; khi không đặt biến, local vẫn dùng Vite proxy.
- Ghi hướng dẫn cấu hình biến Render và CORS backend vào `context/render-deployment.md`.
- Kiểm tra: xác nhận Vite proxy đang trỏ `localhost:5000`; lần kiểm tra này Swagger local không phản hồi, trang Render không truy cập được qua công cụ duyệt. Chưa xác minh domain backend/CORS nên chưa thể cấu hình giá trị deploy cuối cùng.
- Còn mở: cung cấp backend public URL hoặc triển khai backend; đặt `VITE_API_BASE_URL` trên Render rồi redeploy, đồng thời allow origin frontend trong CORS backend.
- Đối chiếu thêm `REWEAR.API/Program.cs`: source backend hiện không có `AddCors`/`UseCors`; ghi nhận cần allowlist origin Render ở backend, chưa xác minh cấu hình deploy.

## Cập nhật backend CORS cho Render (2026-10-07)

- Thêm CORS policy vào `REWEAR.API/Program.cs`, chỉ cho phép origin frontend `https://rewear-wyb0.onrender.com` và các header/method API cần thiết.
- Kiểm tra: đọc lại vị trí đăng ký policy và middleware; chưa build hoặc kiểm tra backend live. Cần deploy backend để policy có hiệu lực.
- Còn mở: đặt `VITE_API_BASE_URL` của frontend Render bằng public backend origin; redeploy frontend và backend, rồi xác nhận request/CORS trên DevTools.

## 2026-10-07 — Chuẩn bị backend chạy trên Render

- Sửa Dockerfile backend từ Windows container và đường dẫn sai sang multi-stage Linux .NET 10; cấu hình bind `0.0.0.0:10000` cho Render. Backend source đã có CORS allowlist cho frontend.
- Ghi checklist deploy backend, cấu hình MongoDB/JWT/Cloudinary/PayOS trong Render Environment, và nối URL public qua `VITE_API_BASE_URL`.
- Kiểm tra: rà lại Dockerfile path, port và CORS middleware bằng đọc mã; chưa build Docker/.NET, chưa deploy Render, chưa xác minh URL backend public.
- Còn mở: backend owner commit/deploy đúng repo, cung cấp API URL; frontend Render cần set env và redeploy.

## 2026-10-17 — Cân chiều cao thanh điều hướng storefront

- Đồng bộ nền menu, link active, logo và action pill về 44px; căn tâm trong nav 68px; giữ pill bo tròn khi cuộn nav trên màn hình hẹp. Chỉ áp dụng wrapper storefront ngoài Home.
- Kiểm tra trực quan route Nữ ở 375/1024/1440/1893px; nav giữ trong viewport. Chưa chạy lại production build cho thay CSS thuần.


## 2026-10-17 — Đồng bộ navbar ngoài Home theo Home

- Bỏ CSS global thử nghiệm từng làm đổi Home và override navbar trắng/44px ngoài Home; listing, About, World, Profile, PDP trở lại pill 38px/menu 38px/link 30px và nền kính xám theo `HomePage.css`. PDP dùng class `rw-nav`, Profile/World bổ sung Search/Cart/Account; giữ back link PDP. Mobile ngoài Home dùng menu cuộn và action icon để đủ chỗ.
- Kiểm tra: `npm.cmd run build` thành công (4021 modules, cảnh báo bundle lớn); Playwright fixture kiểm tra Home và 7 route storefront ở 375/1440px, không document overflow; đo màu/kích thước navbar, kiểm tra search PDP đến catalog, cart drawer trên catalog/Profile, không có pageerror trong lượt tương tác.
- Còn mở: Home mobile hiện menu chỉ rộng khoảng 10px tại 375px; không chỉnh Home trong task này. API thật, thiết bị thật/Safari/Firefox chưa thử. Checkout/payment và admin giữ header/flow riêng. `npm.cmd run lint` chưa chạy được vì repo thiếu `eslint.config.*`.
