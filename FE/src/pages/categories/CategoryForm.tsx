/**
 * ============================================
 * CATEGORY FORM — Form thêm/sửa danh mục
 * ============================================
 */
import { useState, useEffect } from 'react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import * as categoryService from '../../services/categoryService';
import type { Category, CreateCategoryPayload } from '../../types/category';
import './CategoryForm.css';

interface CategoryFormProps {
  /** Dữ liệu danh mục để sửa (null nếu thêm mới) */
  category?: Category | null;
  /** Khi lưu thành công */
  onSuccess: () => void;
  /** Khi nhấn hủy */
  onCancel: () => void;
}

export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  // State quản lý form
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: '',
    description: '',
    image: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync dữ liệu khi sửa
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        image: '', // Không còn dùng ảnh
        isActive: category.isActive,
      });
    }
  }, [category]);

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi khi gõ
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Validate form
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Tên danh mục không được để trống';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      let response;
      if (category) {
        response = await categoryService.updateCategory(category._id, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive
        });
      } else {
        response = await categoryService.createCategory({
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive
        });
      }

      if (response.success) {
        onSuccess();
      } else {
        setErrors({ submit: response.message || 'Có lỗi xảy ra' });
      }
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || 'Không thể kết nối đến server' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cat-form">

      {/* Tên danh mục */}
      <Input 
        label="Tên danh mục" 
        name="name" 
        value={formData.name} 
        onChange={handleChange}
        error={errors.name}
        placeholder="Ví dụ: Cà phê, Trà sữa, Bánh ngọt..."
        required
      />

      {/* Mô tả */}
      <div className="input-group">
        <label className="input-group__label">Mô tả danh mục</label>
        <textarea 
          name="description" 
          value={formData.description} 
          onChange={handleChange as any}
          className="input-group__input cat-form__description-area"
          placeholder="Giới thiệu ngắn về nhóm sản phẩm này..."
        />
      </div>

      {/* Trạng thái hoạt động */}
      <div className="cat-form__status-group">
        <input 
          type="checkbox"
          id="cat-isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="cat-isActive">
          Đang hoạt động (Hiện trên menu)
        </label>
      </div>

      {/* Nút bấm */}
      <div className="cat-form__actions">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" loading={loading}>
          {category ? 'Lưu thay đổi' : 'Tạo danh mục'}
        </Button>
      </div>

      {errors.submit && (
        <p className="cat-form__error">
          {errors.submit}
        </p>
      )}
    </form>
  );
}
