/**
 * ============================================
 * BUTTON — Nút bấm dùng chung toàn app
 *
 * Props:
 *   variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 *   size: 'sm' | 'md' | 'lg'
 *   loading: boolean — hiển thị spinner khi đang xử lý
 *   fullWidth: boolean — chiếm toàn bộ chiều rộng
 * ============================================
 */
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Kiểu nút (màu sắc) */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Kích thước nút */
  size?: 'sm' | 'md' | 'lg';
  /** Trạng thái loading — có spinner */
  loading?: boolean;
  /** Chiếm full chiều rộng */
  fullWidth?: boolean;
  /** Nội dung bên trong nút */
  children: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Spinner quay khi đang loading */}
      {loading && <Loader2 className="btn__spinner" size={16} />}
      {children}
    </button>
  );
}