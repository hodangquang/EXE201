# Vận chuyển và đơn mua — 25/10/2026

## Quyết định giao diện đã chốt với người dùng

- Shipper dùng lại `AdminLayout`, `Sidebar`, `Header` và `ShippingPage` của vận hành. Không có portal thiết kế riêng. `/shipper/orders` và `/shipper/orders/:id` được bảo vệ riêng cho SHIPPER; sidebar chỉ có **Đơn giao của tôi**, không có kho, thu mua, chi phí hay báo cáo. Header không hiển thị thông báo quản trị minh họa cho Shipper.
- Member chỉ có một mục **Đơn mua**, chứa toàn bộ đơn, bộ lọc, thông tin thanh toán và theo dõi giao hàng ngay trong thẻ đơn. Bỏ `HistorySection` vốn gọi cùng danh sách và lặp `OrderCard`. `?tab=history` chuyển sang `?tab=orders`; `/profile/orders/:id` mở đúng đơn trong cùng giao diện tài khoản, không tạo màn theo dõi riêng.
- Chi tiết lấy `GET /api/orders/{id}/tracking`: snapshot đơn, thanh toán, Shipper, mã vận đơn và `deliveryHistory` có thời điểm backend. Mở chi tiết sẽ cập nhật mỗi 20 giây khi tab đang hiển thị; có tải lại/lỗi/thử lại. Không dựng mốc tương lai thành đã hoàn thành, không có GPS.

## API và tương thích dữ liệu

Tận dụng các endpoint shipping sẵn có: `queue`, `my-orders`, `all`, GET theo order, POST phân công, PUT trạng thái; giữ luồng Admin giao lại và nhận/kiểm định hàng hoàn. Staff được xem `all`; cập nhật tiến độ chỉ dành cho đúng Shipper được phân công. Quyền phía frontend không thay thế kiểm tra server.

Giữ nguyên mã `0 Pending`, `1 InTransit`, `2 Delivered`, `3 Failed`, `4 Returned`; thêm `5 PickedUp`. Pending được hiển thị “Chờ lấy hàng”, tương ứng đã phân công. Chuyến mới có `RequiresPickupConfirmation=true`, đi Pending → PickedUp → InTransit → Delivered/Failed. Dữ liệu cũ thiếu cờ vẫn có thể Pending → InTransit để tương thích, không tự điền thời điểm lấy hàng.

- Phân công/đổi phân công trước lấy hàng ghi sự kiện; không tạo bản vận chuyển thứ hai. Sau lấy hàng không đổi người bằng POST phân công.
- Thất bại có mã lý do; trường hợp “Khác” cần mô tả. Server tự tăng số lần thất bại, bỏ qua số lần do client gửi. Cập nhật trùng không thêm lịch sử hoặc trừ tồn lần nữa.
- Customer nhận nhãn an toàn; ghi chú nội bộ, id Shipper và tên/id người thao tác lịch sử được lọc khỏi tracking. Shipper nhận snapshot địa chỉ/người nhận và danh sách kiện, không nhận chi phí nguyên liệu/lợi nhuận.
- Sự kiện nằm trong `OrderStatusHistories` hiện có, bổ sung loại sự kiện, shipment, người giao, shipping trước/sau; không tạo bảng lịch sử song song. Dữ liệu cũ thiếu ngày trả `null`, không lấy ngày hiện tại làm lịch sử.
- `AssignedAt`, `PickedUpAt` là nullable. Chuyển quyền giữ kiện Warehouse → Shipper → Buyer có `InventoryMovements`, độc lập trạng thái bán hàng. Hàng đã thanh toán không bị trừ tồn thêm khi giao.
- Migration `20261025_delivery_v2`: chỉ thêm index shipper/trạng thái/ngày phân công, sự kiện, custody và ngày thu tiền. Chạy rõ ràng bằng `--delivery-migration-check` / `--delivery-migration-apply`; không tự chạy khi khởi động, không sửa dữ liệu cũ hay bịa ngày.

## Bằng chứng và cách chạy

`dotnet test Rewear_BackEnd/REWEAR.Tests/REWEAR.Tests.csproj --no-restore -p:OutputPath=D:/EXE201/Rewear_BackEnd/.artifacts/phase5-tests/ -v minimal --logger "trx;LogFileName=shipping-final.trx"`

