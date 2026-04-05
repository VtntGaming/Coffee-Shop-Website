/**
 * ============================================
 * USER SERVICE — API quản lý người dùng (ADMIN only)
 * ============================================
 */
import apiClient from './apiClient';
import type { ApiResponse, User } from '../types/auth';

/**
 * Lấy danh sách tất cả user (ADMIN)
 * GET /api/users
 */
export async function getAllUsers(): Promise<ApiResponse<User[]>> {
  const response = await apiClient.get<ApiResponse<User[]>>('/users');
  return response.data;
}

/**
 * Lấy 1 user theo id (ADMIN)
 * GET /api/users/:id
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return response.data;
}

/**
 * Tạo user mới (ADMIN)
 * POST /api/users
 */
export async function createUser(data: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: string;
}): Promise<ApiResponse<User>> {
  const response = await apiClient.post<ApiResponse<User>>('/users', data);
  return response.data;
}

/**
 * Cập nhật user (ADMIN)
 * PUT /api/users/:id
 */
export async function updateUser(
  id: string,
  data: {
    fullName?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
  }
): Promise<ApiResponse<User>> {
  const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data);
  return response.data;
}

/**
 * Xóa user (soft delete — ADMIN)
 * DELETE /api/users/:id
 */
export async function deleteUser(id: string): Promise<ApiResponse<User>> {
  const response = await apiClient.delete<ApiResponse<User>>(`/users/${id}`);
  return response.data;
}