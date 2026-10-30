# Context dự án REWEAR

> **27/10/2026 — chỉ tái chế:** Định hướng hiện tại: **chỉ tái chế**, bỏ nhánh bán lại đồ nguyên trạng. Chỉ đăng bán mới qua dự án tái chế đã QC; chặn tạo sản phẩm/mở preview trực tiếp. Hàng cũ khác Upcycled không hiển thị công khai hoặc mua được; dữ liệu lịch sử được giữ. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> Trung tâm thông báo đã thêm trong source local 25/10/2026: Member xem đơn, giao hàng, thu mua và món hợp gu trong `/profile?tab=notifications`; Admin/Staff/Shipper xem `/notifications`, có badge và đánh dấu đã đọc theo người. [Contract, kiểm thử và giới hạn](notifications-2026-10-25.md). Chưa nghiệm thu deploy/live.

> Theo dõi gu đồ đã triển khai local 25/10/2026: Member lưu danh mục/cỡ/màu/giá và chọn báo trong tài khoản, email opt-in; worker quét món độc bản mới mỗi 60 giây. [Contract, bằng chứng và giới hạn](style-watch-implementation-2026-10-25.md). Ghi chú đề xuất bên dưới là trạng thái trước triển khai.

> Đánh giá tính năng mới 25/10/2026: [cơ hội nổi bật và ưu tiên](feature-opportunities-2026-10-25.md). Đây là đánh giá ban đầu; mục Theo dõi gu đồ hiện đã triển khai local, các mục khác vẫn là đề xuất.

> Rà soát nghiệp vụ 25/10/2026: xem [báo cáo hiện trạng](business-flow-audit-2026-10-25.md). Source local đã bỏ lối vào demo quản trị, sửa trạng thái đơn/thanh toán và chặn ẩn sản phẩm đang giữ trong đơn. API local hiện có 1 món mở bán và 5 preview; các ghi chú cũ nói cả 6 đều preview là snapshot trước đó. Chưa xác minh ảnh với hiện vật hoặc bản deploy.

> Trang `/products/drafts` hiện được ghi rõ là **Bản lưu ý tưởng** từ tệp JSON tĩnh. Sáu mẫu đã ở Danh sách sản phẩm API; trang lưu không thay đổi trạng thái bán hay tồn. Đã bỏ hướng dẫn nhập tồn/ảnh trước-sau lỗi thời ở bản lưu (25/10/2026).

> Quy trình độc bản 25/10/2026: màn quản trị không nhập tồn kho hoặc yêu cầu ảnh trước/sau khi đăng bán preview. Admin xác nhận món đồ đang có, chọn tình trạng và bấm **Đăng bán 1 món**; backend tự đặt tồn 1 và `IsUnique=true`. Sản phẩm tạo mới cũng tự có đúng một món. Ảnh hiện có được giữ nguyên, kể cả metadata ảnh đề xuất; sáu preview chưa được Admin xác nhận nên vẫn tồn 0. Xem `api-contract.md`, `user-flows.md`.

> Lịch sử trước khi đơn giản hóa đăng bán 25/10/2026: Admin vào **Sản phẩm → Chỉnh sửa** để sửa tồn hàng đang bán. Sáu món đề xuất vẫn preview/tồn 0 cho đến khi xác nhận số món, tình trạng, biên bản và ảnh hiện vật (upcycling cần ảnh trước/sau). Chưa có hàng thực tế nên chưa kích hoạt sáu món. Xem `api-contract.md` và `user-flows.md`.

> Rà luồng kiểm định 25/10/2026: [trạng thái sau sửa, bằng chứng và giới hạn](inspection-flow-audit-2026-10-25.md). Thu gom của shipper đã tách khỏi nhận kho; bán lại phải qua QC hiện vật có ảnh. Đây là thay đổi source local, chưa deploy hoặc xác minh hiện vật.

> Cập nhật nội dung 25/10/2026: theo yêu cầu người dùng, đã bỏ nhãn/câu “Ảnh minh họa AI” khỏi giao diện Home, catalog, PDP/journey và màn sản phẩm quản trị. Nguồn ảnh trong metadata vẫn được giữ đúng; gallery bốn góc và trạng thái preview không đổi. Build và 40 kiểm tra storefront qua API thật đạt.

> Gallery nhiều góc 25/10/2026: [mỗi sản phẩm có bốn ảnh riêng, tổng 24 ảnh + 2 ảnh nguyên liệu](catalog-gallery-2026-10-25.md). Đã upload 18 ảnh mới vào Cloudinary, cập nhật database và kiểm tra website/API thật (168 lượt đạt); giữ trạng thái chờ hàng thực tế. Bản API local hiện tại: `.artifacts/gallery-api/`.

> Đã thay dữ liệu cửa hàng 25/10/2026: [ẩn 12 sản phẩm cũ, đưa 6 sản phẩm mới và 8 ảnh Cloudinary vào database](catalog-replacement-2026-10-25.md). Đã xác minh website localhost:5173 + API thật. Bộ mới hiển thị công khai nhưng chờ hàng thực tế (`isPreview=true`), chưa nhận đơn. [Bộ đề xuất gốc](catalog-drafts-2026-10-25.md) vẫn xem tại `/products/drafts`. Vite proxy API về localhost:5000; chưa deploy hosting.

