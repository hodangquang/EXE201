# Gallery nhiều góc cho REWEAR — 25/10/2026

## Đã áp dụng trên nguồn dữ liệu website

Theo yêu cầu làm phần detail khác nhau giữa các ảnh, đã tạo **18 ảnh AI bổ sung** từ sáu ảnh mặt trước làm tham chiếu: mỗi sản phẩm có ảnh mặt sau, góc nghiêng và cận cảnh riêng. Đã xem và kiểm tra cả 18 kết quả. Ảnh gốc được giữ; bộ hiện có **24 ảnh sản phẩm** (bốn ảnh mỗi món) và **hai ảnh nguyên liệu trước upcycling**.

- PNG lưu tại `public/images/catalog-drafts/`, tên thêm hậu tố `-back`, `-angle`, `-detail`; mỗi ảnh 1024×1536 và dưới giới hạn upload 5 MB. [Prompt chính xác](catalog-gallery-prompts-2026-10-25.md); dùng công cụ image_gen tích hợp, không dùng CLI/API key riêng.
- `public/catalog/rewear-drafts.json` có bốn `imageUrls` và bốn `imageLabels` mỗi sản phẩm: **Mặt trước → Mặt sau → Góc nghiêng → Cận cảnh**. Trang duyệt `/products/drafts` cũng xem/tải được đầy đủ bộ ảnh.
- Đã upload **18 ảnh mới lên Cloudinary thật**, cập nhật gallery trên sáu bản ghi Products hiện có. Giữ nguyên ID, ảnh đầu tiên đang dùng làm đại diện, ảnh nguyên liệu trước tái chế, giá, tồn, trạng thái preview và các dữ liệu vận hành khác.
- API đang chạy bằng build `.artifacts/gallery-api/`, content root/môi trường Development như trước. Vite đã khởi chạy lại cổng 5173 sau gián đoạn tài nguyên. Chưa deploy hosting.

## Thay đổi UI và contract

Product/DTO thêm danh sách tùy chọn `ImageLabels`; API trả `imageLabels` khớp thứ tự `imageUrls`. ProductService chỉ xuất nhãn khi số lượng khớp; sửa thứ tự/bộ URL bằng chức năng cập nhật thông thường sẽ xóa nhãn cũ để tránh mô tả sai. Adapter hook bỏ URL lặp, thêm `label` và alt tiếng Việt; dữ liệu chưa có nhãn dùng “Ảnh n”.

PDP có bốn nút tên góc chụp, trạng thái chọn qua `aria-pressed`, vùng điều khiển có nhãn truy cập và vùng bấm 44 px. Nút có thể xuống dòng khi hẹp, không tràn ngang. Ảnh phần chi tiết mặc định chọn cận cảnh; thay bộ ảnh cùng ID cũng đặt lại đúng ảnh chi tiết.

Conveyor dùng một bộ bốn góc khác nhau theo thứ tự, chỉ nhân bộ đầy đủ để nối vòng animation. Không nhân một ảnh thành bốn vị trí liên tiếp như trước; dữ liệu một ảnh sẽ dừng chuyển động và không hiện nút pause không cần thiết. Vẫn giữ phóng to và đóng bằng Escape. Nhãn AI/preview và khóa mua hàng tiếp tục hoạt động.

## Cơ chế cập nhật gallery

`CatalogGalleryUpdate.cs` dùng batch `rewear-proposed-2026-10-25-views-v1`, chỉ cập nhật `imageUrls`, `ImageLabels`, `updatedAt`, `Version` trên đúng sản phẩm preview của collection. Upload trước, sau đó cập nhật sáu gallery và marker trong Mongo transaction. Kiểm tra version và bộ URL cũ, không đè gallery vừa được người vận hành sửa. `CatalogGalleryUpdates` lưu bộ ảnh trước đó để đối chiếu. Chạy lại revision đã hoàn tất trả `AlreadyApplied=true`, không upload hay reset dữ liệu.

CLI có chế độ `--gallery-only`, mặc định chỉ kiểm tra; thêm `--apply` mới ghi. Vẫn đối chiếu tập ID giữa API localhost:5000 và Mongo trước khi chạy. Không có endpoint công khai để cập nhật hàng loạt. Chế độ thay catalog trước đó vẫn hoạt động riêng và đã được đánh dấu hoàn tất.

## Bằng chứng

- Kết quả apply: `Applied=true`, `Galleries=6`, `UploadedImages=18`; kiểm tra lại: `Applied=false`, `AlreadyApplied=true`, `UploadedImages=0`.
- API thật trả sáu sản phẩm, mỗi món **bốn URL riêng, bốn nhãn đúng thứ tự**. Journey giữ một ảnh trước cho từng Upcycled, không có ảnh trước cho SecondHand, trả bốn ảnh sau/hiện tại.
- Backend build: **0 lỗi, 0 cảnh báo**. **3/3 test gallery đạt** trên database GUID riêng với uploader giả: bảo toàn ID/ảnh trước/ảnh đại diện/giá/tồn và idempotency; upload lỗi không thay gallery; không đè thay đổi đồng thời. TRX: `REWEAR.Tests/TestResults/gallery-tests.trx`.
- Frontend build thành công: **4039 modules**, còn cảnh báo bundle lớn; output `.artifacts/gallery-frontend/`.
- `tools/qa/catalog-gallery.cjs`: **168/168 kiểm tra đạt** qua website localhost:5173, API và ảnh Cloudinary thật, không intercept/fixture và không gửi API ghi. Kiểm tra cả sáu món ở **1440/768/390 px**, bốn góc liền nhau khác nhau, cận cảnh mặc định, đổi từng nút đúng URL/ảnh giải mã được, aria-pressed, không tràn ngang, phóng to/Escape và bảo toàn ảnh trước. Kết quả/screenshot tại `.artifacts/gallery-qa/`.
- Lượt build/test chạy song song đầu tiên bị lỗi thiếu bộ nhớ máy; chạy lại tuần tự, tắt shared build servers và giới hạn Mongo test cache đã đạt các kết quả trên. Không dùng database website cho unit/integration tests.

## Còn mở

Đây vẫn là ảnh minh họa AI, không xác nhận hình học/chất liệu/khuyết điểm của hiện vật. Các sản phẩm tiếp tục là preview, chờ hàng thật trước khi nhận đơn. PNG nguồn tổng khoảng **68,9 MB**; storefront dùng ảnh Cloudinary có `q_auto/f_auto`, bản nháp/tải file vẫn dùng PNG gốc. Chưa tạo các biến thể kích thước responsive, chưa QA Safari/Firefox/thiết bị thật hoặc deploy hosting. Script QA bản nháp đã chỉnh kỳ vọng số ảnh 5 (upcycled: 1 trước + 4 sau) và 4 (bán lại), chưa chạy lại toàn bộ bộ fixture đó trong task này.
