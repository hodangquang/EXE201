# Nghiệp vụ REWEAR — đối chiếu frontend và backend 2026-10-24

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

## Phạm vi bằng chứng

Đã đọc frontend `src` và backend mới có trong workspace tại `Rewear_BackEnd`: controllers, services, DTO, enum, repository tồn kho, worker hết hạn và cấu hình đăng ký policy/worker. Đây là **đối chiếu mã nguồn**, chưa build/chạy backend, chưa gọi email, Cloudinary, PayOS hoặc giao dịch thật; không chứng minh phiên bản production giống source local. Không sửa mã ứng dụng trong task này.

Context cũ ghi chỉ có frontend không còn đúng với workspace hiện tại. `FE_INTEGRATION_GUIDE.md` có chỗ mâu thuẫn ngay trong tài liệu (không webhook nhưng phần FAQ lại nhắc webhook; thời hạn 5/15 phút), cần lấy code và response thực tế làm căn cứ.

## Mô hình và vai trò

REWEAR tổ chức thu mua/tiếp nhận đồ đã sử dụng rồi bán lại thông qua catalog do đội vận hành kiểm soát. Khách gửi **yêu cầu thu mua**, không tự xuất bản listing để bán trực tiếp cho khách khác. Có thể tạo sản phẩm từ sourcing đã duyệt hoặc qua form quản trị.

| Vai trò | Nghiệp vụ chính | Giới hạn hiện trạng |
| --- | --- | --- |
| Khách chưa đăng nhập | Xem nội dung thương hiệu, catalog, sản phẩm; đăng ký/đăng nhập | Giỏ và dữ liệu cá nhân dựa trên tài khoản; không coi giỏ khách vãng lai là đã có nghiệp vụ lưu server. |
| Member | Hồ sơ/ảnh, địa chỉ, giỏ, đặt hàng, thanh toán, xem đơn, gửi sourcing và đồng ý/từ chối giá | Một tài khoản có thể vừa mua vừa gửi đồ; chưa có seller dashboard, ví hay payout tự động trong flow sourcing đã đọc. |
| Staff | Xử lý sourcing, xem sản phẩm/danh mục, tạo phân công giao hàng theo quyền | UI chưa mở mọi quyền backend; ví dụ tạo/sửa sản phẩm ở frontend chỉ Admin, policy shipping my-orders/status chỉ Admin/Shipper. |
| Admin | Quản trị catalog, người dùng/quyền, sourcing, vận chuyển và các API vận hành bổ sung | Dashboard và nhiều màn quản trị vẫn mock; không suy mọi nút là nghiệp vụ đã chạy server. |
| Shipper | Xem danh sách được giao, cập nhật vận chuyển, ghi chú/mã vận đơn/số lần thất bại | Service status kiểm tra đúng shipper được phân công; chưa kiểm tra đầy đủ thứ tự chuyển trạng thái. |

Đăng ký gửi OTP email; service đặt OTP 5 phút, tài khoản chưa xác thực chưa đăng nhập được. Có quên/đặt lại mật khẩu. Profile FE sửa họ tên/giới tính và ảnh riêng; sổ địa chỉ có thêm/sửa/xóa/chọn mặc định, backend kiểm sở hữu.

## Thu mua đồ cũ — sourcing

Khách nhập tên, mô tả, thương hiệu, danh mục, tình trạng khai báo, màu/cỡ, giá mong muốn tùy chọn và ảnh. Service yêu cầu 1–5 ảnh, thương hiệu/danh mục hợp lệ đang hoạt động; giá mong muốn nếu có phải >0.

Luồng thực thi trong `SourcingService`:

`Pending → UnderReview → Priced → Accepted → Received → Approved → Completed`

