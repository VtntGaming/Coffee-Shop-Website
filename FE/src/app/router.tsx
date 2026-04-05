/**
 * ============================================
 * ROUTER — Cấu hình định tuyến cho toàn app
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
import { CategoryListPage } from '../pages/categories/CategoryListPage';
import { ProductListPage } from '../pages/products/ProductListPage';

/**
 * Component bảo vệ route — chặn người chưa đăng nhập
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
 */
function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  return <AuthLayout><Outlet /></AuthLayout>;
}

/**
 * Trang 404
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

const routes: RouteObject[] = [
  { path: '/', element: <HomePage /> },
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/admin', element: <DashboardPage /> },
      { path: '/admin/categories', element: <CategoryListPage /> },
      { path: '/admin/products', element: <ProductListPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter(routes);