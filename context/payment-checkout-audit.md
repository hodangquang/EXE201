# Kiểm tra lỗi tạo phiên PayOS (2026-10-07)

**Phạm vi thời điểm:** các phát hiện dưới đây thuộc lần đối chiếu backend/PayOS trước khi người dùng cung cấp `FE_INTEGRATION_GUIDE.md` và báo Swagger flow hiện chạy được. Chưa kiểm tra lại backend live trong workspace này; không dùng các lỗi cấu hình ghi dưới đây để kết luận nguyên nhân giao dịch mới. Với giao dịch mới, kiểm tra Network xem frontend có gọi `GET /api/payments/{orderId}/status` và backend trả `paymentStatus: Paid`/`2` hay không.

## Bằng chứng đã đối chiếu

- Backend `Rewear_BackEnd` chạy tại `localhost:5000`; `GET /swagger/v1/swagger.json` trả 200. Mã backend nằm ngoài workspace frontend này. Không gọi checkout thật hoặc dùng token của khách để kiểm tra.
- Toast “Không tạo được phiên thanh toán. Vui lòng thử lại sau.” phát sinh từ `PaymentService.CreateSessionAsync`, khi `PayOsService.CreatePaymentRequestAsync` trả `null`. `OrdersController.Checkout` tự tạo phiên PayOS sau khi tạo đơn và chuyển lỗi này thành HTTP 409. Nhánh tạo session riêng trên frontend chỉ hiển thị lỗi trong khung checkout, nên giả thuyết trước đó rằng toast do gọi trùng session không đúng với thông báo đang thấy.
- Khi tạo link thất bại, backend trả sản phẩm về kho và hủy đơn. `OrderService.CheckoutAsync` đã xóa các dòng vừa đặt khỏi giỏ trước lúc gọi PayOS; nhánh lỗi không thêm chúng trở lại. Vì vậy có thể thấy giỏ trống sau lỗi dù đơn không thanh toán được.
- Checkout lỗi trả HTTP 409 mà không trả orderId/checkoutUrl. Frontend không thể dùng `POST /api/payments/{orderId}/session` để cứu lần đặt này vì đơn đã bị hủy; cần sửa backend trước.
- `appsettings.Development.json` có các trường PayOS ClientId, ApiKey, ChecksumKey và AppBaseUrl rỗng; không tìm thấy tệp .NET User Secrets tương ứng hoặc các biến môi trường PayOs trong shell kiểm tra. Chưa đọc được biến môi trường riêng của tiến trình backend, nên không khẳng định cấu hình hiệu lực tuyệt đối.
- Mã `PayOsService` hiện gửi `Authorization: clientId:apiKey`, `orderCode` dạng chuỗi REWEAR `RW-YYYYMMDD-XXXXXX`, `expiredAt` dạng ISO, không có `signature`; URL mặc định là `api-beta.payos.vn`. `AppBaseUrl` trống còn khiến returnUrl/cancelUrl dựng từ URL API PayOS.
- [Tài liệu API payOS](https://payos.vn/docs/api/) hiện mô tả tạo link qua `https://api-merchant.payos.vn/v2/payment-requests`, xác thực `x-client-id` và `x-api-key`, `orderCode` dạng số nguyên, `expiredAt` là Unix timestamp, và `signature` HMAC-SHA256 tạo từ amount/cancelUrl/description/orderCode/returnUrl. Vì vậy request backend hiện không khớp hợp đồng payOS, kể cả nếu bổ sung khóa.
- Swagger backend có `GET /api/payments/{orderId}/status`. DTO backend trả `paymentStatus`, `orderStatus`, `isPaid`, `isExpired`, `expiresInSeconds` trong `data`; frontend hiện chưa gọi endpoint này.

## Việc cần sửa ở backend

1. Cấp khóa PayOS bằng secret store hoặc biến môi trường trên server; đặt AppBaseUrl là URL của ứng dụng sở hữu trang nhận return/cancel. Không ghi khóa trong repo hoặc context.
2. Thay REST client PayOS hiện tại bằng SDK .NET chính thức hoặc sửa theo API hiện hành: endpoint, headers, chữ ký, mã đơn PayOS dạng số riêng với mã hiển thị REWEAR, thời hạn Unix và kiểm tra response `code`/`checkoutUrl`.
3. Gắn mã số PayOS với đơn/payment để webhook và đối soát tra đúng đơn. Rà lại webhook/reconcile theo API hiện hành.
4. Khi tạo link lỗi, khôi phục các dòng giỏ đã xóa hoặc đổi thứ tự transaction để checkout lỗi không làm mất giỏ; ghi log upstream status/error code đã lược bỏ dữ liệu nhạy cảm.
5. Chạy thử bằng môi trường PayOS có khóa hợp lệ: tạo link, hủy, hết hạn, webhook, quay về ứng dụng và `GET /api/payments/{orderId}/status`. Chỉ frontend hiển thị thành công khi backend trả `isPaid: true`.

**Chưa xác minh:** HTTP status/body thực tế mà PayOS trả cho lần lỗi của người dùng; frontend không sở hữu log của tiến trình backend.

## Bổ sung sau khi đối chiếu với máy người tạo (2026-10-07)

- Người dùng xác nhận PayOS vẫn hoạt động bình thường trên máy người tạo. Điều này xác nhận nền tảng PayOS đang dùng được, nhưng chưa xác nhận máy REWEAR đang chạy cùng commit/backend binary hoặc cùng cấu hình PayOS.
- Trên phiên hiện tại, shell không có biến môi trường `PayOs:*`; không tìm thấy .NET User Secrets có cấu hình PayOS. Không đọc được environment riêng của tiến trình backend (Windows CIM trả Access Denied), nên chưa chứng minh được các giá trị cấu hình hiệu lực bên trong process.
- Do đó, nếu mã nguồn và phiên bản backend trên hai máy giống nhau, khác biệt cấu hình (ClientId, ApiKey, ChecksumKey, AppBaseUrl hoặc PayOS môi trường test/live) là hướng cần kiểm tra đầu tiên. Nếu cấu hình cũng trùng, cần so sánh backend commit/binary và log lỗi PayOS đã che thông tin bí mật.
- Mã nguồn backend đã đọc vẫn có request PayOS custom với `Authorization`, `orderCode` chuỗi và `expiredAt` ISO. Đây là dấu hiệu cần đối chiếu với phiên bản SDK/API mà máy người tạo đang chạy; chưa kết luận chỉ riêng mã nguồn này là nguyên nhân runtime vì máy người tạo báo cùng flow chạy được và chưa đối chiếu được binary/config của họ.
- Chưa sửa code backend hoặc gọi checkout thật. Backend ở ngoài workspace ghi được; không sửa cấu hình/khóa thanh toán từ frontend.
