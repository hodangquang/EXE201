# Future plan: giao hàng bằng shipper riêng và thanh toán payOS

> **27/10/2026 — chỉ tái chế:** Quyết định phạm vi sản phẩm: chỉ đăng bán mới từ dự án tái chế đã QC. Giữ nguyên trạng thái payment/shipping, quyền shipper và xác nhận tiền từ backend; không triển khai flow giao hàng hay payOS mới trong task này. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> 25/10/2026: thông báo trong ứng dụng nay lấy từ lịch sử đơn và phân công giao hàng backend lưu; item xác nhận thanh toán sinh sau khi trạng thái đơn chuyển Confirmed. Không dùng return URL hay trạng thái giao hàng để suy đơn đã thanh toán. Đây là source local, chưa nghiệm thu payOS/giao vận live. [Chi tiết](notifications-2026-10-25.md).

> Rà soát 25/10/2026: giao diện Đơn mua nay xử lý `Paid=1`, `Failed=2` và tách bộ lọc giao hàng theo OrderStatus; luồng backend local vẫn cần nghiệm thu merchant PayOS, shipper và hoàn tiền thật. Xem [báo cáo nghiệp vụ](business-flow-audit-2026-10-25.md).

## Thu gom đồ cũ và nhận kho — cập nhật 25/10/2026

Source local đã tách trạng thái shipper `PickedUp` khỏi `Received` của yêu cầu thu mua: shipper xác nhận lấy hàng, sau đó Staff/Admin xác nhận nhận tại kho trước khi kiểm định. Không tự đưa hàng vào kho khi shipper bấm “đã lấy”; phân công yêu cầu tên, điện thoại, địa chỉ và giờ hẹn thật. Đây là luồng sourcing, không thay trạng thái giao hàng đơn mua hoặc thanh toán payOS. Chưa xác minh triển khai/live. [Bằng chứng](inspection-flow-audit-2026-10-25.md).

## Quyết định mới đã làm local — 25/10/2026

Người dùng chốt Shipper **dùng lại UI quản lý Admin**, giới hạn menu/route/API, không làm portal UI riêng. Member giữ Đơn mua và theo dõi nội tuyến, gộp Lịch sử trùng. Shipping giữ enum 0–4 và thêm 5 PickedUp; Pending là đã phân công/chờ lấy. Ngày phân công/lấy hàng nullable, không backfill giả cho đơn cũ. Tái sử dụng OrderStatusHistories; kiểm tra trạng thái và quyền phía backend. [Báo cáo giao hàng](shipping-acceptance-2026-10-25.md) thay thế phần dự kiến bên dưới khi khác nhau; merchant/deploy vẫn chưa xác minh.

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

## Hiện trạng đã triển khai local — 25/10/2026

Order/payment/shipping là các bản ghi riêng, giữ hàng thuộc order trong Mongo transaction, Paid chốt Sold khi hết tồn; giao hàng không trừ kho lần hai. Có webhook được xác minh chữ ký và polling/worker đối soát. Enum payment là 1 Paid/2 Failed theo source. Đã có full-order receive/inspect/refund confirmation, shipper server-side assignment và dashboard API; automatic refund/partial refund và live merchant vẫn chưa nghiệm thu. Các phần ghi “dự kiến”/mapping cũ bên dưới là lịch sử thiết kế; dùng [báo cáo triển khai](implementation-report-2026-10-25.md) và [migration backend](../Rewear_BackEnd/docs/COMMERCE_MIGRATION.md) cho quyết định hiện tại.

## Trạng thái triển khai frontend ngày 2026-10-18

> **Đối chiếu source backend mới tại workspace ngày 2026-10-24:** xem `business-overview-2026-10-24.md`. Đã có shipping/shipper, reship, cancel-permanent, webhook và status reconciliation trong source; chưa xác nhận deploy/live. Payment success hiện chốt sản phẩm Sold ngay khi Paid, không chờ Delivered. Mặc định settings giữ hàng 15 phút, runtime có thể ghi đè; một số comment/service fallback vẫn 5 phút. Nhánh cancel-permanent không refund/không trả kho là code hiện có, chưa coi là chính sách đã được duyệt. Cần khớp lại refund với release không nhận Sold và các enum FE/BE. Các đoạn ngày 18 và future plan dưới đây giữ vai trò snapshot/lịch sử định hướng.

Người dùng đã cung cấp Swagger cho bảy endpoint shipping: rates, chi tiết theo orderId, tạo shipping, cập nhật status, queue, my-orders và all. Frontend hiện có `/shipping` cho Admin/Staff, `/shipper/orders` cho SHIPPER, lựa chọn rates khi checkout và thông tin shipping trong chi tiết Đơn mua. Các màn này gọi API thật qua `shippingApi`, không lấy mock; backend không nằm trong repo và localhost:5000 không phản hồi lúc kiểm tra nên chưa xác minh dữ liệu, role server, enum status và thao tác end-to-end. `PUT /api/shipping/{orderId}` cũng xuất hiện trong ảnh Swagger nhưng chưa có body/contract nên chưa dùng. Trang `/orders` admin vẫn là mock độc lập.

