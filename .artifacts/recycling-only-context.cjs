const fs=require('fs');
const file='context/recycling-only-2026-10-27.md';
fs.writeFileSync(file,`# REWEAR chỉ tái chế — 27/10/2026

## Quyết định và phạm vi đang có trong source local

Người dùng xác nhận bỏ nhánh resale/bán lại đồ nguyên trạng, chỉ giữ **thu gom/thu mua → tiếp nhận và kiểm định nguyên liệu → đồng ý giá/chi trả → dự án tái chế → hoàn thiện → QC thành phẩm → đăng bán → mua hàng/giao hàng**. Quyết định này thay thế các mô tả hai nhánh và đăng bán trực tiếp ngày 25/10 trong context cũ. Chưa triển khai lên hosting và không sửa database đang vận hành trong task này.

- Kho không còn thao tác QC hiện vật để bán nguyên trạng hay đăng bán trực tiếp. Màn QC chỉ xử lý dự án tái chế. Thu mua sau chi trả dẫn tới dự án.
- Nguyên liệu cũ ở AvailableRaw, QCApproved hoặc Rework được cấp vào dự án khi chưa có ProjectId/ProductId và đã có chứng từ chi trả. Lịch sử, chi phí và ảnh được giữ; không tự chuyển trạng thái hàng loạt. Thành phẩm/hàng hoàn có ProductId không được xem là nguyên liệu chưa cấp.
- Đăng bán mới chỉ qua POST /api/operations/projects/{id}/publish khi dự án QCApproved. Giữ nguyên chi phí nguồn/sản xuất, lịch sử kho, quyền vận hành và điều kiện QC hiện có.
- POST /api/operations/inventory/{id}/qc và /publish được giữ để trả lỗi nghiệp vụ cho client cũ; service từ chối trước khi thay dữ liệu, kể cả nguồn đã chi trả hoặc đã có ProductId. Luồng Sourcing convert-to-product cũ gọi cùng service nên cũng bị chặn.
- POST /api/Products trả 409 trước upload; ProductService.CreateAsync từ chối tạo trực tiếp. POST /api/Products/{id}/activate-preview cũng từ chối. Bản xem trước không được nâng tồn bằng thao tác chọn tình trạng. Route /products/new chuyển tới /upcycling; nút thêm sản phẩm mở danh sách dự án. Form sửa vẫn cập nhật metadata, không thay loại sản phẩm.
- GET danh sách/chi tiết Products công khai chỉ trả ProductType=Upcycled; Admin/Staff vẫn đọc dữ liệu cũ. Public journey không cung cấp hàng khác Upcycled. Hook frontend lọc cả list và PDP để tương thích khi chạy cùng backend cũ.
- Cart add/update/select-all/read, checkout validation và atomic stock reservation chặn hàng không phải Upcycled, kể cả món đã nằm trong giỏ. Tồn, loại sản phẩm và đơn cũ không bị xóa hoặc sửa để giả làm tái chế. Worker gu đồ chỉ phát hiện mới từ Upcycled.
- Không đổi mặc định SecondHand của entity/DTO cũ: bản ghi thiếu loại không được tự suy là đã tái chế. Hàng Upcycled có thật từ trước vẫn giữ trạng thái; task không kiểm toán lại nguồn gốc từng món cũ.
- Quản trị danh sách/chi tiết/form phân biệt dữ liệu cũ ngừng kinh doanh. Storefront chỉ mô tả tái chế. About nêu rõ tái chế và QC. Hoàn hàng của sản phẩm đã bán vẫn giữ quy trình tiếp nhận/kiểm định/hoàn tiền; việc nhập lại kho thành phẩm không phải nhánh thu mua bán nguyên trạng.
- JSON bản lưu và /products/drafts chỉ còn 2 ý tưởng Upcycled, không còn 4 ý tưởng SecondHand. Collection ID mới rewear-upcycled-ideas-2026-10-27; không chạy importer hay tự liên kết các ý tưởng với dự án thật. Không chạy lại import batch lịch sử để suy dữ liệu hiện tại.

## Bằng chứng kiểm tra

- Frontend production build vào .artifacts/recycling-only/frontend thành công; còn cảnh báo bundle lớn đã có từ trước.
- dotnet test toàn bộ suite tự động: **70 passed, 0 failed**, Mongo replica riêng cổng 27029, database GUID được fixture dọn; không dùng dữ liệu hoặc gateway thật. ShippingBrowserAcceptanceAgainstRealLocalApi là bài Explicit và không thuộc lượt chạy này.
- TRX: .artifacts/recycling-only/test-results/. Regression mới: RecyclingOnlyTests.cs; cập nhật CircularFashionTests, CatalogReplacementTests và fixture Upcycled của CommerceTests/StyleWatchTests theo nghiệp vụ mới.
- Kiểm tra browser dùng fixture: đang xác minh; cập nhật kết quả sau khi hoàn tất. Không phải nghiệm thu API deploy/Cloudinary/payOS thật.

## Việc còn mở

Cần deploy đồng bộ backend/frontend để guard server có hiệu lực trên môi trường thật. Chưa kiểm toán/migrate dữ liệu đang vận hành hoặc kiểm chứng hiện vật của sản phẩm Upcycled cũ; không bịa project/QC để sửa provenance. Chưa nghiệm thu giao dịch, upload hoặc email live trong task này. Các script QA ngày 25/10 còn kỳ vọng hai nhánh/6 mẫu là snapshot cũ; dùng tools/qa/recycling-only.cjs cho phạm vi mới.
`, 'utf8');
const notes={
 'README.md':'Định hướng hiện tại: **chỉ tái chế**, bỏ nhánh bán lại đồ nguyên trạng. Chỉ đăng bán mới qua dự án tái chế đã QC; chặn tạo sản phẩm/mở preview trực tiếp. Hàng cũ khác Upcycled không hiển thị công khai hoặc mua được; dữ liệu lịch sử được giữ.',
 'architecture.md':'Chốt nghiệp vụ chỉ Upcycled ở public Products/journey, CartService, OrderService, ProductRepository reservation và StyleWatch scan. Service bán nguyên trạng, tạo sản phẩm trực tiếp và activate-preview đã bị khóa; nguồn được cấp vào dự án tái chế.',
 'user-flows.md':'Flow hiện tại chỉ thu mua → kiểm định nguyên liệu/chi trả → dự án tái chế → QC → đăng bán. /products/new chuyển tới /upcycling; preview chỉ là ý tưởng và không mở bán trực tiếp. Những flow hai nhánh hoặc xác nhận tình trạng để nâng tồn bên dưới là lịch sử.',
 'api-contract.md':'POST inventory/{id}/qc và /publish của operations, Sourcing convert-to-product, ProductService.CreateAsync và activate-preview từ chối nghiệp vụ; POST /api/Products trả 409 trước upload. Public GET Products và journey chỉ Upcycled, cart/checkout/reservation chặn loại khác. Endpoint đăng bán hợp lệ là POST /api/operations/projects/{id}/publish sau QCApproved.',
 'design-ui.md':'Kho và màn QC bỏ nhánh bán nguyên trạng; sourcing chỉ dẫn tạo dự án tái chế. Nút thêm sản phẩm dẫn tới dự án; preview dẫn tới quy trình QC thay vì Đăng bán 1 món. Quản trị ghi rõ dữ liệu cũ ngừng kinh doanh; bản lưu chỉ còn 2 ý tưởng Upcycled. About mô tả tái chế và kiểm định.',
 'routes-and-screens.md':'/products/new redirect /upcycling; /upcycling/qc chỉ còn kiểm định thành phẩm dự án. /inventory bỏ QC/bán nguyên trạng. /products/drafts chỉ còn 2 ý tưởng tái chế; /products/edit/:id không có mở bán preview trực tiếp. Public catalog/PDP chỉ nhận Upcycled.',
 'source-map.md':'Thay đổi chỉ tái chế tập trung ở OperationsPage, SourcingRequests, Products (List/Form/Detail/CatalogDrafts), AppRoutes, usePublicProducts; backend CircularFashionService, ProductService/ProductsController, CartService/OrderService, ProductRepository, ProductJourneyQuery và StyleWatchService. Regression: REWEAR.Tests/RecyclingOnlyTests.cs và tools/qa/recycling-only.cjs.',
 'known-gaps.md':'Nhánh bán lại và đường tạo/mở preview trực tiếp đã khóa trong source. Chưa deploy hoặc migrate database live; hàng Upcycled đã có chưa được kiểm toán nguồn gốc lại. Không tự đổi loại SecondHand thành Upcycled hoặc xóa lịch sử. Các giới hạn luồng mở preview rút gọn bên dưới chỉ còn là lịch sử.',
 'future-plan-delivery-payment.md':'Quyết định phạm vi sản phẩm: chỉ đăng bán mới từ dự án tái chế đã QC. Giữ nguyên trạng thái payment/shipping, quyền shipper và xác nhận tiền từ backend; không triển khai flow giao hàng hay payOS mới trong task này.'
};
for(const [name,note]of Object.entries(notes)){
 const p='context/'+name,s=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');const i=s.indexOf('\n');
 fs.writeFileSync(p,s.slice(0,i+1)+'\n> **27/10/2026 — chỉ tái chế:** '+note+' [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.\n'+s.slice(i+1),'utf8');
}
let p='Rewear_BackEnd/docs/PROJECT_CONTEXT.md',s=fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');const i=s.indexOf('\n');
fs.writeFileSync(p,s.slice(0,i+1)+`\n## Recycling only — 2026-10-27

Current product decision supersedes the resale and direct-preview-publication snapshots below. New retail products may only be published from QCApproved upcycling projects. Legacy inventory QC/resale publication, sourcing conversion, direct Product creation and preview activation reject without mutation; Product POST rejects before image upload. Public Product reads/journey, cart reads/writes, checkout/reservation and new style-watch scans exclude non-Upcycled goods. Admin/Staff may still read historical records. Legacy defaults remain SecondHand to avoid inventing transformation evidence. Paid raw QCApproved/Rework items without project/product can enter a recycling project with preserved cost/history. No live-data rewrite or deployment was performed. Automated isolated Mongo suite: 70 passed. [Scope, frontend and verification](../../context/recycling-only-2026-10-27.md).
`+s.slice(i+1),'utf8');
p='context/CHANGELOG.md';s=fs.readFileSync(p,'utf8');const j=s.indexOf('\n');fs.writeFileSync(p,s.slice(0,j+1)+`\n## 2026-10-27 — Chỉ giữ luồng tái chế

- Người dùng xác nhận bỏ nhánh bán lại nguyên trạng; sửa kho/QC/thu mua/catalog và chặn backend bán trực tiếp, tạo sản phẩm, mở preview bỏ qua dự án. Public/giỏ/checkout chỉ Upcycled; giữ lịch sử và hỗ trợ nguyên liệu QC cũ vào dự án. JSON còn 2 ý tưởng tái chế.
- Kiểm tra: frontend build đạt; backend 70/70 test đạt với Mongo riêng. Browser fixture đang xác minh, sẽ cập nhật trong báo cáo.
- Còn mở: deploy đồng bộ, kiểm toán nguồn gốc/hiện vật Upcycled cũ; không sửa dữ liệu hoặc tích hợp live. [Chi tiết](recycling-only-2026-10-27.md).
`+s.slice(j+1),'utf8');
