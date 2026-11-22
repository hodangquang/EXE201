# Thay bộ sản phẩm trên cửa hàng REWEAR — 25/10/2026

> Điều chỉnh quy trình 25/10/2026: Admin chỉ chọn tình trạng và bấm đăng bán; backend tự đặt độc bản/tồn 1, không yêu cầu tải ảnh trước/sau. Ảnh đề xuất và metadata nguồn ảnh được giữ. Sáu món đã nhập **vẫn preview/tồn 0** vì chưa có thao tác xác nhận hàng; các mô tả yêu cầu ảnh thật/tồn thủ công bên dưới là snapshot trước điều chỉnh này.

> Cập nhật 25/10/2026: đã thêm giao diện Admin nhập tồn và endpoint mở bán preview sau xác nhận hiện vật, tình trạng, ảnh thực tế và tham chiếu kiểm định; upcycling cần ảnh trước/sau. **Chưa chạy endpoint này cho sáu món đang hiển thị** vì chưa có hàng thực tế được xác nhận; dữ liệu hiện tại vẫn preview/tồn 0. Các đoạn dưới ghi lại thời điểm nhập catalog ban đầu.

> Cập nhật sau đó: [gallery bốn góc mỗi sản phẩm](catalog-gallery-2026-10-25.md) đã upload thêm 18 ảnh, tổng hiện tại 24 ảnh thành phẩm + 2 ảnh nguyên liệu. Giữ nguyên sáu ID đã nhập; API local hiện dùng `.artifacts/gallery-api/`. Các con số 8 ảnh bên dưới là snapshot lần nhập catalog ban đầu.

## Kết quả đã áp dụng

Theo yêu cầu thay dữ liệu cũ trong ảnh chụp bằng bộ vừa chuẩn bị, đã đối chiếu database cấu hình Development với danh sách do **API đang chạy tại localhost:5000** trả về. Hai tập mã sản phẩm đang hoạt động khớp nhau trước khi ghi.

- Đã **ẩn 12 sản phẩm cũ/test** bằng `isActive=false`, giữ nguyên mã, tiêu đề, giá, tồn, trạng thái, các liên kết và lịch sử đơn hàng. Không xóa bản ghi cũ.
- Đã thêm **6 sản phẩm mới** với mã backend riêng: hai `Upcycled`, bốn `SecondHand`, nội dung và giá từ `public/catalog/rewear-drafts.json`.
- Đã tải **8 ảnh lên Cloudinary thật**, lưu URL HTTPS trong Products. Dịch vụ upload hiện thêm `q_auto`/`f_auto`; storefront không phải ghép ảnh local vào response API.
- API công khai đã xác minh chỉ trả sáu sản phẩm mới. Home, Mới về, Nam/Nữ dùng chung API này. Chi tiết sản phẩm lấy đúng ID mới từ API, journey trả ảnh trước/sau cho hai món upcycling; bốn món bán lại không có ảnh trước.
- Đã thay bản API cục bộ đang chạy bằng build mới tại `Rewear_BackEnd/.artifacts/catalog-api-v2/`, giữ content root `REWEAR.API`, môi trường Development, URL localhost:5000. Frontend người dùng vẫn chạy cổng 5173. Không deploy frontend hoặc API lên Render.

## Trạng thái hàng hóa và contract

Nguồn đầu vào chỉ là bộ thiết kế/ảnh AI, chưa có hàng thực tế được người dùng xác nhận. Vì vậy các bản ghi mới có `IsPreview=true`, `ImageSource="ai-generated"`, tồn `0`, `HasCostBasis=false`, không có sourcing/payout/project/QC giả. `ProductResponse.condition=null` cho preview; không khẳng định hàng đã được đánh giá “Tốt”. Giá/cỡ trong bộ vẫn là đề xuất.

Sản phẩm preview có thể hiện trên catalog (`isActive=true`, `status=Available`) nhưng **không mua được**. Card có nhãn AI và “Sắp mở bán”; nút PDP và thanh mua nhanh bị khóa. Backend kiểm tra preview trong cart add/update/read, checkout và điều kiện giữ kho nguyên tử; không dựa riêng vào việc ẩn/khóa nút frontend.

Product thêm metadata `CatalogCollectionId`, `CatalogSku`, `IsPreview`, `ImageSource`, `BeforeImageUrls`, `TransformationDescription`. DTO public chỉ thêm `isPreview`, `imageSource`; condition nullable chỉ để không bịa tình trạng preview. Journey DTO thêm hai field này, trả `beforeImages`/`afterImages` HTTPS; với preview luôn không có timeline và `isComplete=false`. Luồng journey của hàng vận hành thật tiếp tục dùng dự án Completed và các mốc đã lưu.

