/**
 * ============================================
 * TYPES — Định nghĩa kiểu dữ liệu cho Branch
 * ============================================
 */

/** Chi nhánh */
export interface Branch {
  _id: string;
  name: string;
  address: string;
  phone?: string;
  openTime?: string;
  closeTime?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload tạo/sửa chi nhánh */
export interface BranchPayload {
  name: string;
  address: string;
  phone?: string;
  openTime?: string;
  closeTime?: string;
  isActive: boolean;
}
