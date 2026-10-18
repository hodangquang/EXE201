# Bản đồ mã nguồn

Tìm route trước ở `src/routes/AppRoutes.jsx`, rồi theo component tới API/data/CSS. Dưới đây là nơi bắt đầu cho từng khu vực; đọc mã hiện tại trước khi sửa vì tài liệu có thể cũ.

| Khu vực | File chính | Vai trò |
| --- | --- | --- |
| Entry/config | `index.html`, `package.json`, `vite.config.js`, `src/main.jsx`, `src/App.jsx` | Mount app, dependencies/scripts, dev proxy, provider tree. |
| Route/layout | `src/routes/AppRoutes.jsx`, `ProtectedRoute.jsx`, `src/layouts/AdminLayout.jsx` | URL, guard theo role, admin shell. |
| Auth/API | `src/contexts/AuthContext.jsx`, `src/services/auth.js` | Session, admin login, fetch helper, profile API. |
| Hook/utils | `src/hooks/usePublicProducts.js`, `useDebounce.js`, `src/utils/constants.js`, `formatters.js` | Adapter public product, placeholder debounce, trạng thái/role, định dạng. |
| Shared UI | `src/components/common/{AccountMenu,AuthModal,GlobalLoader,Header,Sidebar,StatusBadge,KPICard,RainsFooter}.*` | Menu/login public, loader, admin nav/header/badge/KPI, footer. |
| Data demo | `src/data/mockData.js`, `storeProducts.js`, `customerOrders.js` | Mock admin, catalog demo cũ dùng ảnh tham khảo bên ngoài, đơn hàng demo profile. |
| Public home | `src/pages/Home/HomePage.jsx`, `HomePage.css` | Hero, rails, video, banner, nav/footer tại page. |
| Public about | `src/pages/About/AboutPage.jsx`, `AboutPage.css` | Trang giới thiệu REWEAR, pill nav từ `HomePage.css`, EditorialHero, hành trình tương tác, gallery, FAQ, CTA nền ảnh và RainsFooter dùng chung với Home. |
| Public catalog | `src/pages/Store/{NewInPage,WomenPage,MenPage,RainsWorldPage,StoreProductPage}.jsx` và CSS cùng thư mục | Listing, editorial world, PDP; ba listing cấu hình `components/common/CatalogPage.jsx`, dùng `ProductListingGrid.jsx` và `NewInPage.css` + `HomePage.css`. |
| Store locator | `src/components/common/StoreLocator.jsx`, `StoreLocator.css` | Tìm kiếm/lọc cửa hàng mẫu, chọn location để đổi map ArcGIS; được render giữa nội dung Thế giới REWEAR và footer. |
| Customer account | `src/pages/Profile/ProfilePage.jsx`, `ProfilePage.css` | Profile, addresses, orders/history và sourcing API; response live vẫn cần đối chiếu. |
| Admin login | `src/pages/Auth/Login.jsx` | Login ADMIN/STAFF. |
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
