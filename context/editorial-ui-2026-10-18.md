# Giao diện editorial — 2026-10-18

## Phạm vi

Mới về, Nữ, Nam, Giới thiệu và Thế giới REWEAR. Tiếp tục yêu cầu hình ảnh lớn và chuyển động theo tham khảo https://rains.com/ đã đọc ngày 2026-10-17. Không sao chép nội dung quảng cáo, chính sách hoặc thông số sản phẩm của website tham khảo. Home, API hooks/services, giá, checkout và CartContext không sửa trong lượt này.

## Triển khai

- `EditorialHero.jsx` và `Editorial.css`: banner tràn khung, hai ảnh desktop/một ảnh mobile, chuyển cảnh 6,5 giây, ảnh phóng nhẹ, nút trước/sau/dừng. Thao tác đổi ảnh thủ công dừng autoplay; tiếp tục chủ động được ngay cả khi nút còn focus. Tạm dừng khi hover/focus, banner ngoài viewport hoặc tab ẩn; tắt autoplay và animation khi reduced motion.
- `EditorialJournal.jsx`: ba khối ảnh cảm hứng với bộ nội dung riêng từng catalog; liên kết về bộ lọc của trang hoặc Giới thiệu. World dùng bộ mặc định dẫn Nữ/Nam/Giới thiệu. Mobile có cuộn ngang, scroll snap, nút trước/sau có trạng thái disabled. Hiệu ứng xuất hiện dùng CSS view timeline khi trình duyệt hỗ trợ; nội dung vẫn hiện nếu không hỗ trợ.
- Footer dùng đúng `RainsFooter` của Home cho Catalog/About/World, đồng nhất với PDP/Profile. Bỏ component/CSS EditorialFooter thử nghiệm. Không sửa Home hoặc component/CSS footer dùng chung. About reset màu link/margin không áp dụng vào footer; Profile đặt `overflow-wrap: normal` riêng footer để logo REWEAR không bị tách xuống dòng. Các link `#` và newsletter của mẫu Home vẫn là placeholder/demo.
- Catalog giữ search/sort/filter/phân đoạn cũ, thay hero và CTA cuối bằng ảnh lớn, bổ sung bộ ảnh cảm hứng. Card có ảnh thứ hai từ adapter thì hiện khi hover hoặc keyboard focus; không thêm ảnh stock thay cho sản phẩm thiếu ảnh.
- About giữ hành trình 4 bước, FAQ và pause toàn trang; đổi hero, cân lại tiêu đề section, CTA nền ảnh, thêm footer. World thay dải ảnh remote lặp bằng hero và ba khối cảm hứng với liên kết rõ ràng; giữ StoreLocator.

## Ảnh

Các ảnh tải về và kiểm tra trực quan, lưu local để không phụ thuộc request ảnh ngoài trong các section mới. Hai ảnh của About/World:

| File | URL nguồn |
| --- | --- |
| `public/images/editorial/city-fashion.jpg` | https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1600&q=85 |
| `public/images/editorial/wardrobe.jpg` | https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85 |

Chín ảnh mới chia riêng theo catalog, không trùng giữa Mới về/Nam/Nữ. Một ảnh có thể xuất hiện lại trong các vị trí khác nhau của cùng trang. Các URL dưới dùng tham số `?auto=format&fit=crop&w=1400&q=82` khi tải:

| Trang | File trong `public/images/editorial/` | URL nguồn |
| --- | --- | --- |
| Mới về | `newin-studio.jpg` | https://images.unsplash.com/photo-1445205170230-053b83016050 |
| Mới về | `newin-texture.jpg` | https://images.unsplash.com/photo-1532453288672-3a27e9be9efd |
| Mới về | `newin-details.jpg` | https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3 |
| Nam | `men-city.jpg` | https://images.unsplash.com/photo-1516257984-b1b4d707412e |
| Nam | `men-style.jpg` | https://images.unsplash.com/photo-1617137968427-85924c800a22 |
| Nam | `men-detail.jpg` | https://images.unsplash.com/photo-1473966968600-fa801b869a1a |
| Nữ | `women-street.jpg` | https://images.unsplash.com/photo-1515886657613-9f3515b0c78f |
| Nữ | `women-city.jpg` | https://images.unsplash.com/photo-1469334031218-e382a71b716b |
| Nữ | `women-style.jpg` | https://images.unsplash.com/photo-1483985988355-763728e1935b |

Các ảnh này và ảnh `prod-*.jpg` có sẵn dùng làm cảm hứng trang trí, không coi là hàng tồn kho, người mẫu của REWEAR hoặc bằng chứng thông số sản phẩm. Chín file catalog mới tổng khoảng 2,66 MB, hai ảnh About/World khoảng 860 KB; chưa tạo biến thể WebP/AVIF/responsive. URL nguồn được ghi để truy xuất, không phải xác nhận riêng về giấy phép của từng ảnh. Ảnh trong lưới sản phẩm vẫn từ API; frontend chưa có phân loại giới tính nên các sản phẩm có thể còn giống nhau giữa ba listing.

## Kiểm tra và giới hạn

- Build production bằng `npm.cmd run build -- --outDir .qa-editorial-build` để không sửa `dist` đã track: thành công, 4024 modules; còn cảnh báo JS bundle khoảng 1,97 MB.
- Chromium với API fixture: 5 route ở 375/768/1440px, ảnh hero tải đầy đủ, không document overflow, không sự kiện pageerror. Xem ảnh desktop/mobile của Nữ, About, World và phần nội dung thấp hơn của About.
- Sau khi đổi ảnh/footer: kiểm tra 24 ca render gồm Home làm chuẩn và bảy route storefront (Mới về/Nam/Nữ/About/World/PDP/Profile) ở 375/768/1440px. Bảy route không tràn ngang hoặc pageerror. Tất cả ảnh hero/journal/CTA mới tải được; ba tập ảnh catalog có đúng ba file mỗi trang và không giao nhau. So sánh computed styles của footer với Home, phát hiện và sửa logo footer Profile bị xuống dòng do kế thừa ngắt chữ; chạy lại cả 24 ca đạt, không còn chênh lệch trong các thuộc tính đã so sánh. Xem screenshot ba catalog desktop/mobile và footer About.
- `interactions.cjs`: autoplay, dừng/tiếp tục khi nút còn focus, chuyển ảnh thủ công, reduced motion, tìm không có kết quả/reset, mở giỏ, bước About, FAQ bằng Enter, nút cuộn journal mobile đều đạt. About/World ở 320/768/1440px không tràn ngang hoặc chồng nút CTA với điều khiển ảnh.
- `final.cjs`: ảnh sản phẩm thứ hai hiển thị khi hover và focus bàn phím với fixture hai ảnh; link journal về bộ lọc từng catalog, chuyển slide thủ công và link footer About/World đều đạt.
- Không xác nhận backend live, đơn hàng/thanh toán thật, Safari/Firefox, thiết bị vật lý, toàn bộ WCAG hoặc contrast trên mọi frame. Font/bản đồ ngoài site vẫn phụ thuộc mạng. Lint vẫn dừng vì thiếu `eslint.config.*`.
- Bằng chứng và script tạm: `%TEMP%/rewear-editorial/`; đây là QA trình duyệt cục bộ, không phải test suite tích hợp trong repo.