**41 kiểm thử tự động đã đạt** trên Mongo replica set local riêng cổng 27029, mỗi test dùng database `rewear_tests_<guid>` rồi dọn đúng database đó. TRX: `Rewear_BackEnd/REWEAR.Tests/TestResults/shipping-final.trx`. Có một browser test Explicit được chạy riêng, không gộp vào số 41.

| Luồng | Bằng chứng hiện tại |
| --- | --- |
| Checkout đồng thời | 50 HTTP request, 1 giữ chỗ thành công; 49 bị từ chối rõ ràng; 1 reservation. |
| Webhook trùng | 20 HTTP webhook có chữ ký kiểm thử → 1 receipt và 1 lần xác nhận bán. |
| Ba vai trò giao hàng | HTTP checkout → webhook → Staff phân công → đúng Shipper lấy/giao → Customer đọc cùng trạng thái/ngày thực. |
| Phân quyền và bước giao | Khách khác/shipper khác không đọc đơn; sai vai trò hoặc bỏ bước bị chặn và không thêm lịch sử. Shipper không truy cập kho vận hành. |
| Giao thất bại và giao lại | Đổi phân công trước pickup; chặn đổi sau pickup; lý do hợp lệ; không tăng lần giao khi gửi lặp; Admin giao lại và giữ sự kiện cũ. |
| Tồn kho và custody | Giao xong không trừ kho lần hai; đúng hai lần bàn giao Warehouse → Shipper → Buyer. |
| Hàng hoàn | Test receive → inspect → refund: chưa duyệt QC/hoàn tiền không mở bán; món không đạt tiếp tục cách ly. |
| Migration | Commerce v1 và Delivery v2 chạy lại không đổi document legacy; không bịa thời điểm pickup/lịch sử. |

Browser test dùng **API controllers/JWT/Mongo thật của test**, không intercept `/api`; chỉ cổng thanh toán là test double. Chạy bằng filter `Name=ShippingBrowserAcceptanceAgainstRealLocalApi`. Harness: `tools/qa/shipping-real-api.cjs`, kết quả trong `Rewear_BackEnd/.artifacts/delivery-browser/`; không ghi JWT vào context hoặc kết quả QA.

Kết quả bản UI đã chốt: **19 kiểm tra đạt**, gồm 12 tổ hợp màn/kích thước (queue, danh sách Shipper, modal Shipper, Profile tracking × 390/768/1440px) và 7 luồng: phân công, dùng chung shell/menu bị giới hạn, pickup/transit/delivered qua UI, Customer thấy cùng lịch sử, một mục Đơn mua với alias history, empty và lỗi truy cập đơn khác. Không có runtime exception; không tràn ngang trang. TRX riêng `shipping-browser.trx`; JSON và screenshot trong thư mục artifact trên. Bảng mobile cuộn ngang trong vùng bảng như UI quản lý sẵn có.

Frontend build vào `Rewear_BackEnd/.artifacts/frontend-shipping` vì `dist` đang có file bị khóa. Build được kiểm tra riêng với `npm.cmd run build -- --outDir Rewear_BackEnd/.artifacts/frontend-shipping`; còn cảnh báo bundle lớn.

Build cuối thành công với 4037 modules; JS khoảng 1,647 MB (gzip 499 KB), CSS khoảng 168 KB. Không thay Home/navbar storefront. Shared GlobalLoader giữ subscription ổn định để không bỏ lỡ sự kiện kết thúc request, dọn timer khi unmount; shipping/order list dùng trạng thái tải cục bộ.

## Phần chưa nghiệm thu

Chưa deploy backend/frontend mới, migrate database thật hoặc kiểm thử merchant payOS/Cloudinary/SMTP live. Các bằng chứng trên là local, không xác nhận API đang deploy đã có contract mới. Bản Final Audit toàn hệ thống vẫn cần kiểm tra rộng hơn về upload, ranh giới kỳ báo cáo, dữ liệu legacy đại diện và Product Journey; không suy các mục đó đã nghiệm thu chỉ từ test giao hàng.

Trong phần audit trước khi chốt UI còn có thay đổi local về `Payment.CashEvents` (ngày thực nhận tiền), tách doanh thu/tiền thu/giá vốn trên Dashboard và endpoint Product Journey dùng dữ liệu public cho phép. Bộ 41 test đã chạy qua các source này, nhưng chưa đủ kiểm thử riêng để xác nhận trọn vẹn quy tắc kỳ kế toán, privacy/ảnh và tính đầy đủ Journey. Public GET sản phẩm đã bỏ thao tác hết hạn thanh toán chạy nền; không dùng GET public để thay đổi giao dịch.
