# UI và định hướng thiết kế

> **27/10/2026 — chỉ tái chế:** Kho và màn QC bỏ nhánh bán nguyên trạng; sourcing chỉ dẫn tạo dự án tái chế. Nút thêm sản phẩm dẫn tới dự án; preview dẫn tới quy trình QC thay vì Đăng bán 1 món. Quản trị ghi rõ dữ liệu cũ ngừng kinh doanh; bản lưu chỉ còn 2 ý tưởng Upcycled. About mô tả tái chế và kiểm định. [Phạm vi, kiểm thử và giới hạn](recycling-only-2026-10-27.md). Các mô tả xung đột ngày trước là snapshot lịch sử.

> 25/10/2026: `NotificationCenter` dùng danh sách một cột, phân biệt item mới bằng nền/chấm, có trạng thái tải/rỗng/lỗi, nút tải lại và đánh dấu đọc khi mở; badge hiện ở AccountMenu và Header quản trị. Màn responsive tới mobile. [Chi tiết](notifications-2026-10-25.md).

> UI Theo dõi gu đồ 25/10/2026: tab Profile có chip danh mục/cỡ, nhập màu và giá, hai lựa chọn nhận tin, danh sách thông báo có trạng thái chưa đọc; có loading/error/empty/retry, responsive. Liên kết ở menu tài khoản và catalog. [Chi tiết](style-watch-implementation-2026-10-25.md).

> Cập nhật UI 25/10/2026: bỏ chuông thông báo mẫu và menu quản trị dẫn đến khuyến mãi/cài đặt giả; danh sách/chi tiết sản phẩm dùng trạng thái và `stockQuantity` từ API, hiển thị chỗ thiếu ảnh thay vì ảnh Unsplash. Form mới buộc chọn tình trạng; Đơn mua phân loại đúng trạng thái thanh toán và vận chuyển. Xem [rà soát nghiệp vụ](business-flow-audit-2026-10-25.md).

## Làm rõ trang bản lưu ý tưởng — 25/10/2026

Trang `/products/drafts` giữ gallery, bộ lọc và tải JSON nhưng đổi nhãn/cảnh báo để người quản trị hiểu đây là nội dung tĩnh ban đầu. Bỏ checklist yêu cầu tồn kho, ảnh trước/sau và câu “chưa tạo sản phẩm trong kho” đã sai sau khi nhập sáu mẫu. Liên kết hành động dẫn về Danh sách sản phẩm, nơi kiểm tra tình trạng và đăng bán.

## Đơn giản hóa đăng bán — 25/10/2026

Theo phản hồi người dùng, bỏ ô tồn kho ở form tạo/sửa, cột tồn ở danh sách và các trường số món, mã biên bản, tải ảnh trước/sau của preview. Khối Đăng bán chỉ còn một Select tình trạng và nút Đăng bán 1 món, cùng câu nhắc Admin kiểm tra hiện vật. Thông tin sản phẩm ở cột trái vẫn sửa được; ảnh cũ giữ nguyên. Mục Form tồn kho bên dưới là thiết kế trước khi đơn giản hóa.

## Form tồn kho — 25/10/2026

Bảng Sản phẩm hiện số món hoặc “Chờ xác nhận”. Form tạo mới và chỉnh sửa hàng đang bán có ô tồn số nguyên; độc bản giới hạn 1. Preview có khối xác nhận riêng yêu cầu số món, tình trạng sau kiểm tra, tham chiếu kiểm định và ảnh mới; upcycling thêm ảnh trước. Nút mở bán tách nút lưu thông tin, có trạng thái chờ/lỗi API. Không hiện nhãn nguồn ảnh AI theo yêu cầu trước.

## Màn kiểm định nguồn hàng và QC — 25/10/2026

