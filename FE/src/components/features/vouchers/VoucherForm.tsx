/**
 * ============================================
 * VOUCHER FORM — Form thêm/sửa voucher
 * ============================================
 */
import { useState, type FormEvent } from 'react';
import { Button } from '../../common/Button';
import { Input } from '../../common/Input';
import type { Voucher, VoucherPayload, DiscountType } from '../../../types/voucher';
import * as voucherService from '../../../services/voucherService';

interface VoucherFormProps {
  voucher?: Voucher | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function toDateInputValue(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().slice(0, 10);
}

export function VoucherForm({ voucher, onSuccess, onCancel }: VoucherFormProps) {
  const [code, setCode] = useState(voucher?.code || '');
  const [description, setDescription] = useState(voucher?.description || '');
  const [discountType, setDiscountType] = useState<DiscountType>(voucher?.discountType || 'percentage');
  const [discountValue, setDiscountValue] = useState(String(voucher?.discountValue || ''));
  const [maxDiscount, setMaxDiscount] = useState(voucher?.maxDiscount ? String(voucher.maxDiscount) : '');
  const [minOrderAmount, setMinOrderAmount] = useState(String(voucher?.minOrderAmount || 0));
  const [startDate, setStartDate] = useState(toDateInputValue(voucher?.startDate));
  const [endDate, setEndDate] = useState(toDateInputValue(voucher?.endDate));
  const [usageLimit, setUsageLimit] = useState(voucher?.usageLimit ? String(voucher.usageLimit) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!code.trim() || !discountValue || !startDate || !endDate) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const payload: VoucherPayload = {
      code: code.toUpperCase().trim(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderAmount: Number(minOrderAmount) || 0,
      startDate,
      endDate,
      usageLimit: usageLimit ? Number(usageLimit) : null,
    };

    setLoading(true);
    try {
      let response;
      if (voucher) {
        response = await voucherService.updateVoucher(voucher._id, payload);
      } else {
        response = await voucherService.createVoucher(payload);
      }
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="voucher-form">
      {error && <div className="voucher-form__error">{error}</div>}

      <Input
        label="Mã voucher"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="VD: GIAM20, SALE50..."
        required
        disabled={!!voucher}
      />

      <Input
        label="Mô tả"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Mô tả ngắn về voucher..."
      />

      <div className="voucher-form__row">
        <div className="voucher-form__field">
          <label className="input-group__label">
            Loại giảm giá <span className="input-group__required">*</span>
          </label>
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            className="input-group__input"
          >
            <option value="percentage">Phần trăm (%)</option>
            <option value="fixed">Số tiền cố định (VNĐ)</option>
          </select>
        </div>

        <Input
          label={discountType === 'percentage' ? 'Giá trị (%)' : 'Giá trị (VNĐ)'}
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          min="0"
          required
        />
      </div>

      <div className="voucher-form__row">
        {discountType === 'percentage' && (
          <Input
            label="Giảm tối đa (VNĐ)"
            type="number"
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="Không giới hạn"
            min="0"
          />
        )}
        <Input
          label="Đơn hàng tối thiểu (VNĐ)"
          type="number"
          value={minOrderAmount}
          onChange={(e) => setMinOrderAmount(e.target.value)}
          min="0"
        />
      </div>

      <div className="voucher-form__row">
        <Input
          label="Ngày bắt đầu"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <Input
          label="Ngày kết thúc"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>

      <Input
        label="Giới hạn lượt sử dụng"
        type="number"
        value={usageLimit}
        onChange={(e) => setUsageLimit(e.target.value)}
        placeholder="Không giới hạn"
        min="0"
      />

      <div className="voucher-form__actions">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={loading}>
          Hủy
        </Button>
        <Button type="submit" loading={loading}>
          {voucher ? 'Cập nhật' : 'Tạo voucher'}
        </Button>
      </div>
    </form>
  );
}
