/**
 * ============================================
 * BRANCH FORM — Form thêm/sửa chi nhánh
 * Tách riêng để tái sử dụng (Người 2)
 * ============================================
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../../common/Modal';
import { Button } from '../../common/Button';
import { convertTo12hFormat, convertTo24hFormat } from '../../../utils/timeUtils';
import type { Branch, BranchPayload } from '../../../types/branch';
import './BranchForm.css';

interface BranchFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Branch | null;
  onSubmit: (payload: BranchPayload) => Promise<void>;
  loading?: boolean;
}

interface FormState {
  name: string;
  address: string;
  phone: string;
  openTimeH: string;
  openTimePeriod: 'SA' | 'CH';
  closeTimeH: string;
  closeTimePeriod: 'SA' | 'CH';
  isActive: boolean;
}

export function BranchForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  loading = false,
}: BranchFormProps) {
  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    phone: '',
    openTimeH: '07',
    openTimePeriod: 'SA',
    closeTimeH: '22',
    closeTimePeriod: 'CH',
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      const open12 = convertTo12hFormat(initialData.openTime || '');
      const close12 = convertTo12hFormat(initialData.closeTime || '');
      const [openH] = open12.split(':');
      const [closeH] = close12.split(':');
      setForm({
        name: initialData.name,
        address: initialData.address,
        phone: initialData.phone || '',
        openTimeH: openH || '7',
        openTimePeriod: open12.includes('CH') ? 'CH' : 'SA',
        closeTimeH: closeH || '10',
        closeTimePeriod: close12.includes('CH') ? 'CH' : 'SA',
        isActive: initialData.isActive,
      });
    } else {
      setForm({
        name: '',
        address: '',
        phone: '',
        openTimeH: '7',
        openTimePeriod: 'SA',
        closeTimeH: '10',
        closeTimePeriod: 'CH',
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;

    const openTime = convertTo24hFormat(`${form.openTimeH}:00 ${form.openTimePeriod}`);
    const closeTime = convertTo24hFormat(`${form.closeTimeH}:00 ${form.closeTimePeriod}`);

    // Validate time conversion
    if (!openTime || !closeTime) {
      alert('Lỗi chuyển đổi giờ. Vui lòng kiểm tra lại.');
      return;
    }

    const payload: any = {
      name: form.name.trim(),
      address: form.address.trim(),
      isActive: form.isActive,
      openTime,
      closeTime,
    };

    // Only add optional fields if they have values
    if (form.phone?.trim()) {
      payload.phone = form.phone.trim();
    }

    console.log('Submitting payload:', payload);
    await onSubmit(payload);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Sửa chi nhánh' : 'Thêm chi nhánh'}
      size="md"
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
      <form className="branch-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Tên chi nhánh *</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Địa chỉ *</label>
          <input
            className="form-input"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Điện thoại</label>
          <input
            className="form-input"
            type="tel"
            placeholder="VD: 0909123456"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <small style={{fontSize: '12px', color: '#999'}}>Format: 08 chữ số (VD: 0909123456)</small>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Giờ mở cửa</label>
            <div className="time-group">
              <input
                className="form-input time-input"
                type="number"
                min="1"
                max="12"
                value={form.openTimeH}
                onChange={(e) => setForm({ ...form, openTimeH: e.target.value })}
              />
              <select
                className="form-input"
                value={form.openTimePeriod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    openTimePeriod: e.target.value as 'SA' | 'CH',
                  })
                }
              >
                <option value="SA">Sáng</option>
                <option value="CH">Chiều</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Giờ đóng cửa</label>
            <div className="time-group">
              <input
                className="form-input time-input"
                type="number"
                min="1"
                max="12"
                value={form.closeTimeH}
                onChange={(e) => setForm({ ...form, closeTimeH: e.target.value })}
              />
              <select
                className="form-input"
                value={form.closeTimePeriod}
                onChange={(e) =>
                  setForm({
                    ...form,
                    closeTimePeriod: e.target.value as 'SA' | 'CH',
                  })
                }
              >
                <option value="SA">Sáng</option>
                <option value="CH">Chiều</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>Kích hoạt chi nhánh</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