Màn Duyệt yêu cầu bỏ lựa chọn Resale/Upcycling giả bằng tiền tố trong ghi chú, bỏ nút đăng bán trực tiếp; nhân viên chuyển sang Kho để QC hiện vật hoặc tạo dự án tái chế. Form kiểm định nguồn hàng có tải ảnh chứng cứ và hiển thị rõ tình trạng khách khai báo/sau kiểm định. Màn Kho yêu cầu ảnh hiện vật khi QC đạt, bỏ mô tả và giá bán tính sẵn, không cho tự chọn “như mới”/tỷ lệ độ mới chưa xác nhận ở bước đăng bán. Shipper hiển thị “đã lấy đồ” tách “đã nhận tại kho”. Frontend build đạt; QA Chromium fixture 13/13 ở 1440/390px. [Giới hạn](inspection-flow-audit-2026-10-25.md).

## Chi tiết yêu cầu thu mua — 25/10/2026

Modal `/profile?tab=sourcing` dùng component/CSS riêng: tiêu đề và trạng thái, mô tả, cỡ/màu, tình trạng khách khai báo và sau kiểm định, hai mức giá, ghi nhận chi trả, ghi chú/lý do từ chối, gallery ảnh có ảnh chính giới hạn kích thước và nút chuyển ảnh. Header/footer cố định, phần thân cuộn dọc; mobile xếp một cột, không tràn ngang. `payout.state=Confirmed` được diễn đạt là cửa hàng **ghi nhận** chi trả, không xác nhận ngân hàng đã chuyển tiền. Không suy chi trả từ status Completed. Trường thiếu hiện thông báo tương ứng. Kiểm tra fixture browser 24/24 ở 1440/768/390/320px; chưa kiểm tra với dữ liệu tài khoản thật.

## Bỏ nhãn ảnh AI theo yêu cầu — 25/10/2026

Home/card catalog/journey/bản nháp không còn badge hay dòng chữ “Ảnh minh họa AI”. Nhãn trạng thái quản trị chỉ còn “Sắp mở bán”; alt ảnh bản nháp dùng tên sản phẩm/góc ảnh. `formatCatalogText` bỏ câu nhãn được ghép vào mô tả khi hiển thị và đổi câu mô tả upcycling tương ứng, áp dụng cho adapter storefront, journey và form/detail quản trị. Nguồn ảnh metadata không bị đổi, các cảnh báo hàng chưa xác nhận và bốn góc vẫn giữ. Build 4040 modules, QA storefront 40/40 qua API thật; sáu mô tả/journey đã rà không còn câu AI sau định dạng.

## Gallery nhiều góc — 25/10/2026

PDP hiện bốn góc riêng (trước/sau/nghiêng/cận cảnh) từ API; detail mặc định cận cảnh, nút chọn góc có tên và aria-pressed, bấm 44px, xuống dòng khi cần. Chỉ nhân cả bộ ảnh để nối vòng conveyor; một ảnh không chạy. Có 18 ảnh bổ sung AI, giữ ảnh trước upcycling. Trang bản nháp hiển thị/tải đủ bộ. Build và 168 kiểm tra browser/API thật đạt. [Chi tiết và giới hạn](catalog-gallery-2026-10-25.md).

## Bộ sản phẩm đề xuất — 25/10/2026

**Sau thay dữ liệu cửa hàng:** các lưới thật và Home đã hiện 6 sản phẩm API mới, có nhãn ảnh AI/“Sắp mở bán”. PDP và thanh mua nhanh khóa đồng nhất; journey có selector trước/sau riêng cho Upcycled và nhãn minh họa, không timeline QC giả. 40 kiểm tra Chromium trên API thật ở ba kích thước đạt. [Chi tiết](catalog-replacement-2026-10-25.md).

`/products/drafts` dùng layout quản trị, lưới 3/2/1 cột, tìm kiếm/lọc loại và modal ảnh trước/sau (hai cột desktop, xếp dọc mobile). Sáu thiết kế và tám ảnh AI cùng nền sáng, không logo dịch vụ khác. Có nhãn AI, trạng thái bản nháp, giá/cỡ đề xuất, tồn chưa xác nhận; không có CTA mua hàng. [Dữ liệu, prompt, QA và giới hạn](catalog-drafts-2026-10-25.md).

## Dùng lại UI quản lý và gộp Đơn mua — 25/10/2026

Theo yêu cầu người dùng, Shipper dùng nguyên AdminLayout/Header/Sidebar và ShippingPage Ant Design, chỉ thay menu/dữ liệu/thao tác theo role. Đã bỏ component và CSS portal riêng. Header có nhãn Người giao hàng, không hiển thị thông báo quản trị minh họa cho Shipper.

Member giữ Profile hiện có và một mục Đơn mua. Nút Theo dõi đơn hàng mở thông tin nhận, Shipper, timeline thật và thanh toán ngay trong thẻ, cập nhật 20 giây khi đang xem. DeliveryTimeline dùng chung với modal vận chuyển. Bỏ HistorySection trùng lặp, giữ link cũ tương thích. [Bằng chứng và giới hạn](shipping-acceptance-2026-10-25.md).

> Cập nhật 25/10/2026: luồng commerce đã được sửa trong source local. Đọc [kết quả triển khai](implementation-report-2026-10-25.md) trước các snapshot lịch sử bên dưới; trạng thái PayOS/Cloudinary/SMTP live và deploy vẫn chưa được xác minh.

## Trang Giới thiệu đồng bộ storefront — 2026-10-24

- `/about` dùng lại `EditorialHero`, navbar và `RainsFooter` của storefront; nội dung dưới hero đã được dựng lại thành câu chuyện REWEAR, ba nguyên tắc Chọn lại/Giữ lại/Mặc tiếp, hành trình tương tác, FAQ và CTA nền ảnh. Cùng Inter/Barlow Condensed, ink/paper/fog, gutter `clamp(20px, 4vw, 64px)`, nút pill 48px và ảnh phẳng như Catalog/World.
- Bỏ marquee, manifesto cao cố định, chữ viền trang trí, khối hành trình nền đen và các selector hero/orbit/ring cũ. Không còn reveal JS ẩn nội dung hay nút pause toàn trang; slideshow giữ bộ điều khiển pause/reduced motion riêng của component chung. Hành trình có bốn nút `aria-pressed`, panel live và liên kết tương ứng; FAQ native dùng được bằng bàn phím. Nội dung tái thiết kế được diễn đạt là tinh thần/định hướng, không khẳng định mọi sản phẩm đều trải qua tái thiết kế.
- CSS mới scope `.about-page`, không thêm reset tổng quát ảnh hưởng hero/footer/nav. Bố cục nội dung 2 cột chuyển thành 1 dưới 768px; bước hành trình từ 4 thành 2 cột. Giữ target `#our-cycle`, `#our-design`, `#about-help`, thêm `#our-story`.
- QA Chromium ở 1440/1024/768/390/320px: không overflow ngang trong section, bốn bước đổi được bằng Enter và có focus, FAQ mở bằng Enter, anchor nằm dưới navbar, drawer giỏ mở được. Reduced motion dừng hero. So sánh geometry/computed styles khi bật/tắt riêng About CSS tại Home/New In/World không thấy thay đổi trên 74/78/78 phần tử được chọn. Chưa kiểm thử mọi tổ hợp dữ liệu, backend hoặc trình duyệt khác.

## Audit 2026-10-24 — đề xuất chưa triển khai

