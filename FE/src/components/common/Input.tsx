/**
 * ============================================
 * INPUT — Ô nhập liệu dùng chung
 *
 * Props:
 *   label: string — nhãn trên input
 *   error: string — thông báo lỗi
 *   hint: string — gợi ý phía dưới
 *   required: boolean — dấu * bắt buộc
 * ============================================
 */
import type { InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Nhãn hiển thị phía trên */
  label?: string;
  /** Thông báo lỗi — hiển thị màu đỏ */
  error?: string;
  /** Gợi ý phía dưới input */
  hint?: string;
}

/**
 * Tự động tạo id cho label từ label text
 */
function toId(label?: string): string {
  return label?.toLowerCase().replace(/\s+/g, '-') || '';
}

export function Input({ label, error, hint, id, className = '', required, ...props }: InputProps) {
  const inputId = id || toId(label);

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {/* Nhãn */}
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
          {/* Dấu * bắt buộc */}
          {required && <span className="input-group__required">*</span>}
        </label>
      )}

      {/* Ô nhập */}
      <input
        id={inputId}
        className="input-group__input"
        {...props}
      />

      {/* Lỗi hoặc gợi ý */}
      {error && <span className="input-group__error">{error}</span>}
      {hint && !error && <span className="input-group__hint">{hint}</span>}
    </div>
  );
}