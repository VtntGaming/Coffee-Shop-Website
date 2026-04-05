import { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { CategoryTable } from '../../components/features/categories/CategoryTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import * as categoryService from '../../services/categoryService';
import type { Category } from '../../types/category';
import { CategoryForm } from './CategoryForm';
import './CategoryListPage.css';

export function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        const res = await categoryService.deleteCategory(id);
        if (res.success) {
          fetchCategories();
        } else {
          alert(res.message || 'Lỗi khi xóa danh mục');
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa danh mục');
      }
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchCategories();
  };

  const handleToggleStatus = async (category: Category) => {
    const confirmMessage = category.isActive
      ? `Bạn có chắc muốn ẩn danh mục "${category.name}"?`
      : `Bạn có chắc muốn hiện danh mục "${category.name}"?`;

    if (window.confirm(confirmMessage)) {
      try {
        const response = await categoryService.updateCategory(category._id, {
          isActive: !category.isActive,
        });
        if (response.success) {
          fetchCategories();
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi cập nhật trạng thái.');
      }
    }
  };

  return (
    <div className="categories-page">
      <header className="categories-page__header">
        <div className="categories-page__title-group">
          <h1>Quản lý Danh mục</h1>
          <p>Quản lý các nhóm sản phẩm trong thực đơn của quán.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Thêm danh mục
        </Button>
      </header>

      <div className="categories-page__toolbar">
        <div className="categories-page__search">
          <Input
            placeholder="Tìm theo tên danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" onClick={fetchCategories} title="Làm mới">
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </Button>
      </div>

      <div className="categories-page__table-wrapper">
        <CategoryTable
          data={filteredCategories}
          loading={loading}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục mới'}
      >
        <CategoryForm
          category={editingCategory}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