- Xem `ui-audit-2026-10-24.md`: đã đối chiếu mã và Chromium 1440×900/390×900 bằng fixture, chưa kiểm chứng backend. Không sửa Home/navbar hoặc mã UI trong task này.
- Catalog hiện đẩy lưới xuống y≈1377px desktop và y≈1230px mobile; chọn 8 cột trên mobile vẫn render 2 cột. PDP nhân một ảnh thành nhiều phần tử băng chuyền; nhiều thẻ kính tách thông tin mua. Profile có khung lồng nhau, radius lớn hơn Checkout; một CTA empty checkout còn dùng style trình duyệt mặc định.
- Đề xuất ưu tiên: rút phần đầu Catalog, đơn giản hóa PDP, thống nhất form/card/button của Profile–Checkout, rồi giảm nội dung/chuyển động lặp ở About/World. Các đề xuất này chưa thay thế lựa chọn thiết kế đang chạy.
- **Đính chính snapshot QA cũ:** từ thay đổi 2026-10-23, `usePublicProducts` dùng ảnh Unsplash theo tên/danh mục khi không có ảnh API; `hasImage` không chứng minh đó là ảnh thật. Placeholder của listing chỉ xuất hiện khi không có URL hoặc tải ảnh thất bại. Các ghi chép ngày 17–18 dưới đây về “không thêm ảnh giả” mô tả thời điểm cũ.

## Hiện trạng quan sát từ mã

- Hai mặt giao diện: **public storefront REWEAR** mang phong cách editorial (ảnh lớn, hero sticky/parallax, product rail, video, nav pill, nền trắng/xám); **admin REWEAR** dùng Ant Design table/form/sidebar đen, KPI và trang chi tiết. Nội dung tĩnh trên storefront dùng tiếng Việt; tên/file/class cũ trong mã có thể còn nhưng không phải thương hiệu hiển thị. Cả hai cùng dùng `index.css` toàn cục nên cần kiểm tra ảnh hưởng chéo.
- `REWEAR_DESIGN_SYSTEM.md` là tài liệu định hướng REWEAR cho web/mobile. Triển khai thực tế ở `src/index.css` dùng Inter + Barlow Condensed, token `--color-fog #efefef`, `--color-ink #10100f`, `--color-paper #fff`, `--color-charcoal #26292a`, `--color-butter-cream #fffb85`; `src/styles/theme.js` cấu hình Ant Design. Khi sửa cần kiểm tra UI đang dùng trước khi áp token.
- Storefront CSS chính: `HomePage.css` (dùng chung cho listing/profile/world), `NewInPage.css`, `StoreProductPage.css`, `ProfilePage.css`. Public nav được viết lặp ở nhiều page. Admin CSS là `index.css`, `App.css` và inline style trong JSX.
- Home: announcement, nav ẩn/hiện khi scroll, hero parallax, product rail từ API, split campaign, video với play/mute, các sticky banner và footer. Listing: ba route dùng chung CatalogPage với hero editorial, tìm kiếm không dấu, sắp xếp tên/giá, lọc màu/cỡ từ dữ liệu đã tải, chip xóa bộ lọc, cụm nút bố cục dạng segmented control (icon cột trực quan + số 2/4/8) và xem thêm 12 mục mỗi lần; không gọi API lọc mới. Ảnh sản phẩm hỗ trợ fallback tự động theo danh mục/tên và bắt lỗi onError nhằm đảm bảo ảnh hiển thị đồng bộ giữa listing và chi tiết PDP. PDP: conveyor gallery, hotspot, variant, accordion, size guide; cart drawer dùng chung với Home/About/listing/World. Profile: sidebar/tab, account form, địa chỉ, đơn API, sourcing.
- About: `/about` dùng hero chung và bố cục nội dung sáng, phẳng; câu chuyện/ảnh chia hai cột, nguyên tắc gọn, bốn bước tương tác, FAQ và CTA. Chi tiết triển khai 2026-10-24 ở đầu tài liệu; marquee, reveal và trang trí orbit/ring cũ đã bỏ. Navbar announcement/sticky pill/Search/Cart/Account dùng CSS storefront chung; root overflow-x clip để sticky hoạt động. Mục About có tại Home, listing, World, PDP và About; các mục Bags, Footwear, Accessories, Home Away đã được gỡ khỏi nav storefront.
- Thế giới REWEAR (`/world`) có store locator trước footer: tìm kiếm danh sách bên trái, map client-side ghép từ tile ArcGIS Light Gray Base; có thể kéo, zoom/reset và chọn địa điểm để định tâm. Địa chỉ do người dùng cung cấp: 124 Đường 160, phường Tăng Nhơn Phú A, TP. Thủ Đức, TP.HCM. Pin nhúng đang đặt ở tâm khu vực phường vì chưa lấy được tọa độ số nhà; liên kết Google Maps tìm theo địa chỉ đầy đủ. Có ghi nguồn ArcGIS/OSM và thông báo lỗi tile. Layout chuyển từ 2 cột sang stack mobile.
- Khu vực tài khoản `/profile` dùng sidebar sáng và năm tab cùng hệ thống header editorial, thẻ nội dung, CTA và trạng thái. Tab hồ sơ có ô thông tin hai cột/khối avatar; form chỉ sửa họ tên/giới tính, ảnh đổi qua API riêng. Tab địa chỉ có form gắn label, card địa chỉ, loading/error/empty. Đơn mua/Lịch sử đọc API; Đơn mua có lọc trạng thái, tìm kiếm cục bộ trên trang, phân trang, card đơn và trạng thái loading/error/empty. Order status 0–5 dùng mapping tiếng Việt do người dùng cung cấp; Lịch sử không tính thống kê hoàn tất/chi tiêu khi chưa có contract lọc/response đủ tin cậy. Tab bán đồ cũ có form/list card, preview ảnh, badge trạng thái tiếng Việt và modal chi tiết cùng palette. Các tab dùng ink/fog/paper, butter cream làm điểm nhấn, responsive ở 900/640px và focus visible cho thao tác chính.
- ProductForm edit dùng dropdown thương hiệu/danh mục. Khu vực ảnh chỉ hiện ở chế độ tạo; khi sửa, form giữ nguyên URL ảnh tải từ API trong PUT payload nhưng không cho chỉnh ảnh trên UI theo yêu cầu tạm thời.
- Responsive đã có media query ở Home (1024/768), PDP (1024/991/768/600), Profile (900/640); `NewInPage.css` co lưới 8 cột thành 4 ở 1100px và tất cả lựa chọn thành 2 ở 767px. Admin sidebar 250px thu về 0 dưới breakpoint lg, có nút mở/đóng ở Header; bảng cuộn trong vùng riêng, form/modal thích ứng mobile qua AdminQuality.css.
- Ảnh trong `public/images`, và nhiều ảnh/video ngoài site. URL asset bên ngoài không phải tên thương hiệu ứng dụng. UX phụ thuộc asset từ xa; kiểm tra alt/fallback/crop và media loading khi chỉnh layout.

