/**
 * ============================================
 * API CLIENT — Wrapper axios dùng chung cho cả team
 *
 * Team member khác muốn gọi API chỉ cần:
 *   import apiClient from '../services/apiClient';
 *   await apiClient.get('/branches');
 *   await apiClient.post('/orders', data);
 * ============================================
 */
import axios from 'axios';
import { getToken, clearAuth } from '../utils/storage';

// Địa chỉ backend, đọc từ biến môi trường Vite
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor — Tự động gắn token vào header
 * Mỗi request gửi đi sẽ mang theo Authorization: Bearer <token>
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor — Xử lý lỗi response tập trung
 * - 401: token hết hạn → xóa auth → redirect về login
 * - 403: không có quyền → thông báo
 * - 500: lỗi server → thông báo
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token không hợp lệ hoặc hết hạn → clear auth và redirect
          clearAuth();
          window.location.href = '/login';
          break;

        case 403:
          console.warn('Bạn không có quyền thực hiện thao tác này.');
          break;

        case 404:
          console.warn('Tài nguyên không tìm thấy.');
          break;

        case 500:
          console.error('Lỗi server. Vui lòng thử lại sau.');
          break;
      }
    } else if (error.request) {
      // Không nhận được response (server down, mất mạng)
      console.error('Không thể kết nối đến server.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;