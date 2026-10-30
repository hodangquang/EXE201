# Lịch sử context

## 2026-10-27 — Chỉ giữ luồng tái chế

- Người dùng xác nhận bỏ nhánh bán lại nguyên trạng; sửa kho/QC/thu mua/catalog và chặn backend bán trực tiếp, tạo sản phẩm, mở preview bỏ qua dự án. Public/giỏ/checkout chỉ Upcycled; giữ lịch sử và hỗ trợ nguyên liệu QC cũ vào dự án. JSON còn 2 ý tưởng tái chế.
- Kiểm tra: frontend build đạt; backend 70/70 test đạt với Mongo riêng; Chrome fixture 43 lượt đạt (42 tổng thể + 1 ghi chi phí) ở 1440/768/390 px, không có lỗi JavaScript.
- Còn mở: deploy đồng bộ, kiểm toán nguồn gốc/hiện vật Upcycled cũ; không sửa dữ liệu hoặc tích hợp live. [Chi tiết](recycling-only-2026-10-27.md).

## 2026-10-25 — Trung tâm thông báo chung

- Thêm feed/read có phân quyền cho Member/Admin/Staff/Shipper; lưu sự kiện đơn, giao hàng, thu mua; gộp thông báo gu đồ và thêm badge/menu/màn xem. Không tạo dữ liệu thông báo lịch sử cũ.
- Bằng chứng: API và Vite build thành công; NUnit 64/64 trên Mongo test riêng, ba bài notification chạy lại 3/3. [Thiết kế và giới hạn](notifications-2026-10-25.md).
- Còn mở: deploy, browser với tài khoản thật, push/email tổng quát, phục hồi sự kiện sourcing khi lỗi ghi ngoài transaction, và đếm chưa đọc toàn lịch sử.

## 2026-10-25 — Xác nhận phạm vi thông báo hiện tại

- Đối chiếu Header, AccountMenu, tab Theo dõi gu đồ và API: chỉ thông báo món mới hợp gu đã chạy trong source local; chưa có hệ thông báo chung cho đơn/thu mua/giao hàng/Admin.
- Bằng chứng: đọc source `StyleWatchController`, worker, `StyleWatchSection`, `AccountMenu`, `Header`; API/frontend local đang nghe cổng 5000/5173. Không chạy test mới vì chỉ phân tích.
- Còn mở: SMTP/deploy chưa nghiệm thu; các nhóm thông báo khác cần thiết kế và backend riêng nếu triển khai.


## 2026-10-25 — Triển khai Theo dõi gu đồ

- Member lưu loại/cỡ/màu/khoảng giá, bật thông báo tài khoản và opt-in email. Worker quét mỗi 60 giây món độc bản mới; thông báo không trùng theo user/product và chỉ chủ tài khoản đọc/đánh dấu đã đọc. Thêm tab Profile, link menu/catalog và email sender qua SMTP.
- Bằng chứng: Vite build 4039 modules; .NET build/publish Release; NUnit 61/61 trên Mongo test riêng; API local GET 6 Products, endpoint style-watch không đăng nhập 401, frontend route trả 200. [Báo cáo](style-watch-implementation-2026-10-25.md).
- Còn mở: SMTP/email thật và browser Member/deploy chưa nghiệm thu; thông báo không tạo ngược cho món đã mở bán trước khi khách bật theo dõi.


## 2026-10-25 — Đánh giá tính năng nổi bật

- Đề xuất ưu tiên hồ sơ món đồ độc bản (số đo/vết lỗi/ảnh và hành trình xác minh), tiếp theo là theo dõi gu đồ và gửi lại món từng mua. Chưa sửa chức năng hoặc dữ liệu.
- Bằng chứng: đối chiếu `ProductJourney`, DTO/API hành trình, catalog/đơn/thu mua trong source; tham khảo trang chính thức Depop và Patagonia; xem [báo cáo](feature-opportunities-2026-10-25.md). Không chạy build/test vì chỉ phân tích.
- Còn mở: cần ảnh và hiện vật thật; chưa chọn phạm vi triển khai hay nghiệm thu tính năng mới.


## 2026-10-25 — Rà soát nghiệp vụ toàn tuyến và sửa lệch trạng thái

- Chuyển route Staff khỏi trang demo sang thu mua thật; bỏ chuông thông báo mẫu và lối vào khuyến mãi/cài đặt giả. Sửa chi tiết/danh sách sản phẩm, form tình trạng bắt buộc, bộ lọc Đơn mua và nhãn enum. Backend chặn ẩn món đang giữ trong đơn (409).
- Bằng chứng: frontend build 4037 modules; backend publish Release; NUnit 57/57 trên MongoDB test riêng; API local bản mới GET 6 món (1 mở bán, 5 preview), mở bán không đăng nhập trả 401. Chi tiết ở [báo cáo](business-flow-audit-2026-10-25.md).
- Còn mở: xác minh hiện vật/ảnh của túi tote đang bán, deploy, PayOS merchant, giao vận và hoàn tiền thật.