Flow tương lai bên dưới là **đề xuất gốc ngày 2026-10-07**, không phải mô tả chức năng đã chạy. Trong số đó `/shipper/orders` hiện đã có route frontend, và endpoint cập nhật thực tế được cung cấp là `PUT /api/shipping/{orderId}/status` thay cho `PATCH /api/shipments/:id/status` từng phác thảo. Các ý tưởng như lấy hàng, giao lại, hoàn trả, bằng chứng giao và webhook vẫn cần quyết định/backend riêng. Payment status vẫn tách khỏi shipping; chỉ backend chốt Paid và cho phép POST shipping sau thanh toán.

## Kế hoạch gốc (snapshot 2026-10-07)

**Trạng thái (cập nhật 2026-10-07):** frontend checkout nối theo các contract người dùng cung cấp; backend không nằm trong repo nên response thực tế chưa kiểm chứng. Luồng hiện gửi `POST /api/orders/checkout` với địa chỉ, `shippingMethod: 0` và ghi chú; kiểm tra checkout response trước vì contract mô tả backend tự tạo phiên; chỉ khi không có checkoutUrl mới gọi `POST /api/payments/{orderId}/session`, rồi chuyển hướng đến `checkoutUrl` PayOS hợp lệ. Người dùng mô tả phiên và giữ hàng có thời hạn 15 phút. Theo contract mới người dùng cung cấp, `GET /api/payments/{orderId}/status` khi payment Pending sẽ hỏi PayOS, đồng bộ DB và idempotent; tab REWEAR mở `/payment/waiting?orderId=...` ngay sau checkout, poll mỗi 3 giây tối đa 15 phút, hiểu Paid dạng string/số 2/isPaid, chỉ kết quả từ backend mới tự về home. Chưa kiểm thử logic poll-on-read trên backend live. Render Static Site cần rewrite `/*` → `/index.html` để route sâu không 404. Trang shipper và các flow vận chuyển vẫn chưa triển khai. Các state/endpoint tương lai bên dưới vẫn là đề xuất trừ endpoint checkout, payment session, payment status và orders đã thấy trong backend/Swagger hoặc contract người dùng cung cấp.

## Đánh giá hướng đi

Hướng đi phù hợp nếu toàn bộ đơn hàng, thanh toán và giao hàng dùng chung một bản ghi đơn trên backend. Dashboard shipper là giao diện thao tác; backend là nguồn trạng thái. payOS xử lý thanh toán, ứng dụng xử lý đơn và vận chuyển. UI customer, admin và shipper đều đọc cùng lịch sử đơn; tránh 3 bộ đơn mock/local riêng như hiện tại.

Trước khi xây trang shipper cần xác minh backend checkout tạo đơn thật, lưu item/giá/địa chỉ đã chốt, giữ hàng nguyên tử trong 15 phút, và đối chiếu API trạng thái thanh toán/vận chuyển đã thấy trong Swagger với hành vi backend thực tế. Người dùng đã cung cấp customer endpoints `GET /api/orders` và `GET /api/orders/{id}`; profile gọi chúng nhưng response thật chưa kiểm chứng. Frontend `/checkout` gọi checkout; mã backend xác nhận response thành công chứa `data.order` và `data.payment`, nhưng tích hợp PayOS hiện lỗi; admin `OrderList`/`OrderDetail` vẫn mock độc lập. Vì vậy chưa ghép trang shipper với các màn này.

Endpoint tạo phiên thanh toán `POST /api/payments/{orderId}/session` được người dùng cung cấp, với response ví dụ `{success,message,data,errorCode}` và mô tả có `checkoutUrl`, `qrCode`, thời hạn. Client chỉ cần `checkoutUrl` để mở PayOS, giữ orderId để polling; mã backend từng được đối chiếu checkout tự tạo session và response `data: {order, payment}` khi thành công. Audit lỗi upstream cũ có thể không còn phản ánh production hiện nay; không báo PAID từ response tạo session.

## Mô hình trạng thái đề xuất

| Luồng | Ví dụ trạng thái | Ai được đổi |
| --- | --- | --- |
| Thanh toán | `PENDING` → `PAID`; nhánh `CANCELLED`/`FAILED`; hoàn tiền `REFUNDED` | Backend sau khi xác minh payOS; customer chỉ khởi tạo thanh toán/hủy theo quy tắc. |
| Xử lý đơn | `CREATED` → `CONFIRMED` → `PACKING` → `READY_FOR_PICKUP` | Backend/admin/nhân viên có quyền. Đơn trả trước chỉ xác nhận khi `PAID`. |
| Giao hàng | `ASSIGNED` → `PICKED_UP` → `IN_TRANSIT` → `DELIVERED`; nhánh `DELIVERY_FAILED` → giao lại hoặc `RETURNED` | Chỉ shipper được phân công; admin có quyền xử lý ngoại lệ. |

Người dùng cung cấp enum order `OrderStatus.cs`: `0 AwaitingPayment`, `1 Confirmed`, `2 Shipping`, `3 Delivered`, `4 Cancelled`, `5 PaymentExpired` (nhãn UI lần lượt: Chờ thanh toán, Đã xác nhận, Đang giao, Đã giao, Đã hủy, Hết hạn thanh toán). Đây là mapping được báo từ dự án nhưng file backend không có trong workspace để kiểm tra độc lập. Contract này không xóa yêu cầu tách riêng trạng thái thanh toán khỏi trạng thái đơn/giao hàng; cần xác minh cách backend lưu payment status và hoàn tiền trước khi phát triển các flow phụ thuộc.

Giữ các trạng thái này ở các trường hoặc entity riêng (`payment`, `order`, `shipment`) thay vì dùng một status duy nhất. `DELIVERED` không tự đồng nghĩa `PAID`; điều này quan trọng nếu sau này có COD, hoàn tiền hoặc giao lại. Mỗi chuyển trạng thái lưu đơn, trạng thái cũ/mới, actor, thời điểm server, ghi chú và bằng chứng nếu cần. Backend kiểm tra bước tiếp theo hợp lệ, quyền người gọi và chống cập nhật trùng/lạc thứ tự.

`FE_INTEGRATION_GUIDE.md` cung cấp enum **payment** riêng: `0 Pending`, `1 Failed`, `2 Paid`, `3 Expired`, `4 Refunded`. Enum **product** riêng có `1 Reserved`, `2 Sold`. Hai số `2` có ý nghĩa khác nhau ở hai entity. Ví dụ order trong guide lại ghi `status: 1` là `PendingPayment`, khác mapping order `1 Confirmed` được cung cấp trước đó; frontend không suy payment từ orderStatus số và cần đối chiếu enum order thực tế ở backend live.

## Flow shipper dự kiến

1. Admin/nhân viên xác nhận và đóng gói đơn, phân công shipper. Chỉ đơn đủ điều kiện thanh toán và sẵn sàng giao mới được phân công.
2. Shipper đăng nhập bằng role riêng, thấy **chỉ đơn được giao cho mình** trên giao diện mobile dễ dùng: địa chỉ cần thiết, liên hệ cần thiết, timeline và nút hành động kế tiếp.
3. Khi nhận kiện, shipper chọn “Đã lấy hàng”; khi xuất phát chọn “Đang giao”; khi giao xong chọn “Giao thành công” và ghi bằng chứng phù hợp. Thất bại phải có lý do và đường xử lý giao lại/trả hàng; không ép chọn thành công.
4. Backend lưu sự kiện và trả trạng thái mới. Trang shipper, admin và customer lấy lại dữ liệu từ server; customer có timeline nhưng không thể đổi trạng thái shipper.

Quyền phải kiểm ở backend theo identity và `assignedShipperId`, không chỉ ẩn nút ở React. Cân nhắc quyền xem số điện thoại/địa chỉ theo nguyên tắc tối thiểu, xử lý mạng chập chờn bằng nút retry rõ ràng và không báo thành công trước phản hồi server. Nếu cần xác nhận “đã nhận hàng” từ customer, coi đó là sự kiện riêng để giải quyết tranh chấp; không ghi đè lịch sử shipper.

## Flow payOS dự kiến

