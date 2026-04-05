/**
 * ============================================
 * REGISTER PAGE — Trang đăng ký
 *
 * Chức năng:
 *   - Form: họ tên, email, password, số điện thoại
 *   - Gọi API /api/auth/register
 *   - Chuyển hướng sang /admin khi thành công
 * ============================================
 */
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import '../auth/LoginPage.css'; // Dùng chung style với login

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();

  // Form state
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  // Toggle hiện/ẩn password
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Cập nhật field trong form
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  /**
   * Xử lý submit form đăng ký
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const result = await register(
      form.fullName,
      form.email,
      form.password,
      form.phone || undefined
    );

    // Thành công → chuyển sang dashboard
    if (result.success) {
      navigate('/admin');
    }
  }

  return (
    <div className="login-page">
      {/* Tiêu đề */}
      <div className="login-page__header">
        <h1 className="login-page__title">Tạo tài khoản mới</h1>
        <p className="login-page__subtitle">
          Đăng ký để bắt đầu quản lý Coffee Shop
        </p>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="login-page__error">{error}</div>
      )}

      {/* Form đăng ký */}
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Họ tên */}
        <div className="login-form__field">
          <label htmlFor="fullName" className="login-form__label">Họ tên</label>
          <div className="login-form__input-wrapper">
            <User size={18} className="login-form__icon" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="login-form__input login-form__input--icon"
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="login-form__field">
          <label htmlFor="email" className="login-form__label">Email</label>
          <div className="login-form__input-wrapper">
            <Mail size={18} className="login-form__icon" />
            <input
              id="email"
              name="email"
              type="email"
              className="login-form__input login-form__input--icon"
              placeholder="email@example.com"
              value={form.email}
              onChange={handleChange}
              required
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
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="login-form__input login-form__input--icon login-form__input--icon-right"
              placeholder="Ít nhất 6 ký tự"
              value={form.password}
              onChange={handleChange}
              minLength={6}
              required
            />
            <button
              type="button"
              className="login-form__toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Số điện thoại (tùy chọn) */}
        <div className="login-form__field">
          <label htmlFor="phone" className="login-form__label">
            Số điện thoại <span style={{ fontWeight: 400, color: '#888' }}>(tùy chọn)</span>
          </label>
          <div className="login-form__input-wrapper">
            <Phone size={18} className="login-form__icon" />
            <input
              id="phone"
              name="phone"
              type="tel"
              className="login-form__input login-form__input--icon"
              placeholder="0901234567"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Nút đăng ký */}
        <Button type="submit" fullWidth loading={loading}>
          Đăng ký
        </Button>
      </form>

      {/* Link sang trang đăng nhập */}
      <p className="login-page__footer">
        Đã có tài khoản?{' '}
        <Link to="/login">Đăng nhập ngay</Link>
      </p>
    </div>
  );
}