## 2026-10-25 — Làm rõ trang Bản lưu ý tưởng

- Đổi nhãn trang/nút từ Bộ sản phẩm đề xuất thành Bản lưu ý tưởng; giải thích đây là JSON tĩnh, sáu mẫu đã ở danh sách API. Bỏ câu nhập tồn, yêu cầu ảnh trước/sau và mô tả “chưa tạo sản phẩm” đã lỗi thời. Giữ gallery, lọc và tải JSON để đối chiếu nội dung gốc.
- Bằng chứng: kiểm tra source CatalogDrafts/ProductList; frontend build 4042 modules thành công (lần đầu thiếu bộ nhớ, chạy lại đạt). Không gọi API ghi hoặc đổi database.
- Còn mở: JSON tĩnh có thể khác thông tin sản phẩm đang bán; dùng Danh sách sản phẩm để xem trạng thái hiện tại.

## 2026-10-25 — Rút gọn đăng bán đồ độc bản

- Theo phản hồi người dùng, bỏ nhập tồn và yêu cầu ảnh trước/sau/mã biên bản khi mở bán. Form preview chỉ chọn tình trạng và đăng bán; API nhận JSON điều kiện, tự đặt độc bản/tồn 1, lưu người/thời gian và giữ ảnh/metadata nguồn ảnh. Tạo mới qua Products cũng luôn độc bản một món; danh sách bỏ cột tồn.
- Bằng chứng: frontend build 4042 modules; backend build/publish đạt; NUnit 56/56 trên Mongo test riêng. API local 5000 đã cập nhật; GET qua 5173 thấy 6 preview/tồn 0, POST JSON chưa đăng nhập trả 401. Chưa gọi mutation cho sáu sản phẩm thật.
- Còn mở: Admin chưa xác nhận sáu hiện vật, ảnh hiện có là nguồn đề xuất; chưa xác minh ảnh/hàng thật hoặc bản deploy hosting.

## 2026-10-25 — Thêm nhập tồn và xác nhận mở bán preview

- ProductForm gửi tồn người quản trị nhập khi tạo và sửa; bảng sản phẩm hiện tồn. Admin xác nhận hiện vật, tham chiếu kiểm định, tình trạng và ảnh thật để mở preview; Upcycled cần ảnh trước/sau. Backend lưu người/thời gian xác nhận. Journey hiện ảnh trước của hàng upcycling xác nhận trực tiếp nhưng không dựng lịch sử QC.
- Bằng chứng: frontend build 4042 modules; backend build/publish thành công; NUnit 55/55 trên Mongo test riêng trước ràng buộc ảnh nhiều góc và 3/3 bài liên quan sau chỉnh. API local 5000 đã chạy bản mới; đọc qua 5000/5173 đều thấy 6 preview, tồn 0; endpoint mở bán trả 401 khi chưa đăng nhập. Không gọi API ghi trên sáu bản ghi thật.
- Còn mở: sáu món vẫn preview/tồn 0 tới khi có hiện vật, ảnh và biên bản; chưa xác minh deploy hosting hoặc giao dịch mua live.

## 2026-10-25 — Rà và siết luồng kiểm định thực tế

- Tách shipper đã lấy đồ khỏi nhân viên kho đã nhận; yêu cầu liên hệ/địa chỉ/giờ hẹn thật, chặn nhảy/lùi trạng thái thu gom. Bỏ số điện thoại/giờ hẹn mẫu.
- Bán lại bắt buộc QC hiện vật đạt với ảnh, dùng đúng ảnh/tình trạng đã kiểm định; bỏ đăng bán tắt ở màn nguồn hàng và giá/mô tả/tỷ lệ độ mới tính sẵn. Bổ sung ảnh kiểm định nguồn hàng, thông tin khách từ API và lược ghi chú nội bộ khỏi response member.
- Bằng chứng: .NET build 0 lỗi/cảnh báo, NUnit 53/53 trên Mongo test riêng; frontend build 4042 modules, Chromium fixture QC 13/13 ở 1440/390px, không ghi dữ liệu thật. QA vận hành tổng quát cũ dừng ở nút Profile đơn hàng ngoài phạm vi QC.
- Còn mở: xác minh hiện vật/chứng từ và deploy; xử lý kết thúc hàng QC không đạt sau chi trả, giải thích công khai khi giá đổi, kiểm toán hàng đã đăng bán trước guard. [Báo cáo](inspection-flow-audit-2026-10-25.md).

