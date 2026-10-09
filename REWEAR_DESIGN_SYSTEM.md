# REWEAR Design System

Hệ thống thiết kế dùng chung cho website và ứng dụng REWEAR. Giao diện ưu tiên thời trang tuần hoàn, tính dễ dùng và sự nhất quán giữa web và mobile.

## 1. Định hướng thương hiệu

- **Tinh than:** toi gian Bac Au, thuc dung, ben bi, tap trung vao san pham.
- **Nen:** trang va anh san pham; dung khoang trong lon de tao cam giac cao cap.
- **Chu dao:** den, trang, xam trung tinh; khong dung gradient mau tim lam mau thuong hieu.
- **Bo cuc:** uu tien anh lon, typography manh, thanh dieu huong gon va cac thao tac ro rang.
- **Nguyen tac:** moi man hinh phai co mot hanh dong chinh de nguoi dung nhan ra ngay.

## 2. Tài sản thương hiệu

| Asset            | Details                                                   |
| :--------------- | :-------------------------------------------------------- |                       |
| Logo             | Inline SVG, mau `#10100f`, ti le khoang `43.95 x 13.92px` |
| Apple Touch Icon | `180 x 180px`                                             |
| Favicon          | `32 x 32px` va `16 x 16px`                                |
| OG Image         | Su dung logo hoac anh campaign co do phan giai cao        |

### Quy tắc dùng tài sản

- Anh hero web: toi thieu `2000px` chieu rong.
- Anh hero mobile: toi thieu `1170 x 2532px` cho crop doc.
- Anh san pham: dung anh goc co cung ti le voi khung hien thi, uu tien WebP/AVIF.
- Video mobile: MP4 H.264, 1080p, `16:9` hoac `9:16`, luon co poster image.
- Luon dat `alt` cho anh san pham va `accessibilityLabel` cho anh trong mobile app.

## 3. Màu sắc

### Màu chủ đạo

| Token         | Value     | Use                          |
| :------------ | :-------- | :--------------------------- |
| `ink`         | `#10100f` | Chu chinh, logo, tieu de     |
| `black`       | `#000000` | Nen toi, wordmark, overlay   |
| `paper`       | `#ffffff` | Nen chinh                    |
| `neutral-700` | `#555554` | Mo ta, link phu              |
| `neutral-500` | `#999998` | Placeholder, metadata        |
| `neutral-200` | `#e3e3e3` | Pill, surface phu            |
| `neutral-100` | `#f5f5f4` | Nen khu vuc                  |
| `line`        | `#cfcfcf` | Border va divider            |
| `focus`       | `#335eea` | Focus ring va keyboard focus |
| `rating`      | `#fbca10` | Rating, chi dung khi can     |

### Quy tắc sử dụng

- Text tren nen trang dung `ink`, khong dung den tuyet doi cho body text.
- Nen anh toi can overlay toi thieu `rgba(0, 0, 0, 0.25)` neu dat text len tren.
- Khong dung qua 3 mau nhan manh trong mot man hinh.
- Dam bao contrast toi thieu WCAG AA: `4.5:1` cho body text va `3:1` cho text lon.

## 4. Kiểu chữ

### Vai trò phông chữ

- **Display:** `EuropaGroNr2SH`, weight `600` hoac `700`.
- **UI/body:** `EuropaGroNr2SB`, weight `600` hoac `700`.
- **Fallback:** `Open Sans`, `Raleway`, sans-serif.

### Thang cỡ chữ

| Token        | Web                        | Mobile | Use                    |
| :----------- | :------------------------- | :----- | :--------------------- |
| `display-xl` | `clamp(72px, 17vw, 307px)` | `64px` | Wordmark, hero display |
| `display-lg` | `clamp(56px, 12vw, 229px)` | `48px` | Hero title             |
| `heading-xl` | `48px`                     | `32px` | Page heading           |
| `heading-lg` | `40px`                     | `28px` | Section heading        |
| `heading-md` | `32px`                     | `24px` | Card group heading     |
| `body-lg`    | `20px`                     | `18px` | Intro, lead copy       |
| `body`       | `16px`                     | `16px` | Body copy              |
| `nav`        | `14px`                     | `12px` | Navigation, tabs       |
| `caption`    | `11px`                     | `11px` | Metadata, legal copy   |

