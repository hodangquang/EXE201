# REWEAR — kết quả triển khai luồng vận hành, 25/10/2026

Tài liệu này mô tả **mã nguồn local sau thay đổi**, thay thế các kết luận audit cũ ở những phần được nêu bên dưới. Chưa deploy, chưa chạy migration trên database đang vận hành, chưa thực hiện giao dịch tiền thật. Không phải chứng nhận đã hoàn thiện toàn bộ 16 phân hệ trong Master Prompt.

## Luồng đã triển khai

1. Người gửi tạo yêu cầu bán đồ cũ, staff báo giá có phiên bản; người gửi phải chấp thuận đúng phiên bản.
2. Staff xác nhận nhận hàng; hệ thống tạo bản ghi kho và lịch sử. Kiểm định không đạt tạo nhánh trả người gửi. Nếu tình trạng/giá thay đổi thì phải xin người gửi đồng ý lại trước khi chi trả.
3. Staff ghi nhận **chi trả thủ công đã thực hiện**, với số tiền bằng giá được đồng ý, phương thức, chứng từ và người xác nhận. Chưa có dịch vụ chuyển tiền cho người gửi. Một yêu cầu chỉ có một payout; thao tác lặp không cộng tiền/kho.
4. Nguyên liệu đã chi trả mới được bán lại hoặc cấp cho dự án tái chế. Mỗi món chỉ được cấp cho một dự án đang sử dụng nó.
5. Dự án lưu ý tưởng, phụ trách, nguyên liệu, ảnh trước/sau, chi phí vật tư/nhân công, tiến độ và lịch sử. QC không đạt về Rework; chỉ QCApproved mới được đăng bán.
6. Đăng bán tạo sản phẩm Upcycled độc bản, tồn 1, ảnh thành phẩm, nguồn nguyên liệu và giá vốn. Nguyên liệu nguồn chuyển Consumed; thành phẩm có bản ghi kho bán lẻ riêng.
7. Checkout tính giá server, chụp thông tin sản phẩm/địa chỉ/giá vốn, giữ hàng theo **order-owned reservation**. Tồn, order và history nằm trong Mongo transaction. Đơn đã thu tiền chốt sản phẩm Sold; delivery không trừ thêm lần nữa.
8. Backend tạo phiên payOS bằng mã cổng thanh toán bền vững, ký request, kiểm tra chữ ký phản hồi tạo link, xác minh webhook và đối soát trực tiếp. Query/returnUrl frontend không xác nhận thanh toán. Giỏ chỉ bỏ các dòng đã mua sau khi lưu link thanh toán hợp lệ.
9. Chỉ giao đơn Paid, không có đối soát/hoàn tiền đang chờ. Shipper chỉ xem/cập nhật đơn được phân công, đi Pending → InTransit → Delivered hoặc Failed, bắt buộc mã vận đơn/lý do thất bại. Staff sửa metadata không tự chuyển trạng thái giao.
10. Admin có thể yêu cầu giao lại đơn Failed đủ điều kiện hoặc chuyển nhánh hàng hoàn. Tiếp nhận toàn bộ đơn → kiểm định từng món → yêu cầu hoàn tiền → admin xác nhận chứng từ hoàn tiền thực tế. Chỉ món được QC duyệt bán lại mới tăng tồn sau bước cuối; món bị cách ly vẫn không bán được.
11. Dashboard tổng hợp từ Mongo theo thời điểm xác nhận thu tiền, hoàn tiền, chi trả và ghi chi phí. Giá vốn lấy từ snapshot order. Thiếu giá vốn, có khoản hoàn trong kỳ hoặc cần đối soát thì không đưa ra con số lãi gộp đầy đủ.

## Phân quyền và tính nhất quán