## 2026-10-25 — Sửa chi tiết yêu cầu thu mua trên Profile

- Tách phần thân modal thành `SourcingRequestDetail` với CSS riêng; nhãn/giá trị, báo giá thu mua, tình trạng khai báo/kiểm định, bản ghi chi trả và ảnh được trình bày rõ, ảnh không tràn khung. Giữ nguyên API và thao tác đồng ý/từ chối giá.
- Đối chiếu source backend: `SourcingResponse` có `imageUrls`, hai tình trạng, hai giá và `PurchasePayout`; cập nhật các ghi chép cũ nói Profile map sai status hoặc sourcing chưa có bản ghi chi trả. Xác nhận chi trả là bản ghi thủ công, không phải xác nhận từ ngân hàng.
- Bằng chứng: frontend build 4042 modules đạt; Chromium fixture 24/24 kiểm tra 1440/768/390/320px, gồm có/chưa có báo giá, chi trả, ảnh và nội dung dài; không gửi API ghi. Ảnh chụp và kết quả tại `Rewear_BackEnd/.artifacts/sourcing-detail-qa/`.
- Còn mở: chưa kiểm tra với dữ liệu tài khoản thật hoặc bản deploy; nghiệp vụ chuyển khoản tự động không thuộc thay đổi này.

## 2026-10-25 — Kiểm tra nơi tăng tồn kho trên giao diện

- Rà ProductForm, Products và Operations/Inventory: chưa có ô nhập/tăng stock; form chỉ giữ existingStock từ API và gửi lại qua PUT. Không hướng dẫn người dùng tới một nút/ô chưa tồn tại.
- Xác nhận tăng stock không đủ mở bán sáu preview do guard riêng IsPreview. Còn thiếu UI chỉnh tồn và thao tác mở bán có kiểm soát.
- Bằng chứng: đối chiếu source ProductForm/Operations và contract/update service; không đổi code ứng dụng, không ghi DB, không chạy build/test vì chỉ phân tích.

## 2026-10-25 — Bỏ chữ “Ảnh minh họa AI” khỏi giao diện

- Theo yêu cầu người dùng, bỏ badge/dòng nhãn tại Home, lưới catalog, journey, trang bản nháp và trạng thái detail quản trị; alt ảnh dùng tên/góc chụp. Thêm formatter dùng chung để bỏ câu nhãn trong mô tả hiển thị, gồm mô tả upcycling và nội dung form/detail.
- Giữ metadata nguồn ảnh chính xác, bốn góc, ảnh trước tái chế và trạng thái preview; không thay ảnh hoặc ghi database.
- Kiểm tra: build thành công 4040 modules (còn cảnh báo bundle lớn); QA storefront thực tế 40/40 ở ba kích thước, không API ghi; rà formatter trên mô tả/journey của cả sáu sản phẩm đều không còn câu AI; diff-check đạt. Bằng chứng browser ở `.artifacts/catalog-storefront-qa/`.
- Còn mở: trạng thái hàng thật/deploy hosting như trước; QA fixture bản nháp đã đổi assertion nhãn, chưa chạy lại toàn bộ. Ảnh vẫn là nguồn AI dù giao diện không hiện nhãn.

## 2026-10-25 — Bổ sung bốn góc ảnh riêng cho từng sản phẩm

- Tạo 18 ảnh AI có tham chiếu ảnh gốc, lưu PNG trong repo; upload Cloudinary thật và cập nhật sáu gallery hiện có (24 ảnh sản phẩm + 2 ảnh nguyên liệu). Giữ ID, ảnh mặt trước/ảnh trước tái chế và dữ liệu giá/tồn. Batch gallery có transaction, chống ghi đè đồng thời, snapshot và chạy lại không upload trùng.
- API thêm imageLabels; PDP chọn cả bốn góc theo tên, detail mặc định cận cảnh, không nhân một ảnh thành nhiều góc giả. Nút 44px, hỗ trợ wrap, aria-pressed và phóng to; trang bản nháp cập nhật đầy đủ ảnh/tải file.
- Kiểm tra: backend build 0 lỗi/cảnh báo, 3/3 test gallery; frontend build 4039 modules; 168/168 kiểm tra Chromium qua API/Cloudinary thật ở 1440/768/390 px. Lượt thiếu bộ nhớ ban đầu đã chạy lại tuần tự thành công. API local đang chạy build mới; Vite cổng 5173 đã khởi động lại.
- Còn mở: ảnh vẫn là AI/preview, chưa xác nhận hiện vật/nhận đơn, chưa deploy hosting, chưa có responsive derivatives hoặc QA browser khác. [Report](catalog-gallery-2026-10-25.md), [prompts](catalog-gallery-prompts-2026-10-25.md).

## 2026-10-25 — Thay catalog cũ bằng bộ REWEAR mới trên nguồn API website

- Đã đối chiếu đúng DB/API, ẩn 12 sản phẩm cũ và nhập 6 sản phẩm mới; 8 ảnh đã upload Cloudinary thật. Giữ nguyên ID/tồn/trạng thái và lịch sử đơn cũ; transaction và marker batch ngăn nhập lặp. Khởi chạy API local bằng build mới, không deploy hosting.
- Storefront/Home/PDP hiển thị nội dung API mới, nhãn AI và “Sắp mở bán”; Upcycled có ảnh trước/sau, SecondHand chỉ ảnh hiện tại. Bỏ ảnh Unsplash đoán theo tên. Preview chưa có hàng xác nhận nên tồn 0, condition null và không mua được ở cả FE/BE; không tạo QC/payout/project giả.
- Bằng chứng: build backend 0 lỗi/cảnh báo; regression 47/47 và kiểm tra cart preview bổ sung 1/1; frontend build 4039 modules; Chromium 40/40 kiểm tra qua API thật ở 1440/768/390 px. Chạy lại lệnh nhập trả AlreadyApplied, không tạo/upload lặp. Ba test sourcing cũ chỉnh tham số OfferVersion cho khớp DTO hiện tại.
- Còn mở: xác nhận hàng/tồn/giá/kích thước, quy trình chuyển preview thành hàng đã kiểm định, deploy hosting; không xác nhận payOS/SMTP. [Báo cáo và đường dẫn bằng chứng](catalog-replacement-2026-10-25.md).

## 2026-10-25 — Tái thiết kế giao diện thanh công cụ tìm kiếm và lọc sản phẩm (Catalog Toolbar)

- **Vấn đề trước khi sửa**:
  - Khung `.catalog-tools` dùng nền xám vàng đục `#f7f7f3` với viền dày `#e3e3dc`, padding lớn 18px tạo cảm giác "hộp lồng trong hộp" thô kệch, thiếu tính thẩm mỹ tối giản của thương hiệu thời trang tuần hoàn REWEAR.
  - Các ô tìm kiếm, sắp xếp và bộ lọc có kích thước và bo góc không đồng bộ, dùng mũi tên mặc định của trình duyệt cho select, các nhãn hiển thị rời rạc và thanh kết quả `8 sản phẩm` đơn điệu.
- **Cải tiến & thiết kế mới**:
  - Gộp thành thanh điều hướng tác vụ liền mạch (Action Bar) trên nền trắng tinh tế, viền mảnh cao cấp `#e7e7e0`, bo góc mềm mại 14px và đổ bóng nhẹ đa tầng (`box-shadow: 0 2px 8px -2px rgba(16, 16, 15, 0.04)`).
  - Ô tìm kiếm: Chuyển sang pill input nền xám nhẹ dịu `#f8f8f4`, icon kính lúp màu mực trầm, tự động sáng nền và hiện viền tập trung đen sắc nét khi gõ; bổ sung nút "X" xóa nhanh từ khóa tìm kiếm.
  - Dropdown "Sắp xếp": Bổ sung nhãn `Sắp xếp:`, che mũi tên mặc định của hệ điều hành, thay bằng icon chevron mỏng xoay chuyển nhẹ khi mở, viền và nền đồng bộ.
  - Nút "Bộ lọc": Thiết kế dạng nút tương tác nổi bật, đảo màu nền đen tuyền sang trọng khi mở (`is-active`), badge đếm số lượng bộ lọc đang kích hoạt sắc nét.
  - Ngăn kéo bộ lọc (Filter Drawer): Thiết kế lại panel mở rộng thành card trắng thanh lịch, hiệu ứng trượt êm ái, nhãn nhóm viết hoa tinh gọn (`MÀU SẮC`, `KÍCH CỠ`), select tùy biến che mũi tên mặc định, nút đặt lại dạng dashed viền mỏng.
  - Dòng kết quả & Bố cục: Nâng cấp kiểu chữ đếm sản phẩm với số lượng in đậm sắc sảo (`font-feature-settings: "tnum"`), cân xứng hoàn hảo với cụm điều khiển chuyển cột `BỐ CỤC [2] [4] [8]`.
  - Hỗ trợ toàn diện mobile & responsive: Tự động dàn dòng xếp chồng thông minh khi màn hình nhỏ hơn 767px.
