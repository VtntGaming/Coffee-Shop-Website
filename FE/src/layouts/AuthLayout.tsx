/**
 * ============================================
 * AUTH LAYOUT — Layout cho trang đăng nhập/đăng ký
 *
 * Dùng cho: /login, /register
 * Giao diện: full màn hình, nền tối, form giữa
 * ============================================
 */
import type { ReactNode } from 'react';
import { Coffee } from 'lucide-react';
import './AuthLayout.css';

interface AuthLayoutProps {
  /** Nội dung trang (form) */
  children: ReactNode;
}

/**
 * AuthLayout bao bọc trang login/register
 * Nền gradient tối + card trắng giữa màn hình
 */
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      {/* Background decoration */}
      <div className="auth-layout__bg" />

      {/* Logo phía trên */}
      <div className="auth-layout__logo">
        <div className="auth-layout__logo-icon">
          <Coffee size={28} />
        </div>
        <span className="auth-layout__logo-name">Coffee Shop</span>
      </div>

      {/* Form đăng nhập/đăng ký */}
      <div className="auth-layout__card">
        {children}
      </div>
    </div>
  );
}