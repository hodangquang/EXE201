# Theo dõi gu đồ — triển khai local 25/10/2026

## Đã chạy trong source và API local

Member vào **Tài khoản → Theo dõi gu đồ** (hoặc từ catalog) để lưu một bộ tiêu chí gồm nhiều danh mục, cỡ, màu và giá tối thiểu/tối đa. Nhiều lựa chọn trong một nhóm dùng OR; các nhóm có giá trị dùng AND. Màu so khớp không dấu theo một phần tên màu; cỡ so khớp chính xác sau chuẩn hóa, “Một cỡ” khớp “Free Size”. Cần ít nhất một tiêu chí, tối đa 8 lựa chọn trong mỗi nhóm và khoảng giá nguyên VND hợp lệ. Các tiêu chí do khách lưu trên server, gắn tài khoản Member đã xác thực; API không tin userId từ body.

Khách bật/tắt **Báo trong tài khoản**; email là lựa chọn thêm và mặc định tắt. Worker backend quét mỗi 60 giây sau khi ứng dụng khởi động, bao trùm các cách xuất bản: tạo Product trực tiếp, kích hoạt preview, bán lại từ kho và sản phẩm upcycling. Chỉ xét sản phẩm đang hoạt động, `isPreview=false`, `isUnique=true`, `status=Available`, tồn dương và thời điểm mở bán sau `ActiveSince` của bộ tiêu chí. Khi sửa tiêu chí hoặc bật lại theo dõi, `ActiveSince` được đặt lại để không báo các món cũ. Nếu một món bán hết trước vòng quét, nó không tạo thông báo trễ. Mỗi cặp tài khoản/sản phẩm có ID thông báo cố định, tránh trùng khi quét lại hoặc chạy nhiều API instance.

Thông báo trong tài khoản có ảnh/tên/giá tại lúc mở bán, đánh dấu đã đọc, tự tải lại khi ở trang theo dõi và dẫn tới trang sản phẩm hiện tại. Avatar tài khoản hiện số thông báo chưa đọc; chỉ chủ tài khoản đọc hoặc đánh dấu đã đọc thông báo của mình. Email được gửi qua SMTP hiện có khi khách bật thêm; sender có giới hạn thời gian, worker thử tối đa 3 lần và kiểm tra lại opt-in trước khi gửi. Chưa xác minh khả năng phát email thật hoặc site URL trên bản deploy; tùy cấu hình `StyleAlerts:SiteBaseUrl` hoặc `PayOs:AppBaseUrl` email có thể kèm link sản phẩm, nếu không vẫn có tên/giá và chỉ dẫn mở REWEAR. Email là best effort; thông báo tài khoản không phụ thuộc gửi email thành công.

## Contract mới từ source

- `GET /api/style-watch`: bộ tiêu chí của Member hiện tại, hoặc mặc định chưa bật.
- `PUT /api/style-watch`: lưu JSON `{categoryIds, sizes, colors, minPrice, maxPrice, isEnabled, emailEnabled}`. Trả 400 khi giá trị/nhóm không hợp lệ, 403 nếu không phải Member đã xác thực.
- `GET /api/style-watch/notifications`: 50 thông báo gần nhất của Member, không trả trạng thái gửi email nội bộ.
- `POST /api/style-watch/notifications/{id}/read`: đánh dấu đã đọc, 404 khi ID không thuộc tài khoản.

Tất cả endpoint cần JWT role Member; không có endpoint ghi sở thích hoặc thông báo của người khác. Collection mới `StyleWatches` và `StyleMatchNotifications`, không cần migration dữ liệu cũ; có index danh sách thông báo theo user/thời gian. Worker đọc catalog và preference, không sửa Product hoặc tồn kho.

## Bằng chứng và giới hạn

Frontend build Vite thành công (4039 modules); .NET build/publish Release thành công, 61/61 backend tests đạt trên MongoDB test tách biệt. Bài test mới xác nhận lọc món mới/độc bản/preview, so khớp màu tiếng Việt và Free Size, không báo lặp, từ chối tiêu chí sai, quyền Member/owner và tắt email trước lần thử lại. API local `127.0.0.1:5000`: GET Products trả 6 món; GET style-watch không đăng nhập trả 401. Trang `127.0.0.1:5173/profile?tab=style` trả 200. Chưa có kiểm thử browser bằng tài khoản Member thật, chưa gửi email thật, chưa deploy. Hiện catalog local có 1 món mở bán trước tính năng và 5 preview; không có thông báo cũ được tạo ngược cho món đó.
