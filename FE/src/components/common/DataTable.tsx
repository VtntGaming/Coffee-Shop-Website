/**
 * ============================================
 * DATA TABLE — Bảng dữ liệu dùng chung
 *
 * Props:
 *   columns: { key, label, render? }[] — cấu hình cột
 *   data: T[] — dữ liệu nguồn
 *   loading: boolean — trạng thái loading
 *   emptyText: string — text khi không có dữ liệu
 * ============================================
 */
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import './DataTable.css';

interface Column<T> {
  /** Key trong object data */
  key: string;
  /** Tiêu đề cột */
  label: string;
  /** Render tùy chỉnh ô (VD: format ngày, badge) */
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  /** Cấu hình các cột */
  columns: Column<T>[];
  /** Dữ liệu hiển thị */
  data: T[];
  /** Có đang loading không */
  loading?: boolean;
  /** Text hiển thị khi không có dữ liệu */
  emptyText?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyText = 'Không có dữ liệu',
}: DataTableProps<T>) {
  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        {/* Header */}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="data-table__loading">
                <Loader2 className="data-table__spinner" size={24} />
                <span>Đang tải dữ liệu...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {/* Ưu tiên dùng render tùy chỉnh, không thì lấy trực tiếp */}
                    {col.render ? col.render(row, index) : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}