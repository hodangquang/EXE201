# Chạy kiểm tra giao diện vận hành

## Chỉ tái chế — 27/10/2026

Chạy node tools/qa/recycling-only.cjs với Vite 127.0.0.1:5196 và Chrome headless CDP 9246, hồ sơ riêng trong .artifacts/recycling-only/chrome-profile. Khởi động bằng Start-Process -WindowStyle Hidden; không dùng hồ sơ người dùng. Script intercept toàn bộ /api/* bằng fixture và dùng JSON bản lưu thật trong repo, không gọi mutation API thật. Bao phủ kho, QC dự án, sourcing, danh sách/bản lưu, redirect tạo hàng, storefront/PDP ẩn hàng bán nguyên trạng, preview không có nút mở bán trực tiếp và empty/error ở 1440/768/390 px. Đã đạt 43 lượt (42 tổng thể + 1 ghi chi phí), không có lỗi JavaScript. Bằng chứng .artifacts/recycling-only/browser. Script qc-flow-ui.cjs và catalog-drafts.cjs cũ còn kỳ vọng nhánh resale/6 mẫu; không dùng làm contract hiện tại.


## Bộ sản phẩm đề xuất — 25/10/2026

**Gallery nhiều góc:** `node tools/qa/catalog-gallery.cjs`, frontend localhost:5173 và Chrome headless profile riêng/CDP 9239; tùy chọn `REWEAR_GALLERY_QA_ORIGIN` / `REWEAR_GALLERY_QA_CDP`. Đã đạt 168 kiểm tra thực tế cho sáu sản phẩm ở 1440/768/390 px, chọn đủ bốn ảnh, cận cảnh mặc định, zoom/Escape và ảnh nguyên liệu. Không intercept/API fixture hoặc gửi thao tác ghi. Bằng chứng `.artifacts/gallery-qa/`; xem `context/catalog-gallery-2026-10-25.md`.

**Storefront dùng API thật sau khi thay dữ liệu:** `node tools/qa/catalog-storefront.cjs`. Cần frontend localhost:5173 + API localhost:5000 đã chạy và Chrome headless profile riêng/CDP 9238. Không mock/intercept API, không đăng nhập hay ghi dữ liệu. Đổi host qua `REWEAR_CATALOG_QA_ORIGIN` và `REWEAR_CATALOG_QA_CDP`. Đã đạt 40 kiểm tra ở 1440/768/390 px; screenshot và kết quả tại `.artifacts/catalog-storefront-qa`. API đang dùng database đã thay thật; không chạy lệnh nhập từ script QA này.

`node tools/qa/catalog-drafts.cjs` kiểm tra route `/products/drafts` với session tổng hợp và chặn mọi `/api/*`; không ghi sản phẩm hoặc tồn kho live. Cần Vite local cổng 5198 và Chrome headless profile riêng mở CDP cổng 9237. Có thể đổi qua `REWEAR_DRAFT_QA_ORIGIN` / `REWEAR_DRAFT_QA_CDP`. Mở Chrome với `-WindowStyle Hidden` khi dùng Start-Process. Không dùng profile đang đăng nhập của người dùng.

Đã đạt 54 kiểm tra ở 1440/768/390 px: filter/tìm kiếm, trước/sau Upcycled, ảnh hiện tại SecondHand, download và decode 8 PNG, disclosure/role. Kết quả và screenshot ở `Rewear_BackEnd/.artifacts/catalog-drafts-qa/`. Xem `context/catalog-drafts-2026-10-25.md` để phân biệt bộ đề xuất với sản phẩm server.

## Giao diện vận hành với fixture

`operations-ui.cjs` là kiểm tra Chromium/CDP **dùng API fixture**. Script intercept mọi `/api/*`, không gửi thao tác tới backend thật, không chứng minh payment/upload live. Token trong script chỉ là chuỗi fixture dùng để mở giao diện local; không phải tài khoản thật.

1. Chạy Vite local cổng 5184: `npm.cmd run dev -- --host 127.0.0.1 --port 5184 --strictPort`.
2. Mở Chromium headless với remote debugging port 9224, profile tạm riêng và tab `about:blank`; không dùng browser/profile đang đăng nhập của người dùng.
3. Chạy `node tools/qa/operations-ui.cjs`.
4. Kết quả/screenshot nằm trong thư mục temp `rewear-operations-ui-qa`.

Script kiểm tra 37 lượt: 8 route vận hành ở 1440/768/390 px, modal và empty/error; thêm Profile timeline/yêu cầu trả hàng ở desktop/mobile. Bộ kiểm thử backend/Mongo và startup HTTP riêng ở `Rewear_BackEnd/REWEAR.Tests`; hướng dẫn đầy đủ ở `context/implementation-report-2026-10-25.md`.

## Shipping/Đơn mua dùng API local thật — 25/10/2026

`shipping-real-api.cjs` được test Explicit `ShippingBrowserAcceptanceAgainstRealLocalApi` khởi chạy với API Kestrel/JWT thật, Mongo database GUID riêng, gateway test double, Vite trỏ `VITE_API_BASE_URL` về đúng host local và Chromium profile riêng. Không intercept API, không dùng tài khoản/payment thật.

Chạy khi Mongo replica set test riêng cổng 27029 sẵn sàng:

```powershell
dotnet test Rewear_BackEnd/REWEAR.Tests/REWEAR.Tests.csproj --no-restore -p:OutputPath=D:/EXE201/Rewear_BackEnd/.artifacts/phase5-tests/ --filter 'Name=ShippingBrowserAcceptanceAgainstRealLocalApi' --logger 'trx;LogFileName=shipping-browser.trx'
```

Yêu cầu Node, Chromium tại đường dẫn trong script hoặc REWEAR_QA_CHROME, cổng frontend 5197 và CDP 9226 trống. Test dọn database/file cấu hình tạm và dừng đúng Vite/Chrome do nó mở. Kết quả/screenshot tại Rewear_BackEnd/.artifacts/delivery-browser; không ghi JWT. Có 19 kiểm tra ở 390/768/1440px, xác nhận UI Admin dùng chung và Member chỉ có Đơn mua với theo dõi nội tuyến. Script fixture cũ phía trên là snapshot trước cập nhật, cần điều chỉnh shape tracking/nhãn nút nếu chạy lại.