> Cập nhật giao hàng 25/10/2026: đọc [nghiệm thu vận chuyển và Đơn mua](shipping-acceptance-2026-10-25.md). Shipper dùng lại layout/màn quản lý Admin với quyền riêng; Member gộp Lịch sử vào Đơn mua và theo dõi ngay trong từng đơn. Đã kiểm thử local, chưa xác minh deploy/live.

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

Thương hiệu hiển thị là **REWEAR**; nội dung giao diện do dự án kiểm soát dùng tiếng Việt. Quy tắc chi tiết ở `AGENTS.md` và `skills/ui-design/SKILL.md`.

Context được bổ sung đến **2026-10-24**. Workspace hiện có frontend React và source backend trong `Rewear_BackEnd/`; đã đối chiếu nghiệp vụ từ code local nhưng chưa xác minh phiên bản đang deploy hoặc giao dịch live. Các snapshot API/flow cũ chủ yếu suy từ client và có chỗ khác backend mới; ưu tiên phần đính chính và `business-overview-2026-10-24.md` khi đọc nghiệp vụ hiện tại.

## Cách đọc

- `business-overview-2026-10-24.md`: nghiệp vụ mua/thu mua đồ cũ, vai trò, order/payment/shipping, trạng thái trong source backend và các chỗ FE/BE còn lệch; phân biệt với mock và tích hợp live chưa kiểm chứng.

- `ui-audit-2026-10-24.md`: phân tích UI các trang khách hàng ngoài Home/navbar, số đo Chromium với fixture và thứ tự cải thiện đề xuất. Trang Giới thiệu đã được chỉnh sau audit; trạng thái hiện tại ở `design-ui.md`.

1. `architecture.md`: công nghệ, cấu trúc, state, xác thực, phân vai.
2. `routes-and-screens.md`: route, màn hình, nguồn dữ liệu, hành động.
3. `user-flows.md`: hành trình storefront, sourcing, quản trị.
4. `api-contract.md`: endpoint, payload, response assumptions, nguyên tắc tích hợp.
5. `design-ui.md`: giao diện thực tế, token, responsive, cải tiến UI.
6. `source-map.md`: bản đồ file và nơi bắt đầu đọc khi sửa từng module.
7. `known-gaps.md`: chỗ demo, rủi ro đã thấy, ưu tiên cải thiện.
8. `future-plan-delivery-payment.md`: trạng thái tích hợp shipping frontend hiện tại và định hướng còn mở cho shipper, giao hàng, payOS; phân biệt endpoint đã nối với flow/backend chưa kiểm chứng.
9. `CHANGELOG.md`: lịch sử cập nhật context theo task.
   `editorial-ui-2026-10-18.md`: nâng cấp ảnh/chuyển động ngoài Home, nguồn ảnh và bằng chứng QA.
   `ui-qa-2026-10-17.md`: phạm vi QA ngoài Home, thay đổi UI/tương tác, bằng chứng browser và giới hạn kiểm tra.
10. `payment-checkout-audit.md`: đối chiếu lỗi tạo link PayOS với backend đang chạy, mã backend và tài liệu payOS; ghi rõ phần backend cần sửa.

## Skill trong repo

- `skills/ui-design/SKILL.md`: dùng khi sửa hoặc thiết kế storefront và admin UI.
- `skills/api-integration/SKILL.md`: dùng khi tích hợp API, auth, loading, dữ liệu server.

Các skill nằm trong repo để người và coding agent đọc qua `AGENTS.md`; không phụ thuộc việc Codex cài skill ở máy riêng. Sau mỗi task, sửa tài liệu liên quan và ghi changelog. Không chép lại toàn bộ mã nguồn vào context.

## Chạy và kiểm tra

`npm.cmd install`, `npm.cmd run dev`, `npm.cmd run build` trên PowerShell Windows. Theo vite.config.js hiện tại, `/api` và `/uploads` cùng proxy tới `http://localhost:5000`. QA local phải đặt `VITE_API_BASE_URL` về API test. Build bộ sản phẩm đề xuất ngày 25/10/2026 thành công (4039 modules) tại `Rewear_BackEnd/.artifacts/catalog-drafts-build`; còn cảnh báo bundle lớn. Build shipping trước đó ở `Rewear_BackEnd/.artifacts/frontend-shipping` vì dist có file bị khóa. `npm.cmd run lint` hiện thất bại vì thiếu `eslint.config.*` (ESLint 10).

11. `render-deployment.md`: cấu hình frontend Render gọi API backend qua `VITE_API_BASE_URL` và yêu cầu CORS production.
12. `../FE_INTEGRATION_GUIDE.md`: tài liệu tích hợp FE do người dùng cung cấp, mô tả checkout trả `data.order.id`, mở PayOS ở tab riêng và polling `GET /api/payments/{orderId}/status`; các ví dụ là contract, chưa thay thế kiểm tra response live.
