# Bản đồ mã nguồn

> **27/10/2026 — chỉ tái chế:** Thay đổi chỉ tái chế tập trung ở OperationsPage, SourcingRequests, Products (List/Form/Detail/CatalogDrafts), AppRoutes, usePublicProducts; backend CircularFashionService, ProductService/ProductsController, CartService/OrderService, ProductRepository, ProductJourneyQuery và StyleWatchService. Regression: REWEAR.Tests/RecyclingOnlyTests.cs và tools/qa/recycling-only.cjs. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> Thông báo chung 25/10/2026: backend `REWEAR.Infrastructure/Services/NotificationService.cs` chứa event writer/feed/read; hooks ở `Repositories/OrderStatusHistoryRepository.cs`, `Repositories/SourcingRepository.cs` và `Repositories/LifecycleStore.cs` (chi trả); API `Controllers/NotificationsController.cs`. Frontend `src/components/common/NotificationCenter.jsx` cùng CSS, gọi từ `ProfilePage`, `Header`, `Sidebar`, `AccountMenu`, route tại `AppRoutes`. Kiểm thử `REWEAR.Tests/NotificationTests.cs`. [Chi tiết](notifications-2026-10-25.md).

> Tính năng Theo dõi gu đồ: frontend `src/pages/Profile/StyleWatchSection.jsx` và CSS, điểm vào `ProfilePage`, `AccountMenu`, `CatalogPage`; API `StyleWatchController`; logic/worker/email ở `REWEAR.Infrastructure/Services/StyleWatch*` và `StyleAlertEmailSender`; entity/DTO ở Domain/Application. [Chi tiết](style-watch-implementation-2026-10-25.md).

## Nội dung nhãn ảnh — 25/10/2026

`src/utils/catalogText.js` định dạng hai câu nhãn ảnh trong nội dung do bộ catalog sinh; dùng ở `usePublicProducts`, `ProductJourney`, `ProductDetail`, `ProductForm`, `CatalogDrafts`. Badge/CSS ảnh AI được bỏ tại Home, ProductListingGrid, journey và bản nháp. Không thay metadata `imageSource` hay dữ liệu ảnh API.

## Gallery nhiều góc — 25/10/2026

`CatalogGalleryUpdate.cs` + `tools/CatalogImport --gallery-only`: cập nhật ảnh theo transaction/revision. Product/ProductDTOs/ProductService: nhãn `ImageLabels` tùy chọn; `usePublicProducts` map label/alt, PDP/CSS chọn đủ bốn góc, CatalogDrafts dùng bộ ảnh mới. 18 PNG mới tại `public/images/catalog-drafts/`; QA `tools/qa/catalog-gallery.cjs`, ba test mới trong `CatalogReplacementTests.cs`. [Report](catalog-gallery-2026-10-25.md), [prompts](catalog-gallery-prompts-2026-10-25.md).

## Bộ sản phẩm đề xuất — 25/10/2026

**Đã nhập lên cửa hàng:** `REWEAR.Infrastructure/Persistence/CatalogReplacement.cs`, `Rewear_BackEnd/tools/CatalogImport` là cơ chế import transaction/idempotent; `Product.cs`, ProductDTOs/ProductService, ProductJourneyQuery/DTOs thêm preview/ảnh AI. CartService/OrderService/ProductRepository chặn mua preview. Hook/Grid/Home/PDP/Journey hiển thị metadata API. Test: `CatalogReplacementTests.cs`, `tools/qa/catalog-storefront.cjs`. [Chi tiết](catalog-replacement-2026-10-25.md).

`src/pages/Products/CatalogDrafts.jsx` / `.css`: UI Admin/Staff duyệt sáu bản nháp. `public/catalog/rewear-drafts.json`: nội dung/giá/cỡ đề xuất; `public/images/catalog-drafts/`: tám PNG AI. `ProductList.jsx` có nút mở `/products/drafts`; route trong AppRoutes. QA: `tools/qa/catalog-drafts.cjs`; tài liệu và prompt: `catalog-drafts-2026-10-25.md`, `catalog-image-prompts-2026-10-25.md`.

## Luồng kiểm định hiện tại — 25/10/2026

