# Rà soát nghiệp vụ REWEAR — 25/10/2026

## Phạm vi và nguồn xác nhận

Đối chiếu source frontend/backend trong workspace, chạy frontend build, 57 bài kiểm thử backend trên MongoDB test tách biệt và đọc API local sau khi cập nhật. Đây là kết quả cho source và API local; chưa phải nghiệm thu bản deploy hay một giao dịch PayOS/giao vận thật.

## Kết quả theo luồng

| Luồng | Kết quả trong source local | Giới hạn còn lại |
| --- | --- | --- |
| Thu mua → nhận kho → kiểm định → hàng vòng đời | Route nhân viên nay vào yêu cầu thu mua dùng API thật. Route thu gom/kiểm định demo được chuyển tới màn thật; các guard nhận kho và QC theo báo cáo kiểm định vẫn được bộ test backend kiểm tra. | Nhân viên phải đối chiếu hiện vật, tình trạng, ảnh và chứng từ; URL ảnh không chứng minh đó là đúng món. |
| Sản phẩm độc bản → đăng bán | Preview chỉ Admin chọn tình trạng khi xác nhận bán; backend đặt một món. Form tạo/sửa và API không còn tự gán tình trạng “Tốt” khi thiếu đầu vào. Không cho ẩn sản phẩm đang được giữ trong đơn; UI khóa thao tác này. | Luồng xác nhận một bước theo quyết định của người dùng không tự xác thực hàng hoặc ảnh thực. |
| Giỏ hàng → đơn → thanh toán | Backend giữ món theo đơn; giao diện Đơn mua nay hiểu enum thanh toán dạng số và chuỗi, lọc đơn đang xử lý theo trạng thái đơn để tránh đưa đơn thanh toán thất bại/đã giao vào danh sách chờ. | Chưa chạy thanh toán thật qua merchant PayOS hoặc kiểm chứng webhook ở môi trường deploy. |
| Giao hàng → hoàn trả | Giữ phân quyền và trạng thái riêng ở backend theo báo cáo triển khai/kiểm thử hiện có. Menu khuyến mãi, cài đặt lưu giả và chuông thông báo mẫu đã bỏ khỏi luồng quản trị. | Chưa nghiệm thu với shipper/đơn thật; hoàn tiền tự động và hoàn tiền từng phần chưa có. |

## Dữ liệu catalog local khi rà soát

`GET /api/Products?IsActive=true` trả 6 sản phẩm: 1 túi tote tái chế từ quần jean đã mở bán (`isPreview=false`, tồn 1), 5 món còn là preview (tồn 0). Cả 6 vẫn có `imageSource=ai-generated`; source không thể xác nhận ảnh của món đã mở bán khớp hiện vật. Không tự đổi trạng thái hoặc dữ liệu sản phẩm trong lần rà soát này. Trang `/products/drafts` chỉ là bản lưu JSON ý tưởng, không phải nguồn trạng thái bán.

## Sửa lỗi và bằng chứng

- Điều hướng Staff tới `/collections/sourcing`; route demo thu gom/kiểm định chuyển sang màn vận hành thật. Bỏ menu thông báo, khuyến mãi và cài đặt giả.
- Chi tiết sản phẩm quản trị dùng `stockQuantity`, `isUnique` và ảnh thực từ API; danh sách chặn ẩn hàng `Reserved`, backend trả 409 nếu có phân bổ đơn còn hiệu lực. Form và API buộc có tình trạng hợp lệ.
- Đơn mua của khách đọc đúng `PaymentStatus` số (`Paid=1`, `Failed=2`) và trạng thái order; nhãn vận hành hỗ trợ enum số, kể cả trạng thái hoàn trả.
- `npm.cmd run build -- --outDir Rewear_BackEnd/.artifacts/business-audit-build`: đạt, 4037 modules; còn cảnh báo bundle lớn.
- `dotnet test Rewear_BackEnd/REWEAR.Tests/REWEAR.Tests.csproj --no-restore --verbosity quiet`: 57/57 đạt trên MongoDB test riêng; có test chặn ẩn sản phẩm đang giữ đơn.
- `dotnet publish` API Release: đạt. API local `127.0.0.1:5000` khởi động bản mới, GET trả 6 sản phẩm nêu trên; endpoint mở bán không đăng nhập trả 401.

## Việc còn mở

Đối chiếu túi tote đang bán với hiện vật và ảnh, kiểm tra giá/cỡ và khả năng giao trước khi nhận đơn thực. Kiểm tra deploy, tài khoản merchant PayOS, Cloudinary, SMTP, giao vận và quy trình hoàn tiền bằng tài khoản thật. Các trang demo cũ còn trong source nhưng không còn được dẫn từ route/menu đang dùng; bản lưu ý tưởng vẫn là JSON tĩnh. Không coi 57 bài test local là bằng chứng hoàn tất tất cả nghiệm thu nghiệp vụ ngoài đời.
