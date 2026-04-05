/**
 * ============================================
 * VOUCHER SERVICE — Các API liên quan đến voucher
 * ============================================
 */
import apiClient from './apiClient';
import type { Voucher, VoucherPayload, VoucherCheckResult } from '../types/voucher';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

/**
 * Lấy danh sách voucher
 * GET /api/vouchers
 */
export async function getAllVouchers(active?: boolean): Promise<ApiResponse<Voucher[]>> {
  const params = active !== undefined ? { active: String(active) } : {};
  const response = await apiClient.get<ApiResponse<Voucher[]>>('/vouchers', { params });
  return response.data;
}

/**
 * Lấy chi tiết voucher
 * GET /api/vouchers/:id
 */
export async function getVoucherById(id: string): Promise<ApiResponse<Voucher>> {
  const response = await apiClient.get<ApiResponse<Voucher>>(`/vouchers/${id}`);
  return response.data;
}

/**
 * Kiểm tra voucher hợp lệ + tính tiền giảm ước tính
 * POST /api/vouchers/check
 */
export async function checkVoucher(code: string, orderAmount: number): Promise<ApiResponse<VoucherCheckResult>> {
  const response = await apiClient.post<ApiResponse<VoucherCheckResult>>('/vouchers/check', { code, orderAmount });
  return response.data;
}

/**
 * Tạo voucher mới (ADMIN)
 * POST /api/vouchers
 */
export async function createVoucher(payload: VoucherPayload): Promise<ApiResponse<Voucher>> {
  const response = await apiClient.post<ApiResponse<Voucher>>('/vouchers', payload);
  return response.data;
}

/**
 * Cập nhật voucher (ADMIN)
 * PUT /api/vouchers/:id
 */
export async function updateVoucher(id: string, payload: Partial<VoucherPayload>): Promise<ApiResponse<Voucher>> {
  const response = await apiClient.put<ApiResponse<Voucher>>(`/vouchers/${id}`, payload);
  return response.data;
}

/**
 * Vô hiệu hóa voucher (ADMIN)
 * DELETE /api/vouchers/:id
 */
export async function deleteVoucher(id: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(`/vouchers/${id}`);
  return response.data;
}
