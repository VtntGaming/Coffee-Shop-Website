/**
 * ============================================
 * TABLE SERVICE — Các API liên quan đến bàn
 * ============================================
 */
import apiClient from './apiClient';
import type { ApiResponse } from '../types/auth';
import type { Table, TablePayload, TableStatus } from '../types/table';

/**
 * Lấy danh sách bàn (có thể filter theo branchId)
 * GET /api/tables?branch=xxx
 */
export async function getAllTables(branchId?: string): Promise<ApiResponse<Table[]>> {
  const params = branchId ? `?branch=${branchId}` : '';
  const response = await apiClient.get<ApiResponse<Table[]>>(`/tables${params}`);
  return response.data;
}

/**
 * Lấy chi tiết bàn
 * GET /api/tables/:id
 */
export async function getTableById(id: string): Promise<ApiResponse<Table>> {
  const response = await apiClient.get<ApiResponse<Table>>(`/tables/${id}`);
  return response.data;
}

/**
 * Tạo bàn mới
 * POST /api/tables
 */
export async function createTable(branchId: string, payload: TablePayload): Promise<ApiResponse<Table>> {
  const response = await apiClient.post<ApiResponse<Table>>('/tables', {
    branch: branchId,
    tableNumber: payload.tableNumber,
    capacity: payload.capacity,
    status: payload.status,
    description: payload.notes,
  });
  return response.data;
}

/**
 * Cập nhật bàn
 * PUT /api/tables/:id
 */
export async function updateTable(
  id: string,
  payload: TablePayload
): Promise<ApiResponse<Table>> {
  const response = await apiClient.put<ApiResponse<Table>>(`/tables/${id}`, {
    tableNumber: payload.tableNumber,
    capacity: payload.capacity,
    status: payload.status,
    description: payload.notes,
  });
  return response.data;
}

/**
 * Cập nhật trạng thái bàn nhanh
 * PATCH /api/tables/:id/status
 */
export async function updateTableStatus(
  id: string,
  status: TableStatus
): Promise<ApiResponse<Table>> {
  const response = await apiClient.patch<ApiResponse<Table>>(`/tables/${id}/status`, { status });
  return response.data;
}

/**
 * Xóa bàn
 * DELETE /api/tables/:id
 */
export async function deleteTable(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/tables/${id}`);
  return response.data;
}
