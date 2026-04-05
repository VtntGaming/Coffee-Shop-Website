/**
 * ============================================
 * TABLE GRID — Hiển thị danh sách bàn (Grid hoặc Table)
 * Người 2: Tạo mới
 * ============================================
 */
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '../../common/Button';
import { StatusBadge } from '../../common/StatusBadge';
import type { Table, TableStatus } from '../../../types/table';
import './TableGrid.css';

interface TableGridProps {
  tables: Table[];
  loading?: boolean;
  onEdit: (table: Table) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: TableStatus) => void;
  viewMode?: 'grid' | 'table';
}

const statusLabel: Record<TableStatus, string> = {
  available: 'Trống',
  occupied: 'Có khách',
  reserved: 'Đặt trước',
  maintenance: 'Bảo trì',
};

const statusVariant: Record<TableStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  available: 'success',
  occupied: 'warning',
  reserved: 'info',
  maintenance: 'danger',
};

/**
 * Hiển thị danh sách bàn dạng grid
 */
function TableGridView({ tables, onEdit, onDelete, onStatusChange }: Omit<TableGridProps, 'viewMode'>) {
  return (
    <div className="table-grid">
      {tables.map((table) => (
        <div key={table._id} className="table-card">
          {/* Bàn số */}
          <div className="table-card__header">
            <div className="table-card__number">Bàn {table.tableNumber}</div>
            <StatusBadge variant={table.isActive ? 'success' : 'danger'}>
              {table.isActive ? 'Hoạt động' : 'Dừng'}
            </StatusBadge>
          </div>

          {/* Thông tin */}
          <div className="table-card__info">
            <p>
              <strong>Sức chứa:</strong> {table.capacity} người
            </p>
            <p>
              <strong>Trạng thái:</strong>{' '}
              <StatusBadge variant={statusVariant[table.status]}>
                {statusLabel[table.status]}
              </StatusBadge>
            </p>
            {table.notes && (
              <p>
                <strong>Ghi chú:</strong> {table.notes}
              </p>
            )}
          </div>

          {/* Status selector */}
          {onStatusChange && (
            <select
              className="table-card__status-select"
              value={table.status}
              onChange={(e) => onStatusChange(table._id, e.target.value as TableStatus)}
            >
              <option value="available">Trống</option>
              <option value="occupied">Có khách</option>
              <option value="reserved">Đặt trước</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          )}

          {/* Actions */}
          <div className="table-card__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(table)}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(table._id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Hiển thị danh sách bàn dạng bảng
 */
function TableTableView({ tables, onEdit, onDelete, onStatusChange }: Omit<TableGridProps, 'viewMode'>) {
  return (
    <div className="table-list-wrapper">
      <table className="table-list">
        <thead>
          <tr>
            <th>Bàn số</th>
            <th>Sức chứa</th>
            <th>Trạng thái</th>
            <th>Hoạt động</th>
            <th>Ghi chú</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((table) => (
            <tr key={table._id}>
              <td>{table.tableNumber}</td>
              <td>{table.capacity} người</td>
              <td>
                {onStatusChange ? (
                  <select
                    value={table.status}
                    onChange={(e) =>
                      onStatusChange(table._id, e.target.value as TableStatus)
                    }
                  >
                    <option value="available">Trống</option>
                    <option value="occupied">Có khách</option>
                    <option value="reserved">Đặt trước</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                ) : (
                  <StatusBadge variant={statusVariant[table.status]}>
                    {statusLabel[table.status]}
                  </StatusBadge>
                )}
              </td>
              <td>
                <StatusBadge variant={table.isActive ? 'success' : 'danger'}>
                  {table.isActive ? 'Hoạt động' : 'Dừng'}
                </StatusBadge>
              </td>
              <td>{table.notes || '-'}</td>
              <td>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(table)}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(table._id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Component chính - TableGrid
 * Hỗ trợ cả grid và table view (mặc định grid)
 */
export function TableGrid({
  tables,
  loading,
  onEdit,
  onDelete,
  onStatusChange,
  viewMode = 'grid',
}: TableGridProps) {
  if (loading) {
    return <div className="table-grid-loading">Đang tải...</div>;
  }

  if (tables.length === 0) {
    return <div className="table-grid-empty">Chưa có bàn nào</div>;
  }

  if (viewMode === 'table') {
    return (
      <TableTableView
        tables={tables}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
      />
    );
  }

  return (
    <TableGridView
      tables={tables}
      onEdit={onEdit}
      onDelete={onDelete}
      onStatusChange={onStatusChange}
    />
  );
}
