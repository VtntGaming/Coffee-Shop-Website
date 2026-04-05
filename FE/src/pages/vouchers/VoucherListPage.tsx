/**
 * ============================================
 * VOUCHER LIST PAGE — Trang quản lý voucher
 *
 * Chức năng:
 *   - Danh sách voucher
 *   - Thêm/sửa voucher (modal)
 *   - Vô hiệu hóa voucher
 *   - Hiển thị trạng thái (còn hạn/hết hạn/đã khóa)
 * ============================================
 */
import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Pencil, Ban } from 'lucide-react';
import { Button, DataTable, Input, Modal, StatusBadge } from '../../components/common';
import { VoucherForm } from '../../components/features/vouchers/VoucherForm';
import * as voucherService from '../../services/voucherService';
import type { Voucher } from '../../types/voucher';
import './VoucherListPage.css';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function getVoucherStatus(voucher: Voucher): { label: string; variant: 'success' | 'warning' | 'danger' | 'default' } {
  if (!voucher.isActive) return { label: 'Đã vô hiệu', variant: 'danger' };
  const now = new Date();
  if (now < new Date(voucher.startDate)) return { label: 'Chưa bắt đầu', variant: 'default' };
  if (now > new Date(voucher.endDate)) return { label: 'Hết hạn', variant: 'warning' };
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return { label: 'Hết lượt', variant: 'warning' };
  return { label: 'Đang hoạt động', variant: 'success' };
}

function formatDiscountValue(voucher: Voucher): string {
  if (voucher.discountType === 'percentage') {
    let text = `${voucher.discountValue}%`;
    if (voucher.maxDiscount) text += ` (tối đa ${currencyFormatter.format(voucher.maxDiscount)})`;
    return text;
  }
  return currencyFormatter.format(voucher.discountValue);
}

export function VoucherListPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    loadVouchers();
  }, []);

  async function loadVouchers() {
    setLoading(true);
    try {
      const res = await voucherService.getAllVouchers();
      if (res.success && res.data) {
        setVouchers(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải voucher:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredVouchers = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleAdd() {
    setEditingVoucher(null);
    setIsModalOpen(true);
  }

  function handleEdit(voucher: Voucher) {
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  }

  async function handleDelete(voucher: Voucher) {
    if (!window.confirm(`Bạn có chắc muốn vô hiệu hóa voucher "${voucher.code}"?`)) return;
    try {
      const res = await voucherService.deleteVoucher(voucher._id);
      if (res.success) {
        loadVouchers();
      } else {
        alert(res.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra');
    }
  }

  function handleSuccess() {
    setIsModalOpen(false);
    loadVouchers();
  }

  const columns = [
    {
      key: 'code',
      label: 'Mã voucher',
      render: (row: Voucher) => <strong className="voucher-code">{row.code}</strong>,
    },
    {
      key: 'description',
      label: 'Mô tả',
      render: (row: Voucher) => row.description || '—',
    },
    {
      key: 'discountValue',
      label: 'Giảm giá',
      render: (row: Voucher) => formatDiscountValue(row),
    },
    {
      key: 'minOrderAmount',
      label: 'Đơn tối thiểu',
      render: (row: Voucher) => row.minOrderAmount ? currencyFormatter.format(row.minOrderAmount) : '—',
    },
    {
      key: 'usage',
      label: 'Sử dụng',
      render: (row: Voucher) =>
        `${row.usedCount}${row.usageLimit ? ` / ${row.usageLimit}` : ' (∞)'}`,
    },
    {
      key: 'period',
      label: 'Thời hạn',
      render: (row: Voucher) => (
        <span className="voucher-period">
          {dateFormatter.format(new Date(row.startDate))} — {dateFormatter.format(new Date(row.endDate))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: Voucher) => {
        const status = getVoucherStatus(row);
        return <StatusBadge variant={status.variant}>{status.label}</StatusBadge>;
      },
    },
    {
      key: 'actions',
      label: '',
      render: (row: Voucher) => (
        <div className="voucher-actions">
          <button
            className="voucher-actions__btn"
            onClick={() => handleEdit(row)}
            title="Sửa"
          >
            <Pencil size={15} />
          </button>
          {row.isActive && (
            <button
              className="voucher-actions__btn voucher-actions__btn--danger"
              onClick={() => handleDelete(row)}
              title="Vô hiệu hóa"
            >
              <Ban size={15} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="vouchers-page">
      <header className="vouchers-page__header">
        <div className="vouchers-page__title-group">
          <h1>Quản lý Voucher</h1>
          <p>Tạo và quản lý mã giảm giá cho đơn hàng.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Thêm voucher
        </Button>
      </header>

      <div className="vouchers-page__toolbar">
        <div className="vouchers-page__search">
          <Input
            placeholder="Tìm theo mã hoặc mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="ghost" onClick={loadVouchers} title="Làm mới">
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </Button>
      </div>

      <div className="vouchers-page__table-wrapper">
        <DataTable
          columns={columns}
          data={filteredVouchers}
          loading={loading}
          emptyText="Chưa có voucher nào"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        title={editingVoucher ? 'Chỉnh sửa Voucher' : 'Thêm Voucher mới'}
        size="md"
      >
        <VoucherForm
          voucher={editingVoucher}
          onSuccess={handleSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
