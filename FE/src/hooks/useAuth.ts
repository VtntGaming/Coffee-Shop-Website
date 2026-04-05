/**
 * ============================================
 * USE AUTH — Hook quản lý trạng thái xác thực
 *
 * Cách dùng:
 *   const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
 * ============================================
 */
import { useState, useCallback } from 'react';
import * as authService from '../services/authService';
import { getUser } from '../utils/storage';
import type { AuthUser } from '../types/auth';

export function useAuth() {
  // Khởi tạo user từ localStorage (nếu có) để refresh page không mất trạng thái
  const [user, setUser] = useState<AuthUser | null>(() => getUser<AuthUser>());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Đăng nhập
   */
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        // Lưu user vào state (service đã lưu vào localStorage)
        setUser(response.data.user);
        return { success: true };
      } else {
        setError(response.message || 'Đăng nhập thất bại');
        return { success: false, message: response.message };
      }
    } catch (err: unknown) {
      // Lấy message từ response error
      const message =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Đăng nhập thất bại';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Đăng ký
   */
  const register = useCallback(
    async (fullName: string, email: string, password: string, phone?: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await authService.register({ fullName, email, password, phone });

        if (response.success && response.data) {
          setUser(response.data.user);
          return { success: true };
        } else {
          setError(response.message || 'Đăng ký thất bại');
          return { success: false, message: response.message };
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message || 'Đăng ký thất bại';
        setError(message);
        return { success: false, message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Đăng xuất — xóa auth và clear state
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setError(null);
  }, []);

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  const isAuthenticated = !!user;

  /**
   * Kiểm tra có phải ADMIN không
   */
  const isAdmin = user?.role === 'ADMIN';

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
  };
}