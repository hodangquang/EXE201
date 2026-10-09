import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag } from "lucide-react";
import RainsFooter from "../../components/common/RainsFooter";
import StoreLocator from "../../components/common/StoreLocator";
import { useCart } from "../../contexts/CartContext";
import "./RainsWorldPage.css";
import "../Home/HomePage.css";
import "../../components/common/StoreLocator.css";

const ARTICLES = [
  {
    id: 5,
    img: "https://images.pexels.com/photos/14810197/pexels-photo-14810197.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Cảm hứng mùa lạnh",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 6,
    img: "https://images.pexels.com/photos/20016574/pexels-photo-20016574.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Những lớp áo mới",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 7,
    img: "https://images.pexels.com/photos/7026777/pexels-photo-7026777.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Khám phá thành phố",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 8,
    img: "https://images.pexels.com/photos/9511322/pexels-photo-9511322.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Tủ đồ mùa lạnh",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 9,
    img: "https://images.pexels.com/photos/31147052/pexels-photo-31147052.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Áo khoác và dấu ấn riêng",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 10,
    img: "https://images.pexels.com/photos/15963599/pexels-photo-15963599.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Phom dáng được làm mới",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 11,
    img: "https://images.pexels.com/photos/16850419/pexels-photo-16850419.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Phối đồ chuyển mùa",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 12,
    img: "https://images.pexels.com/photos/29051340/pexels-photo-29051340.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Phong cách thường ngày",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 13,
    img: "https://images.pexels.com/photos/29696316/pexels-photo-29696316.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Chất liệu và đường may",
    date: "Góc nhìn REWEAR"
  },
  {
    id: 14,
    img: "https://images.pexels.com/photos/16217115/pexels-photo-16217115.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Một vòng đời mới",
    date: "Góc nhìn REWEAR"
  }
];

export default function RainsWorldPage() {
  const navigate = useNavigate();
  const { openCart, cartItemCount } = useCart();

  return (
    <div className="rw world-page">

      {/* Announcement Bar */}
      <div className="rw-announcement">
        <div className="rw-announcement-inner">
          <span>Thời trang tuần hoàn, thêm vòng đời mới</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="rw-nav">
        <div className="rw-nav-inner">
          {/* Left: Logo pill + nav links */}
          <div className="rw-nav-left">
            <a href="/" className="rw-logo-pill">
              REWEAR
            </a>
            <div className="rw-nav-menu">
              <a href="/new-in" onClick={(e) => { e.preventDefault(); navigate('/new-in'); }} className="rw-nav-lk">
                Mới về
              </a>
              <a href="/women" onClick={(e) => { e.preventDefault(); navigate('/women'); }} className="rw-nav-lk">
                Nữ
              </a>
              <a href="/men" onClick={(e) => { e.preventDefault(); navigate('/men'); }} className="rw-nav-lk">
                Nam
              </a>
              <a href="/world" onClick={(e) => { e.preventDefault(); navigate('/world'); }} className="rw-nav-lk active" style={{ fontWeight: 600 }}>
                Thế giới REWEAR
              </a>
              <a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} className="rw-nav-lk">
                Giới thiệu
              </a>
            </div>
          </div>

          {/* Right: Search + Cart pills */}
          <div className="rw-nav-right">
            <button className="rw-nav-pill">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Tìm kiếm
            </button>
            <button className="rw-nav-pill" type="button" onClick={openCart} aria-label={`Giỏ hàng, ${cartItemCount} sản phẩm`}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Giỏ hàng ({cartItemCount})
            </button>
          </div>
        </div>
      </nav>

      {/* Header section */}
      <header className="world-header">
        <h1 className="world-title">Thế giới REWEAR</h1>
        <p className="world-desc">
          REWEAR kết nối những món đồ đã qua sử dụng với người yêu thời trang. Tại đây, bạn có thể khám phá ý tưởng phối đồ, câu chuyện tái sử dụng và địa chỉ cửa hàng của chúng tôi.
        </p>
        <div className="new-in-categories">
          <button className="new-in-cat-pill active">Mới nhất</button>
        </div>
      </header>

      {/* Section Content */}
      <section className="world-section">
        <div className="world-section-header">
          <h2>Mới nhất</h2>
          <p>Góc nhìn, cảm hứng và những câu chuyện từ REWEAR.</p>
        </div>

        {/* Article Marquee */}
        <div className="world-marquee-container">
          <div className="world-marquee-track">
            {[...ARTICLES, ...ARTICLES].map((article, index) => (
              <div className="world-card" key={`${article.id}-${index}`}>
                <div className="world-img-wrapper">
                  <img src={article.img} alt={article.title} />
                </div>
                <div className="world-info">
                  <h3>{article.title}</h3>
                  <p>{article.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoreLocator />

      <RainsFooter />
    </div>
  );
}