- Public registration luôn tạo Member; bỏ khả năng gửi role đặc quyền. Catalog writes cần Staff/Admin; Brand writes cần Admin.
- OTP dùng CSPRNG, giới hạn 5 lần sai trong transaction; auth endpoints giới hạn 5 yêu cầu/phút theo IP và đường dẫn. SMTP lỗi trả false, không báo gửi email thành công và không log OTP.
- Bỏ endpoint debug JWT, TLS bypass và ép IP payOS. Dùng DNS/TLS nền tảng, HttpClient không tự đi theo redirect mang credential.
- Cần MongoDB replica set/sharded cluster. Không fallback về các write rời rạc khi transaction không khả dụng.
- Reservation 15 phút mặc định; `Commerce:ReservationMinutes` nhận 2–60 phút. Deadline của order không gia hạn khi retry.
- Khởi tạo phiên đồng thời được serialize trên document order để tránh hai mã thanh toán. Retry dùng cùng mã cổng thanh toán.
- Worker đóng Pending hết hạn và cả order giữ hàng chưa kịp có Payment; giải phóng toàn bộ batch tồn kho trước khi gọi gateway để tránh mạng chậm giữ hàng của đơn tiếp theo. Có vòng đối soát bù cho giao dịch chưa xác nhận trong 30 ngày gần nhất, tối đa 10 bản ghi/vòng, khoảng cách kiểm tra 5 phút. Đây là giới hạn triển khai hiện tại; giao dịch cũ hơn cần vận hành đối soát chủ động.
- Tiền đến muộn/sai số tiền/nhận thêm từ chứng từ khác chuyển đối soát, không lấy reservation của đơn khác. Webhook lặp không cộng lại tiền hoặc tồn.
- Automatic refund chưa bật vì contract merchant refund chưa được xác minh. Yêu cầu refund và xác nhận đã hoàn là hai bước khác nhau; chứng từ do Admin xác nhận, không tự chuyển tiền.
- Sản phẩm legacy thiếu `stockQuantity` được đọc là 0, không tự tạo một món có thể bán. Không tự backfill giá vốn, giao dịch, payout hoặc reservation từ trạng thái sản phẩm.

## API mới và thay đổi contract

Tất cả `/api/operations/*` cần Staff/Admin; riêng `GET /metrics` cần Admin. Các response thành công bọc `{ success: true, data }`.

| API | Mục đích |
| --- | --- |
| GET `/api/operations/inventory` | Kho nguyên liệu/thành phẩm/hàng hoàn |
| GET `/api/operations/inventory/{id}/movements` | Lịch sử kho |
| GET `/api/operations/operators`, `/shippers` | Danh sách nhân viên được phép chọn, DTO giới hạn |
| GET `/api/operations/payouts` | Các khoản chi trả đã ghi nhận |
| POST `/api/operations/sourcing/{id}/payout` | `{ amount, method: Cash/ManualTransfer, reference, note }` |
| POST `/api/operations/inventory/{id}/return-to-sender` | `{ reference }` xác nhận đã trả đồ không mua |
| GET/POST `/api/operations/projects` | Danh sách / tạo dự án với inventoryIds và responsibleStaffId |
| GET `/api/operations/projects/{id}` | `{ project, inspections }` |
| PATCH `/api/operations/projects/{id}/status` | `{ state, note, afterImages? }` |
| POST `/api/operations/projects/{id}/costs` | `{ idempotencyKey, kind: Material/Labor, amount, note }` |
| POST `/api/operations/projects/{id}/qc` | `{ passed, note, images }` |
| POST `/api/operations/projects/{id}/publish` | Tiêu đề, mô tả, brandId, categoryId, sellingPrice, size/color |
| POST `/api/operations/images` | Multipart file, kiểm tra chữ ký JPEG/PNG/WebP, tối đa 5 MB, upload Cloudinary thật |
| GET `/api/operations/orders` | Phân trang, search, status, from inclusive/to exclusive |
| GET `/api/operations/orders/{id}` | Order snapshot, payment DTO, shipping, history, return |
| POST `/api/operations/orders/{id}/reconcile` | Đối soát chủ động với payOS |
| POST `/api/operations/orders/{id}/refund` | Yêu cầu hoàn trước khi giao hoặc giao dịch cần đối soát |
| GET `/api/operations/metrics?from=&to=` | Tổng hợp tài chính theo kỳ, tối đa 366 ngày; trạng thái kho/đơn/dự án tại hiện tại |
| GET/POST `/api/returns/orders/{orderId}` | Người mua xem/gửi yêu cầu trả toàn bộ đơn của mình |
| GET `/api/returns` | Staff/Admin xem các yêu cầu hoàn |
| POST `/api/returns/orders/{id}/receive` | Staff/Admin: reference, reason, xác nhận nhận đủ hàng |
| POST `/api/returns/orders/{id}/inspect` | Staff/Admin: items[] gồm productId, restockApproved, condition, note |
| POST `/api/admin/payments/{id}/refund/confirm` | Admin: `{ reference, amount }`, xác nhận đã hoàn tiền thực tế |