- **Bằng chứng kiểm tra**:
  - File chỉnh sửa: [CatalogPage.jsx](file:///d:/EXE201/src/components/common/CatalogPage.jsx), [NewInPage.css](file:///d:/EXE201/src/pages/Store/NewInPage.css).
  - Build Vite thành công (`npm.cmd run build -- --outDir Rewear_BackEnd/.artifacts/frontend-shipping`), không có lỗi cú pháp.
  - Đã kiểm tra trực tiếp qua browser subagent trên trình duyệt thật tại `http://localhost:5173/new-in`, chụp ảnh màn hình xác nhận trạng thái đóng và mở ngăn kéo bộ lọc đẹp, đồng bộ với phong cách Editorial REWEAR.

- Theo lựa chọn của người dùng: chuẩn bị sáu sản phẩm (hai Upcycled, bốn SecondHand), mô tả/giá/cỡ đề xuất và tám ảnh AI riêng. Không biến thành tồn kho thật hay tạo hồ sơ thu mua/QC giả.
- Thêm trang Admin/Staff `/products/drafts`, nút từ danh sách sản phẩm, bộ lọc/tìm kiếm, modal ảnh trước-sau, tải ảnh/JSON và nhãn AI/bản nháp; ảnh và JSON lưu trong repo. Đổi tiêu đề danh sách thành “Tất cả sản phẩm” để bao gồm cả bán lại.
- Kiểm tra: build Vite thành công (4039 modules), QA Chromium 54/54 kiểm tra đạt ở 1440/768/390 px; kết quả và ảnh chụp ở `.artifacts/catalog-drafts-qa`. [Chi tiết](catalog-drafts-2026-10-25.md), [prompt](catalog-image-prompts-2026-10-25.md).
- Còn mở: xác nhận hàng/giá/tồn/kích thước, thay ảnh hiện vật khi bán thật, tối ưu PNG, nhập dữ liệu theo quy trình backend và deploy. Không có thay đổi backend hay ghi DB live. Xác minh lại vite.config hiện trỏ localhost:5000, khác ghi chú proxy Render cũ.

## 2026-10-25 — Triển khai hoàn chỉnh tính năng Shipper thu gom đồ cũ tận nơi (Inbound Sourcing Pickup)

- **Backend API & Data Model**:
  - Entity `SourcingRequest`: Bổ sung các trường quản lý thu gom: `PickupAddress`, `SenderName`, `SenderPhone`, `PreferredPickupTime`, `PickupNote`, `AssignedShipperId`, `AssignedShipperName`, `PickupStatus`, `PickupAssignedAt`, `PickedUpAt`.
  - Repository & Service: Thêm `GetByShipperIdAsync`, `AssignShipperAsync`, `GetPickupsByShipperAsync`, `UpdatePickupStatusAsync`. Khi Shipper bấm "Đã nhận đồ & Chở về kho" (`PickedUp`), hệ thống tự động đồng bộ sang `CircularFashionService.ReceiveAsync` để tạo bản ghi kho `InventoryItem` với `Custody = "Warehouse"` và chuyển trạng thái `SourcingStatus.Received`.
  - Endpoints mới:
    - `POST /api/sourcing/{id}/assign-shipper`: Staff/Admin phân công Shipper lấy đồ tận nơi cho yêu cầu thu gom đã chốt giá.
    - `GET /api/shipping/my-pickups`: Shipper lấy danh sách cuốc thu gom đồ cũ được giao cho mình.
    - `PUT /api/shipping/pickups/{id}/status`: Shipper cập nhật trạng thái (`OnTheWay` -> `PickedUp`).
- **Frontend & UI**:
  - `ShippingPage.jsx`: Xóa bỏ 100% cơ chế mock `localStorage`, kết nối trực tiếp `shippingApi.myPickups()` và `shippingApi.updatePickupStatus()`. Hiển thị loading, thông báo trống thân thiện khi chưa có đơn gom, hỗ trợ gọi điện thoại và chỉ đường Google Maps.
  - `SourcingRequests.jsx`: Thêm nút và modal "Phân công Shipper" cho các yêu cầu thu gom ở trạng thái `Accepted`. Hỗ trợ chọn nhân viên giao hàng từ danh sách shipper thực tế và cập nhật địa chỉ, số điện thoại, khung giờ hẹn lấy.
  - `src/services/auth.js`: Thêm `myPickups`, `updatePickupStatus`, `assignPickup` vào `shippingApi`.
- **Bằng chứng kiểm tra**:
  - Backend compile thành công (`dotnet build` 0 Warning, 0 Error).
  - Backend API server khởi động thành công trên `http://localhost:5000`.
  - Đã seed thử 2 nhiệm vụ thu gom mẫu có địa chỉ và số điện thoại thật vào DB cho tài khoản `shipper@gmail.com`.
  - Frontend build thành công (`npm.cmd run build -- --outDir Rewear_BackEnd/.artifacts/frontend-shipping`), không có lỗi cú pháp.

## 2026-10-25 — Tái thiết kế toàn diện UI Hồ sơ cá nhân (Profile) theo phong cách Editorial tối giản

- **Cải tiến trực quan & thẩm mỹ**:
  - Loại bỏ các đường cong bo tròn quá khổ (radius 20px/18px) tạo cảm giác nặng nề, đưa về chuẩn kiến trúc sang trọng tối giản (`border-radius: 12px` cho card, `8px` cho fields/inputs, `9999px` cho nút bấm).
  - Tinh chỉnh typography: Tiêu đề chuyển sang font `Barlow Condensed` sắc nét, tỷ lệ cân đối (`32px`), loại bỏ cảm giác "hét chữ" trước đó; loại bỏ chấm vàng viền đen kiểu bia bắn ở eyebrow.
  - Sidebar tài khoản: Thay thế pill đen thô lồi bằng menu tối giản, tinh tế, font 13.5px, hover êm dịu, avatar tròn đen/trắng thanh lịch đồng bộ với navbar storefront.
  - Sổ địa chỉ (`Sổ địa chỉ`): Thay badge "Mặc định" từ màu vàng chuối sang badge đen/trắng tối giản cao cấp (`#10100f`); thẻ địa chỉ có viền mỏng 1px tinh tế, thông tin phân cấp rõ ràng (tên người nhận đậm, số điện thoại, địa chỉ, ghi chú nền xám nhạt); ẩn nút "Đặt làm mặc định" khi địa chỉ đã là mặc định để tránh dư thừa; nút "+ Thêm địa chỉ" chuẩn phong cách pill storefront.
  - Form & Inputs: Viền mỏng 1px `#dcdcd6`, focus ring êm dịu, chiều cao tiêu chuẩn 44px dễ bấm.
  - **Thêm mục quản lý riêng "Theo dõi giao hàng" trong Sidebar tài khoản**: Bổ sung tab độc lập `Theo dõi giao hàng` (`/profile?tab=delivery`) với icon `Truck`. Mục này cung cấp bảng điều khiển chuyên biệt để theo dõi tiến độ các kiện hàng: bộ lọc theo trạng thái (Tất cả, Đang vận chuyển/Chuẩn bị, Đã giao thành công), thẻ lộ trình kiện hàng chi tiết với mã vận đơn, đơn vị vận chuyển, tên shipper, ngày dự kiến giao, timeline thời gian thực và danh sách sản phẩm trong kiện.
- **Bằng chứng kiểm tra**: Đã cập nhật [ProfilePage.jsx](file:///d:/EXE201/src/pages/Profile/ProfilePage.jsx) và [ProfilePage.css](file:///d:/EXE201/src/pages/Profile/ProfilePage.css). Vite HMR cập nhật trực tiếp tại `http://localhost:5173/profile?tab=delivery`.
- **Việc còn mở**: Tiếp tục tối ưu hóa responsive các modal chi tiết trên mobile nhỏ (<360px).

## 2026-10-25 — Bổ sung đầy đủ 2 công đoạn QC trước khi bán và Tạo sản phẩm hoàn thiện (Resale & Upcycling)

- **Chuỗi nghiệp vụ hoàn chỉnh**: Bổ sung đầy đủ công đoạn 4 (Nghiệm thu QC trước khi bán) và công đoạn 5 (Product -> Storefront) cho cả 2 nhánh:
  - **Nhánh Resale (Second-hand)**: Món đồ thu mua sau khi chi trả (`AvailableRaw`) chuyển sang kiểm định nghiệm thu QC làm sạch/khử khuẩn (`POST /api/operations/inventory/{id}/qc`). Nếu Đạt (`QCApproved`), mở nút "Đăng bán Storefront" (`POST /api/operations/inventory/{id}/publish`) kèm đầy đủ thông tin bán lẻ (Tên, Mô tả, Thương hiệu, Danh mục, Giá bán lẻ, Size, Màu sắc, Độ mới, Ảnh). Sản phẩm tự động tạo trên Storefront với loại `ProductType = "SecondHand"`, chuyển trạng thái kho sang `ReadyRetail`, hoàn tất SourcingRequest.
  - **Nhánh Upcycling (Tái chế độc bản)**: Sau quá trình xưởng gia công (`InProgress`), thành phẩm được gửi QC (`QualityCheck`). Nhân viên QC duyệt nghiệm thu (`POST /api/operations/projects/{id}/qc`). Khi Đạt (`QCApproved`), mở nút "Đăng bán thành phẩm" (`POST /api/operations/projects/{id}/publish`) lên Storefront với loại `ProductType = "Upcycled"`, chuyển trạng thái dự án sang `Completed`.
- **Backend & Controller**: Đã bổ sung DTO `PublishResaleRequest`, các phương thức `InspectInventoryAsync`, `PublishResaleAsync`, cùng các endpoint `POST /api/operations/inventory/{id}/qc`, `POST /api/operations/inventory/{id}/publish`, `GET /api/operations/inventory/{id}/inspections`.
- **Frontend & Giao diện Admin**:
  - `OperationsPage.jsx`: Thêm tab phân loại rõ ràng trong màn Kiểm định QC (`Thành phẩm Tái chế (Upcycling)` vs `Hiện vật Thu mua (Resale Second-hand)`). Trong Kho vòng đời, bổ sung trực tiếp các nút hành động theo trạng thái (`Nghiệm thu QC`, `Tạo dự án`, `Đăng bán Storefront`, `Lịch sử`). Modal hỗ trợ upload ảnh hiện vật/ảnh thành phẩm sau xử lý. Drawer chi tiết hiển thị toàn bộ lịch sử kiểm định QC và biến động kho.
  - `SourcingRequests.jsx`: Bổ sung lựa chọn phân luồng `Resale` vs `Upcycling` ngay từ bước kiểm định thu mua; nút `Bán Second-hand` và `Chuyển Upcycling` (tự động điều hướng và điền sẵn mã đồ vào dự án mới).
  - Sửa `vite.config.js` proxy trỏ về Backend local `http://localhost:5000`.
- **Bằng chứng kiểm tra**:
  - Backend build thành công: 0 Warning, 0 Error (`dotnet build Rewear_BackEnd/REWEAR.API/REWEAR.API.csproj`).
  - Backend API server khởi động thành công trên `http://localhost:5000` (Kestrel dev environment).
  - Frontend code sạch sẽ, đã thay `Drawer width` bằng `size="large"` để triệt tiêu Ant Design warning.
- **Việc còn mở**: Thực hiện kiểm thử toàn bộ luồng nghiệp vụ end-to-end trên trình duyệt với tài khoản Staff/Admin và dữ liệu thực.

## 2026-10-25 — Dùng lại UI Admin cho Shipper; gộp Lịch sử vào Đơn mua

- Theo quyết định người dùng, bỏ portal riêng, dùng AdminLayout/Sidebar/Header/ShippingPage theo quyền; Shipper chỉ có Đơn giao của tôi. Member giữ một Đơn mua, mở theo dõi nội tuyến; link lịch sử cũ chuyển về orders. Tracking hiển thị thanh toán, Shipper, mã vận đơn, snapshot và thời gian backend; chi tiết mở cập nhật khi tab hiển thị.
- Hoàn thiện pickup tương thích enum cũ, assignment/history, đổi phân công trước lấy hàng, failure code, idempotency, quyền đọc/ghi, custody kho và migration index v2 không sửa legacy. Sửa đăng ký sự kiện GlobalLoader; shipping dùng loading cục bộ.
- Bằng chứng: 41/41 kiểm thử backend/Mongo đạt; browser test riêng qua API/JWT/Mongo local đạt 19 kiểm tra (390/768/1440px, phân công → lấy → giao → member, menu theo role, history alias, empty/error), không có runtime exception. Build frontend thành công trong output riêng; còn cảnh báo bundle lớn. Chi tiết ở [báo cáo giao hàng](shipping-acceptance-2026-10-25.md).
- Còn mở: chưa deploy/migrate database thật, chưa merchant payOS/Cloudinary/SMTP live; Final Audit rộng và kiểm thử riêng CashEvents/Dashboard/Product Journey chưa hoàn tất. Kết quả local chưa chứng minh production ready.

## 2026-10-25 — Triển khai luồng Jeans → Tote → giao hàng và báo cáo

- Sửa auth/authorization, OTP/email, bỏ debug JWT/TLS bypass/IP gateway cố định; bổ sung Mongo transaction, reservation theo đơn, idempotency checkout/session/webhook và đối soát tiền trễ/sai/thêm. Phân biệt yêu cầu refund với chứng từ hoàn tiền; giữ số tiền đã hoàn độc lập.
- Thêm payout, raw/finished inventory/movement, upcycling/cost/QC, trả người gửi và full-order return/inspection/quarantine. Chuyển inventory/upcycling/QC/orders/dashboard sang API; shipping chọn người giao và bước hợp lệ; Profile có timeline/đồng ý phiên bản giá/yêu cầu trả hàng.
- Bằng chứng: backend build không warning/error; 36/36 NUnit/Mongo test + actual API startup/HTTP, frontend build và 37 lượt Chromium fixture responsive. Số đếm/chạy lại cụ thể ở [báo cáo triển khai](implementation-report-2026-10-25.md). Có migration additive versioned và test chạy lại/không sửa legacy data; Pkcs 10.0.13 restore thành công.
- Còn mở: chưa deploy/migrate database thật, chưa merchant payOS/SMTP/Cloudinary live; partial/excess refunds, historical reconciliation, hiệu năng và regression toàn 16 phân hệ. Giữ phần demo ngoài luồng trọng tâm có nhãn. Không tự chuyển tiền hoặc bịa lịch sử dữ liệu cũ.

## 2026-10-24 — Giải thích nghiệp vụ và đối chiếu backend mới trong workspace

- Thêm `business-overview-2026-10-24.md`: vai trò, sourcing → product, catalog/cart/checkout, payment/order/shipping, hủy/refund và các module demo. Cập nhật README/architecture/API/flow/future plan/known gaps và context backend theo source hiện tại; không sửa mã ứng dụng.
- Bằng chứng: đọc controllers/services/DTO/enums, repository reserve/release/commit, worker hết hạn và policy registration. Xác nhận paid handler chốt Sold ngay khi Paid; mặc định settings 15 phút, service fallback 5; backend có webhook/reconcile/reship/cancel-permanent.
- Phát hiện còn mở: lệch enum sourcing/payment numeric, PUT product multipart/JSON, refund không release Sold, quyền đăng ký/ghi product/Staff shipping và guard chuyển status; source không có payout tự động trong sourcing đã đọc. Dashboard/đơn quản trị và nhiều module vận hành vẫn mock.
- Kiểm tra: rà mã và đối chiếu contract, không build/backend/API live hoặc thanh toán thật; task chỉ tài liệu. Các tích hợp ngoài, race/idempotency và chính sách hủy giao thất bại cần xác minh/chốt riêng.

## 2026-10-24 — Chỉnh UI trang Giới thiệu theo storefront

- Dựng lại nội dung `/about`: câu chuyện + ảnh, ba nguyên tắc gọn, hành trình 4 bước trên nền sáng, FAQ và CTA dùng nút storefront. Bỏ marquee, chữ/section quá lớn, khối nền đen và CSS hero/orbit/ring/reveal cũ; pause vẫn có tại hero chung. Giữ các liên kết hành trình, sourcing và đơn mua; không đổi API, navbar hoặc footer chung.
- Kiểm tra: `npm.cmd run build` thành công (4027 modules; cảnh báo bundle JS ~1,99 MB). Chromium 1440/1024/768/390/320px không có section overflow; bước/FAQ dùng Enter, focus visible, anchor dưới nav và mở cart đều đạt. Reduced motion dừng hero; không có runtime exception trong lượt QA. Bật/tắt About stylesheet trên Home/New In/World không đổi geometry/computed styles của 74/78/78 phần tử nav/hero/footer đã chọn. Ảnh chụp/số đo tạm tại `%TEMP%/rewear-about-ui-qa`.
- Còn mở: backend và mutation không được kiểm thử; QA dùng guest + fixture chặn API chỉ để kiểm tra UI, chưa thử Safari/Firefox/thiết bị thật hay toàn bộ accessibility. Footer newsletter/link placeholder vẫn là demo chung. Lint hiện thiếu `eslint.config.*` theo context, chưa sửa trong task.

## 2026-10-24 — Phân tích UI ngoài Home và navbar

- Thêm `ui-audit-2026-10-24.md`: phân tích thứ bậc nội dung, banner đẩy sản phẩm xuống sâu, thẻ kính PDP, khung lồng Profile, typography và sự khác nhau giữa form/card; đề xuất thứ tự Catalog → PDP → Profile/Checkout → About/World. Chỉ sửa tài liệu.
- Bằng chứng: đọc JSX/CSS và design system; Chromium 1440×900/390×900 trên 7 route bằng fixture chặn API. Đo lưới catalog bắt đầu y≈1377/1230px; chọn 8 cột mobile vẫn có 2 track; đối chiếu radius Profile 18px/Checkout 2px, CTA checkout empty thiếu style. Chưa duyệt riêng Women/Men, tablet hay mọi tab/state. Không chạy build/lint vì không sửa mã ứng dụng.
- Đính chính context: hook hiện dùng ảnh stock fallback sau cập nhật ngày 23; không coi các ảnh đó là ảnh sản phẩm thật. Error catalog còn lẫn empty, loader giữ tối thiểu 2,5 giây.
- Còn mở: triển khai thiết kế đề xuất, QA tương tác/dữ liệu thật/accessibility và hồi quy Home/navbar nếu sửa shared styles. Không tạo đơn, thanh toán hoặc xác nhận backend.

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