- Khách gửi yêu cầu → Pending; nhân viên bắt đầu xem → UnderReview.
- REWEAR đưa OfferedPrice >0 → Priced; khách sở hữu yêu cầu đồng ý → Accepted hoặc từ chối → Declined.
- Nhân viên đánh dấu nhận được món đồ thực tế → Received; ghi tình trạng kiểm định → Approved.
- Nhập SellingPrice >0 và chuyển thành Product → Completed; lưu ProductId để liên kết nguồn hàng.
- REWEAR có thể từ chối yêu cầu ở Pending/UnderReview qua review; luồng kiểm định trong `CircularFashionService` còn có nhánh từ chối sau Received khi món đồ không đạt. Lý do được lưu ở RejectReason/AdminNote theo bước tương ứng.

Phân biệt ba mức giá: CustomerExpectedPrice (khách mong muốn), OfferedPrice (REWEAR đề nghị thu mua), SellingPrice (giá bán lại). Khi convert, dùng SellingPrice, tình trạng kiểm định nếu có, tái sử dụng ảnh. Source hiện có luồng **ghi nhận chi trả thủ công** sau nhận/kiểm định/đồng ý giá: PurchasePayout lưu Amount, State, Reference, PaidAt và được đưa vào SourcingResponse. Bản ghi Confirmed là xác nhận trong hệ thống do cửa hàng nhập, không phải bằng chứng tích hợp chuyển khoản tự động; Completed không tự suy ra đã chi trả.

Enum backend: 0 Pending, 1 UnderReview, 2 Priced, 3 Accepted, 4 Received, 5 Approved, **6 Completed, 7 Rejected, 8 Declined**. ProfilePage hiện dùng đúng ba mã cuối; nhận định FE map sai trong snapshot cũ không còn áp dụng cho trang Profile. Chưa kiểm tra lại toàn bộ nhãn admin SourcingRequests ở lượt UI này.

## Catalog và vòng đời sản phẩm

Sản phẩm có tên, mô tả, brand/category, giá, tình trạng, màu/cỡ, ảnh, StockQuantity và IsActive. Condition backend: LikeNew, Excellent, Good, Fair. IsActive/soft-delete khác trạng thái thương mại:

| Giá trị | Trạng thái | Ý nghĩa |
| --- | --- | --- |
| 0 | Available | Có thể bán |
| 1 | Reserved | Đã giữ hàng cho giao dịch |
| 2 | Sold | Đã bán |

Frontend catalog yêu cầu active/status 0; Mới về/Nữ/Nam hiện dùng chung tập sản phẩm, chưa lọc giới tính. Tìm tên/màu/cỡ, sort, lọc và xem thêm chạy trên tập đã tải. PDP tra sản phẩm trong list, chưa độc lập lấy detail theo ID. Ảnh thiếu hiện fallback Unsplash theo từ khóa, không chứng minh có ảnh thật.

Định hướng là listing món đồ riêng lẻ; entity vẫn có StockQuantity (mặc định 1), cart cho tối đa 5 mỗi dòng và không vượt kho. Repository reserve/commit đổi trạng thái cả listing, nên mô hình nhiều bản giống nhau chưa nhất quán với 1-of-1; không coi nghiệp vụ nhiều tồn đã hoàn thiện.

## Giỏ và checkout

- Thêm giỏ chưa reserve kho. Backend kiểm sản phẩm khả dụng/active, quantity và tồn kho; lưu giá snapshot và IsSelected. Giỏ có TTL 30 ngày, làm mới khi thao tác.
- Có đổi số lượng, chọn/bỏ từng dòng, chọn tất cả, xóa dòng/toàn giỏ. Chỉ dòng đã tick vào checkout; dòng chưa tick được giữ lại.
- Checkout kiểm địa chỉ thuộc người mua, sản phẩm đang bán/đủ kho, lấy giá hiện tại. Chênh giá snapshot tạo warning; order dùng giá mới. Không khẳng định mọi warning đã được FE hiển thị đầy đủ.
- Mỗi sản phẩm reserve bằng atomic update (Available/active/đủ tồn), giảm StockQuantity và chuyển Reserved. Nếu reserve một món hoặc tạo order lỗi, có bù trừ các món đã reserve trước đó. Không phải giao dịch nguyên tử toàn bộ order/payment/cart/history.
- Order lưu snapshot tên/giá/ảnh/variant/địa chỉ và timeline đầu, trạng thái AwaitingPayment. Tổng = SubTotal − DiscountAmount + ShippingFee; code hiện DiscountAmount=0, ShippingFee=0.
- Các dòng mua bị xóa khỏi giỏ sau khi tạo order, **trước** tạo link PayOS. Link lỗi thì hủy đơn/trả tồn nhưng không thấy khôi phục dòng giỏ ở flow đó.
- FE ưu tiên link trong checkout response, chỉ tạo session riêng nếu thiếu URL, giữ orderId để retry không tạo order lần nữa.

