/**
 * ============================================
 * TYPES — Định nghĩa kiểu dữ liệu cho Table
 * ============================================
 */

/** Trạng thái bàn */
export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

/** Bàn */
export interface Table {
  _id: string;
  branchId: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

/** Payload tạo/sửa bàn */
export interface TablePayload {
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  isActive: boolean;
  notes?: string;
}