## Nguyên tắc khi cải thiện

1. Giữ ngôn ngữ thị giác hiện có nhưng ưu tiên thương hiệu REWEAR nhất quán ở public và admin. Chọn token hiện hữu hoặc thêm token có chủ đích, tránh thêm màu/radius riêng rẽ vào nhiều component.
2. Kiểm tra desktop, tablet, mobile và nội dung dài; đặc biệt lưới 8 cột, nav dày, drawer/cart và bảng admin. Product image cần aspect ratio ổn định.
3. Mọi CTA phải có trạng thái thực: loading, thành công, lỗi, empty. Nút chưa có backend nên thể hiện là demo rõ ràng hoặc hoàn thiện chức năng theo task, tránh báo thành công giả.
4. Dùng element có semantics (Link/button/input label), keyboard focus rõ, alt phù hợp, overlay có focus handling; tôn trọng `prefers-reduced-motion` cho parallax/conveyor/video.
5. Dùng `src/styles/theme.js` cho Ant Design và CSS variables trong `src/index.css` cho CSS riêng; tránh global selector mới làm hỏng page khác. Khi sửa shared CSS, kiểm tra Home/listing/PDP/Profile và admin.

## Điểm cần quan sát khi làm UI

- `HomePage.css` là tab IDE hiện tại, nhưng class `.rw` được dùng nhiều public page; chỉnh selector `.rw-*` có thể đổi đồng thời các page.
- `usePublicProducts` tạo `colors` mảng object; listing đã dùng `color.hex` trong ProductListingGrid. Home còn cách tô swatch cũ và không thuộc phạm vi thay đổi lần QA này.
- `NewInPage`, `WomenPage`, `MenPage` chỉ cấu hình nội dung/ảnh cho CatalogPage dùng chung. Bộ lọc chỉ áp dụng dữ liệu đã tải; Women/Men chưa có trường giới tính trong adapter và có ghi chú trên UI. Không dựng danh mục hoặc giá giả.
- Nút giỏ ở các nav storefront mở drawer dùng chung; giữ các trang trong `StorefrontCartLayout` để cùng dùng state và không tạo drawer riêng theo page.
- Cart drawer có checkbox từng sản phẩm và chọn tất cả; tổng tạm tính tính theo các sản phẩm đã chọn. Ảnh thumbnail dùng ảnh sản phẩm từ cart API trước, rồi fallback catalog hoặc GET chi tiết sản phẩm theo ID; chỉ hiển thị placeholder khi cả các nguồn này không có ảnh, tránh ảnh mock túi cho sản phẩm khác. Xác nhận xóa bật thành modal ở giữa màn hình, có Hủy/Xóa, đóng bằng Escape/chạm lớp phủ. Chọn, đổi số lượng và xóa đều khóa thao tác liên quan khi API đang chờ.
- Thanh thông tin PDP chỉ render tên, giá, mô tả, màu và cỡ lấy từ DTO; không dựng giới tính, cỡ mặc định/bảng số đo, phí giao hàng, trạng thái cửa hàng hoặc nội dung thay thế như thể dữ liệu sản phẩm.
- PDP giữ gallery editorial toàn màn hình cùng bảng thông tin kính mờ bên phải; bảng rộng và rõ hơn, có giới hạn cuộn riêng trên desktop/tablet, chuyển về luồng dọc trên mobile. Băng chuyền dừng khi bật `prefers-reduced-motion`; các trường vẫn chỉ hiển thị khi DTO cung cấp.
- Thẻ kính mờ PDP dùng nền ngà trong dạng gradient, blur và saturation để ảnh nền xuyên nhẹ như tham khảo; trên mobile tăng độ đục để bảo toàn khả năng đọc.
- Bảng PDP desktop bám mép phải với lề co giãn 10–28px và chiều rộng co giãn 330–430px; tablet/mobile tiếp tục dùng breakpoint riêng để tránh đè gallery.
- Khi gallery PDP cuộn khỏi viewport, hiển thị thanh mua nhanh cố định ở cuối màn hình, giữ navbar đầu trang: anchor Mô tả/Gợi ý sản phẩm, tên/giá DTO và CTA dùng lại handler thêm giỏ; ẩn khi cart drawer/lightbox mở, rút gọn trên mobile.
- Thanh mua nhanh dưới đáy PDP trải sát hai mép viewport, góc vuông như tham khảo; trên mobile giữ padding đáy theo safe-area.
- Thanh mua nhanh full-width cao 72px desktop, 66px tablet, 60px mobile; nút CTA tối thiểu 44px trên mobile để giữ mục tiêu chạm tiện dụng.
- Checkout `/checkout` dùng giao diện REWEAR tiếng Việt, form địa chỉ lấy từ sổ địa chỉ API, ghi chú tùy chọn, summary từ các dòng được chọn; `GET /api/shipping/rates` cấp lựa chọn Standard/Express và phí 0 ₫ theo chính sách REWEAR do người dùng cung cấp. Lỗi rates có nút thử lại và khóa tạo đơn. Tạo order với method đã chọn, dùng checkoutUrl đã được checkout tạo sẵn nếu có, chỉ tạo payment session riêng khi response thiếu URL. Lỗi session có thể thử lại với orderId hiện tại, không gửi lại yêu cầu tạo order. Không báo thanh toán thành công ở đây. Không nhập số thẻ trong REWEAR vì PayOS xử lý bước thanh toán. Thiếu giá thì hiện “Chưa cập nhật giá”, tổng dùng dấu gạch ngang và khóa tạo đơn đến khi giá từ API hợp lệ.

