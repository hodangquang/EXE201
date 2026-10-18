import CatalogPage from '../../components/common/CatalogPage';

export default function NewInPage() {
  return <CatalogPage title={'Mới về.\nMặc tiếp.'} description="Những món đồ vừa lên kệ. Những câu chuyện đang chờ được tiếp nối. Tìm một thiết kế phù hợp với bạn." route="/new-in" slides={[
    { src: '/images/editorial/newin-studio.jpg', alt: 'Các thiết kế trên giá treo trong không gian cửa hàng', companion: '/images/editorial/newin-texture.jpg' },
    { src: '/images/editorial/newin-details.jpg', alt: 'Áo khoác, đồ len và phụ kiện trên giá gỗ', companion: '/images/editorial/newin-studio.jpg' },
  ]} stories={[
    { image: '/images/editorial/newin-studio.jpg', alt: 'Giá treo quần áo dưới ánh đèn ấm', number: '01', label: 'MỚI VỀ / KHÁM PHÁ', title: 'Một lần ghé. Một điều mới.', to: '/new-in#catalog-tools', link: 'Khám phá tủ đồ' },
    { image: '/images/editorial/newin-texture.jpg', alt: 'Những lớp vải nhiều màu trên giá treo', number: '02', label: 'MỚI VỀ / SẮC ĐỘ', title: 'Thêm màu cho ngày thường.', to: '/new-in#catalog-tools', link: 'Tìm món đồ phù hợp' },
    { image: '/images/editorial/newin-details.jpg', alt: 'Các lớp áo và phụ kiện được phối cạnh nhau', number: '03', label: 'MỚI VỀ / CHẤT LIỆU', title: 'Câu chuyện từ chất vải.', to: '/about', link: 'Câu chuyện REWEAR' },
  ]} circularImage="/images/editorial/newin-details.jpg" />;
}
