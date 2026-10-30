# Cơ hội tính năng nổi bật — 25/10/2026

> Cập nhật 25/10/2026: mục **Theo dõi gu đồ** đã được triển khai trong source/API local; xem [báo cáo thực hiện](style-watch-implementation-2026-10-25.md). Bảng dưới là đề xuất ban đầu, không phản ánh riêng trạng thái hiện tại của mục 2.

Đây là đánh giá ban đầu. Mục Theo dõi gu đồ đã triển khai sau đó; các mục khác vẫn là đề xuất. Đối chiếu source local sau [rà soát nghiệp vụ](business-flow-audit-2026-10-25.md); trạng thái deploy chưa xác minh.

| Ưu tiên | Tính năng đề xuất | Điểm tựa hiện có | Phần cần xây | Mức công sức ước tính |
| --- | --- | --- | --- | --- |
| 1 | **Hồ sơ món đồ độc bản**: số đo thật, vị trí vết lỗi, tình trạng kiểm định, ảnh nhiều góc và hành trình đã xác nhận. Với upcycling có thể kể quá trình trước/sau nếu dữ liệu có thật; bán lại không cần ảnh trước. | Gallery và `ProductJourney`/`GET /api/products/{id}/journey` đã có ảnh, mốc vòng đời và `isComplete`. | Field số đo theo loại đồ, ghi chú lỗi và ảnh gắn vị trí; UI ngắn gọn trên PDP, nhập liệu một lần ở QC hoặc form sản phẩm. Chỉ hiển thị mốc/ảnh được xác minh, không dựng số liệu môi trường. | Vừa |
| 2 | **Theo dõi gu đồ**: khách lưu cỡ, loại, màu, giá; khi món mới hợp tiêu chí được mở bán thì báo trong tài khoản/email nếu khách chọn nhận. | Catalog API có loại/cỡ/màu/giá; đăng bán là sự kiện rõ ràng. | Saved search, backend matching và thông báo opt-in; không có hệ yêu thích/thông báo thật trong source hiện tại. | Vừa |
| 3 | **Mặc tiếp một vòng đời**: khách đã mua từ REWEAR gửi lại chính món đó để bán/đổi; hành trình sản phẩm nối sang vòng tiếp theo. | Đã có đơn hàng, yêu cầu thu mua và ProductJourney. | Liên kết đơn đã giao với yêu cầu thu mua mới, xác minh quyền sở hữu/hiện vật, bảo vệ dữ liệu người mua cũ, quy tắc giá và ID sản phẩm mới. | Lớn |

Ưu tiên thực tế: trước khi mở rộng tính năng tăng mua, cần đối chiếu hiện vật/ảnh của món đang bán và có thêm hàng thật. API local hiện có 1 món mở bán, 5 món preview; nguồn ảnh của cả 6 là `ai-generated`. Hồ sơ độc bản chỉ có giá trị khi nội dung phản ánh món thật. Không khôi phục yêu cầu bắt buộc ảnh trước/sau ở bước mở bán một chạm mà người dùng đã bỏ; nếu có ảnh nguồn gốc xác minh được thì bổ sung tự nguyện hoặc qua QC.

Tham khảo mô hình, không sao chép chính sách: [Depop Saved Searches](https://depophelp.zendesk.com/hc/en-gb/articles/360019648117-Saved-Searches) xác nhận tính năng lưu tìm kiếm và thông báo; [Patagonia Worn Wear](https://www.patagonia.com/worn-wear/?tab=suite) có mua đồ cũ, sửa và thu mua lại. Suy luận cho REWEAR: ghép hồ sơ từng món với luồng thu mua/upcycling hiện có có thể tạo trải nghiệm rõ ràng hơn một gallery ảnh đơn thuần.