## Thanh toán, hủy và hết hạn

Đơn mới trả trước qua PayOS; COD=99 chỉ là legacy enum, không phải lựa chọn checkout hiện tại. FE mở PayOS tab riêng, ở lại trang chờ và đọc `/api/payments/{orderId}/status` khoảng mỗi 3 giây tối đa 15 phút; đọc backend thành công mới hiển thị đã trả tiền, không dựa query/callback.

Backend có cả signed webhook controller, chủ động đối soát khi đọc status và reconcile endpoint. Chưa xác nhận webhook đã đăng ký hoặc nhận callback production. `GetStatus` trả paymentStatus dạng **chuỗi** và isPaid. Enum payment trong backend là **0 Pending, 1 Paid, 2 Failed, 3 Expired, 4 Refunded**; numeric fallback FE đang đảo Paid/Failed, dù shape chuỗi/isPaid hiện có vẫn được FE hiểu.

`Program.cs`/`PayOsSettings` mặc định ExpirationMinutes=15; hàm service fallback=5 nếu không truyền hoặc tham số ngoài phạm vi 2–60. Controller truyền settings; runtime có thể ghi đè nên không khẳng định thời hạn live luôn 5 hoặc 15. Worker đăng ký chạy mỗi 60 giây; product controller còn kích hoạt quét hết hạn khi đọc catalog.

Khi ghi nhận thành công: kiểm đơn/payment, chặn xử lý lại nếu payment đã Paid, kiểm số tiền theo code, lưu Paid rồi gọi `CommitStockAsync` chuyển **Reserved → Sold ngay khi thanh toán**, sau đó yêu cầu order chuyển Confirmed. Order/Shipping vẫn gọi commit lúc Delivered, nhưng filter chỉ nhận Reserved nên thường không thay đổi lần nữa. Các comment/docs giữ Reserved đến Delivered đã lỗi thời. Chưa chứng minh chống mọi race hoặc xử lý lỗi giữa các lần lưu.

Order status: 0 AwaitingPayment, 1 Confirmed, 2 Shipping, 3 Delivered, 4 Cancelled, 5 PaymentExpired, **6 Failed**. Nhánh chính: chờ trả tiền → xác nhận → đang giao → giao xong; có nhánh hủy/hết hạn/giao thất bại.

Backend có hủy đơn chưa thanh toán và refund cho đơn đã thanh toán. Refund gọi gateway trước, chỉ cập nhật Refunded/Cancelled nếu gateway báo success; nhưng hợp đồng refund ngoài chưa kiểm thử. FE hiện chưa nối nút hủy/refund/reconcile. **ReleaseStockAsync chỉ nhận Available/Reserved**, nên món đã Sold sau Paid không tự được trả kho dù RefundAsync có gọi release — đây là xung đột cần sửa trước khi coi refund hoàn chỉnh.

## Giao hàng

Rates code có Standard (3–5 ngày), Express (1–2 ngày), đều fee 0. Đây là giá trị trong source, không phải bảo đảm SLA ngoài thực tế. Checkout DTO có ShippingMethod nhưng `BuildOrder` chưa dùng để lưu lựa chọn; bước tạo shipping nhận method riêng, cần kiểm tra tính liên thông lựa chọn của khách.