- Trang `/shipping` dùng bảng Ant Design và modal phân công/chi tiết; `/shipper/orders` có bố cục gọn cho mobile, trạng thái loading/empty/error và nút thử lại. Mã status số giữ nguyên vì Swagger chưa xác nhận tên enum; không gán nhãn giao thành công theo suy đoán. Tab Đơn mua hiển thị shipping/timeline nếu API trả dữ liệu, 404 là chưa có thông tin vận chuyển.
- Trang chờ `/payment/waiting` mở ở tab REWEAR ngay sau checkout và bắt đầu polling status; có nút mở PayOS khi popup bị chặn, tự kiểm tra lại khi tab trở về foreground. Request polling không bật GlobalLoader 2,5 giây, dùng spinner/trạng thái ngay trong trang. `Paid`/mã số 2 hoặc `isPaid: true` từ backend mới chuyển UI sang thành công, sau đó về home; Failed/Expired/Refunded/Cancelled hiện riêng. Pending/lỗi có nút kiểm tra lại và liên kết Đơn mua/trang chủ. Tôn trọng `prefers-reduced-motion` cho spinner.
- Design system đề xuất WCAG AA, target chạm tối thiểu 44px, ảnh hero có overlay, video có poster và controls; kiểm tra mức độ đáp ứng theo màn cụ thể, không giả định đã đạt toàn bộ.

