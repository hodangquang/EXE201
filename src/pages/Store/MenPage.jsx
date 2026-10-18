import CatalogPage from '../../components/common/CatalogPage';

export default function MenPage() {
  return <CatalogPage title={'Tự nhiên.\nĐúng chất bạn.'} description="Bắt đầu từ chất liệu, phom dáng và những điều bạn yêu thích. Một góc nhìn mới về tủ đồ thường ngày." route="/men" slides={[
    { src: '/images/editorial/men-city.jpg', alt: 'Cảm hứng phối áo denim nam', companion: '/images/editorial/men-style.jpg', position: 'center 30%' },
    { src: '/images/editorial/men-detail.jpg', alt: 'Áo denim phối quần màu sáng và giày trắng', companion: '/images/editorial/men-city.jpg' },
  ]} stories={[
    { image: '/images/editorial/men-city.jpg', alt: 'Áo khoác denim nam với phom dáng thoải mái', number: '01', label: 'GÓC NAM / DENIM', title: 'Denim, mỗi ngày một cách.', to: '/men#catalog-tools', link: 'Khám phá tủ đồ' },
    { image: '/images/editorial/men-style.jpg', alt: 'Cảm hứng bộ vest xanh phối cùng giày da', number: '02', label: 'GÓC NAM / PHOM DÁNG', title: 'Chỉn chu từ nét đơn giản.', to: '/men#catalog-tools', link: 'Tìm phong cách của bạn' },
    { image: '/images/editorial/men-detail.jpg', alt: 'Chi tiết phối quần chinos và giày thể thao trắng', number: '03', label: 'GÓC NAM / THƯỜNG NGÀY', title: 'Thoải mái mà vẫn riêng.', to: '/about', link: 'Câu chuyện REWEAR' },
  ]} circularImage="/images/editorial/men-detail.jpg" />;
}
