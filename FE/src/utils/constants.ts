/**
 * ============================================
 * CONSTANTS — Hằng số dùng chung
 * ============================================
 */

/** Trạng thái bàn */
export const TABLE_STATUSES = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
} as const;

/** Label & màu sắc cho trạng thái bàn */
export const TABLE_STATUS_CONFIG = {
  available: { label: 'Trống', variant: 'success' as const },
  occupied: { label: 'Có khách', variant: 'warning' as const },
  reserved: { label: 'Đặt trước', variant: 'info' as const },
  maintenance: { label: 'Bảo trì', variant: 'danger' as const },
} as const;

/** Pagination */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZES = [10, 20, 50];
