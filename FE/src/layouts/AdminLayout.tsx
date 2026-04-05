/**
 * ============================================
 * ADMIN LAYOUT — Layout cho trang admin/dashboard
 *
 * Gồm: Sidebar + Header + Main content
 * ============================================
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../hooks/useAuth';
import './AdminLayout.css';

interface AdminLayoutProps {
  /** Nội dung trang con */
  children: React.ReactNode;
}

/**
 * AdminLayout bao bọc các trang trong /admin/*
 * Tự động hiện/ẩn sidebar trên mobile
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Sidebar mở/đóng trên mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /**
   * Đăng xuất — xóa auth data rồi chuyển về trang home công khai
   */
  function handleLogout() {
    logout();
    navigate('/'); // Chuyển về trang chủ
  }

  return (
    <div className="admin-layout">
      {/* Sidebar — truyền isOpen và onClose để mobile có thể đóng */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Khu vực chính */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          {/* Nút hamburger — chỉ hiện trên mobile */}
          <button
            className="admin-header__menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Menu size={24} />
          </button>

          {/* Thông tin user bên phải */}
          <div className="admin-header__right">
            <div className="admin-header__user">
              <span className="admin-header__avatar">
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </span>
              <span className="admin-header__name">{user?.fullName}</span>
              <span className="admin-header__role">{user?.role}</span>
            </div>
            <button
              className="admin-header__logout"
              onClick={handleLogout}
              title="Đăng xuất"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        {/* Nội dung trang */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}