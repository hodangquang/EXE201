# Context dự án REWEAR

Thương hiệu hiển thị là **REWEAR**; nội dung giao diện do dự án kiểm soát dùng tiếng Việt. Quy tắc chi tiết ở `AGENTS.md` và `skills/ui-design/SKILL.md`.

Ảnh chụp hiểu biết từ mã nguồn frontend cập nhật đến **2026-10-18**. Repo này chỉ chứa ứng dụng React; backend tại `localhost:5000` không nằm trong workspace. Vì vậy contract API bên dưới là **suy ra từ client**, trừ schema người dùng cung cấp; cần đối chiếu backend trước khi kết luận chính thức.

## Cách đọc

1. `architecture.md`: công nghệ, cấu trúc, state, xác thực, phân vai.
2. `routes-and-screens.md`: route, màn hình, nguồn dữ liệu, hành động.
3. `user-flows.md`: hành trình storefront, sourcing, quản trị.
4. `api-contract.md`: endpoint, payload, response assumptions, nguyên tắc tích hợp.
5. `design-ui.md`: giao diện thực tế, token, responsive, cải tiến UI.
6. `source-map.md`: bản đồ file và nơi bắt đầu đọc khi sửa từng module.
7. `known-gaps.md`: chỗ demo, rủi ro đã thấy, ưu tiên cải thiện.
8. `future-plan-delivery-payment.md`: trạng thái tích hợp shipping frontend hiện tại và định hướng còn mở cho shipper, giao hàng, payOS; phân biệt endpoint đã nối với flow/backend chưa kiểm chứng.
9. `CHANGELOG.md`: lịch sử cập nhật context theo task.
   `editorial-ui-2026-10-18.md`: nâng cấp ảnh/chuyển động ngoài Home, nguồn ảnh và bằng chứng QA.
   `ui-qa-2026-10-17.md`: phạm vi QA ngoài Home, thay đổi UI/tương tác, bằng chứng browser và giới hạn kiểm tra.
10. `payment-checkout-audit.md`: đối chiếu lỗi tạo link PayOS với backend đang chạy, mã backend và tài liệu payOS; ghi rõ phần backend cần sửa.

## Skill trong repo

- `skills/ui-design/SKILL.md`: dùng khi sửa hoặc thiết kế storefront và admin UI.
- `skills/api-integration/SKILL.md`: dùng khi tích hợp API, auth, loading, dữ liệu server.

Các skill nằm trong repo để người và coding agent đọc qua `AGENTS.md`; không phụ thuộc việc Codex cài skill ở máy riêng. Sau mỗi task, sửa tài liệu liên quan và ghi changelog. Không chép lại toàn bộ mã nguồn vào context.

## Chạy và kiểm tra

`npm.cmd install`, `npm.cmd run dev`, `npm.cmd run build` trên PowerShell Windows. Vite proxy `/api` và `/uploads` sang `http://localhost:5000`. `npm.cmd run build` đã chạy thành công ngày 2026-10-18 sau tích hợp shipping (4027 modules), có cảnh báo JS bundle khoảng 1.99 MB. `npm.cmd run lint` hiện thất bại vì thiếu `eslint.config.*` (ESLint 10).

11. `render-deployment.md`: cấu hình frontend Render gọi API backend qua `VITE_API_BASE_URL` và yêu cầu CORS production.
12. `../FE_INTEGRATION_GUIDE.md`: tài liệu tích hợp FE do người dùng cung cấp, mô tả checkout trả `data.order.id`, mở PayOS ở tab riêng và polling `GET /api/payments/{orderId}/status`; các ví dụ là contract, chưa thay thế kiểm tra response live.
