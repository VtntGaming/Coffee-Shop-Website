/**
 * ============================================
 * CART PANEL — Giỏ hàng bên phải khi tạo đơn
 * ============================================
 */
import { Minus, Plus, Trash2, Tag } from 'lucide-react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import type { CreateOrderItemPayload } from '../../../types/order';
import './CartPanel.css';

export interface CartItem extends CreateOrderItemPayload {
  productName: string;
  unitPrice: number;
  image?: string;
}

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (index: number, qty: number) => void;
  onRemoveItem: (index: number) => void;
  voucherCode: string;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucher: () => void;
  voucherDiscount: number;
  voucherApplied: boolean;
  voucherLoading: boolean;
  subtotal: number;
  total: number;
  onSubmit: () => void;
  submitting: boolean;
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  voucherCode,
  onVoucherCodeChange,
  onApplyVoucher,
  voucherDiscount,
  voucherApplied,
  voucherLoading,
  subtotal,
  total,
  onSubmit,
  submitting,
}: CartPanelProps) {
  return (
    <div className="cart-panel">
      <h3 className="cart-panel__title">Giỏ hàng ({items.length} món)</h3>

      {/* Danh sách sản phẩm trong giỏ */}
      <div className="cart-panel__items">
        {items.length === 0 ? (
          <p className="cart-panel__empty">Chưa có sản phẩm nào</p>
        ) : (
          items.map((item, index) => (
            <div key={`${item.product}-${item.size}-${index}`} className="cart-item">
              <div className="cart-item__info">
                <span className="cart-item__name">{item.productName}</span>
                <span className="cart-item__meta">
                  Size {item.size} · {currencyFormatter.format(item.unitPrice)}
                </span>
              </div>
              <div className="cart-item__actions">
                <button
                  className="cart-item__qty-btn"
                  onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus size={14} />
                </button>
                <span className="cart-item__qty">{item.quantity}</span>
                <button
                  className="cart-item__qty-btn"
                  onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                >
                  <Plus size={14} />
                </button>
                <button
                  className="cart-item__remove"
                  onClick={() => onRemoveItem(index)}
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="cart-item__total">
                {currencyFormatter.format(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Voucher */}
      <div className="cart-panel__voucher">
        <div className="cart-panel__voucher-input">
          <Input
            placeholder="Nhập mã voucher..."
            value={voucherCode}
            onChange={(e) => onVoucherCodeChange(e.target.value.toUpperCase())}
            disabled={voucherApplied}
          />
          <Button
            variant={voucherApplied ? 'ghost' : 'secondary'}
            size="sm"
            onClick={onApplyVoucher}
            loading={voucherLoading}
            disabled={!voucherCode || voucherApplied}
          >
            <Tag size={14} />
            {voucherApplied ? 'Đã áp dụng' : 'Áp dụng'}
          </Button>
        </div>
      </div>

      {/* Tổng tiền */}
      <div className="cart-panel__summary">
        <div className="cart-panel__row">
          <span>Tạm tính</span>
          <span>{currencyFormatter.format(subtotal)}</span>
        </div>
        {voucherDiscount > 0 && (
          <div className="cart-panel__row cart-panel__row--discount">
            <span>Giảm giá</span>
            <span>-{currencyFormatter.format(voucherDiscount)}</span>
          </div>
        )}
        <div className="cart-panel__row cart-panel__row--total">
          <span>Tổng cộng</span>
          <span>{currencyFormatter.format(total)}</span>
        </div>
      </div>

      {/* Nút tạo đơn */}
      <Button
        fullWidth
        onClick={onSubmit}
        loading={submitting}
        disabled={items.length === 0}
      >
        Tạo đơn hàng
      </Button>
    </div>
  );
}
