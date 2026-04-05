/**
 * ============================================
 * TABLE FORM — Form thêm/sửa bàn
 * Người 2: Tạo mới
 * ============================================
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import type { Table, TablePayload, TableStatus } from '../../../types/table';
import './TableForm.css';

interface TableFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Table | null;
  onSubmit: (payload: TablePayload) => Promise<void>;
  loading?: boolean;
}

interface FormState {
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  isActive: boolean;
  notes: string;
}

export function TableForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  loading = false,
}: TableFormProps) {
  const [form, setForm] = useState<FormState>({
    tableNumber: 0,
    capacity: 2,
    status: 'available',
    isActive: true,
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        tableNumber: initialData.tableNumber,
        capacity: initialData.capacity,
        status: initialData.status,
        isActive: initialData.isActive,
        notes: initialData.notes || '',
      });
    } else {
      setForm({
        tableNumber: 0,
        capacity: 2,
        status: 'available',
        isActive: true,
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.tableNumber <= 0 || form.capacity <= 0) return;

    await onSubmit({
      tableNumber: form.tableNumber,
      capacity: form.capacity,
      status: form.status,
      isActive: form.isActive,
      notes: form.notes || undefined,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Sửa bàn' : 'Thêm bàn'}
      size="sm"
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {initialData ? 'Cập nhật' : 'Thêm'}
          </Button>
        </div>
      }
    >
      <form className="table-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Bàn số *</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.tableNumber}
              onChange={(e) =>
                setForm({ ...form, tableNumber: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Sức chứa *</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) || 0 })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Trạng thái *</label>
          <select
            className="form-input"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as TableStatus })
            }
          >
            <option value="available">Trống</option>
            <option value="occupied">Có khách</option>
            <option value="reserved">Đặt trước</option>
            <option value="maintenance">Bảo trì</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Ghi chú</label>
          <textarea
            className="form-input"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="VD: Bàn gần cửa sổ, gần nhà vệ sinh..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>Kích hoạt bàn</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
