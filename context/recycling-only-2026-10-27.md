# REWEAR chỉ tái chế — 27/10/2026

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

Bổ sung hàm operationsApi.addCost còn thiếu để gửi POST /api/operations/projects/{id}/costs. Backend endpoint này đã có; browser fixture xác nhận form gửi đúng route và chỉ báo lưu sau response thành công.

## Bằng chứng kiểm tra

- Frontend production build vào .artifacts/recycling-only/frontend thành công; còn cảnh báo bundle lớn đã có từ trước.
- dotnet test toàn bộ suite tự động: **70 passed, 0 failed**, Mongo replica riêng cổng 27029, database GUID được fixture dọn; không dùng dữ liệu hoặc gateway thật. ShippingBrowserAcceptanceAgainstRealLocalApi là bài Explicit và không thuộc lượt chạy này.
- TRX: .artifacts/recycling-only/test-results/. Regression mới: RecyclingOnlyTests.cs; cập nhật CircularFashionTests, CatalogReplacementTests và fixture Upcycled của CommerceTests/StyleWatchTests theo nghiệp vụ mới.
- Kiểm tra Chrome dùng fixture: **43 lượt đạt (42 tổng thể + 1 ghi chi phí), không có lỗi JavaScript**, ở 1440/768/390 px; đã xem screenshot kho, QC và bản lưu. Bao phủ bỏ resale ở kho/QC/thu mua, tạo dự án, redirect tạo hàng, 2 bản nháp, storefront/PDP ẩn hàng nguyên trạng dù API fixture trả về, preview không có nút mở bán trực tiếp, kho trống/lỗi và kiểm định nhận đồ. Không phải nghiệm thu API deploy/Cloudinary/payOS thật. Kết quả/screenshot tại .artifacts/recycling-only/browser/ và browser-cost/.

## Việc còn mở

Cần deploy đồng bộ backend/frontend để guard server có hiệu lực trên môi trường thật. Chưa kiểm toán/migrate dữ liệu đang vận hành hoặc kiểm chứng hiện vật của sản phẩm Upcycled cũ; không bịa project/QC để sửa provenance. Chưa nghiệm thu giao dịch, upload hoặc email live trong task này. Các script QA ngày 25/10 còn kỳ vọng hai nhánh/6 mẫu là snapshot cũ; dùng tools/qa/recycling-only.cjs cho phạm vi mới.
