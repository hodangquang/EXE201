# Triển khai Master Prompt REWEAR — 2026-10-24

Nguồn yêu cầu: Master Prompt đính kèm và kịch bản Jeans → chi trả → kho → Tote → QC → payOS → giao → báo cáo. Không chạy migration/data mutation production hoặc giao dịch tiền thật.

## Baseline

- Frontend React 19/Vite 8 và backend .NET 10/MongoDB, kiến trúc hiện có được giữ.
- `npm.cmd run build` và `dotnet build Rewear_BackEnd/REWEAR.API/REWEAR.API.csproj --no-restore` thành công trước sửa. Backend có cảnh báo dependency Pkcs; frontend cảnh báo bundle.
- Backend là Git repo riêng trong `Rewear_BackEnd/`; thay đổi có sẵn ở docs context và Dockerfile được giữ. Các thay đổi About/context/dist có sẵn từ task trước không thuộc phạm vi ghi đè.

## Issue map / thứ tự

1. P0 auth: `AuthService.RegisterAsync` nhận role; Products/Brands/Categories thiếu write authorization; `Program.cs` có debug JWT lộ thông tin khóa và TLS bypass. OTP chưa giới hạn thử, cần rate limit.
2. P0 giao dịch: OrderService ghi order/cart/history/kho rời rạc; kho chưa có reservation owner; PaymentService success/expiry/refund thay trạng thái qua nhiều write không atomic; PayOsService log payload và refund contract chưa xác minh.
3. P0 contract: sourcing numeric 6/7/8, payment Paid/Failed, product PUT JSON/form-data, Staff shipping policy, shipping transition guard và ownership detail.
4. P1 sourcing/payout/kho/upcycling/QC: bổ sung bằng dữ liệu Mongo thật, lưu nguồn/cost/actor/history, chặn trùng payout/nguyên liệu và publish trước QC.
5. P2 orders/dashboard/returns: thay mock bằng API, thống kê theo record tài chính và cost snapshot, nhận hoàn hàng/kiểm định trước bán lại.
6. UI/QA: giữ REWEAR/Home; hoàn thiện page vận hành và kiểm thử âm/concurrency/end-to-end với gateway test double chỉ trong tests.

## Cổng kiểm chứng

- Mỗi mốc cần backend/frontend build + tests phù hợp. Không ghi “PayOS live đạt” từ gateway test double.
- Mongo transaction cần replica set; không âm thầm fallback về nhiều write thiếu atomic. Schema mới phải additive và có tài liệu/index/migration versioned; không xóa dữ liệu cũ.
- Sau từng mốc cập nhật bằng chứng và phần chưa thực hiện ở tài liệu này, docs backend và CHANGELOG.

## Tiến độ

- [x] Audit và baseline build.
- [x] Phase 1: quyền/contract/checkout/payment/refund.
- [x] Phase 2: sourcing/payout/inventory/upcycling/QC.
- [x] Phase 3: orders/shipping/returns/dashboard.
- [ ] Phase 4: UX và kiểm chứng tổng thể.

Phase 1–3 hoàn thành ở phạm vi luồng trọng tâm local; không có nghĩa toàn bộ API/merchant live đã được nghiệm thu. Phase 4 đã có UI responsive và kiểm thử trọng tâm, còn regression toàn storefront, hiệu năng và live staging. Chi tiết/bằng chứng/phần mở: [báo cáo 25/10/2026](implementation-report-2026-10-25.md).
