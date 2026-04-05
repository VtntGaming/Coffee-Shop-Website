/**
 * ============================================
 * USER MANAGEMENT PAGE — Quản lý danh sách người dùng
 *
 * Chức năng:
 *   - Xem danh sách user (chỉ ADMIN được vào)
 *   - Thêm user mới
 *   - Sửa thông tin user
 *   - Bật/tắt trạng thái active
 *   - Xóa user
 *
 * Chỉ ADMIN mới truy cập được trang này
 * ============================================
 */
import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, ShieldCheck, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import * as userService from '../../services/userService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { User, RoleName } from '../../types/auth';
import './UserManagementPage.css';

// ===== FORM STATE =====
interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: RoleName;
}

const EMPTY_FORM: UserFormData = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: 'STAFF',
};

export function UserManagementPage() {
  const { isAdmin, user: currentUser } = useAuth();

  // ===== RENDER ======
  // Nếu không phải ADMIN → redirect về dashboard
  if (!isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // ===== STATE =====
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal thêm/sửa user
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null); // null = thêm mới, != null = sửa
  const [form, setForm] = useState<UserFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal xác nhận xóa
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ===== LOAD DATA =====
  /**
   * Lấy danh sách user từ API
   */
  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getAllUsers();
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setError(res.message || 'Không thể tải danh sách user');
      }
    } catch {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ===== FORM HANDLERS =====

  /**
   * Cập nhật giá trị field trong form
   */
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null); // Xóa lỗi cũ
  }

  /**
   * Mở modal thêm user mới
   */
  function openAddModal() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  }

  /**
   * Mở modal sửa user (không cho sửa password)
   */
  function openEditModal(user: User) {
    setEditingUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role.name as RoleName,
    });
    setFormError(null);
    setModalOpen(true);
  }

  /**
   * Đóng modal và reset form
   */
  function closeModal() {
    setModalOpen(false);
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  /**
   * Submit form thêm/sửa user
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    // Validate cơ bản
    if (!form.fullName.trim()) { setFormError('Họ tên không được để trống'); return; }
    if (!form.email.trim()) { setFormError('Email không được để trống'); return; }
    if (!editingUser && !form.password.trim()) { setFormError('Mật khẩu không được để trống'); return; }
    if (form.password && form.password.length < 6) { setFormError('Mật khẩu phải ít nhất 6 ký tự'); return; }

    setSaving(true);
    try {
      let res;
      if (editingUser) {
        // Sửa user — không gửi password nếu rỗng
        const payload: Parameters<typeof userService.updateUser>[1] = {
          fullName: form.fullName,
          phone: form.phone || undefined,
          role: form.role,
        };
        res = await userService.updateUser(editingUser._id, payload);
      } else {
        // Thêm user mới
        res = await userService.createUser({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          role: form.role,
        });
      }

      if (res.success) {
        closeModal();
        loadUsers(); // Tải lại danh sách
      } else {
        setFormError(res.message || 'Thao tác thất bại');
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message || 'Thao tác thất bại';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  }

  // ===== TOGGLE ACTIVE =====

  /**
   * Bật/tắt trạng thái user (active/inactive)
   */
  async function toggleActive(user: User) {
    try {
      const res = await userService.updateUser(user._id, { isActive: !user.isActive });
      if (res.success) {
        loadUsers(); // Cập nhật lại danh sách
      }
    } catch {
      setError('Không thể thay đổi trạng thái');
    }
  }

  // ===== DELETE =====

  /**
   * Mở modal xác nhận xóa
   */
  function openDeleteModal(user: User) {
    setDeletingUser(user);
    setDeleteModal(true);
  }

  /**
   * Thực hiện xóa user
   */
  async function confirmDelete() {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      const res = await userService.deleteUser(deletingUser._id);
      if (res.success) {
        setDeleteModal(false);
        setDeletingUser(null);
        loadUsers();
      }
    } catch {
      setError('Không thể xóa user');
    } finally {
      setDeleting(false);
    }
  }

  // ===== CỘT BẢNG =====
  const columns = [
    {
      key: 'fullName',
      label: 'Họ tên',
      render: (row: User) => (
        <div className="user-cell">
          <span className="user-cell__avatar">
            {row.fullName.charAt(0).toUpperCase()}
          </span>
          <span className="user-cell__name">{row.fullName}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      render: (row: User) => row.phone || '—',
    },
    {
      key: 'role',
      label: 'Vai trò',
      render: (row: User) => (
        <StatusBadge variant={row.role.name === 'ADMIN' ? 'danger' : 'info'}>
          {row.role.name === 'ADMIN' ? (
            <><ShieldCheck size={12} /> Admin</>
          ) : (
            <><UserCheck size={12} /> Staff</>
          )}
        </StatusBadge>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (row: User) => (
        <StatusBadge variant={row.isActive ? 'success' : 'danger'}>
          {row.isActive ? 'Hoạt động' : 'Bị khóa'}
        </StatusBadge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row: User) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '—',
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row: User) => (
        <div className="action-buttons">
          {/* Sửa */}
          <button
            className="action-btn action-btn--edit"
            onClick={() => openEditModal(row)}
            title="Sửa"
          >
            <Pencil size={15} />
          </button>

          {/* Bật/tắt active */}
          <button
            className={`action-btn ${row.isActive ? 'action-btn--warning' : 'action-btn--success'}`}
            onClick={() => toggleActive(row)}
            title={row.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
          >
            {row.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
          </button>

          {/* Xóa (không cho xóa chính mình) */}
          {row._id !== currentUser?.id && (
            <button
              className="action-btn action-btn--danger"
              onClick={() => openDeleteModal(row)}
              title="Xóa"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="user-management">
      {/* ===== HEADER ===== */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý người dùng</h1>
          <p className="page-subtitle">
            Thêm, sửa, xóa và quản lý tài khoản nhân viên
          </p>
        </div>
        <Button onClick={openAddModal}>
          <Plus size={16} />
          Thêm người dùng
        </Button>
      </div>

      {/* ===== LỖI ===== */}
      {error && (
        <div className="user-management__error">{error}</div>
      )}

      {/* ===== BẢNG DỮ LIỆU ===== */}
      <div className="user-management__table">
        <DataTable
          columns={columns}
          data={users}
          loading={loading}
          emptyText="Chưa có người dùng nào"
        />
      </div>

      {/* ===== MODAL THÊM / SỬA ===== */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} type="button">
              Hủy
            </Button>
            <Button onClick={handleSubmit as React.FormEventHandler} loading={saving} type="button">
              {editingUser ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <form className="user-form" onSubmit={handleSubmit}>
          {formError && (
            <div className="user-form__error">{formError}</div>
          )}

          <Input
            label="Họ tên"
            name="fullName"
            value={form.fullName}
            onChange={handleFormChange}
            placeholder="Nguyễn Văn A"
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleFormChange}
            placeholder="email@example.com"
            required
            disabled={!!editingUser} // Sửa thì không đổi email
          />

          {!editingUser && (
            <Input
              label="Mật khẩu"
              name="password"
              type="password"
              value={form.password}
              onChange={handleFormChange}
              placeholder="Ít nhất 6 ký tự"
              required
            />
          )}

          <Input
            label="Số điện thoại"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleFormChange}
            placeholder="0901234567"
            hint="Tùy chọn"
          />

          {/* Vai trò */}
          <div className="input-group">
            <label htmlFor="role" className="input-group__label">Vai trò</label>
            <select
              id="role"
              name="role"
              className="input-group__input"
              value={form.role}
              onChange={handleFormChange}
            >
              <option value="STAFF">Staff — Nhân viên</option>
              <option value="ADMIN">Admin — Quản trị viên</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* ===== MODAL XÁC NHẬN XÓA ===== */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)} type="button">
              Hủy
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={deleting} type="button">
              Xóa
            </Button>
          </>
        }
      >
        <p style={{ color: 'var(--color-text)', lineHeight: 1.6 }}>
          Bạn có chắc muốn xóa tài khoản{' '}
          <strong>{deletingUser?.fullName}</strong>?
          <br />
          <span style={{ fontSize: '13px', color: '#888' }}>
            Hành động này không thể hoàn tác.
          </span>
        </p>
      </Modal>
    </div>
  );
}