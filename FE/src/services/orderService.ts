/**
 * ============================================
 * ORDER SERVICE — Các API liên quan đến đơn hàng
 * ============================================
 */
import apiClient from './apiClient';
import type {
  Order,
  CreateOrderPayload,
  OrderFilter,
  OrderListResponse,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../types/order';

/**
 * Lấy danh sách đơn hàng (có filter, phân trang)
 * GET /api/orders
 */
export async function getAllOrders(filter?: OrderFilter): Promise<OrderListResponse> {
  const response = await apiClient.get<OrderListResponse>('/orders', { params: filter });
  return response.data;
}

/**
 * Lấy chi tiết đơn hàng
 * GET /api/orders/:id
 */
export async function getOrderById(id: string): Promise<{ success: boolean; data: Order; message?: string }> {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
}

/**
 * Tạo đơn hàng mới
 * POST /api/orders
 */
export async function createOrder(payload: CreateOrderPayload): Promise<{ success: boolean; data: Order; message?: string }> {
  const response = await apiClient.post('/orders', payload);
  return response.data;
}

/**
 * Cập nhật trạng thái đơn hàng
 * PATCH /api/orders/:id/status
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ success: boolean; data: Order; message?: string }> {
  const response = await apiClient.patch(`/orders/${id}/status`, { status });
  return response.data;
}

/**
 * Cập nhật thanh toán
 * PATCH /api/orders/:id/payment
 */
export async function updatePayment(
  id: string,
  paymentMethod: PaymentMethod,
  paymentStatus: PaymentStatus
): Promise<{ success: boolean; data: Order; message?: string }> {
  const response = await apiClient.patch(`/orders/${id}/payment`, { paymentMethod, paymentStatus });
  return response.data;
}