1. Backend tạo đơn ở `PENDING`, tự tính tổng tiền từ giá sản phẩm hiện hành và phí đã chốt, giữ hàng 1-of-1 trong thời hạn thanh toán. Lưu mapping duy nhất giữa `orderId`, `orderCode`, `paymentLinkId`, số tiền và thời hạn link.
2. Backend dùng thông tin kênh payOS để tạo payment link; client nhận `checkoutUrl` và chuyển khách sang checkout payOS. Client không giữ API key/checksum key và không tự tính số tiền làm nguồn sự thật.
3. Sau checkout, tab REWEAR giữ `data.order.id`, mở PayOS ở tab riêng và poll `GET /api/payments/{orderId}/status` mỗi 3–5 giây ngay cả khi khách đang trả tiền. Theo `FE_INTEGRATION_GUIDE.md`, nếu payment còn Pending thì backend gọi PayOS lấy trạng thái thật, đồng bộ payment `0 → 2`, order và product `Reserved → Sold` khi Paid, xử lý idempotent. Backend giữ bí mật và đối chiếu đúng payment link/order/amount. Thiết kế này dùng truy vấn trạng thái từ backend thay cho webhook; nếu tab REWEAR đóng trước khi chốt, việc đồng bộ tự động phụ thuộc cơ chế khác ở backend.
4. Trang customer đọc trạng thái từ response backend; `PAID` → thông báo thành công và mã đơn; `PENDING`/`PROCESSING` → tiếp tục kiểm tra có giới hạn; `CANCELLED`/`EXPIRED` → hiển thị trạng thái tương ứng và đường về đơn mua/trang chủ. Không suy ra thành công chỉ từ query params hoặc callback trình duyệt.
5. Chỉ khi backend xác nhận `PAID` mới chuyển đơn trả trước vào xử lý/đóng gói và chuyển các sản phẩm 1-of-1 đã mua sang `Sold` (status 2), cập nhật tồn kho cùng một giao dịch/idempotent operation. Trong thời gian chờ thanh toán giữ `Reserved`; khi đơn bị hủy/hết hạn thì giải phóng về `Available` theo chính sách tồn kho. Link hết hạn, thanh toán trùng, hoàn tiền, khách đóng tab và số tiền sai cần có nhánh xử lý/đối soát.

Theo tài liệu payOS hiện tại, API tạo link dùng `orderCode`, `amount`, `returnUrl`, `cancelUrl`; có API lấy trạng thái payment link. payOS cũng gắn query params vào return URL. Thiết kế REWEAR theo contract người dùng cung cấp là backend tự truy vấn API trạng thái payOS khi endpoint status được gọi; tài liệu webhook là nguồn tham khảo nếu backend đổi phương án, không phải flow đang yêu cầu.

## Thứ tự triển khai và tiêu chí xong

1. Chốt mô hình đơn, tách payment/fulfillment/shipment, chính sách COD (nếu có), điều kiện giữ hàng 1-of-1, role SHIPPER và API/backend. Thay các màn order mock bằng dữ liệu thật.
2. Hoàn thiện checkout payOS và status polling backend, trang kết quả customer theo trạng thái backend. Kiểm tra thanh toán thành công, hủy, pending, gọi status lặp, reload và thanh toán trùng; kiểm tra đơn 1-of-1 không bị bán hai lần.
3. Xây phân công và trang shipper, timeline customer/admin. Kiểm tra quyền shipper, bước trạng thái hợp lệ, giao thất bại/giao lại, mạng lỗi và bằng chứng giao.

Các route/API tương lai như `/shipper/orders`, `PATCH /api/shipments/:id/status` chỉ là **phác thảo để thảo luận**; `GET /api/payments/{orderId}/status` đã có trong backend/Swagger và được mô tả gọi PayOS khi Pending, nhưng hành vi chưa kiểm chứng live; `GET /api/orders/{id}` là endpoint chi tiết customer do người dùng cung cấp, nhưng chưa xác minh backend thực tế.

## Rủi ro cần quản lý

- **Báo thanh toán thành công sai:** return URL/query/callback bị sửa. Giải pháp: trạng thái backend đã xác minh, UI có pending.
- **Lộ khóa hoặc giả trạng thái:** bí mật PayOS chỉ ở server; backend gọi PayOS và đối chiếu giao dịch, không đặt credentials trong Vite env public.
- **Gọi trạng thái quá dày hoặc đồng bộ lặp:** polling frontend ở mức 3–5 giây; backend chỉ gọi PayOS khi còn Pending và chốt DB idempotent.
- **Bán trùng hàng 1-of-1:** giữ tồn kho có thời hạn và cập nhật nguyên tử khi thanh toán; giải phóng khi hết hạn/hủy.
- **Shipper cập nhật sai hoặc vượt quyền:** role riêng, chỉ đơn được giao, state machine phía server, audit log và quy trình sửa sai.
- **Chênh lệch giữa payment và delivery:** trạng thái tách biệt, customer/admin/shipper cùng đọc một nguồn dữ liệu; có quy trình hoàn tiền, giao thất bại, giao lại.
- **Mạng di động/API trạng thái lỗi:** thao tác shipper có retry và idempotency; callback giữ trạng thái pending rõ ràng cho customer để có thể tải lại/kiểm tra lại.

## Tài liệu payOS tham khảo (đã đối chiếu 2026-10-06)

- API tạo/đọc payment link và webhook: https://payos.vn/docs/api/
- Return URL và query params: https://payos.vn/docs/du-lieu-tra-ve/return-url/
- Kiểm tra webhook signature: https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/
- Ví dụ SDK backend .NET (nếu backend dùng .NET): https://payos.vn/docs/sdks/back-end/net/
