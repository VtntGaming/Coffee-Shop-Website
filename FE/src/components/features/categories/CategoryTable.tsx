import { Edit2, EyeOff, Eye, Trash2 } from 'lucide-react';
import { DataTable } from '../../common/DataTable';
import { StatusBadge } from '../../common/StatusBadge';
import { Button } from '../../common/Button';
import type { Category } from '../../../types/category';
import './CategoryTable.css';

interface CategoryTableProps {
  data: Category[];
  loading?: boolean;
  onEdit: (category: Category) => void;
  onToggleStatus: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({
  data,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
}: CategoryTableProps) {
  const columns = [
    {
      key: 'name',
      label: 'Tên danh mục',
      render: (row: Category) => (
        <span className="cat-table__name-text">{row.name}</span>
      ),
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (row: Category) => (
        <span className="cat-table__description">
          {row.description || 'Chưa có mô tả'}
        </span>
      ),
    },
    {
      key: 'isActive',
      label: 'Trạng thái',
      render: (row: Category) => (
        <StatusBadge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Đang hoạt động' : 'Đang ẩn'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      render: (row: Category) => (
        <div className="cat-table__actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            title="Chỉnh sửa"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleStatus(row)}
            title={row.isActive ? 'Ẩn danh mục' : 'Hiện danh mục'}
          >
            {row.isActive ? (
              <EyeOff size={16} style={{ color: 'var(--color-warning)' }} />
            ) : (
              <Eye size={16} style={{ color: 'var(--color-success)' }} />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row._id)}
            title="Xác nhận xóa"
            style={{ color: 'var(--color-danger, #dc3545)' }}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns as any}
      data={data as any}
      loading={loading}
      emptyText="Chưa có danh mục nào được tạo."
    />
  );
}
