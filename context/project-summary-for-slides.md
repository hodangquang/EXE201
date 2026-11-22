# Tóm tắt REWEAR để làm slide

> Bản tóm tắt ngày 22/11/2026, dựa trên source local và context đến 27/10/2026. Source local đã có các luồng được mô tả dưới đây; chưa xác minh đồng bộ deploy, giao dịch production, hàng hóa hoặc tích hợp ngoài.

## Thông điệp chính

**REWEAR là nền tảng thời trang tuần hoàn, biến quần áo đã qua sử dụng thành sản phẩm tái chế có hành trình được ghi nhận và được kiểm định trước khi mở bán.** Phạm vi sản phẩm hiện tại chỉ giữ nhánh tái chế sáng tạo (Upcycled); không bán lại đồ nguyên trạng.

## Dàn ý slide đề xuất

### 1. REWEAR là gì?

- Nền tảng kết nối người gửi đồ, đội vận hành và khách mua trong một vòng đời tái chế.
- Giá trị hướng tới: kéo dài vòng đời vật liệu, quản lý quy trình từ đầu vào tới thành phẩm, và bán các món tái chế độc bản.
- Câu giới thiệu ngắn: **“Gửi đồ cũ — tạo vòng đời mới.”** Đây là thông điệp gợi ý cho slide, không phải số liệu hay kết quả tác động đã đo lường.

### 2. Hành trình tuần hoàn

**Gửi yêu cầu thu mua → xem xét và thống nhất giá → tiếp nhận, kiểm định → ghi nhận chi trả → cấp nguyên liệu vào dự án tái chế → sản xuất và ghi nhận chi phí → QC thành phẩm → đăng bán → khách đặt mua, thanh toán và theo dõi giao hàng.**

Chỉ thành phẩm từ dự án tái chế đã qua QC mới được đăng bán mới. Nhánh đăng bán trực tiếp và bán lại nguyên trạng đã bị khóa trong source local.

### 3. Ai sử dụng?

- **Khách xem:** xem câu chuyện thương hiệu và catalog thành phẩm.
- **Member:** gửi yêu cầu thu mua, theo dõi báo giá, quản lý hồ sơ/địa chỉ, mua hàng và xem trạng thái đơn.
- **Admin/Staff:** xử lý thu mua, tiếp nhận và kiểm định, quản lý dự án tái chế, chi phí, QC và catalog.
- **Shipper:** xem đơn được phân công và cập nhật tiến độ giao hàng.

### 4. Sản phẩm và chức năng chính

- Storefront: trang giới thiệu, catalog, chi tiết sản phẩm/hành trình, giỏ hàng, checkout và theo dõi đơn.
- Vận hành: yêu cầu thu mua, kho nguyên liệu, dự án tái chế, ghi chi phí, QC thành phẩm và đăng bán.
- Tài khoản: hồ sơ, địa chỉ, đơn mua, thu mua và thông báo.
- Sản phẩm đăng bán là độc bản, tồn kho một món theo logic hiện tại.

### 5. Công nghệ

- Frontend: React 19, Vite 8, React Router 7, Ant Design 6.
- Backend: ASP.NET Core 10, tổ chức theo các lớp API, Application, Domain và Infrastructure.
- Lưu trữ: MongoDB; tích hợp được chuẩn bị cho PayOS (thanh toán), Cloudinary (ảnh) và SMTP (email).
- Các phiên bản thư viện/API và cấu hình production cần xác minh lại trước khi đưa thành thông số công bố.

### 6. Hiện trạng triển khai

- Luồng tái chế-only đã được áp dụng trong source local; storefront, giỏ và checkout lọc/chặn sản phẩm không phải Upcycled.
- Bằng chứng gần nhất được ghi nhận ngày 27/10/2026: frontend production build đạt; backend 70/70 test tự động đạt; Chrome fixture 43 lượt kiểm tra đạt ở 1440/768/390 px.
- Đây là kiểm tra local/fixture, không phải nghiệm thu hệ thống production. Chưa xác minh deploy đồng bộ, thanh toán/giao hàng thật, SMTP, hoặc provenance của từng món Upcycled cũ.

### 7. Việc tiếp theo

- Deploy frontend và backend đồng bộ, rồi nghiệm thu luồng đầu-cuối trên môi trường thực.
- Xác minh nguồn gốc, ảnh, QC và khả năng giao của sản phẩm hiện có trước khi xem là hàng thật sẵn bán.
- Kiểm tra PayOS, Cloudinary, email và chính sách giao hàng/hoàn tiền bằng tích hợp phù hợp.
- Hoàn thiện hoặc loại khỏi phạm vi trình diễn các màn quản trị còn dùng mock/dữ liệu cục bộ.

## Lưu ý khi thuyết trình

- Nói “đã có trong source local/đã kiểm tra fixture” thay vì “đang chạy production”.
- Không đưa ra số lượng quần áo tái chế, lượng rác giảm, doanh thu, người dùng hoặc tác động môi trường: chưa có số liệu xác minh trong context.
- Chi trả cho người gửi được ghi nhận bằng chứng thủ công trong source; không mô tả là chuyển khoản tự động.
- Dashboard và một số màn báo cáo/quản trị còn mock; không trình bày như dữ liệu vận hành thật.
