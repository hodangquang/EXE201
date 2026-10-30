# Bộ sản phẩm đề xuất REWEAR — 25/10/2026

> Cập nhật UI 25/10/2026: `/products/drafts` được gọi là **Bản lưu ý tưởng** để tránh nhầm với Danh sách sản phẩm API. Sáu mẫu đã được nhập vào catalog; trang này chỉ đọc JSON tĩnh, xem/tải ảnh và không đăng bán. Đã thay cảnh báo nhập tồn và checklist cũ bằng hướng dẫn quay về Danh sách sản phẩm để chọn tình trạng, đăng bán một món độc bản. Nội dung phía dưới là lịch sử giai đoạn soạn bộ đầu tiên.

> Bộ ảnh hiện tại đã bổ sung [bốn góc cho từng sản phẩm](catalog-gallery-2026-10-25.md): 24 ảnh sản phẩm và 2 ảnh nguyên liệu; JSON nguồn và trang duyệt đã cập nhật. Số 8 ảnh trong nội dung lịch sử dưới đây mô tả task tạo bộ gốc.

> **Cập nhật sau task soạn:** người dùng đã yêu cầu thay dữ liệu cũ bằng bộ này. Đã nhập 6 sản phẩm preview vào database nguồn API, ẩn 12 mục cũ và upload 8 ảnh Cloudinary thật. Storefront đã đọc bộ mới; chưa nhận đơn khi chưa có hàng xác nhận. [Kết quả hiện tại](catalog-replacement-2026-10-25.md). Các phần “chưa ghi DB/Cloudinary” bên dưới là snapshot của task soạn ban đầu.

Người dùng chọn **soạn bộ sản phẩm và tạo ảnh trước**, chưa cung cấp danh sách hàng thật. Vì vậy đây là nội dung/thiết kế đề xuất để duyệt, không phải tồn kho đã nhập hoặc sản phẩm có thể nhận đơn.

## Đã chuẩn bị

| Mã đề xuất | Tên | Loại | Giá đề xuất | Ảnh |
| --- | --- | --- | --- | --- |
| RW-UP-001 | Túi tote tái chế từ quần jean | Upcycled | 329.000 đ | Trước: quần jean cũ; sau: túi tote denim |
| RW-UP-002 | Áo sơ mi ghép vải xanh kem | Upcycled | 349.000 đ | Trước: hai sơ mi; sau: một sơ mi ghép vải |
| RW-SH-001 | Áo sơ mi kem dáng thoải mái | SecondHand | 159.000 đ | Một ảnh hiện tại |
| RW-SH-002 | Quần jean xanh ống đứng | SecondHand | 219.000 đ | Một ảnh hiện tại |
| RW-SH-003 | Áo cardigan xanh lá dịu | SecondHand | 189.000 đ | Một ảnh hiện tại |
| RW-SH-004 | Chân váy chữ A xám than | SecondHand | 169.000 đ | Một ảnh hiện tại |

- Nguồn dữ liệu duy nhất: `public/catalog/rewear-drafts.json`, `schemaVersion: 1`, `status: Draft`, `imageSource: ai-generated`. Mã RW-* là mã đề xuất, không phải ObjectId backend.
- Tất cả `stockQuantity`, `condition`, `measurements` để `null`. `proposedPrice` và `proposedSize` là gợi ý; không có giá vốn, lịch sử thu mua, payout hoặc QC được bịa thêm. Thương hiệu của bốn món bán lại chưa được xác nhận (`null`).
- 8 ảnh PNG riêng tại `public/images/catalog-drafts/`, 1024×1536. Tạo bằng công cụ image_gen tích hợp; hai ảnh thành phẩm upcycled được tạo có tham chiếu ảnh nguyên liệu tương ứng. [Bộ prompt đầy đủ](catalog-image-prompts-2026-10-25.md). Ảnh không chứng minh đã sở hữu/thu mua/tái chế món đồ.
- Admin/Staff xem `/products/drafts`, hoặc từ Sản phẩm → **Bộ sản phẩm đề xuất**. Có bộ lọc, tìm kiếm, empty state, fallback ảnh lỗi, modal chi tiết, tải ảnh từng giai đoạn và tải JSON.
- Modal Upcycled hiển thị ảnh trước/sau cạnh nhau (xếp dọc trên mobile); SecondHand chỉ hiển thị một ảnh sản phẩm. Nhãn minh họa AI và bản nháp xuất hiện rõ ràng.
- JSON và ảnh trong `public/` là tài nguyên tĩnh công khai sau build, không chứa dữ liệu riêng tư. Guard Admin/Staff bảo vệ route UI, không bảo mật các tài nguyên tĩnh này.

## Kiểm tra local

- `npm.cmd run build -- --outDir Rewear_BackEnd/.artifacts/catalog-drafts-build`: thành công, 4039 modules; còn cảnh báo bundle JS lớn đã có ở ứng dụng.
- `node tools/qa/catalog-drafts.cjs`: **54/54 kiểm tra đạt**, Chromium 1440/768/390 px; kiểm tra hiển thị, nền thông báo sáng, filter/tìm kiếm, ảnh trước/sau và ảnh bán lại, Escape đóng modal, tải/giải mã đủ 8 ảnh, JSON giữ tồn chưa xác nhận, role Staff và redirect anonymous; không gọi API ghi dữ liệu. Session tổng hợp trong browser profile riêng, không dùng tài khoản khách hàng.
- Bằng chứng: `Rewear_BackEnd/.artifacts/catalog-drafts-qa/results.json` và `catalog-{1440,768,390}.png`. Đây là QA giao diện/tài nguyên tĩnh, không phải kiểm chứng backend live.

## Việc còn mở

Chưa deploy, chưa upload Cloudinary hoặc ghi MongoDB; các trang bán hàng vẫn đọc API như trước. Cần kiểm tra hàng thực tế, kích thước, chất liệu, tình trạng, tồn, giá và ảnh hiện vật trước khi mở bán. Upcycled phải đi đúng quy trình dự án/QC có thật, không dùng bộ ảnh AI để giả lập các mốc vận hành. JSON đề xuất không phải request trực tiếp cho API tạo sản phẩm.

Các ảnh gốc PNG tổng khoảng 19,5 MB; cần tối ưu định dạng/biến thể kích thước nếu dùng trên storefront sau này. Ảnh tải lazy ở lưới đề xuất. Chưa kiểm tra Safari/Firefox hoặc thiết bị thật.

Phát hiện hiện trạng: `usePublicProducts.js` vẫn tự dùng Unsplash khi API thiếu ảnh; task này không đưa các ảnh đề xuất vào fallback bán hàng. `ProductJourneyQuery` chỉ lấy ảnh trước từ dự án Completed có liên kết và chỉ nhận URL HTTPS. Mã `vite.config.js` hiện proxy `/api` và `/uploads` về `http://localhost:5000`; ghi chú Render trong snapshot trước đã cũ.
