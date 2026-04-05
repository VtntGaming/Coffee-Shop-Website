/**
 * ============================================
 * LOGIN PAGE — Trang đăng nhập
 *
 * Chức năng:
 *   - Form email + password
 *   - Gọi API /api/auth/login
 *   - Lưu token vào localStorage
 *   - Chuyển hướng sang /admin khi thành công
 * ============================================
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Toggle hiện/ẩn password
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Xử lý submit form đăng nhập
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = await login(email, password);

    // Đăng nhập thành công → chuyển sang dashboard
    if (result.success) {
      navigate('/admin');
    }
  }

  return (
    <div className="login-page">
      {/* Tiêu đề */}
      <div className="login-page__header">
        <h1 className="login-page__title">Chào mừng quay trở lại</h1>
        <p className="login-page__subtitle">
          Đăng nhập để quản lý Coffee Shop
        </p>
      </div>

      {/* Hiển thị lỗi từ API trả về */}
      {error && (
        <div className="login-page__error">
          {error}
        </div>
      )}

      {/* Form đăng nhập */}
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="login-form__field">
          <label htmlFor="email" className="login-form__label">Email</label>
          <div className="login-form__input-wrapper">
            <Mail size={18} className="login-form__icon" />
            <input
              id="email"
              type="email"
              className="login-form__input login-form__input--icon"
              placeholder="admin@coffee.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div className="login-form__field">
          <label htmlFor="password" className="login-form__label">Mật khẩu</label>
          <div className="login-form__input-wrapper">
            <Lock size={18} className="login-form__icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="login-form__input login-form__input--icon login-form__input--icon-right"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {/* Nút toggle hiện/ẩn password */}
            <button
              type="button"
              className="login-form__toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Nút đăng nhập */}
        <Button type="submit" fullWidth loading={loading}>
          Đăng nhập
        </Button>
      </form>

      {/* Link sang trang đăng ký */}
      <p className="login-page__footer">
        Chưa có tài khoản?{' '}
        <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
}