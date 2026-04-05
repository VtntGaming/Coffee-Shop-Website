/**
 * ============================================
 * DASHBOARD PAGE — Trang tổng quan admin
 *
 * Chức năng:
 *   - Hiển thị lời chào user
 *   - Placeholder thống kê (số đơn, doanh thu,...)
 *   - Link nhanh đến các module khác
 *   - Lưu ý: phần thống kê thực tế sẽ do người khác implement
 * ============================================
 */
import { Link } from 'react-router-dom';
import {
  Coffee,
  Users,
  Store,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  Ticket,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './DashboardPage.css';

/**
 * Thẻ module — link nhanh đến các trang
 */
interface ModuleCard {
  label: string;
  description: string;
  to: string;
  icon: React.ReactNode;
  color: string;
}

const moduleCards: ModuleCard[] = [
  {
    label: 'Chi nhánh & Bàn',
    description: 'Quản lý cửa hàng và sơ đồ bàn',
    to: '/admin/branches',
    icon: <Store size={24} />,
    color: '#8B5E3C',
  },
  {
    label: 'Menu & Sản phẩm',
    description: 'Danh mục đồ uống và món ăn',
    to: '/admin/menu',
    icon: <UtensilsCrossed size={24} />,
    color: '#C97C3D',
  },
  {
    label: 'Kho nguyên liệu',
    description: 'Tồn kho và nhà cung cấp',
    to: '/admin/inventory',
    icon: <Package size={24} />,
    color: '#16A34A',
  },
  {
    label: 'Đơn hàng',
    description: 'Theo dõi đơn hàng và thanh toán',
    to: '/admin/orders',
    icon: <ShoppingCart size={24} />,
    color: '#7C3AED',
  },
  {
    label: 'Voucher',
    description: 'Khuyến mãi và ưu đãi thành viên',
    to: '/admin/vouchers',
    icon: <Ticket size={24} />,
    color: '#DC2626',
  },
  {
    label: 'Quản lý người dùng',
    description: 'Thêm, sửa, xóa tài khoản',
    to: '/admin/users',
    icon: <Users size={24} />,
    color: '#1D4ED8',
  },
];

export function DashboardPage() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="dashboard-page">
      {/* Header — lời chào */}
      <div className="dashboard-page__header">
        <div className="dashboard-page__greeting">
          <h1 className="dashboard-page__title">
            Xin chào, {user?.fullName || 'User'} 👋
          </h1>
          <p className="dashboard-page__subtitle">
            {isAdmin
              ? 'Chào mừng quản trị viên! Đây là tổng quan hệ thống Coffee Shop.'
              : 'Chào mừng nhân viên! Đây là trang làm việc của bạn.'}
          </p>
        </div>
        <div className="dashboard-page__date">
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      {/* Thống kê nhanh — placeholder, sẽ implement sau */}
      <div className="dashboard-page__stats">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#F4E7DA' }}>
            <Coffee size={22} color="#8B5E3C" />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">0</span>
            <span className="stat-card__label">Đơn hàng hôm nay</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#dcfce7' }}>
            <span style={{ fontSize: '20px', color: '#16A34A' }}>đ</span>
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">0đ</span>
            <span className="stat-card__label">Doanh thu hôm nay</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#dbeafe' }}>
            <Users size={22} color="#1D4ED8" />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">0</span>
            <span className="stat-card__label">Người dùng</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__icon" style={{ backgroundColor: '#fef3c7' }}>
            <Store size={22} color="#b45309" />
          </div>
          <div className="stat-card__info">
            <span className="stat-card__value">0</span>
            <span className="stat-card__label">Chi nhánh</span>
          </div>
        </div>
      </div>

      {/* Link đến các module — đang placeholder */}
      <div className="dashboard-page__modules">
        <h2 className="dashboard-page__section-title">
          Các khu vực quản lý
        </h2>
        <p className="dashboard-page__section-hint">
          Các module đang được phát triển. Nhấn vào để xem chi tiết.
        </p>

        <div className="module-grid">
          {moduleCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="module-card"
            >
              <div
                className="module-card__icon"
                style={{ backgroundColor: card.color + '15', color: card.color }}
              >
                {card.icon}
              </div>
              <div className="module-card__info">
                <h3 className="module-card__label">{card.label}</h3>
                <p className="module-card__desc">{card.description}</p>
              </div>
              <ChevronRight size={18} className="module-card__arrow" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}