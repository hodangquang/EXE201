# Rà luồng kiểm định thu mua và mở bán — 25/10/2026

## Trạng thái sau sửa trong source local

1. Khách gửi yêu cầu cùng ảnh, giá mong muốn và tình trạng **tự khai báo**. Nhân viên xem xét, đưa giá thu mua; khách đồng ý hoặc từ chối. Đây chưa phải kiểm định hiện vật.
2. Nếu có shipper, cửa hàng phải nhập tên liên hệ, địa chỉ, điện thoại và giờ hẹn thực tế. Shipper chuyển `Assigned → OnTheWay → PickedUp`; `PickedUp` chỉ nghĩa là đã lấy đồ. Nhân viên kho xác nhận nhận hàng bằng bước riêng `Accepted → Received`. Không tự tạo bản ghi kho từ nút của shipper. Trường hợp khách tự mang tới cửa hàng không cần chuyến shipper.
3. Nhân viên kiểm định nguồn hàng sau khi đã nhận: ghi tình trạng thực tế, kết quả đạt/không đạt, ghi chú và có thể tải 1–5 ảnh hiện vật. Không đạt → chờ trả đồ; tình trạng/giá khác thỏa thuận → chờ khách đồng ý lại, chưa chi trả. Đạt và đã đồng ý giá → `Approved`, kho `AwaitingPayout`.
4. Chi trả là **ghi nhận thủ công có chứng từ**; chỉ khi bản ghi `PurchasePayout` Confirmed và tiền khớp giá đã đồng ý mới chuyển nguyên liệu sang `AvailableRaw`. Hệ thống không tự chuyển khoản và không suy đã trả tiền từ status `Completed`.
5. Bán lại Second-hand: `AvailableRaw` phải qua QC hiện vật. QC đạt bắt buộc ghi 1–5 URL ảnh HTTPS; ảnh QC được lưu vào inventory, kèm lượt kiểm định và lịch sử trạng thái. API đăng bán chỉ nhận `QCApproved` có lượt QC đạt kèm ảnh; dùng đúng ảnh QC và tình trạng đã kiểm định nguồn hàng, từ chối tình trạng/ảnh khác. QC không đạt → `Rework`, có thể kiểm tra lại sau xử lý. Giá bán do nhân viên nhập, không lấy công thức nhân giá thu mua hoặc mẫu giả.
6. Upcycling: chỉ nguyên liệu đã chi trả được cấp dự án; phải có ảnh thành phẩm trước khi gửi QC dự án. QC không đạt → Rework; QC đạt mới được xuất bản. Ảnh trước lấy từ nguồn vật liệu, ảnh bán hàng lấy từ thành phẩm.

Endpoint/API đã đối chiếu **mã nguồn local**: `PATCH /api/Sourcing/{id}/received`, `/inspect`, `/accept`, `/decline`; `POST /api/operations/sourcing/{id}/payout`, `/inventory/{id}/qc`, `/inventory/{id}/publish`, `/projects/{id}/qc`, `/projects/{id}/publish`; shipper pickup dùng API sourcing riêng. `GET /api/Sourcing/my` và detail của member không trả ghi chú kiểm định nội bộ/ID nhân viên trong offer history; lý do từ chối, tình trạng và ảnh kiểm định được trả để khách đối chiếu. Chưa đối chiếu bản deploy hoặc tài khoản thực.

## Bằng chứng kiểm tra

- .NET build: 0 lỗi/cảnh báo. NUnit 53/53 trên Mongo replica test riêng (mỗi test database GUID), gồm QC thiếu ảnh/không đạt/đạt, chặn ảnh và tình trạng bị thay ở bước đăng bán, tách shipper pickup với nhận kho, kiểm tra ghi chú nội bộ không trả cho khách.
- Frontend Vite build: 4042 modules, chỉ còn cảnh báo bundle lớn. Chromium fixture cô lập: 13/13 kiểm tra ở 1440/390px cho màn duyệt nguồn, kho, QC và giao hàng; không ghi API thật. Ảnh/kết quả: `Rewear_BackEnd/.artifacts/qc-flow-ui/`.
- QA vận hành tổng quát cũ chạy được các route trước Profile nhưng dừng tại nút chi tiết đơn hàng của fixture Profile, ngoài phạm vi kiểm định; không dùng kết quả đó làm bằng chứng hoàn tất luồng Profile.

## Giới hạn còn mở

- Ảnh kiểm định chỉ được kiểm tra định dạng, dung lượng ở endpoint upload và URL HTTPS ở service; hệ thống không thể tự chứng minh ảnh đúng hiện vật, việc vệ sinh/sửa chữa thực tế hoặc người đã giao nhận. Cần quy trình đối chiếu tại kho.
- Nếu hiện vật QC bán lại không đạt và không thể sửa, trạng thái `Rework` chưa có quyết định tiêu hủy/chuyển mục đích/hoàn trả rõ ràng. Không tự chọn phương án vì liên quan quyền sở hữu sau chi trả.
- Ghi chú kiểm định nội bộ không còn trả cho member; chưa có trường giải thích công khai riêng khi báo giá đổi. Hiện member thấy giá mới/tình trạng/ảnh kiểm định và thông báo cần đồng ý lại.
- Payout chỉ là xác nhận thủ công, chưa đối soát ngân hàng. Các sản phẩm đã đăng bán **trước** thay đổi guard chưa được kiểm tra lại hoặc di chuyển trạng thái tự động. Sáu sản phẩm catalog đề xuất hiện vẫn là preview, tồn 0, không bán được; task này không tạo hiện vật/stock/QC giả cho chúng.
- Cập nhật pickup và một số sourcing write hiện dùng `ReplaceOne` theo ID, chưa có điều kiện version/compare-and-swap cho hai thao tác đồng thời; cần kiểm thử tranh chấp và siết ghi nguyên tử trước khi vận hành nhiều thiết bị cùng lúc.
