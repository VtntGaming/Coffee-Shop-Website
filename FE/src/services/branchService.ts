/**
 * ============================================
 * BRANCH SERVICE — Các API liên quan đến chi nhánh
 * ============================================
 */
import apiClient from './apiClient';
import type { ApiResponse } from '../types/auth';
import type { Branch, BranchPayload } from '../types/branch';

/**
 * Lấy danh sách chi nhánh
 * GET /api/branches
 */
export async function getAllBranches(): Promise<ApiResponse<Branch[]>> {
  const response = await apiClient.get<ApiResponse<Branch[]>>('/branches');
  return response.data;
}

/**
 * Lấy chi tiết chi nhánh
 * GET /api/branches/:id
 */
export async function getBranchById(id: string): Promise<ApiResponse<Branch>> {
  const response = await apiClient.get<ApiResponse<Branch>>(`/branches/${id}`);
  return response.data;
}

/**
 * Tạo chi nhánh mới
 * POST /api/branches
 */
export async function createBranch(payload: BranchPayload): Promise<ApiResponse<Branch>> {
  const response = await apiClient.post<ApiResponse<Branch>>('/branches', payload);
  return response.data;
}

/**
 * Cập nhật chi nhánh
 * PUT /api/branches/:id
 */
export async function updateBranch(
  id: string,
  payload: BranchPayload
): Promise<ApiResponse<Branch>> {
  const response = await apiClient.put<ApiResponse<Branch>>(`/branches/${id}`, payload);
  return response.data;
}

/**
 * Xóa chi nhánh
 * DELETE /api/branches/:id
 */
export async function deleteBranch(id: string): Promise<ApiResponse<void>> {
  const response = await apiClient.delete<ApiResponse<void>>(`/branches/${id}`);
  return response.data;
}
