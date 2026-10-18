import CatalogPage from '../../components/common/CatalogPage';

export default function WomenPage() {
  return <CatalogPage title={'Tủ đồ mới.\nVẫn là bạn.'} description="Một góc cảm hứng cho những ngày rất riêng. Chọn món đồ bạn yêu thích, viết tiếp câu chuyện theo cách của mình." route="/women" slides={[
    { src: '/images/editorial/women-street.jpg', alt: 'Cảm hứng trang phục nữ sắc vàng trên phố', companion: '/images/editorial/women-city.jpg', position: 'center 35%' },
    { src: '/images/editorial/women-style.jpg', alt: 'Áo khoác đỏ trầm trong một buổi dạo phố', companion: '/images/editorial/women-street.jpg' },
  ]} stories={[
    { image: '/images/editorial/women-street.jpg', alt: 'Trang phục nữ tông vàng với phom dáng rộng', number: '01', label: 'GÓC NỮ / SẮC MÀU', title: 'Ngày mới, thêm chút nắng.', to: '/women#catalog-tools', link: 'Khám phá tủ đồ' },
    { image: '/images/editorial/women-city.jpg', alt: 'Áo xanh ngọc và kính mát trên nền tường vàng', number: '02', label: 'GÓC NỮ / PHỐ THỊ', title: 'Ra phố, mang theo cá tính.', to: '/women#catalog-tools', link: 'Tìm phong cách của bạn' },
    { image: '/images/editorial/women-style.jpg', alt: 'Cảm hứng phối áo khoác nữ màu đỏ trầm', number: '03', label: 'GÓC NỮ / PHỐI LỚP', title: 'Lớp áo quen. Cảm hứng mới.', to: '/about', link: 'Câu chuyện REWEAR' },
  ]} circularImage="/images/editorial/women-style.jpg" />;
}
