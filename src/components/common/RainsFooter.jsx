import React from "react";
import { Link } from "react-router-dom";
import "./RainsFooter.css";

export default function RainsFooter() {
  return (
    <footer className="rw-footer-rains">
      <div className="rw-footer-top-grid">
        {/* Left Column: Guarantees + Newsletter */}
        <div className="rw-footer-left-col">
          <div className="rw-footer-guarantees">
            <p className="rw-guarantee-item">
              Thời trang tuần hoàn, thêm vòng đời mới.
            </p>
            <p className="rw-guarantee-item">Tuyển chọn những món đồ có giá trị sử dụng.</p>
            <p className="rw-guarantee-item">Mua sắm có trách nhiệm cùng REWEAR.</p>
          </div>

          <div className="rw-footer-subscribe">
            <p className="rw-sub-title">Câu chuyện mới từ REWEAR.</p>
            <p className="rw-sub-desc">
              Khám phá sản phẩm mới, ý tưởng tái thiết kế và hành trình của thời trang tuần hoàn.
            </p>
            <button
              className="rw-footer-signup-btn"
              onClick={() => alert("Tính năng đăng ký nhận tin đang được hoàn thiện.")}
            >
              Đăng ký
            </button>
          </div>
        </div>

        {/* Links Columns */}
        <div className="rw-footer-nav-cols">
          {/* Service */}
          <div className="rw-footer-nav-col">
            <h3 className="rw-nav-col-title">Hỗ trợ</h3>
            <a href="#" className="rw-footer-link">Liên hệ</a>
            <a href="#" className="rw-footer-link">Giao hàng</a>
            <a href="#" className="rw-footer-link">Đổi trả</a>
            <a href="#" className="rw-footer-link">Bảo hành</a>
            <Link to="/world" className="rw-footer-link">Địa chỉ cửa hàng</Link>
            <a href="#" className="rw-footer-link">Quyền lợi khách hàng</a>
            <a href="#" className="rw-footer-link">Hủy mua hàng</a>
          </div>

          {/* Company */}
          <div className="rw-footer-nav-col">
            <h3 className="rw-nav-col-title">REWEAR</h3>
            <Link to="/about" className="rw-footer-link">Giới thiệu</Link>
            <a href="#" className="rw-footer-link">Tuyển dụng</a>
            <a href="#" className="rw-footer-link">Thư viện ảnh</a>
            <a href="#" className="rw-footer-link">Báo chí</a>
          </div>

          {/* Social */}
          <div className="rw-footer-nav-col">
            <h3 className="rw-nav-col-title">Kết nối</h3>
            <a href="#" className="rw-footer-link">Instagram</a>
            <a href="#" className="rw-footer-link">Facebook</a>
            <a href="#" className="rw-footer-link">Pinterest</a>
            <a href="#" className="rw-footer-link">TikTok</a>
            <a href="#" className="rw-footer-link">LinkedIn</a>
          </div>

          {/* Shipping to */}
          <div className="rw-footer-nav-col">
            <h3 className="rw-nav-col-title">Khu vực</h3>
            <a href="#" className="rw-footer-shipping-btn">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ marginRight: "6px" }}
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Việt Nam
            </a>
          </div>
        </div>
      </div>

      {/* Legal Sub-bar */}
      <div className="rw-footer-legal-bar">
        <span className="rw-legal-copy">
          © REWEAR 2026. Bảo lưu mọi quyền.
        </span>
        <a href="#" className="rw-legal-link">Điều khoản</a>
        <a href="#" className="rw-legal-link">Quyền riêng tư</a>
        <a href="#" className="rw-legal-link">Chính sách cookie</a>
        <a href="#" className="rw-legal-link">Khả năng truy cập</a>
        <a href="#" className="rw-legal-link">Thu hồi sản phẩm</a>
        <a href="#" className="rw-legal-link">Sơ đồ trang</a>
        <a href="#" className="rw-legal-link">Hỗ trợ truy cập</a>
      </div>

      {/* Giant edge-to-edge RAINS Wordmark */}
      <div className="rw-footer-giant-wordmark" aria-hidden="true">
        REWEAR
      </div>
    </footer>
  );
}
