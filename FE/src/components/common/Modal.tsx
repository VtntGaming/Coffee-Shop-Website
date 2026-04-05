/**
 * ============================================
 * MODAL — Cửa sổ popup dùng chung
 *
 * Props:
 *   isOpen: boolean — có đang mở không
 *   onClose: () => void — đóng modal
 *   title: string — tiêu đề modal
 *   size: 'sm' | 'md' | 'lg' — kích thước
 *   footer: ReactNode — nội dung footer (nút Hủy/Lưu)
 * ============================================
 */
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
  /** Trạng thái mở/đóng */
  isOpen: boolean;
  /** Hàm đóng modal */
  onClose: () => void;
  /** Tiêu đề modal */
  title?: string;
  /** Nội dung chính */
  children: ReactNode;
  /** Kích thước modal */
  size?: 'sm' | 'md' | 'lg';
  /** Nội dung footer (thường là nút Hủy/Lưu) */
  footer?: ReactNode;
}

/**
 * Modal là component trả về null nếu không mở
 * overlay bắt click bên ngoài → đóng modal
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation để click trong modal không bị đóng */}
      <div
        className={`modal modal--${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header — tiêu đề + nút đóng */}
        <div className="modal__header">
          {title && <h3 className="modal__title">{title}</h3>}
          <button className="modal__close" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </div>

        {/* Body — nội dung chính */}
        <div className="modal__body">{children}</div>

        {/* Footer — các nút hành động */}
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}