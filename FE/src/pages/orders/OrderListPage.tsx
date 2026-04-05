/**
 * ============================================
 * ORDER LIST PAGE — Trang danh sách đơn hàng
 *
 * Chức năng:
 *   - Hiển thị danh sách đơn hàng với phân trang
 *   - Filter theo trạng thái, chi nhánh, loại đơn, ngày
 *   - Xem chi tiết đơn (modal)
 *   - Cập nhật trạng thái đơn nhanh
 *   - Link tạo đơn mới
 * ============================================
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
} from 'lucide-react';
import { Button, DataTable, Modal } from '../../components/common';
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  ORDER_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
} from '../../components/features/orders/OrderStatusBadge';
import * as orderService from '../../services/orderService';
import * as branchService from '../../services/branchService';
import type { Order, OrderStatus, OrderFilter, PaymentStatus } from '../../types/order';
import type { Branch } from '../../types/branch';
import './OrderListPage.css';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

const ORDER_TYPE_LABELS: Record<string, string> = {
  'dine-in': 'Tại bàn',
  'takeaway': 'Mang đi',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ',
  transfer: 'Chuyển khoản',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
};

const ORDER_STATUS_OPTIONS = Object.keys(ORDER_STATUS_CONFIG) as OrderStatus[];
const PAYMENT_STATUS_OPTIONS = Object.keys(PAYMENT_STATUS_CONFIG) as PaymentStatus[];

export function OrderListPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Detail modal
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // Inline editing
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusDrafts, setStatusDrafts] = useState<Record<string, OrderStatus>>({});
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, PaymentStatus>>({});

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [page, filterStatus, filterPaymentStatus, filterBranch, filterType, filterDate]);

  async function loadBranches() {
    try {
      const res = await branchService.getAllBranches();
      if (res.success && res.data) {
        setBranches(res.data);
      }
    } catch {
      // ignore
    }
  }

  async function loadOrders() {
    setLoading(true);
    try {
      const filter: OrderFilter = { page, limit: 15 };
      if (filterStatus) filter.status = filterStatus as OrderStatus;
      if (filterPaymentStatus) filter.paymentStatus = filterPaymentStatus as PaymentStatus;
      if (filterBranch) filter.branch = filterBranch;
      if (filterType) filter.orderType = filterType as 'dine-in' | 'takeaway';
      if (filterDate) filter.date = filterDate;

      const res = await orderService.getAllOrders(filter);
      if (res.success) {
        setOrders(res.data);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleViewDetail(orderId: string) {
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const res = await orderService.getOrderById(orderId);
      if (res.success) {
        setDetailOrder(res.data);
      }
    } catch {
      // ignore
    } finally {
      setDetailLoading(false);
    }
  }

  function getSelectedStatus(order: Order): OrderStatus {
    return statusDrafts[order._id] ?? order.status;
  }

  function getSelectedPaymentStatus(order: Order): PaymentStatus {
    return paymentDrafts[order._id] ?? order.paymentStatus;
  }

  function hasPendingChanges(order: Order) {
    return getSelectedStatus(order) !== order.status || getSelectedPaymentStatus(order) !== order.paymentStatus;
  }

  function clearDrafts(orderId: string) {
    setStatusDrafts((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    setPaymentDrafts((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
  }

  async function refreshDetailOrder(orderId: string) {
    if (detailOrder?._id !== orderId) return;

    const res = await orderService.getOrderById(orderId);
    if (res.success) {
      setDetailOrder(res.data);
    }
  }

  async function handleApplyChanges(order: Order) {
    const nextStatus = getSelectedStatus(order);
    const nextPaymentStatus = getSelectedPaymentStatus(order);

    if (!hasPendingChanges(order)) return;

    setUpdatingId(order._id);
    try {
      let latestOrder = order;

      if (nextStatus !== order.status) {
        const statusRes = await orderService.updateOrderStatus(order._id, nextStatus);
        if (statusRes.success) {
          latestOrder = statusRes.data;
        }
      }

      if (nextPaymentStatus !== latestOrder.paymentStatus) {
        const paymentRes = await orderService.updatePayment(
          order._id,
          latestOrder.paymentMethod,
          nextPaymentStatus,
        );
        if (paymentRes.success) {
          latestOrder = paymentRes.data;
        }
      }

      clearDrafts(order._id);
      await loadOrders();
      await refreshDetailOrder(order._id);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi cập nhật đơn hàng');
    } finally {
      setUpdatingId(null);
    }
  }

  function getBranchName(order: Order): string {
    if (typeof order.branch === 'object' && order.branch) return order.branch.name;
    return '';
  }

  function getTableNumber(order: Order): string {
    if (!order.table) return 'Mang đi';
    if (typeof order.table === 'object') return `Bàn ${order.table.tableNumber}`;
    return '';
  }

  function getCreatedBy(order: Order): string {
    if (typeof order.createdBy === 'object' && order.createdBy) return order.createdBy.fullName;
    return '';
  }

  const columns = [
    {
      key: 'orderNumber',
      label: 'Mã đơn',
      render: (row: Order) => <strong>{row.orderNumber}</strong>,
    },
    {
      key: 'branch',
      label: 'Chi nhánh',
      render: (row: Order) => getBranchName(row),
    },
    {
      key: 'table',
      label: 'Bàn',
      render: (row: Order) => getTableNumber(row),
    },
    {
      key: 'orderType',
      label: 'Loại',
      render: (row: Order) => ORDER_TYPE_LABELS[row.orderType] || row.orderType,
    },
    {
      key: 'totalAmount',
      label: 'Tổng tiền',
      render: (row: Order) => (
        <strong style={{ color: 'var(--color-primary, #8b5e3c)' }}>
          {currencyFormatter.format(row.totalAmount)}
        </strong>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái đơn',
      render: (row: Order) => (
        <div className="order-inline-editor">
          <OrderStatusBadge status={row.status} />
          <select
            className="order-inline-editor__select"
            value={getSelectedStatus(row)}
            onChange={(e) => setStatusDrafts((prev) => ({
              ...prev,
              [row._id]: e.target.value as OrderStatus,
            }))}
            disabled={updatingId === row._id}
          >
            {ORDER_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Thanh toán',
      render: (row: Order) => (
        <div className="order-inline-editor">
          <PaymentStatusBadge status={row.paymentStatus} />
          <select
            className="order-inline-editor__select"
            value={getSelectedPaymentStatus(row)}
            onChange={(e) => setPaymentDrafts((prev) => ({
              ...prev,
              [row._id]: e.target.value as PaymentStatus,
            }))}
            disabled={updatingId === row._id}
          >
            {PAYMENT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {PAYMENT_STATUS_CONFIG[status].label}
              </option>
            ))}
          </select>
          <span className="order-inline-editor__hint">
            {PAYMENT_METHOD_LABELS[row.paymentMethod] || row.paymentMethod}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Ngày tạo',
      render: (row: Order) => row.createdAt ? dateTimeFormatter.format(new Date(row.createdAt)) : '',
    },
    {
      key: 'actions',
      label: 'Tác vụ',
      render: (row: Order) => (
        <div className="order-actions">
          <button
            className="order-actions__btn"
            onClick={() => handleViewDetail(row._id)}
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <Button
            size="sm"
            variant={hasPendingChanges(row) ? 'primary' : 'ghost'}
            disabled={updatingId === row._id || !hasPendingChanges(row)}
            loading={updatingId === row._id}
            onClick={() => handleApplyChanges(row)}
          >
            <Save size={14} style={{ marginRight: '6px' }} />
            Lưu
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="orders-page">
      <header className="orders-page__header">
        <div className="orders-page__title-group">
          <h1>Quản lý Đơn hàng</h1>
          <p>Tổng cộng {total} đơn hàng</p>
        </div>
        <Button onClick={() => navigate('/admin/orders/create')}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Tạo đơn mới
        </Button>
      </header>

      {/* Filters */}
      <div className="orders-page__filters">
        <select
          className="orders-page__select"
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        <select
          className="orders-page__select"
          value={filterPaymentStatus}
          onChange={(e) => { setFilterPaymentStatus(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả thanh toán</option>
          {PAYMENT_STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>{PAYMENT_STATUS_CONFIG[status].label}</option>
          ))}
        </select>

        <select
          className="orders-page__select"
          value={filterBranch}
          onChange={(e) => { setFilterBranch(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả chi nhánh</option>
          {branches.map((b) => (
            <option key={b._id} value={b._id}>{b.name}</option>
          ))}
        </select>

        <select
          className="orders-page__select"
          value={filterType}
          onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả loại đơn</option>
          <option value="dine-in">Tại bàn</option>
          <option value="takeaway">Mang đi</option>
        </select>

        <input
          type="date"
          className="orders-page__select"
          value={filterDate}
          onChange={(e) => { setFilterDate(e.target.value); setPage(1); }}
        />

        <Button variant="ghost" onClick={() => { setPage(1); loadOrders(); }} title="Làm mới">
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
        </Button>
      </div>

      {/* Table */}
      <div className="orders-page__table-wrapper">
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          emptyText="Không có đơn hàng nào"
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="orders-page__pagination">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft size={16} /> Trước
          </Button>
          <span className="orders-page__page-info">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Sau <ChevronRight size={16} />
          </Button>
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => { setShowDetail(false); setDetailOrder(null); }}
        title={`Chi tiết đơn ${detailOrder?.orderNumber || ''}`}
        size="lg"
      >
        {detailLoading ? (
          <div className="order-detail__loading">Đang tải...</div>
        ) : detailOrder ? (
          <div className="order-detail">
            <div className="order-detail__grid">
              <div className="order-detail__info">
                <h4>Thông tin đơn hàng</h4>
                <table className="order-detail__table">
                  <tbody>
                    <tr><td>Mã đơn</td><td><strong>{detailOrder.orderNumber}</strong></td></tr>
                    <tr><td>Chi nhánh</td><td>{getBranchName(detailOrder)}</td></tr>
                    <tr><td>Bàn</td><td>{getTableNumber(detailOrder)}</td></tr>
                    <tr><td>Loại</td><td>{ORDER_TYPE_LABELS[detailOrder.orderType]}</td></tr>
                    <tr><td>Trạng thái</td><td><OrderStatusBadge status={detailOrder.status} /></td></tr>
                    <tr><td>Thanh toán</td><td><PaymentStatusBadge status={detailOrder.paymentStatus} /></td></tr>
                    <tr><td>Phương thức TT</td><td>{PAYMENT_METHOD_LABELS[detailOrder.paymentMethod] || detailOrder.paymentMethod}</td></tr>
                    <tr><td>Nhân viên</td><td>{getCreatedBy(detailOrder)}</td></tr>
                    {detailOrder.customerName && <tr><td>Khách hàng</td><td>{detailOrder.customerName}</td></tr>}
                    {detailOrder.customerPhone && <tr><td>SĐT</td><td>{detailOrder.customerPhone}</td></tr>}
                    {detailOrder.note && <tr><td>Ghi chú</td><td>{detailOrder.note}</td></tr>}
                    <tr><td>Ngày tạo</td><td>{detailOrder.createdAt ? dateTimeFormatter.format(new Date(detailOrder.createdAt)) : ''}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="order-detail__items">
                <h4>Chi tiết món ({detailOrder.items?.length || 0} món)</h4>
                <table className="order-detail__items-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Size</th>
                      <th>SL</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items?.map((item) => (
                      <tr key={item._id}>
                        <td>{item.productName}</td>
                        <td>{item.size}</td>
                        <td>{item.quantity}</td>
                        <td>{currencyFormatter.format(item.unitPrice)}</td>
                        <td>{currencyFormatter.format(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="order-detail__summary">
                  <div className="order-detail__summary-row">
                    <span>Tạm tính</span>
                    <span>{currencyFormatter.format(detailOrder.subtotal)}</span>
                  </div>
                  {detailOrder.discountAmount > 0 && (
                    <div className="order-detail__summary-row order-detail__summary-row--discount">
                      <span>Giảm giá {typeof detailOrder.voucher === 'object' && detailOrder.voucher ? `(${detailOrder.voucher.code})` : ''}</span>
                      <span>-{currencyFormatter.format(detailOrder.discountAmount)}</span>
                    </div>
                  )}
                  <div className="order-detail__summary-row order-detail__summary-row--total">
                    <span>Tổng cộng</span>
                    <span>{currencyFormatter.format(detailOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-detail__actions order-detail__actions--editor">
              <div className="order-detail__action-group">
                <span>Trạng thái đơn</span>
                <select
                  className="order-inline-editor__select"
                  value={getSelectedStatus(detailOrder)}
                  onChange={(e) => setStatusDrafts((prev) => ({
                    ...prev,
                    [detailOrder._id]: e.target.value as OrderStatus,
                  }))}
                  disabled={updatingId === detailOrder._id}
                >
                  {ORDER_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {ORDER_STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="order-detail__action-group">
                <span>Trạng thái thanh toán</span>
                <select
                  className="order-inline-editor__select"
                  value={getSelectedPaymentStatus(detailOrder)}
                  onChange={(e) => setPaymentDrafts((prev) => ({
                    ...prev,
                    [detailOrder._id]: e.target.value as PaymentStatus,
                  }))}
                  disabled={updatingId === detailOrder._id}
                >
                  {PAYMENT_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {PAYMENT_STATUS_CONFIG[status].label}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                size="sm"
                onClick={() => handleApplyChanges(detailOrder)}
                loading={updatingId === detailOrder._id}
                disabled={!hasPendingChanges(detailOrder)}
              >
                <Save size={14} style={{ marginRight: '6px' }} />
                Lưu cập nhật
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
