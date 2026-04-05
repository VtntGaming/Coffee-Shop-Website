/**
 * ============================================
 * TYPES — Định nghĩa kiểu dữ liệu Đơn hàng (Order)
 * ============================================
 */

/** Trạng thái đơn hàng */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

/** Trạng thái thanh toán */
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

/** Loại đơn hàng */
export type OrderType = 'dine-in' | 'takeaway';

/** Phương thức thanh toán */
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'momo' | 'zalopay';

/** Một item trong đơn hàng */
export interface OrderItem {
  _id: string;
  order: string;
  product: {
    _id: string;
    name: string;
    image?: string;
    price?: number;
  } | string;
  productName: string;
  size: 'S' | 'M' | 'L';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note: string;
}

/** Đơn hàng đầy đủ (trả về từ API) */
export interface Order {
  _id: string;
  orderNumber: string;
  branch: { _id: string; name: string; address?: string } | string;
  table: { _id: string; tableNumber: number; floor?: string } | string | null;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  voucher: { _id: string; code: string; discountType?: string; discountValue?: number } | string | null;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  createdBy: { _id: string; fullName: string } | string;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** Payload item khi tạo đơn */
export interface CreateOrderItemPayload {
  product: string;
  size: 'S' | 'M' | 'L';
  quantity: number;
  note?: string;
}

/** Payload tạo đơn hàng */
export interface CreateOrderPayload {
  branch: string;
  table?: string | null;
  orderType: OrderType;
  items: CreateOrderItemPayload[];
  voucherCode?: string;
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  note?: string;
}

/** Filter cho danh sách đơn hàng */
export interface OrderFilter {
  branch?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  orderType?: OrderType;
  date?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/** Response phân trang đơn hàng */
export interface OrderListResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Order[];
  message?: string;
}