Frontend: `src/pages/Collections/SourcingRequests.jsx` (duyệt/kiểm định nguồn và ảnh), `src/pages/Operations/OperationsPage.jsx` (QC kho/dự án, mở bán), `src/pages/Shipping/ShippingPage.jsx` (shipper lấy đồ), `src/components/common/SourcingRequestDetail.jsx` (khách xem). Backend: `REWEAR.Application/Services/{SourcingService,CircularFashionService}.cs`, `REWEAR.API/Controllers/{Sourcing,Operations}Controller.cs`, `REWEAR.Application/DTOs/SourcingDTOs.cs`. Kiểm thử: `REWEAR.Tests/CircularFashionTests.cs`, `tools/qa/qc-flow-ui.cjs`. [Bằng chứng và giới hạn](inspection-flow-audit-2026-10-25.md).

## Mã shipping/Đơn mua hiện tại — 25/10/2026

`ShippingPage.jsx` + `AdminLayout`/`Sidebar`/`Header`: UI dùng chung theo role. `ProfilePage.jsx`: OrdersSection/OrderCard chứa theo dõi nội tuyến, không còn HistorySection. `DeliveryTimeline.jsx`/`Delivery.css`: timeline chung.

Backend: ShippingService.cs/ShippingService.Tracking.cs, OrderService.cs, DTO/enum/entity shipping/history và OrderStatusHistoryRepository.cs; DeliverySchemaMigration.cs thêm index v2. Kiểm thử: ShippingHttpTests.cs, ShippingBrowserTests.cs, Phase5HttpHost.cs và tools/qa/shipping-real-api.cjs. [Bằng chứng](shipping-acceptance-2026-10-25.md).

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

Tìm route trước ở `src/routes/AppRoutes.jsx`, rồi theo component tới API/data/CSS. Dưới đây là nơi bắt đầu cho từng khu vực; đọc mã hiện tại trước khi sửa vì tài liệu có thể cũ.

| Khu vực | File chính | Vai trò |
| --- | --- | --- |
| Entry/config | `index.html`, `package.json`, `vite.config.js`, `src/main.jsx`, `src/App.jsx` | Mount app, dependencies/scripts, dev proxy, provider tree. |
| Route/layout | `src/routes/AppRoutes.jsx`, `ProtectedRoute.jsx`, `src/layouts/AdminLayout.jsx` | URL, guard theo role, admin shell. |
| Auth/API | `src/contexts/AuthContext.jsx`, `src/services/auth.js` | Session, admin login, fetch helper, profile API. |
| Shipping API/adapter | `src/services/auth.js`, `src/services/shipping.js` | Helper bảy endpoint shipping, unwrap response và label khi enum còn thiếu schema. |
| Shipping UI | `src/pages/Shipping/ShippingPage.jsx`, `ShippingPage.css` | Danh sách queue/all/my-orders, phân công, cập nhật status. Checkout và Profile có tích hợp rates/detail. |
| Hook/utils | `src/hooks/usePublicProducts.js`, `useDebounce.js`, `src/utils/constants.js`, `formatters.js` | Adapter public product, placeholder debounce, trạng thái/role, định dạng. |
| Shared UI | `src/components/common/{AccountMenu,AuthModal,GlobalLoader,Header,Sidebar,StatusBadge,KPICard,RainsFooter}.*` | Menu/login public, loader, admin nav/header/badge/KPI, footer. |
| Data demo | `src/data/mockData.js`, `storeProducts.js`, `customerOrders.js` | Mock admin, catalog demo cũ dùng ảnh tham khảo bên ngoài, đơn hàng demo profile. |
| Public home | `src/pages/Home/HomePage.jsx`, `HomePage.css` | Hero, rails, video, banner, nav/footer tại page. |
| Public about | `src/pages/About/AboutPage.jsx`, `AboutPage.css` | Trang giới thiệu REWEAR, pill nav từ `HomePage.css`, EditorialHero, hành trình tương tác, gallery, FAQ, CTA nền ảnh và RainsFooter dùng chung với Home. |
| Public catalog | `src/pages/Store/{NewInPage,WomenPage,MenPage,RainsWorldPage,StoreProductPage}.jsx` và CSS cùng thư mục | Listing, editorial world, PDP; ba listing cấu hình `components/common/CatalogPage.jsx`, dùng `ProductListingGrid.jsx` và `NewInPage.css` + `HomePage.css`. |
| Store locator | `src/components/common/StoreLocator.jsx`, `StoreLocator.css` | Tìm kiếm/lọc cửa hàng mẫu, chọn location để đổi map ArcGIS; được render giữa nội dung Thế giới REWEAR và footer. |
| Customer account | `src/pages/Profile/ProfilePage.jsx`, `ProfilePage.css`, `src/components/common/SourcingRequestDetail.jsx`, `SourcingRequestDetail.css` | Profile, addresses, orders và sourcing API; modal chi tiết thu mua hiển thị giá/chi trả/ảnh kiểm định theo response. Response tài khoản thật vẫn cần đối chiếu. |
| Cổng vận hành | `src/pages/Auth/Login.jsx` | Login ADMIN/STAFF/SHIPPER, điều hướng theo role response. |
| Admin products | `src/pages/Products/{ProductList,ProductDetail,ProductForm,Categories,CategoryModal,Brands,BrandModal}.jsx` | Catalog API, publish, CRUD product/category/brand. |
| Admin sourcing/collections | `src/pages/Collections/{SourcingRequests,CollectionList,CollectionDetail,Inspection}.jsx` | Sourcing API và pipeline mock riêng. |
| Admin upcycling | `src/pages/Upcycling/{ProjectList,ProjectDetail,QualityCheck}.jsx` | Pipeline mock. |
| Admin operations | `src/pages/{Dashboard,Orders,Customers,Inventory,Promotions,Reports,Staff,Settings,NotFound}/*.jsx` | Dashboard/report/mock operations, customer API, settings, 404. |
| Styling | `src/index.css`, `src/styles/theme.js`, `src/App.css`, `REWEAR_DESIGN_SYSTEM.md` | Global tokens/Ant Design theme/design reference. `App.css` hiện không được import. |
| Assets | `public/images/*`, `src/assets/*` | Ảnh local; nhiều asset khác tham chiếu URL ngoài. |

`src/hooks/useDebounce.js` chỉ có comment placeholder. `src/assets/react.svg` và `vite.svg` là asset template. `README.md` hiện là README Vite mẫu, không mô tả ứng dụng. `dist/` và `node_modules/` là output/dependencies, không phải source.

UI QA: `src/styles/StorefrontQuality.css` chỉ áp wrapper ngoài Home; `src/styles/AdminQuality.css` cho admin/login/modal. Báo cáo: `context/ui-qa-2026-10-17.md`.


- Navbar storefront: `src/pages/Home/HomePage.css` là nguồn style `rw-nav` cho Home và các route công khai có navbar; `src/styles/StorefrontQuality.css` chỉ điều chỉnh responsive ngoài Home. PDP dùng cùng class `rw-nav` trong `StoreProductPage.jsx`.

- Editorial storefront: `src/components/common/EditorialHero.jsx`, `EditorialJournal.jsx`, `Editorial.css`; dùng cho Catalog/About/World, không được render ở Home. Ảnh cảm hứng mới tại `public/images/editorial/`, nguồn và QA ghi ở `context/editorial-ui-2026-10-18.md`.

## Commerce triển khai 25/10/2026

- `src/pages/Operations/OperationsPage.jsx`, `src/services/operations.js`: vòng đời kho/tái chế/QC thật. Wrappers Inventory/Upcycling giữ route cũ.
- `src/pages/Orders`, `src/pages/Dashboard`: order/metrics API; `SourcingPayoutPanel`, `CustomerReturnRequest`: chứng từ chi trả/yêu cầu trả hàng.
- `Rewear_BackEnd/REWEAR.Application/Services/CircularFashionService.cs`, `ReturnService.cs`: quy tắc vòng đời; `PaymentService.cs`, `ProductRepository.cs`: stock ledger/payment consistency.
- `Rewear_BackEnd/REWEAR.Infrastructure/Persistence/CommerceSchemaMigration.cs`: migration explicit; `REWEAR.Tests`: integration/concurrency/startup tests; `tools/qa/operations-ui.cjs`: UI fixture.
- Báo cáo chi tiết: implementation-report-2026-10-25.md.
