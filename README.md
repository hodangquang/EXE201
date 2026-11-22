# REWEAR

REWEAR là nền tảng thời trang tuần hoàn. Repository gồm frontend React/Vite và backend ASP.NET Core trong `Rewear_BackEnd/`; giao diện khách hàng và vận hành dùng chung hệ thống.

## Chạy trên máy cá nhân

```powershell
npm.cmd install
npm.cmd run dev
```

Vite chuyển tiếp `/api` và `/uploads` tới backend tại `http://localhost:5000` khi phát triển local.

## Kiểm tra bản dựng

```powershell
npm.cmd run build
```

Đọc [context/README.md](context/README.md) để xem kiến trúc, màn hình, luồng dữ liệu và các phần còn dùng dữ liệu minh họa. Dàn ý thuyết trình có tại [context/project-summary-for-slides.md](context/project-summary-for-slides.md). Quy tắc làm việc và thương hiệu nằm trong [AGENTS.md](AGENTS.md).
