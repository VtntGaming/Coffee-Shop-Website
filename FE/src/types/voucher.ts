/**
 * ============================================
 * TYPES — Định nghĩa kiểu dữ liệu Voucher
 * ============================================
 */

/** Loại giảm giá */
export type DiscountType = 'percentage' | 'fixed';

/** Voucher đầy đủ */
export interface Voucher {
  _id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** Payload tạo/sửa voucher */
export interface VoucherPayload {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
}

/** Kết quả kiểm tra voucher */
export interface VoucherCheckResult {
  voucherId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  estimatedDiscount: number;
}