Admin/Staff xem queue đơn Confirmed và tạo shipping gắn shipper; tạo shipping chặn AwaitingPayment/PaymentExpired/Cancelled, mỗi order không tạo shipping lặp. Shipper xem my-orders, cập nhật status/tracking/note, backend kiểm assigned shipper và lưu timeline cùng order. Policy my-orders/status hiện chỉ Admin/Shipper, khác với vài màn Staff frontend có nút.

Shipping enum: 0 Pending, 1 InTransit, 2 Delivered, 3 Failed, 4 Returned. Giao thất bại lưu AttemptCount/lý do/thời điểm. Admin có API reship (Failed → Confirmed, shipping → Pending, có thể đổi shipper, giữ attempt count) và hủy vĩnh viễn (order → Cancelled, shipping → Returned; **không refund, không release tồn**). Đây là nhánh code hiện có, không phải chính sách sản phẩm đã được người dùng duyệt. FE chưa có thao tác reship/cancel-permanent riêng.

## Phần demo và khoảng trống

| Đã thấy FE gọi API, backend có source tương ứng | Còn mock/local hoặc chưa nối đầy đủ |
| --- | --- |
| Auth/profile/địa chỉ; catalog/cart; sourcing; checkout/payment status; danh mục/thương hiệu; danh sách khách; shipping | Dashboard/doanh thu; `/orders` quản trị; thu gom/quyên góp/kiểm định cũ; upcycling/QC; kho; voucher; nhân sự/cài đặt; newsletter/footer placeholder |

“Có source/API call” không có nghĩa end-to-end đã kiểm chứng. PUT product FE gửi JSON nhưng backend local hiện `[Consumes("multipart/form-data")]`/`[FromForm]`, cần khớp lại contract. Frontend thiếu mapping order Failed và nhãn số shipping. Chưa có flow sourcing payout, vận chuyển thu hồi đồ từ người gửi, chương trình loyalty, đánh giá hoặc quản trị lợi nhuận thực trong phần đã kiểm tra.

## Những việc cần chốt trước khi mô tả là hệ thống hoàn chỉnh

1. Khớp FE/BE enums, PUT product, policy Staff, ShippingMethod và các API chưa nối.
2. Chốt paid → Sold theo code mới và sửa refund/restore kho tương ứng; QA race/idempotency/rollback qua order–payment–cart–stock.
3. Chốt chính sách sau giao thất bại/hoàn tiền; không mặc nhiên áp dụng nhánh hủy vĩnh viễn không refund cho khách.
4. Củng cố quyền server: `AuthService.RegisterAsync` hiện nhận role từ request; ProductsController có write action chưa gắn Authorize, default policy không phải fallback. Đây là quan sát source, chưa thử gọi không quyền.
5. `ShippingService.UpdateShippingStatusAsync` kiểm assignment và enum nhưng không guard đầy đủ bước chuyển; cần ngăn nhảy/lùi trạng thái sai.
6. Hoàn thiện tiền thu mua trả khách, tiếp nhận vật lý, sổ kho và dashboard/đơn quản trị từ dữ liệu thật nếu thuộc phạm vi sản phẩm.

## Nguồn mã chính

- `../src/routes/AppRoutes.jsx`, `../src/services/auth.js`, `../src/pages/Profile/ProfilePage.jsx`, `../src/pages/Collections/SourcingRequests.jsx`.
- `../Rewear_BackEnd/REWEAR.Application/Services/{SourcingService,OrderService,PaymentService,ShippingService,CartService,AuthService}.cs`.
- `../Rewear_BackEnd/REWEAR.Domain/Enums`, `../Rewear_BackEnd/REWEAR.Infrastructure/Repositories/ProductRepository.cs`.
- `../Rewear_BackEnd/REWEAR.API/Controllers` và `Program.cs`; `../Rewear_BackEnd/docs/PROJECT_CONTEXT.md` có ghi chú đính chính cùng ngày.
