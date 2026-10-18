# UI và định hướng thiết kế

## Hiện trạng quan sát từ mã

- Hai mặt giao diện: **public storefront REWEAR** mang phong cách editorial (ảnh lớn, hero sticky/parallax, product rail, video, nav pill, nền trắng/xám); **admin REWEAR** dùng Ant Design table/form/sidebar đen, KPI và trang chi tiết. Nội dung tĩnh trên storefront dùng tiếng Việt; tên/file/class cũ trong mã có thể còn nhưng không phải thương hiệu hiển thị. Cả hai cùng dùng `index.css` toàn cục nên cần kiểm tra ảnh hưởng chéo.
- `REWEAR_DESIGN_SYSTEM.md` là tài liệu định hướng REWEAR cho web/mobile. Triển khai thực tế ở `src/index.css` dùng Inter + Barlow Condensed, token `--color-fog #efefef`, `--color-ink #10100f`, `--color-paper #fff`, `--color-charcoal #26292a`, `--color-butter-cream #fffb85`; `src/styles/theme.js` cấu hình Ant Design. Khi sửa cần kiểm tra UI đang dùng trước khi áp token.
- Storefront CSS chính: `HomePage.css` (dùng chung cho listing/profile/world), `NewInPage.css`, `StoreProductPage.css`, `ProfilePage.css`. Public nav được viết lặp ở nhiều page. Admin CSS là `index.css`, `App.css` và inline style trong JSX.
- Home: announcement, nav ẩn/hiện khi scroll, hero parallax, product rail từ API, split campaign, video với play/mute, các sticky banner và footer. Listing: ba route dùng chung CatalogPage với hero editorial, tìm kiếm không dấu, sắp xếp tên/giá, lọc màu/cỡ từ dữ liệu đã tải, chip xóa bộ lọc, layout toggle và xem thêm 12 mục mỗi lần; không gọi API lọc mới. PDP: conveyor gallery, hotspot, variant, accordion, size guide; cart drawer dùng chung với Home/About/listing/World. Profile: sidebar/tab, account form, địa chỉ, đơn API, sourcing.
- About: route `/about` dùng biến toàn cục `--color-ink`, `--color-paper`, `--color-fog`, `--color-butter-cream` và `--font-display`, `--font-ui` để đồng nhất 100% về màu sắc và typography với storefront. Tiêu đề Việt dùng tracking ít âm và line-height rộng để dấu/khối chữ không đè nhau. Bố cục editorial kể vòng đời sản phẩm; motion gồm reveal theo scroll, marquee, ảnh nổi, vòng chữ và pulse ring; có `prefers-reduced-motion`. Navigation dùng cùng announcement, sticky pill, Search/Cart/Account controls trong `HomePage.css`; root overflow-x clip để sticky không bị chặn. Mục About có mặt tại Home, New In, Women, Men, World, PDP và About. Bags, Footwear, Accessories, Home Away đã được gỡ khỏi nav toàn storefront.
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
- Checkout `/checkout` dùng giao diện REWEAR tiếng Việt, form địa chỉ lấy từ sổ địa chỉ API, ghi chú tùy chọn, summary từ các dòng được chọn; tạo order, dùng checkoutUrl đã được checkout tạo sẵn nếu có, chỉ tạo payment session riêng khi response thiếu URL. Lỗi session có thể thử lại với orderId hiện tại, không gửi lại yêu cầu tạo order. Không báo thanh toán thành công ở đây. Không nhập số thẻ trong REWEAR vì PayOS xử lý bước thanh toán. Thiếu giá thì hiện “Chưa cập nhật giá”, tổng dùng dấu gạch ngang và khóa tạo đơn đến khi giá từ API hợp lệ; không giả hiện 0 đ. Không hiện phí giao hàng như giá đã chốt khi response chưa có dữ liệu đó.
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
