/**
 * ============================================
 * BRANCH CARD — Component hiển thị thẻ chi nhánh
 * (Có thể tái sử dụng hoặc mở rộng sau)
 * ============================================
 */
import type { ReactNode } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '../../common/Button';
import { StatusBadge } from '../../common/StatusBadge';
import type { Branch } from '../../../types/branch';
import './BranchCard.css';

interface BranchCardProps {
  branch: Branch;
  onEdit?: (branch: Branch) => void;
  onDelete?: (id: string) => void;
  children?: ReactNode;
}

export function BranchCard({ branch, onEdit, onDelete, children }: BranchCardProps) {
  return (
    <div className="branch-card">
      <div className="branch-card__header">
        <h3 className="branch-card__name">{branch.name}</h3>
        <div className="branch-card__status">
          <StatusBadge variant={branch.isActive ? 'success' : 'danger'}>
            {branch.isActive ? 'Hoạt động' : 'Dừng'}
          </StatusBadge>
        </div>
      </div>

      <div className="branch-card__content">
        <p className="branch-card__info">
          <strong>Địa chỉ:</strong> {branch.address}
        </p>
        {branch.phone && (
          <p className="branch-card__info">
            <strong>Điện thoại:</strong> {branch.phone}
          </p>
        )}
        {branch.openTime && (
          <p className="branch-card__info">
            <strong>Giờ mở cửa:</strong> {branch.openTime} - {branch.closeTime}
          </p>
        )}
      </div>

      {children && <div className="branch-card__custom">{children}</div>}

      <div className="branch-card__actions">
        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(branch)}
          >
            <Edit size={16} /> Sửa
          </Button>
        )}
        {onDelete && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(branch._id)}
          >
            <Trash2 size={16} /> Xóa
          </Button>
        )}
      </div>
    </div>
  );
}
