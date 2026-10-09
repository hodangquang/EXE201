---
name: api-integration
description: Tích hợp hoặc cải thiện các lời gọi API của REWEAR, gồm auth, sản phẩm, sourcing, profile và chuyển màn mock sang dữ liệu server; dùng khi task chạm endpoint hoặc state bất đồng bộ.
---

# API integration cho REWEAR

Đọc `context/README.md`, `context/architecture.md`, `context/api-contract.md`, `context/user-flows.md` và mã của flow liên quan. API contract trong context chỉ suy từ frontend; nếu backend hoặc OpenAPI được cung cấp, lấy đó làm nguồn chính và cập nhật context.

Với checkout, thanh toán, đơn hàng hoặc giao hàng, đọc thêm `context/future-plan-delivery-payment.md`; phân biệt rõ định hướng tương lai với endpoint đang có.

Giữ đúng session/role: admin login qua `AuthContext`, public auth qua `AuthModal`, shared `auth_session` và `authFetch`. Dùng JSON hoặc FormData đúng theo endpoint; không đặt `Content-Type` thủ công cho FormData. Chuẩn hóa response trước khi render, xử lý 401/error và loading/empty state nhất quán. Tránh request lặp hoặc kết quả cũ ghi đè khi filter đổi; cập nhật/invalidate dữ liệu sau mutation thành công.

Phân biệt rõ dữ liệu thật, mock và local state. Không biến thao tác demo thành thông báo đã lưu server nếu chưa có API tương ứng. Với thay đổi contract, kiểm tra cả nơi gọi và các adapter như `usePublicProducts`; kiểm tra quyền ở backend khi có quyền truy cập backend, không dựa riêng vào ẩn nút frontend.

Chạy build và kiểm tra flow bị ảnh hưởng bằng backend/mock có thể kiểm soát. Ghi endpoint/shape xác nhận vào `context/api-contract.md`, cập nhật `user-flows.md`, `known-gaps.md` và `CHANGELOG.md` sau task.
