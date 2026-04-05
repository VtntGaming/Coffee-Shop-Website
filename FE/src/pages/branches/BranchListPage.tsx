/**
 * ============================================
 * BRANCH LIST PAGE — Trang quản lý chi nhánh & bàn
 *
 * Chức năng:
 *   - Hiển thị danh sách chi nhánh dạng card/grid
 *   - Thêm, sửa, xóa chi nhánh (modal form)
 *   - Lưu chi nhánh hiện tại đang quản lý bàn
 *   - Hiển thị danh sách bàn theo chi nhánh
 *   - Cập nhật trạng thái bàn nhanh
 * ============================================
 */
import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { convertTo12hFormat, convertTo24hFormat, formatTimeDisplay } from '../../utils/timeUtils';
import * as branchService from '../../services/branchService';
import * as tableService from '../../services/tableService';
import type { Branch, BranchPayload } from '../../types/branch';
import type { Table, TableStatus } from '../../types/table';
import './BranchListPage.css';

type ViewMode = 'branches' | 'tables';

/**
 * BranchListPage — Component trang chính
 */
export function BranchListPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('branches');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal form chi nhánh
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Modal form bàn
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableFormLoading, setTableFormLoading] = useState(false);

  /**
   * Tải danh sách chi nhánh
   */
  useEffect(() => {
    loadBranches();
  }, []);

  /**
   * Tải danh sách bàn khi chuyển sang view bàn hoặc chọn chi nhánh
   */
  useEffect(() => {
    if (viewMode === 'tables' && selectedBranch) {
      loadTables(selectedBranch._id);
    }
  }, [viewMode, selectedBranch]);

  /**
   * Lấy danh sách chi nhánh
   */
  async function loadBranches() {
    setLoading(true);
    setError(null);

    try {
      const response = await branchService.getAllBranches();
      if (response.success && response.data) {
        setBranches(response.data);
        // Mặc định chọn chi nhánh đầu tiên
        if (response.data.length > 0 && !selectedBranch) {
          setSelectedBranch(response.data[0]);
        }
      } else {
        setError(response.message || 'Không thể tải chi nhánh');
      }
    } catch (err) {
      setError('Có lỗi khi tải chi nhánh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Lấy danh sách bàn theo chi nhánh
   */
  async function loadTables(branchId: string) {
    setLoading(true);
    setError(null);

    try {
      const response = await tableService.getAllTables(branchId);
      if (response.success && response.data) {
        setTables(response.data);
      } else {
        setError(response.message || 'Không thể tải danh sách bàn');
      }
    } catch (err) {
      setError('Có lỗi khi tải danh sách bàn');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Xử lý thêm/sửa chi nhánh
   */
  async function handleBranchSubmit(payload: BranchPayload) {
    setFormLoading(true);

    try {
      let response;
      if (editingBranch) {
        response = await branchService.updateBranch(editingBranch._id, payload);
      } else {
        response = await branchService.createBranch(payload);
      }

      if (response.success) {
        await loadBranches();
        setShowBranchForm(false);
        setEditingBranch(null);
      } else {
        setError(response.message || 'Lỗi khi lưu chi nhánh');
      }
    } catch (err: any) {
      // Hiển thị error message từ backend nếu có
      const errorMsg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra';
      setError(errorMsg);
      console.error('Branch submit error:', err);
    } finally {
      setFormLoading(false);
    }
  }

  /**
   * Xử lý xóa chi nhánh
   */
  async function handleDeleteBranch(id: string) {
    if (!window.confirm('Bạn chắc chắn muốn xóa chi nhánh này?')) return;

    setLoading(true);

    try {
      const response = await branchService.deleteBranch(id);
      if (response.success) {
        await loadBranches();
      } else {
        setError(response.message || 'Không thể xóa chi nhánh');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Xử lý thêm/sửa bàn
   */
  async function handleTableSubmit(payload: any) {
    if (!selectedBranch) {
      setError('Vui lòng chọn chi nhánh');
      return;
    }

    setTableFormLoading(true);

    try {
      let response;
      if (editingTable) {
        response = await tableService.updateTable(editingTable._id, payload);
      } else {
        response = await tableService.createTable(selectedBranch._id, payload);
      }

      if (response.success) {
        await loadTables(selectedBranch._id);
        setShowTableForm(false);
        setEditingTable(null);
      } else {
        setError(response.message || 'Lỗi khi lưu bàn');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setTableFormLoading(false);
    }
  }

  /**
   * Xử lý cập nhật trạng thái bàn
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleTableStatusChange(tableId: string, status: TableStatus) {
    try {
      const response = await tableService.updateTableStatus(tableId, status);
      if (response.success && selectedBranch) {
        await loadTables(selectedBranch._id);
      } else {
        setError(response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    }
  }

  /**
   * Xử lý xóa bàn
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleDeleteTable(id: string) {
    if (!window.confirm('Bạn chắc chắn muốn xóa bàn này?')) return;

    try {
      const response = await tableService.deleteTable(id);
      if (response.success && selectedBranch) {
        await loadTables(selectedBranch._id);
      } else {
        setError(response.message || 'Không thể xóa bàn');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    }
  }

  return (
    <div className="branch-list-page">
      {/* Header */}
      <div className="branch-list-page__header">
        <h1 className="branch-list-page__title">Chi nhánh & Bàn</h1>

        {/* Tabs — chuyển giữa view chi nhánh và bàn */}
        <div className="branch-list-page__tabs">
          <button
            className={`branch-list-page__tab ${viewMode === 'branches' ? 'active' : ''}`}
            onClick={() => setViewMode('branches')}
          >
            Chi nhánh
          </button>
          <button
            className={`branch-list-page__tab ${viewMode === 'tables' ? 'active' : ''}`}
            onClick={() => setViewMode('tables')}
          >
            Bàn
          </button>
        </div>
      </div>

      {/* Hiển thị lỗi */}
      {error && (
        <div className="branch-list-page__error">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* VIEW BRANCHES */}
      {viewMode === 'branches' && (
        <div className="branch-list-page__section">
          <div className="branch-list-page__actions">
            <Button
              variant="primary"
              onClick={() => {
                setEditingBranch(null);
                setShowBranchForm(true);
              }}
            >
              <Plus size={18} /> Thêm chi nhánh
            </Button>
          </div>

          {/* Danh sách chi nhánh dạng grid */}
          {loading ? (
            <div className="branch-list-page__loading">Đang tải...</div>
          ) : branches.length === 0 ? (
            <div className="branch-list-page__empty">
              <p>Chưa có chi nhánh nào. Hãy thêm chi nhánh để bắt đầu.</p>
            </div>
          ) : (
            <div className="branch-grid">
              {branches.map((branch: Branch) => (
                <div key={branch._id} className="branch-card">
                  <div className="branch-card__header">
                    <h3 className="branch-card__name">{branch.name}</h3>
                    <div className="branch-card__status">
                      <StatusBadge variant={branch.isActive ? 'success' : 'danger'}>
                        {branch.isActive ? 'Hoạt động' : 'Dừng hoạt động'}
                      </StatusBadge>
                    </div>
                  </div>

                  <div className="branch-card__content">
                    <p className="branch-card__info">
                      <strong>Địa chỉ:</strong> {branch.address}
                    </p>
                    {branch.phone && (
                      <p className="branch-card__info">
                        <strong>Điện thoại:</strong> {branch.phone}
                      </p>
                    )}
                    {branch.openTime && branch.closeTime && (
                      <p className="branch-card__info">
                        <strong>Giờ mở cửa:</strong> {formatTimeDisplay(branch.openTime)} - {formatTimeDisplay(branch.closeTime)}
                      </p>
                    )}
                  </div>

                  <div className="branch-card__actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingBranch(branch);
                        setShowBranchForm(true);
                      }}
                    >
                      <Edit size={16} /> Sửa
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteBranch(branch._id)}
                    >
                      <Trash2 size={16} /> Xóa
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW TABLES */}
      {viewMode === 'tables' && (
        <div className="branch-list-page__section">
          {/* Chọn chi nhánh */}
          <div className="branch-list-page__table-header">
            <div className="branch-list-page__table-filter">
              <label>Chi nhánh:</label>
              <select
                className="branch-list-page__select"
                value={selectedBranch?._id || ''}
                onChange={(e) => {
                  const branch = branches.find((b) => b._id === e.target.value);
                  setSelectedBranch(branch || null);
                }}
              >
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="primary"
              onClick={() => {
                setEditingTable(null);
                setShowTableForm(true);
              }}
              disabled={!selectedBranch}
            >
              <Plus size={18} /> Thêm bàn
            </Button>
          </div>

          {/* Danh sách bàn */}
          {loading ? (
            <div className="branch-list-page__loading">Đang tải...</div>
          ) : !selectedBranch ? (
            <div className="branch-list-page__empty">
              <p>Vui lòng chọn chi nhánh để xem danh sách bàn</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="branch-list-page__empty">
              <p>Chi nhánh này chưa có bàn nào</p>
            </div>
          ) : (
            <DataTable<Table>
              columns={[
                {
                  key: 'tableNumber',
                  label: 'Bàn số',
                },
                {
                  key: 'capacity',
                  label: 'Sức chứa',
                  render: (row) => `${row.capacity} người`,
                },
                {
                  key: 'status',
                  label: 'Trạng thái',
                  render: (row) => (
                    <select
                      className="table-status-select"
                      value={row.status}
                      onChange={(e) => handleTableStatusChange(row._id, e.target.value as TableStatus)}
                    >
                      <option value="available">Trống</option>
                      <option value="occupied">Có khách</option>
                      <option value="reserved">Đặt trước</option>
                      <option value="maintenance">Bảo trì</option>
                    </select>
                  ),
                },
                {
                  key: 'isActive',
                  label: 'Trạng thái hoạt động',
                  render: (row) => (
                    <StatusBadge variant={row.isActive ? 'success' : 'danger'}>
                      {row.isActive ? 'Hoạt động' : 'Dừng'}
                    </StatusBadge>
                  ),
                },
                {
                  key: 'actions',
                  label: 'Hành động',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setEditingTable(row);
                          setShowTableForm(true);
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteTable(row._id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={tables}
              loading={loading}
              emptyText="Không có bàn nào"
            />
          )}
        </div>
      )}

      {/* MODAL THÊM/SỬA CHI NHÁNH */}
      <BranchFormModal
        isOpen={showBranchForm}
        onClose={() => {
          setShowBranchForm(false);
          setEditingBranch(null);
        }}
        initialData={editingBranch}
        onSubmit={handleBranchSubmit}
        loading={formLoading}
      />

      {/* MODAL THÊM/SỬA BÀN */}
      <TableFormModal
        isOpen={showTableForm}
        onClose={() => {
          setShowTableForm(false);
          setEditingTable(null);
        }}
        initialData={editingTable}
        onSubmit={handleTableSubmit}
        loading={tableFormLoading}
      />
    </div>
  );
}

/**
 * ============================================
 * BRANCH FORM MODAL — Form thêm/sửa chi nhánh
 * ============================================
 */
interface BranchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Branch | null;
  onSubmit: (payload: BranchPayload) => Promise<void>;
  loading: boolean;
}

function BranchFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  loading,
}: BranchFormModalProps) {
  const [formData, setFormData] = useState<BranchPayload>({
    name: '',
    address: '',
    phone: '',
    openTime: '',
    closeTime: '',
    isActive: true,
  });

  // State riêng cho display (12h format + AM/PM)
  const [openTimeDisplay, setOpenTimeDisplay] = useState('7');
  const [openTimePeriod, setOpenTimePeriod] = useState<'SA' | 'CH'>('SA');
  const [closeTimeDisplay, setCloseTimeDisplay] = useState('10');
  const [closeTimePeriod, setCloseTimePeriod] = useState<'SA' | 'CH'>('CH');

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      const openDisplay = convertTo12hFormat(initialData.openTime || '');
      const closeDisplay = convertTo12hFormat(initialData.closeTime || '');
      
      // Parse display time
      const [openH] = openDisplay.split(':');
      const openPeriod = openDisplay.includes('CH') ? 'CH' : 'SA';
      const [closeH] = closeDisplay.split(':');
      const closePeriod = closeDisplay.includes('CH') ? 'CH' : 'SA';
      
      setOpenTimeDisplay(openH || '07');
      setOpenTimePeriod(openPeriod as 'SA' | 'CH');
      setCloseTimeDisplay(closeH || '22');
      setCloseTimePeriod(closePeriod as 'SA' | 'CH');
      
      setFormData({
        name: initialData.name,
        address: initialData.address,
        phone: initialData.phone || '',
        openTime: initialData.openTime || '',
        closeTime: initialData.closeTime || '',
        isActive: initialData.isActive,
      });
    } else {
      setOpenTimeDisplay('07');
      setOpenTimePeriod('SA');
      setCloseTimeDisplay('22');
      setCloseTimePeriod('CH');
      
      setFormData({
        name: '',
        address: '',
        phone: '',
        openTime: '',
        closeTime: '',
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Convert 12h → 24h format
    const openTime24 = convertTo24hFormat(`${openTimeDisplay}:00 ${openTimePeriod}`);
    const closeTime24 = convertTo24hFormat(`${closeTimeDisplay}:00 ${closeTimePeriod}`);
    
    const payload: any = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      openTime: openTime24,
      closeTime: closeTime24,
    };

    // Only add optional fields if they have values
    if (formData.phone?.trim()) {
      payload.phone = formData.phone.trim();
    }

    console.log('BranchFormModal submitting:', payload);
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
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {initialData ? 'Cập nhật' : 'Thêm'}
          </Button>
        </div>
      }
    >
      <form className="branch-form">
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Tên chi nhánh <span className="required">*</span>
          </label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="VD: Chi nhánh trung tâm"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address" className="form-label">
            Địa chỉ <span className="required">*</span>
          </label>
          <input
            id="address"
            type="text"
            className="form-input"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            placeholder="VD: 123 Nguyễn Văn A, Quận 1, TP.HCM"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Điện thoại
          </label>
          <input
            id="phone"
            type="tel"
            className="form-input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="VD: 0909123456"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="openTime" className="form-label">
              Giờ mở cửa
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <input
                id="openTime"
                type="number"
                className="form-input"
                style={{ flex: 1 }}
                min="1"
                max="12"
                value={openTimeDisplay}
                onChange={(e) => setOpenTimeDisplay(e.target.value)}
                placeholder="VD: 7"
              />
              <select
                className="form-input"
                style={{ flex: 0.6 }}
                value={openTimePeriod}
                onChange={(e) => setOpenTimePeriod(e.target.value as 'SA' | 'CH')}
              >
                <option value="SA">Sáng</option>
                <option value="CH">Chiều</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="closeTime" className="form-label">
              Giờ đóng cửa
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <input
                id="closeTime"
                type="number"
                className="form-input"
                style={{ flex: 1 }}
                min="1"
                max="12"
                value={closeTimeDisplay}
                onChange={(e) => setCloseTimeDisplay(e.target.value)}
                placeholder="VD: 10"
              />
              <select
                className="form-input"
                style={{ flex: 0.6 }}
                value={closeTimePeriod}
                onChange={(e) => setCloseTimePeriod(e.target.value as 'SA' | 'CH')}
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
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span>Kích hoạt chi nhánh</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}

/**
 * ============================================
 * TABLE FORM MODAL — Form thêm/sửa bàn
 * ============================================
 */
interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Table | null;
  onSubmit: (payload: any) => Promise<void>;
  loading: boolean;
}

function TableFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  loading,
}: TableFormModalProps) {
  const [formData, setFormData] = useState({
    tableNumber: 0,
    capacity: 2,
    status: 'available' as TableStatus,
    isActive: true,
    notes: '',
  });

  // Cập nhật form khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setFormData({
        tableNumber: initialData.tableNumber,
        capacity: initialData.capacity,
        status: initialData.status,
        isActive: initialData.isActive,
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
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
    await onSubmit(formData);
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Sửa bàn' : 'Thêm bàn'}
      size="md"
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {initialData ? 'Cập nhật' : 'Thêm'}
          </Button>
        </div>
      }
    >
      <form className="table-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tableNumber" className="form-label">
              Bàn số <span className="required">*</span>
            </label>
            <input
              id="tableNumber"
              type="number"
              className="form-input"
              value={formData.tableNumber}
              onChange={(e) =>
                setFormData({ ...formData, tableNumber: parseInt(e.target.value) })
              }
              required
              min="1"
              placeholder="VD: 1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity" className="form-label">
              Sức chứa <span className="required">*</span>
            </label>
            <input
              id="capacity"
              type="number"
              className="form-input"
              value={formData.capacity}
              onChange={(e) =>
                setFormData({ ...formData, capacity: parseInt(e.target.value) })
              }
              required
              min="1"
              placeholder="VD: 2"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status" className="form-label">
              Trạng thái <span className="required">*</span>
            </label>
            <select
              id="status"
              className="form-input"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as TableStatus })
              }
            >
              <option value="available">Trống</option>
              <option value="occupied">Có khách</option>
              <option value="reserved">Đặt trước</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Ghi chú
          </label>
          <textarea
            id="notes"
            className="form-input"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="VD: Bàn gần cửa sổ"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span>Kích hoạt bàn</span>
          </label>
        </div>
      </form>
    </Modal>
  );
}