## QA và tăng tương tác — 2026-10-17

- StorefrontCartLayout chỉ thêm wrapper rw-storefront-quality ngoài Home. Các sửa shared nav, focus, touch target và reduced motion đều được scope; Home không có wrapper. So sánh computed styles/geometry của 261 phần tử Home tại bốn chiều rộng không có khác biệt với CSS gốc.
- Catalog dùng nền ngà, hero ảnh local, phân cấp tiêu đề, thanh công cụ và thẻ ảnh 3:4. Tìm tên/màu/cỡ không dấu, sort dùng rawPrice (thiếu giá xếp cuối), lọc lấy option từ DTO, reset/chip, empty recovery và phân đoạn 12 mục ở client. Không đổi hook, giá, status hay mutation. Ảnh thiếu dùng placeholder thay ảnh mẫu.
- About có mục lục anchor, 4 bước chọn bằng nút aria-pressed và panel giải thích, FAQ dùng details/summary và nút pause motion. Mô tả nguyên tắc được giữ trên mobile.
- PDP dùng dialog native cho phóng to ảnh, Escape/focus return; accordion có aria-expanded, gợi ý dùng Link. Gallery có pause, reduced motion; thông tin sản phẩm về luồng dọc trên mobile.
- Profile sửa min-width và lưới mobile để mọi tab không tràn ngang. Checkout giữ form trước summary trên mobile; badge số lượng không áp nhầm lên placeholder ảnh. Payment spinner chỉ scope trong trang chờ.
- Admin đồng nhất font/token, bảng cuộn, modal có giới hạn chiều cao, form nhiều cột về 1 cột mobile; nút menu dùng bàn phím, sidebar thu gọn inert. Bỏ thao tác switchRole không tồn tại; không đổi role/guard. Các module mock có thông báo minh họa.
- Chi tiết bằng chứng và giới hạn: ui-qa-2026-10-17.md.