Hook `usePublicProducts` đã bỏ ảnh Unsplash đoán theo tên sản phẩm. Nếu API không có ảnh, card dùng placeholder, không biến ảnh không liên quan thành ảnh hiện vật.

## Cơ chế nhập và khả năng phục hồi

`Rewear_BackEnd/tools/CatalogImport` là lệnh bảo trì tường minh, mặc định chỉ kiểm tra. Nó đọc cấu hình Development và biến môi trường, so tập ID API/Mongo trước khi upload/ghi, chỉ thao tác trên 12 ID đã chụp lại trong mã lệnh. Không có endpoint public nhập catalog và không seed tự động khi API khởi động.

`CatalogReplacement` kiểm tra ảnh, loại sản phẩm và giá; upload trước, rồi tạo sáu bản ghi và ẩn danh sách cũ trong cùng Mongo transaction. Nếu danh sách thay đổi trong lúc chuẩn bị sẽ dừng. Collection `CatalogReplacements` lưu batch và visibility trước đó, cùng các ID mới. Chạy lại batch đã hoàn tất trả `AlreadyApplied=true`, không tạo sản phẩm hoặc upload ảnh lặp, không reset tồn.

Không sửa/xóa Orders, Payments, SourcingRequests, InventoryItems, UpcyclingProjects hay ledger giữ hàng. Muốn hoàn tác phải đối chiếu batch, giữ nguyên các giao dịch phát sinh và khôi phục visibility phù hợp; không xóa toàn database. Nếu upload thành công nhưng transaction thất bại, ảnh có thể còn trên Cloudinary để kiểm tra/tái sử dụng; không tự xóa asset dùng chung.

## Bằng chứng kiểm tra

- API localhost:5000 sau lần khởi động cuối: **6 active, 2 Upcycled, 4 SecondHand, 6 preview**, không còn tên test/cũ. Kết quả tại `.artifacts/catalog-storefront-qa/api-verification.json`.
- Kiểm tra lần nữa lệnh nhập: `Applied=false`, `AlreadyApplied=true`, `ArchivedProducts=12`, `AddedProducts=6`, `UploadedImages=0`.
- Backend build **0 lỗi, 0 cảnh báo**; regression **47/47** bài đạt trên Mongo replica set test riêng cổng 27029, database GUID (không dùng DB website). Sáu bài mới bao phủ bảo toàn lịch sử/tồn cũ, nhập lặp, catalog drift, bắt buộc trước/sau, upload lỗi, chặn mua preview và journey không bịa mốc. Chạy bổ sung bài cart preview sau sửa cart-read: **1/1** đạt.
- Ba lời gọi test sourcing cũ được cập nhật truyền `AcceptSourcingOfferRequest { OfferVersion }` thay vì int để tương thích chữ ký service hiện tại; không thay hành vi sourcing.
- Frontend build thành công, **4039 modules**; còn cảnh báo bundle lớn. Output `.artifacts/catalog-storefront-build`.
- Chromium **40/40 kiểm tra** với website cổng 5173 + API thật, không intercept/fixture/session giả, ở 1440/768/390 px. Xác nhận đủ ảnh giải mã được, nhãn AI, ảnh trước/sau khác nhau, không có selector trước cho bán lại, nút preview khóa, Home nhận bộ mới, không gọi API ghi. Kết quả và ảnh listing/upcycling tại `.artifacts/catalog-storefront-qa/`.
- TRX: `REWEAR.Tests/TestResults/catalog-regression.trx`, `catalog-tests.trx`, `catalog-cart-read.trx`.

## Còn mở

Chưa xác nhận hàng/tồn/kích thước/chất liệu thực tế; chưa cho phép nhận đơn với bộ preview. Khi có hiện vật, cần quy trình kiểm định và đăng bán thực, thay ảnh hiện vật và xác nhận giá/tồn; không chỉ tăng stock rồi bỏ nhãn để giả lập hàng đã QC. Chưa thêm công cụ chuyển preview thành hàng vận hành. Chưa deploy build mới lên hosting; database/ảnh đã thay thật trong nguồn mà API local đang dùng, nhưng trạng thái frontend/API hosting khác chưa kiểm chứng. SMTP/payOS không nằm trong phạm vi nghiệm thu này.
