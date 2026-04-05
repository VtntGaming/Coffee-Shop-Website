/**
 * ============================================
 * SIDEBAR — Thanh điều hướng bên trái (dùng chung)
 *
 * Props:
 *   isOpen: boolean — có đang mở không (mobile)
 *   onClose: () => void — đóng sidebar (mobile)
 * ============================================
 */
import { Link, useLocation } from 'react-router-dom';
import {
  Coffee,
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  Package,
  ShoppingCart,
  Ticket,
  Users,
  ChevronRight,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import './Sidebar.css';

interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

interface SidebarProps {
  /** Sidebar đang mở (mobile) */
  isOpen?: boolean;
  /** Đóng sidebar (mobile) */
  onClose?: () => void;
}

/**
 * Menu điều hướng chính
 * Thêm/bớt mục theo tiến độ các module
 */
const navItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'Chi nhánh & Bàn', to: '/admin/branches', icon: <Store size={20} /> },
  { label: 'Menu & Sản phẩm', to: '/admin/menu', icon: <UtensilsCrossed size={20} /> },
  { label: 'Kho nguyên liệu', to: '/admin/inventory', icon: <Package size={20} /> },
  { label: 'Đơn hàng', to: '/admin/orders', icon: <ShoppingCart size={20} /> },
  { label: 'Voucher', to: '/admin/vouchers', icon: <Ticket size={20} /> },
  { label: 'Quản lý người dùng', to: '/admin/users', icon: <Users size={20} /> },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay nền khi sidebar mở trên mobile */}
      {isOpen && onClose && (
        <div className="sidebar-overlay" onClick={onClose} />
      )}

      {/* Sidebar chính */}
      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Logo + tên app */}
        <div className="sidebar__header">
          <div className="sidebar__brand">
            <Coffee size={24} />
            <span>Coffee Shop</span>
          </div>
          {/* Nút đóng trên mobile */}
          {onClose && (
            <button className="sidebar__close" onClick={onClose}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Danh sách menu */}
        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar__link ${active ? 'sidebar__link--active' : ''}`}
                onClick={onClose}
              >
                <span className="sidebar__icon">{item.icon}</span>
                <span className="sidebar__label">{item.label}</span>
                {/* Mũi tên chỉ active */}
                {active && <ChevronRight size={16} className="sidebar__arrow" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}