### Kiểu chữ rules

- Display heading line-height: `0.88-0.92`.
- Body line-height: `1.4-1.55`.
- Khong dung letter-spacing am de lam chu vua khung.
- Tranh viet hoa toan bo doan van; chi dung uppercase cho nav, label va caption.

## 5. Khoảng cách

Dung boi so cua `4px` tren ca web va mobile:

```text
space-1: 4px    space-2: 8px     space-3: 12px
space-4: 16px   space-5: 20px    space-6: 24px
space-8: 32px   space-10: 40px   space-14: 56px
space-20: 80px  space-25: 100px
```

### Khoảng cách trên di động

- Safe area ngang: `16px` toi thieu, `24px` cho man hinh lon hon.
- Khoang cach giua section: `32px`.
- Padding card: `16px`.
- Khoang cach giua cac control: `8px`.
- Khong dat noi dung quan trong sat tai notch, status bar hoac home indicator.

## 6. Bo góc, đường viền và độ nổi

| Token             | Value                          | Use                        |
| :---------------- | :----------------------------- | :------------------------- |
| `radius-pill`     | `9999px`                       | Button, chip, search, cart |
| `radius-card`     | `8px`                          | Card san pham, panel       |
| `radius-media`    | `0px`                          | Anh campaign toan man hinh |
| `border-hairline` | `1px solid rgba(16,16,15,.08)` | Divider                    |
| `border-strong`   | `2px solid #000000`            | Focus hoac trang thai chon |
| `shadow-soft`     | `0 2px 8px rgba(0,0,0,.12)`    | Bottom sheet, menu         |

## 7. Nền tảng ứng dụng di động

### Nền tảng

- Uu tien React Native + Expo neu can Android va iOS tu mot codebase.
- Dung he thong token nay cho React Native, Flutter hoac native app; khong hard-code mau trong tung component.
- Dung `SafeAreaView`/safe area inset cho iOS va Android.
- Chỉ hỗ trợ giao diện tối khi có bộ token riêng; REWEAR hiện dùng giao diện sáng.

### Cảm ứng và tương tác

- Touch target toi thieu `44 x 44px` cho iOS va `48 x 48dp` cho Android.
- Button chinh cao toi thieu `48px`, pill co padding ngang `20px`.
- Khong chi dung mau de bieu thi trang thai; them icon, text hoac hinh dang.
- Swipe, pull-to-refresh va horizontal carousel phai co chi dan truc quan.
- Moi thao tac nguy hiem can confirmation hoac undo.
- Dung haptic nhe cho add-to-cart, thanh cong va thay doi trang thai quan trong.

### Điều hướng di động

- Dung bottom tab bar cho toi da 5 khu vuc cap cao: `Home`, `Shop`, `Collections`, `Orders`, `Account`.
- Dung stack navigation cho detail, checkout va form.
- Dung bottom sheet cho filter, sort va tuy chon ngan.
- Menu phan cap mo bang modal hoac drawer tu trai.
- Tab dang chon can co icon + label, khong chi doi mau icon.
- Khi mo keyboard, khong de keyboard che input, CTA hoac loi validation.

### Các màn hình di động đề xuất

1. Splash/Onboarding: logo, anh campaign, bo qua.
2. Home: hero, New In, collection cards, campaign video.
3. Shop: search, filter, sort, product grid.
4. Product detail: gallery, gia, mau/size, add to cart co dinh o day man hinh.
5. Cart/Checkout: review, shipping, payment, confirmation.
6. Account/Orders: thong tin ca nhan, lich su don, saved items.

## 8. Quy chuẩn thành phần

### Thanh điều hướng

- Web: logo pill ben trai, menu pill o giua, Search va Cart ben phai.
- Mobile: logo gon ben trai, search va cart icon ben phai, menu mo bang modal/drawer.
- Height web: `54px` toi `64px`; height mobile: `56px` toi `64px`.
- Nen co the trong suot tren hero; khi cuon qua nen trang thi dung surface `paper`.

### Nút bấm