- Lần QA trước từng tăng navbar ngoài Home lên 44px/68px; yêu cầu mới đã thay quy tắc này bằng kích thước Home thực tế 38px cho pill/menu và 30px cho link.


## Thanh điều hướng storefront theo Home — 2026-10-17

- `HomePage.css` là chuẩn của navbar storefront: pill/menu cao 38px, link cao 30px, nền xám kính `rgba(200,200,200,.35)`, nav trong suốt. Bỏ CSS global thử nghiệm và các override nền trắng/44px ngoài Home. Home không đổi mã nguồn/giao diện.
- Listing, About, World, Profile và PDP cùng dùng markup/class `rw-nav`; PDP giữ link quay lại riêng. Profile/World có đủ Search, Cart, Account như Home. Mobile ngoài Home thu action thành icon và cho menu cuộn ở hàng thứ hai để các link vẫn sử dụng được; Home mobile hiện vẫn có menu bị ép rất hẹp và cần task riêng nếu được phép chỉnh Home.
- Checkout dùng header có bước đặt hàng riêng; trang chờ thanh toán và admin/login không dùng navbar storefront. Không thay đổi các flow này trong task đồng bộ navbar.

## Ảnh lớn và chuyển động editorial — 2026-10-18

- Mới về/Nữ/Nam/About/World dùng `EditorialHero` chung: chuyển cảnh chậm, ảnh phóng nhẹ, điều khiển thủ công và pause; dừng khi banner không nhìn thấy, tab ẩn hoặc người dùng tương tác. Reduced motion bỏ autoplay và animation.
- Catalog/World có `EditorialJournal`: ba góc cảm hứng, bố cục ảnh lệch nhịp desktop, rail cuộn có nút mobile. Catalog nhận bộ ảnh/nội dung riêng theo route.
- Footer lấy đúng component `RainsFooter` của Home cho Catalog/About/World; PDP/Profile cũng dùng component này. Không chỉnh Home hoặc CSS footer chung. About loại footer khỏi reset màu link/margin; Profile loại footer khỏi ngắt chữ tùy ý để logo lớn không xuống dòng. Newsletter và các link placeholder sẵn có vẫn là demo như Home.
- About đổi hero khung ảnh nổi sang ảnh lớn, rút cỡ tiêu đề section để tránh ngắt quá nhiều dòng, CTA nền ảnh và footer mới. Bỏ hero cũ trong JSX; một số selector CSS cũ của hero/orbit còn chưa dọn. Catalog không còn hero nền ngà chia chữ/ảnh cũ mà dùng banner toàn khung.
- Mới về/Nam/Nữ mỗi trang dùng ba ảnh mới riêng, tổng chín file local; không dùng chung ảnh giữa ba bộ banner/journal/CTA. Một ảnh có thể được dùng lại ở nhiều vị trí trong cùng trang. About/World giữ bộ ảnh riêng có sẵn.
- Ảnh cảm hứng phân biệt với ảnh sản phẩm. Card chỉ đổi góc khi adapter có ảnh thứ hai. Không thêm ảnh/giá giả vào danh sách sản phẩm. Nguồn ảnh và bằng chứng: `editorial-ui-2026-10-18.md`.

## 25/10/2026 — vận hành dùng API

Inventory/upcycling/QC dùng OperationsPage chung, CSS giới hạn ops và modal/drawer. Bảng cuộn trong card, grid minmax(0,1fr) tránh overflow; cảnh báo nền sáng đủ đọc. Orders/detail/dashboard bỏ mock. Payout/refund ghi rõ chứng từ thủ công, UI đợi response; shipping dùng tên shipper và bước tiếp theo, không yêu cầu nhập enum kỹ thuật. Profile có timeline API và return request. Home/navbar không sửa trong lượt commerce; shared cart chỉ bổ sung khóa tăng số lượng đúng giới hạn server. QA fixture và giới hạn kiểm chứng ở báo cáo triển khai 25/10.