`PATCH /api/Sourcing/{id}/accept` gửi `{ offerVersion }`. Kiểm định sourcing thêm passed/revisedPrice/images. Sourcing numeric: 6 Completed, 7 Rejected, 8 Declined. Payment numeric theo source: 0 Pending, 1 Paid, 2 Failed, 3 Expired, 4 Refunded; endpoint status ưu tiên chuỗi. Order bổ sung 7 ReturnRequested, 8 ReturnReceived, 9 Returned; không đổi mã cũ. Product PUT giữ multipart/KeepImageUrls; giữ stock hiện có, không reset về 1. Cart thêm isUnique; UI khóa tăng số lượng khi chạm giới hạn.

## Giao diện đã nối dữ liệu thật

- `/inventory`, `/upcycling`, `/upcycling/:id`, `/upcycling/qc`: bỏ mock; form tạo dự án, cấp nguyên liệu, upload, ghi chi phí, QC, đăng bán và lịch sử kho.
- `/orders`, `/orders/:id`, `/dashboard`: bỏ mock; tìm/lọc/phân trang đơn, payment/shipping tách riêng, refund/return/reship và tổng hợp tài chính từ API.
- `/collections/sourcing`: chi trả có chứng từ, kiểm định, giá điều chỉnh, sửa condition enum, chỉ đăng bán khi có payout.
- `/shipping`, `/shipper/orders`: chọn shipper bằng tên từ API, nhãn trạng thái tiếng Việt, chỉ hiện bước tiếp theo hợp lệ, bỏ nhập mã số trạng thái/số lần giao thủ công.
- Profile: chấp thuận giá có phiên bản, hiển thị chi trả, timeline từ tracking API và yêu cầu trả hàng. Store PDP hiển thị loại SecondHand/Upcycled được backend trả về.
- CSS mới giới hạn trong ops/drawer/modal; sửa overflow bảng và nền cảnh báo. Giữ mã Home/navbar; các file About có thay đổi từ task trước được giữ.
- Quyên góp/inspection demo cũ, khuyến mãi và settings còn nhãn minh họa. Chưa thay toàn bộ các trang ngoài luồng chấp nhận bằng API.

## Bằng chứng kiểm tra

