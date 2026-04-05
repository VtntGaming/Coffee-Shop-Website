/**
 * ============================================
 * HOME PAGE — Trang chủ / landing page công khai
 *
 * Ai cũng vào được (không cần đăng nhập)
 * Giới thiệu Coffee Shop và CTA đăng nhập
 * ============================================
 */
import { Link } from 'react-router-dom';
import { Coffee, MapPin, Clock, Star, ArrowRight, ShoppingBag } from 'lucide-react';
import './HomePage.css';

/** Section giới thiệu sản phẩm nổi bật */
const featuredProducts = [
  { name: 'Cà Phê Sữa Đá', price: '35.000đ', desc: 'Hương vị truyền thống Việt Nam', img: '☕' },
  { name: 'Cappuccino', price: '45.000đ', desc: 'Bọt sữa mịn, cà phê đậm đà', img: '🥛' },
  { name: 'Trà Đá Chanh', price: '25.000đ', desc: 'Thơm mát, giải khát cực đã', img: '🍋' },
  { name: 'Matcha Latte', price: '50.000đ', desc: 'Trà xanh Nhật Bản, sữa tươi', img: '🍵' },
];

/** Thông tin chi nhánh */
const branches = [
  { name: 'Chi nhánh Quận 1', address: '123 Nguyễn Huệ, P. Bến Nghé, Q.1, TP.HCM', hours: '7:00 - 22:00' },
  { name: 'Chi nhánh Q.3', address: '45 Lê Văn Sỹ, P. 12, Q.3, TP.HCM', hours: '7:00 - 22:00' },
  { name: 'Chi nhánh Thủ Đức', address: '78 Võ Văn Ngân, P. Bình Thọ, TP.Thủ Đức', hours: '7:00 - 21:30' },
];

export function HomePage() {
  return (
    <div className="home-page">

      {/* ========================================
          NAVBAR — điều hướng trên cùng
          ======================================== */}
      <nav className="home-nav">
        <div className="home-nav__brand">
          <Coffee size={24} />
          <span>Coffee Shop</span>
        </div>
        <div className="home-nav__links">
          <a href="#products">Sản phẩm</a>
          <a href="#branches">Chi nhánh</a>
          <a href="#about">Giới thiệu</a>
        </div>
        <div className="home-nav__actions">
          <Link to="/login" className="home-nav__login">Đăng nhập</Link>
          <Link to="/register" className="home-nav__cta">Bắt đầu</Link>
        </div>
      </nav>

      {/* ========================================
          HERO — banner chính
          ======================================== */}
      <section className="hero">
        <div className="hero__content">
          <span className="hero__eyebrow">☕ Coffee Shop Management</span>
          <h1 className="hero__title">
            Quản lý quán cà phê<br />
            <span className="hero__title--accent">Dễ dàng hơn bao giờ hết</span>
          </h1>
          <p className="hero__desc">
            Hệ thống quản lý toàn diện: từ đơn hàng, kho nguyên liệu,
            đến khuyến mãi — tất cả trong một nền tảng duy nhất.
          </p>
          <div className="hero__actions">
            <Link to="/register" className="hero__btn hero__btn--primary">
              Dùng thử miễn phí
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="hero__btn hero__btn--ghost">
              Đăng nhập
            </Link>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__card">
            <span className="hero__emoji">☕</span>
            <p>Quản lý đơn hàng nhanh chóng</p>
          </div>
          <div className="hero__card">
            <span className="hero__emoji">📦</span>
            <p>Theo dõi kho nguyên liệu</p>
          </div>
          <div className="hero__card">
            <span className="hero__emoji">🎟️</span>
            <p>Khuyến mãi hấp dẫn</p>
          </div>
        </div>
      </section>

      {/* ========================================
          PRODUCTS — sản phẩm nổi bật
          ======================================== */}
      <section id="products" className="section">
        <div className="section__header">
          <span className="section__tag">Thực đơn</span>
          <h2 className="section__title">Sản phẩm nổi bật</h2>
          <p className="section__desc">
            Những món được yêu thích nhất tại Coffee Shop
          </p>
        </div>

        <div className="product-grid">
          {featuredProducts.map((p) => (
            <article key={p.name} className="product-card">
              <div className="product-card__img">{p.img}</div>
              <h3 className="product-card__name">{p.name}</h3>
              <p className="product-card__desc">{p.desc}</p>
              <span className="product-card__price">{p.price}</span>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================
          FEATURES — tính năng hệ thống
          ======================================== */}
      <section id="about" className="section section--alt">
        <div className="section__header">
          <span className="section__tag">Hệ thống</span>
          <h2 className="section__title">Tại sao chọn Coffee Shop?</h2>
          <p className="section__desc">
            Giải pháp quản lý hiện đại dành riêng cho quán cà phê Việt
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-item__icon"><ShoppingBag size={28} /></div>
            <h3>Đơn hàng nhanh</h3>
            <p>Tạo và xử lý đơn hàng chỉ trong vài giây. Hỗ trợ tại quầy, mang đi, giao hàng.</p>
          </div>
          <div className="feature-item">
            <div className="feature-item__icon"><Coffee size={28} /></div>
            <h3>Quản lý menu</h3>
            <p>Dễ dàng thêm, sửa, xóa món trong thực đơn. Cập nhật giá theo thời gian thực.</p>
          </div>
          <div className="feature-item">
            <div className="feature-item__icon"><MapPin size={28} /></div>
            <h3>Nhiều chi nhánh</h3>
            <p>Quản lý đồng thời nhiều cửa hàng từ một dashboard duy nhất.</p>
          </div>
          <div className="feature-item">
            <div className="feature-item__icon"><Star size={28} /></div>
            <h3>Khuyến mãi linh hoạt</h3>
            <p>Tạo voucher, giảm giá theo ngày, chương trình tích điểm thành viên.</p>
          </div>
        </div>
      </section>

      {/* ========================================
          BRANCHES — danh sách chi nhánh
          ======================================== */}
      <section id="branches" className="section">
        <div className="section__header">
          <span className="section__tag">Địa điểm</span>
          <h2 className="section__title">Chi nhánh của chúng tôi</h2>
          <p className="section__desc">Ghé thăm và trải nghiệm tại quán</p>
        </div>

        <div className="branch-grid">
          {branches.map((b) => (
            <article key={b.name} className="branch-card">
              <div className="branch-card__icon">
                <MapPin size={20} />
              </div>
              <h3 className="branch-card__name">{b.name}</h3>
              <p className="branch-card__address">{b.address}</p>
              <div className="branch-card__hours">
                <Clock size={14} />
                <span>{b.hours}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========================================
          CTA — kêu gọi hành động
          ======================================== */}
      <section className="cta-section">
        <div className="cta-section__content">
          <h2>Sẵn sàng quản lý quán của bạn?</h2>
          <p>Đăng ký ngay hôm nay — hoàn toàn miễn phí trong 30 ngày đầu tiên.</p>
          <Link to="/register" className="hero__btn hero__btn--primary">
            Bắt đầu ngay
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ========================================
          FOOTER
          ======================================== */}
      <footer className="home-footer">
        <div className="home-footer__brand">
          <Coffee size={20} />
          <span>Coffee Shop</span>
        </div>
        <p className="home-footer__copy">
          © {new Date().getFullYear()} Coffee Shop Management System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}