# Deploy frontend REWEAR lên Render

Frontend hiện gọi API bằng đường dẫn `/api/...` và `/uploads/...`. `vite.config.js` chỉ tạo proxy tới `http://localhost:5000` khi chạy Vite local; Vite proxy không được đóng gói vào bản production.

## Cấu hình frontend production

1. Theo `FE_INTEGRATION_GUIDE.md` người dùng cung cấp, API production và Swagger nằm ở `https://rewear-wyb0.onrender.com`; người dùng báo Swagger chạy được. Nếu frontend và API thực sự cùng origin này, `VITE_API_BASE_URL` có thể để rỗng hoặc đặt bằng chính origin, rồi kiểm tra URL request trong Network. Nếu backend ở domain riêng, dùng origin backend public đó.
2. Trong Render của frontend, nếu dùng `VITE_API_BASE_URL`, đặt origin backend không thêm `/api` ở cuối và không dùng `localhost`.
3. Trigger deploy lại frontend vì biến `VITE_*` được nhúng lúc build.
4. Nếu API khác origin frontend, backend cần cho phép CORS từ origin frontend `https://rewear-wyb0.onrender.com` (không kèm `/index.html`) cùng header `Authorization`, `Content-Type` và các method API dùng.
5. Trong DevTools Network, xác nhận request `/api/payments/{orderId}/status` tới đúng backend sau checkout và lặp mỗi 3 giây khi Pending. Lỗi CORS phải sửa ở backend; Vite proxy local không giải quyết production.

## Client-side routes và PayOS callback

Nếu đang dùng Render Static Site, thêm rule trong **Redirects/Rewrites**: Source `/*`, Destination `/index.html`, Action **Rewrite** để route sâu tải trực tiếp/reload được. Nếu frontend đang được phục vụ bởi ASP.NET Web Service cùng Swagger, fallback route phải cấu hình ở server đó; rule Static Site không áp dụng. Loại dịch vụ live chưa kiểm chứng từ workspace.

Checkout nay chuyển nội bộ đến `/payment/waiting?orderId=...` trong tab REWEAR và mở PayOS ở tab mới. Tab REWEAR poll status ngay nên returnUrl PayOS 404 ở tab PayOS không chặn đồng bộ, dù vẫn cần fallback để UX callback hoạt động. OrderId lấy trực tiếp từ checkout; query `orderCode` PayOS có thể khác mã đơn REWEAR và không dùng để khẳng định đã trả tiền.

Mã frontend lấy base URL từ `VITE_API_BASE_URL` qua `apiUrl()` trong `src/services/auth.js`, dùng chung cho `authFetch`, đăng nhập quản trị và `AuthModal`. Khi biến rỗng, local development vẫn dùng URL tương đối và Vite proxy như trước.

Không đặt API key, PayOS secret hoặc thông tin đăng nhập trong biến `VITE_*`; các giá trị này có thể đọc được từ trình duyệt. PayOS credentials chỉ cấu hình ở backend.

## Chưa xác minh

Guide mới ghi API/Swagger production cùng origin `https://rewear-wyb0.onrender.com` và người dùng báo Swagger chạy được; môi trường làm việc chưa truy cập được live host để kiểm chứng HTTP/CORS hoặc biến môi trường Render.
- Backend source `REWEAR.API/Program.cs` đã thêm CORS allowlist cho origin `https://rewear-wyb0.onrender.com`. Thay đổi chỉ có hiệu lực sau khi backend được commit/deploy; cấu hình trên dịch vụ live chưa xác minh.
- Frontend dùng `BrowserRouter` và Vite SPA entry tại `/`; `/index.html` là entry document, không phải lệnh chạy frontend. Khi chẩn đoán link `https://rewear-wyb0.onrender.com/index.html` ngày 2026-10-07, trình duyệt web và `curl` trong môi trường làm việc không lấy được phản hồi (lỗi truy cập/TLS), nên chưa xác minh được trạng thái HTTP hoặc nội dung live. Không suy ra service live đang lỗi chỉ từ lần kiểm tra này.
- Cấu hình repo hiện không có `render.yaml`; cấu hình build/publish của Render Static Site không thể xác nhận từ source. Nếu trang mở nhưng request API lỗi, kiểm tra `VITE_API_BASE_URL` ở frontend Render, backend có chạy public, và CORS cho origin frontend.


## Nếu backend được deploy thành dịch vụ riêng

Theo ghi nhận cũ, backend repository ngoài workspace có Dockerfile Linux cho .NET 10 tại `REWEAR.API/Dockerfile` và CORS policy trong `REWEAR.API/Program.cs`. Thông tin này thuộc lần kiểm tra trước; hiện guide và người dùng báo Swagger đang chạy ở cùng origin frontend. Cần kiểm tra Render dashboard để biết Web Service nào phục vụ API/SPA hiện tại trước khi thay đổi cấu hình deployment.

Khi tạo Web Service riêng, dùng repository backend, Dockerfile path `REWEAR.API/Dockerfile`, Docker context là thư mục gốc backend. Cấu hình các biến production trong Render Environment: MongoDB connection string/database, JWT secret/issuer/audience, Cloudinary credentials; thêm PayOS credentials khi bật thanh toán. Dùng MongoDB public/managed instance có thể truy cập được từ Render; `docker-compose.yml` local không tự chạy cùng Render Web Service.

Nếu dùng backend riêng, frontend Render đặt `VITE_API_BASE_URL` bằng URL public HTTPS của backend và redeploy frontend. Kiểm tra API Swagger/health endpoint và request từ browser; nếu backend deploy khác branch/repo, nhớ đưa các thay đổi Dockerfile/CORS vào đúng source đang deploy.
