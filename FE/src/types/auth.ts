/**
 * ============================================
 * TYPES — Định nghĩa kiểu dữ liệu dùng trong Auth
 * ============================================
 */

/** Vai trò người dùng (từ backend trả về) */
export type RoleName = 'ADMIN' | 'STAFF';

/** Thông tin vai trò */
export interface Role {
  _id: string;
  name: RoleName;
  description?: string;
}

/** User đầy đủ (từ API /users) */
export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role; // backend trả về object Role
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** User trả về từ login/register (id thay vì _id, role là string) */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string; // 'ADMIN' hoặc 'STAFF'
}

/** Payload đăng nhập */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload đăng ký */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

/** Response chuẩn từ backend */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

/** Dữ liệu trả về sau login/register */
export interface AuthResponseData {
  token: string;
  user: AuthUser;
}