- Primary: nen `ink`, chu `paper`, pill, cao toi thieu `48px`.
- Secondary: nen `neutral-200`, chu `ink`, pill.
- Tertiary: khong nen, chu `ink`, co underline khi hover/focus.
- Loading: giu nguyen kich thuoc button va hien spinner, khong de layout nhay.

### Thẻ sản phẩm

- Anh la noi bat nhat, dung khung aspect ratio on dinh.
- Ten san pham, gia va mau nam trong cung mot vertical flow.
- Tren mobile, dung grid 2 cot; tren tablet 3 cot; tren desktop 4 cot hoac horizontal rail.
- Hover zoom chi dung tren web; mobile dung press state nhe.

### Ảnh và video chiến dịch

- Desktop co the dung sticky parallax; mobile uu tien anh/video tinh de tiet kiem pin.
- Text tren media can overlay toi va luon co contrast du.
- Video phai `muted`, `loop`, `playsInline`, co nut play/pause va mute/unmute.
- Neu video khong tai duoc, poster image phai thay the ma khong lam vo layout.

### Biểu mẫu

- Label luon nam ngoai input, khong chi dung placeholder.
- Input mobile cao toi thieu `48px`.
- Loi hien ngay gan field, noi ro cach sua.
- Dung input type phu hop de hien keyboard dung: email, numeric, tel, search.

## 9. Điểm ngắt responsive

| Name  | Width         | Rule                            |
| :---- | :------------ | :------------------------------ |
| `xs`  | `< 414px`     | 1 cot, padding `16px`           |
| `sm`  | `414-767px`   | Mobile, 2 cot san pham          |
| `md`  | `768-1023px`  | Tablet, 3 cot                   |
| `lg`  | `1024-1279px` | Desktop compact                 |
| `xl`  | `1280-1535px` | Desktop                         |
| `2xl` | `>= 1536px`   | Desktop rong, max content width |

Khong chi dua vao width. Can kiem tra them orientation, safe area, font scaling va thiet bi co notch.

## 10. Khả năng truy cập

- Ho tro VoiceOver va TalkBack cho moi luong chinh.
- Dung accessibility label ngan, mo ta hanh dong thay vi mo ta giao dien.
- Thu tu focus phai theo thu tu doc tu tren xuong.
- Ho tro Dynamic Type/Font Scaling den toi thieu `200%` ma khong cat mat chu.
- Khong dung animation quan trong neu nguoi dung bat `prefers-reduced-motion`.
- Moi icon button can co tooltip tren web va accessibility label tren mobile.
- Kiem tra voi keyboard, screen reader, contrast checker va tap target checker truoc khi release.

## 11. Chuyển động

| Token             | Duration | Use                        |
| :---------------- | :------- | :------------------------- |
| `motion-fast`     | `0.18s`  | Hover, pressed, color      |
| `motion-normal`   | `0.3s`   | Drawer, modal, tab         |
| `motion-slow`     | `0.5s`   | Image transition, card     |
| `motion-campaign` | `1s`     | Ken Burns, video crossfade |

- Easing mac dinh: `ease`.
- Animation phai phuc vu hierarchy hoac feedback, khong trang tri tuy tien.
- Tren mobile, tranh animation parallax nang va tu dong phat video co am thanh.

## 12. Danh sách kiểm tra kỹ thuật

### Trước khi triển khai

- [ ] Chon dung token thay vi hard-code mau, spacing va radius.
- [ ] Xac dinh CTA chinh cua moi man hinh.
- [ ] Chuan bi anh/video dung kich thuoc va poster fallback.
- [ ] Xac dinh trang thai loading, empty, error va offline.

### Trước khi phát hành

- [ ] Test iOS va Android o man hinh nho, lon va co notch.
- [ ] Test light mode, font scaling, screen reader va reduced motion.
- [ ] Kiem tra tap target toi thieu `44px`.
- [ ] Kiem tra hinh anh khong bi mo, crop sai hoac nhay layout.
- [ ] Kiem tra video fallback khi offline va mang cham.
- [ ] Kiem tra navigation back, deep link va restore state.

## Nguồn tham khảo

Một số ý tưởng thị giác ban đầu được tham khảo từ https://rains.com. Đây là nguồn tham khảo bên ngoài, không phải tên thương hiệu, tài sản hay cam kết sản phẩm của REWEAR.
