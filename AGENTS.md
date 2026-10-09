# Quy tắc làm việc với dự án REWEAR

Trước mỗi task, đọc `context/README.md` rồi đọc các tài liệu context liên quan đến khu vực sẽ sửa. Khi thông tin trong context và mã nguồn khác nhau, mã nguồn là nguồn sự thật; kiểm tra lại và sửa context.

Khi task liên quan UI/UX, đọc `context/skills/ui-design/SKILL.md`. Khi task liên quan gọi API, auth, dữ liệu server hoặc thay mock bằng dữ liệu thật, đọc `context/skills/api-integration/SKILL.md`.

Sau mỗi task trong repo, cập nhật những tài liệu context bị ảnh hưởng và thêm một mục ngắn vào `context/CHANGELOG.md`: ngày, thay đổi, bằng chứng kiểm tra, việc còn mở. Kể cả task chỉ phân tích, ghi phát hiện mới nếu nó thay đổi hiểu biết về dự án. Giữ context phản ánh trạng thái hiện tại, phân biệt chức năng đã chạy thật với demo/mock và giả định chưa xác minh.

Không ghi token, mật khẩu, dữ liệu cá nhân hoặc phản hồi API nhạy cảm vào context. Không mô tả API backend là đã xác nhận khi chỉ suy ra từ frontend.

## Thương hiệu và ngôn ngữ

Thương hiệu hiển thị cho khách hàng là **REWEAR** (viết hoa). Toàn bộ nội dung giao diện do dự án kiểm soát dùng tiếng Việt; tên riêng của dịch vụ ngoài, mã kỹ thuật, URL và dữ liệu sản phẩm trả về từ API được giữ nguyên khi cần. Không đưa tên thương hiệu RAINS hoặc nội dung quảng cáo, chính sách, thông số sản phẩm chưa được xác nhận từ trang tham khảo vào giao diện REWEAR. Khi sửa trang mới hoặc shared component, rà logo, navbar, footer, tiêu đề trình duyệt, nhãn truy cập, trạng thái và nội dung mẫu theo quy tắc này.

## Định hướng tương lai: giao hàng và payOS

Khi task đụng checkout, đơn hàng, thanh toán hoặc vận chuyển, đọc `context/future-plan-delivery-payment.md` trước khi thiết kế hoặc sửa code. Đây là **định hướng đã thống nhất để lập kế hoạch**, chưa phải chức năng đang chạy hay API đã có. Phải cập nhật tài liệu khi quyết định sản phẩm/backend thay đổi.

Giữ trạng thái thanh toán tách khỏi trạng thái giao hàng. Khi tích hợp payOS, backend tạo payment link, giữ khóa bí mật, xác minh webhook và cập nhật trạng thái đơn hàng; frontend chỉ hiển thị thanh toán thành công khi đọc được trạng thái đã xác nhận từ backend. `returnUrl`, query params hoặc callback trên trình duyệt chỉ dùng để điều hướng/khởi động kiểm tra, không tự đánh dấu đơn đã thanh toán. Khi làm trang shipper, thêm role/quyền phía server, chỉ cho phép shipper được phân công cập nhật đúng đơn và đúng bước; lưu lịch sử thay đổi. Không triển khai flow tương lai chỉ vì nó có trong context nếu task hiện tại không yêu cầu.
