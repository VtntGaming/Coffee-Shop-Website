/**
 * ============================================
 * STATUS BADGE — Nhãn trạng thái dùng chung
 *
 * Props:
 *   variant: 'success' | 'warning' | 'danger' | 'info' | 'default'
 *   children: nội dung nhãn
 * ============================================
 */
import type { ReactNode } from 'react';
import './StatusBadge.css';

interface StatusBadgeProps {
  /** Kiểu màu nhãn */
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  /** Nội dung hiển thị */
  children: ReactNode;
}

export function StatusBadge({ children, variant = 'default' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge--${variant}`}>
      {children}
    </span>
  );
}