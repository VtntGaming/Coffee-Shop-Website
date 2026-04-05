/**
 * ============================================
 * AUTH SERVICE — Các API liên quan đến xác thực
 * ============================================
 */
import apiClient from './apiClient';
import {
  setToken,
  setUser,
  removeToken,
  removeUser,
} from '../utils/storage';
import type {
  LoginPayload,
  RegisterPayload,
  ApiResponse,
  AuthResponseData,
  AuthUser,
} from '../types/auth';

/**
 * Đăng nhập
 * POST /api/auth/login
 */
export async function login(
  payload: LoginPayload
): Promise<ApiResponse<AuthResponseData>> {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    '/auth/login',
    payload
  );

  // Nếu thành công → lưu token và user vào localStorage
  if (response.data.success && response.data.data) {
    setToken(response.data.data.token);
    setUser(response.data.data.user);
  }

  return response.data;
}

/**
 * Đăng ký
 * POST /api/auth/register
 */
export async function register(
  payload: RegisterPayload
): Promise<ApiResponse<AuthResponseData>> {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    '/auth/register',
    payload
  );

  // Nếu thành công → lưu token và user
  if (response.data.success && response.data.data) {
    setToken(response.data.data.token);
    setUser(response.data.data.user);
  }

  return response.data;
}

/**
 * Lấy thông tin user hiện tại (từ token)
 * GET /api/auth/me
 */
export async function getMe(): Promise<ApiResponse<AuthUser>> {
  const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
  return response.data;
}

/**
 * Đăng xuất — xóa hết auth data
 */
export function logout(): void {
  removeToken();
  removeUser();
}