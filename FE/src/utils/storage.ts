/**
 * ============================================
 * STORAGE — Quản lý localStorage cho Auth
 * ============================================
 */

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Lưu token vào localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Lấy token từ localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Xóa token khỏi localStorage (khi logout)
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Lưu thông tin user vào localStorage
 */
export function setUser(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

/**
 * Lấy thông tin user từ localStorage
 */
export function getUser<T>(): T | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Xóa thông tin user (khi logout)
 */
export function removeUser(): void {
  localStorage.removeItem(USER_KEY);
}

/**
 * Xóa toàn bộ auth data (logout toàn bộ)
 */
export function clearAuth(): void {
  removeToken();
  removeUser();
}