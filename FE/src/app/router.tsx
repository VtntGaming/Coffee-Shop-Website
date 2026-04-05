/**
 * ============================================
 * ROUTER — Cấu hình định tuyến cho toàn app
 *
 * Cách dùng:
 *   import { router } from './app/router';
 *   <RouterProvider router={router} />
 *
 * Team member khác muốn thêm route mới chỉ cần thêm vào đây.
 * ============================================
 */
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  type RouteObject,
} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { HomePage } from '../pages/home/HomePage';
import { InventoryManagementPage } from '../pages/inventory/InventoryManagementPage';

/**
 * Component bảo vệ route — chặn người chưa đăng nhập
 * Nếu chưa login → redirect sang /login
 */
function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout><Outlet /></AdminLayout>;
}

/**
 * Redirect người đã đăng nhập khỏi trang login
 * Nếu đã login → redirect sang /admin
 */
function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <AuthLayout><Outlet /></AuthLayout>;
}

/**
 * Trang 404 — hiển thị khi route không tồn tại
 */
function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <h1 style={{ fontSize: '72px', fontWeight: 700, color: '#ccc', margin: 0 }}>404</h1>
      <p style={{ color: '#888', fontSize: '16px' }}>Trang không tồn tại</p>
      <a href="/admin" style={{ color: 'var(--color-primary)', fontSize: '14px' }}>
        Quay về trang chủ
      </a>
    </div>
  );
}

/**
 * Định nghĩa tất cả routes
 */
const routes: RouteObject[] = [
  // ===== HOME — ai cũng vào được (trang công khai) =====
  { path: '/', element: <HomePage /> },

  // ===== PUBLIC ROUTES — ai cũng vào được (chưa đăng nhập) =====
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // ===== PROTECTED ROUTES — cần đăng nhập =====
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/admin', element: <DashboardPage /> },
      { path: '/admin/inventory', element: <InventoryManagementPage /> },
      // Các trang admin khác sẽ thêm vào đây
    ],
  },

  // ===== 404 =====
  { path: '*', element: <NotFoundPage /> },
];

/**
 * Tạo router với createBrowserRouter
 * Dùng trong main.tsx: <RouterProvider router={router} />
 */
export const router = createBrowserRouter(routes);