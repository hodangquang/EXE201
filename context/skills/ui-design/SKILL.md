---
name: ui-design
description: Cải thiện UI/UX frontend REWEAR; dùng khi thiết kế hoặc sửa layout, component, CSS, responsive và tương tác trên storefront hoặc admin. Nội dung giao diện dùng tiếng Việt.
---

# UI design cho REWEAR

Đọc `context/README.md`, `context/design-ui.md`, `context/routes-and-screens.md` và màn hình/CSS liên quan. Với flow có dữ liệu server, đọc thêm `context/api-contract.md`.

Với UI checkout, trạng thái thanh toán, timeline đơn hoặc trang shipper, đọc thêm `context/future-plan-delivery-payment.md` và thiết kế theo trạng thái backend trả về.

Giữ tương quan giữa storefront editorial và admin Ant Design. Lấy token CSS ở `src/index.css`, theme Ant Design ở `src/styles/theme.js`; đối chiếu `REWEAR_DESIGN_SYSTEM.md` với code thực trước khi chọn giá trị. Ưu tiên sửa shared component/token khi cùng vấn đề xuất hiện nhiều nơi, nhưng kiểm tra mọi màn dùng chung `.rw`/`HomePage.css`.

Mọi logo, tiêu đề, mô tả, nhãn nút và thông báo do dự án kiểm soát phải dùng REWEAR và tiếng Việt. Dữ liệu lấy từ backend giữ nguyên nội dung gốc; tên riêng dịch vụ ngoài và đường dẫn kỹ thuật không phải tên thương hiệu ứng dụng. Không đưa chính sách, thông số hay đánh giá mẫu từ giao diện tham khảo vào nội dung REWEAR.

Khi thay UI, xem đủ trạng thái loading, empty, error, success và disabled; làm rõ CTA còn demo. Kiểm tra desktop, tablet, mobile; bàn phím, focus, contrast, alt/label và reduced motion khi có animation. Chú ý listing có 3 bản gần giống, PDP có gallery/cart drawer, admin table có nội dung dài.

Sau khi sửa, chạy build và kiểm tra đúng màn/flow bị ảnh hưởng. Ghi quyết định thiết kế mới vào `context/design-ui.md`, vấn đề còn lại vào `context/known-gaps.md`, và mục task vào `context/CHANGELOG.md`.