- Backend test suite sử dụng MongoDB local port 27029, replica set `rewear-tests`, mỗi test database GUID riêng và chỉ xóa database test của chính nó. Không đọc cấu hình ứng dụng production. API startup test chạy content root trống, toàn bộ cấu hình test được truyền tường minh.
- 36/36 bài pass trong lượt chốt; TRX: `Rewear_BackEnd/REWEAR.Tests/TestResults/acceptance-20261025.trx` (24 giây). Bao gồm auth 401/403, rate limit 429, CORS, startup DI thực, OTP, cạnh tranh checkout/session, webhook lặp, tiền muộn/sai/thêm, rollback, payout trùng, nguyên liệu cấp trùng, QC, hàng hoàn và migration chạy lại.
- Kịch bản `JeansToToteToPaidDeliveryUsesPersistedLifecycleAndCost`: mong muốn 120.000đ → đồng ý 100.000đ → payout → tái chế/QC → Tote 299.000đ → Paid → Delivered. Chi phí tái chế **fixture kiểm thử** 20.000đ vật tư + 50.000đ nhân công; báo cáo xác nhận thu 299.000đ, chi trả 100.000đ, tái chế 70.000đ, lãi gộp tham khảo 129.000đ. Không phải định mức giá/chi phí production.
- `dotnet build ... --no-restore -o Rewear_BackEnd/.artifacts/verified` đã pass, 0 warning/0 error. Pkcs pin 10.0.13 sau đối chiếu advisory Microsoft; restore NuGet bản vá thành công.
- `npm.cmd run build -- --emptyOutDir false` pass. Dùng tùy chọn này vì một ảnh dist đang bị process khác khóa; không tắt process của người dùng. Còn cảnh báo bundle ~1,64 MB.
- Chromium/CDP: 37 lượt kiểm tra fixture ở 1440/768/390 px, 8 route vận hành, modal dự án/chi trả/hoàn tiền/phân công, Profile timeline/yêu cầu trả hàng, trạng thái empty/error, không có JavaScript exception chưa xử lý hoặc tràn ngang trang. Script tái chạy ở `tools/qa/operations-ui.cjs`; API bị intercept bằng fixture trong kiểm tra UI, không phải bằng chứng PayOS/Cloudinary live. Ảnh và results lưu ở thư mục temp `rewear-operations-ui-qa`.

## Điều kiện triển khai và phần còn mở

Đọc `../Rewear_BackEnd/docs/COMMERCE_MIGRATION.md` trước khi nâng backend. Build/test pass không đủ để tự áp migration vào database thật.

- Cần kiểm kê reservation cũ không có owner/deadline, stock bị thiếu, email trùng và payment/index cũ. Không khôi phục tồn hoặc bịa transactionId từ status. Chỉ dữ liệu mới đi qua luồng có ledger được bảo đảm bằng các test hiện tại.
- payOS live cần đúng merchant config, frontend AppBaseUrl, webhook HTTPS đăng ký thật và đối chiếu bank/gateway. Cloudinary/SMTP cần nghiệm thu bằng cấu hình thật. Chưa gửi tiền, hoàn tiền, gửi email hay upload production trong task.
- Full-order returns đã có; partial return/refund, hoàn riêng khoản chuyển dư, hủy có một phần đã giao, mất hàng và bồi hoàn chưa có workflow tự động. Trường hợp phức tạp phải giữ đối soát, không coi nút hoàn toàn bộ đơn là xử lý khoản dư một phần.
- Dữ liệu lịch sử thiếu PaidAt/giá vốn làm báo cáo bảo thủ; chưa có kế toán đầy đủ, phí gateway, thuế, chi phí hoạt động hoặc settlement theo ngân hàng.
- Một số list vòng đời vẫn tải toàn bộ rồi phân trang UI; cần server pagination và load/performance test khi dữ liệu lớn. JWT chưa có refresh/revocation tập trung, rate limit hiện theo instance; chưa phải audit xâm nhập độc lập.
- Bằng chứng giao hàng hiện là người thao tác, timeline, mã vận đơn và ghi chú; chưa có ảnh/chữ ký/định vị bắt buộc. Hoạt động worker khi hosting ngủ cần scheduled job/giám sát triển khai.
- Lint baseline thiếu eslint.config; chưa có regression test toàn bộ storefront và 16 phân hệ. Có bộ test cho luồng trọng tâm và UI fixture, chưa có một phiên browser dùng merchant live từ đầu tới cuối.
