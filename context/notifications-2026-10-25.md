# Trung tâm thông báo REWEAR — source local 25/10/2026

## Đã triển khai

- `GET /api/notifications` và `POST /api/notifications/{id}/read` yêu cầu JWT Member, Admin, Staff hoặc Shipper. GET trả `{data: NotificationItem[], unreadCount}`; item gồm `id`, `kind`, `title`, `body`, `link`, `createdAt`, `readAt`. Feed tối đa 50 item mới nhất. Backend kiểm tra người nhận/vai trò; item của người khác trả 404. Dấu đã đọc riêng cho từng tài khoản.
- `NotificationWriter` ghi sự kiện khi lịch sử đơn hoặc yêu cầu thu mua đổi trạng thái, và khi xác nhận chứng từ chi trả thu mua: khách nhận cập nhật đơn/thanh toán/giao hàng/trả hàng và bán đồ cũ; Admin/Staff nhận việc cần theo dõi; Shipper nhận phân công giao/lấy đồ. Nội dung khách không lấy ghi chú nội bộ. Dữ liệu ở `NotificationEvents` và `NotificationReads`.
- Thông báo món mới hợp gu từ `StyleMatchNotifications` được gộp vào feed Member; read chuyển về service gu đồ hiện có. Email chỉ thuộc luồng gu đồ nếu khách opt-in. Thông báo chung hiện chỉ trong ứng dụng.
- Member xem `/profile?tab=notifications` và badge avatar. Admin/Staff/Shipper xem `/notifications` qua Header/Sidebar. Badge kiểm tra lại khi focus hoặc mỗi 30 giây. Mở item sẽ đánh dấu đã đọc rồi điều hướng tới màn liên quan.

## Giới hạn

- Chỉ sự kiện phát sinh sau khi chạy backend mới được ghi; không tự tạo thông báo cho lịch sử cũ. Sourcing chưa có worker phục hồi nếu ghi notification thất bại ngoài transaction của caller; cần outbox/idempotency nếu vận hành nhiều instance hoặc yêu cầu giao tuyệt đối.
- Số chưa đọc hiện tính trên 50 item mới nhất, chưa có push trình duyệt/email tổng quát hoặc cài đặt chọn loại. Chưa nghiệm thu môi trường deploy hay giao dịch live.
- Thông báo xác nhận thanh toán chỉ sinh từ lịch sử trạng thái do backend ghi, không từ return URL/callback trình duyệt.

## Bằng chứng

- .NET API build sạch; frontend Vite build thành công. NUnit 64/64 trên MongoDB replica set test riêng cổng 27029; ba bài mới kiểm tra thông báo đơn/thu mua, quyền chủ tài khoản, đọc riêng của Admin/Staff và API 401/404/204. Sau chỉnh sửa cuối, ba bài notification chạy lại 3/3.
- Chưa chạy browser với tài khoản thật; chưa chạy backend mới với database website.
