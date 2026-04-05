/**
 * ============================================
 * ORDER STATUS BADGE — Badge trạng thái đơn hàng
 * ============================================
 */
import { StatusBadge } from '../../common/StatusBadge';
import type { OrderStatus, PaymentStatus } from '../../../types/order';

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  pending: { label: 'Chờ xác nhận', variant: 'warning' },
  confirmed: { label: 'Đã xác nhận', variant: 'info' },
  preparing: { label: 'Đang pha chế', variant: 'info' },
  ready: { label: 'Sẵn sàng', variant: 'success' },
  completed: { label: 'Hoàn thành', variant: 'success' },
  cancelled: { label: 'Đã hủy', variant: 'danger' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
  pending: { label: 'Chưa thanh toán', variant: 'warning' },
  paid: { label: 'Đã thanh toán', variant: 'success' },
  refunded: { label: 'Đã hoàn tiền', variant: 'danger' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
  return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const config = PAYMENT_STATUS_CONFIG[status] || { label: status, variant: 'default' as const };
  return <StatusBadge variant={config.variant}>{config.label}</StatusBadge>;
}

export { ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG };
