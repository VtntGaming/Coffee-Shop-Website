import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Building2,
  CircleGauge,
  PackagePlus,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  Warehouse,
} from 'lucide-react';
import { Button, DataTable, Input, Modal, StatusBadge } from '../../components/common';
import { fetchInventoryModuleData } from '../../services/inventoryService';
import type {
  BranchOption,
  Ingredient,
  InventoryItem,
  Supplier,
} from '../../types/inventory';
import './InventoryManagementPage.css';

type InventoryTab = 'ingredient' | 'supplier' | 'inventory';

type InventoryHealth = 'healthy' | 'warning' | 'critical';

interface IngredientForm {
  name: string;
  category: string;
  unit: string;
  minStock: string;
  supplierId: string;
  costPerUnit: string;
  status: Ingredient['status'];
}

interface SupplierForm {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: string;
  branchIds: string[];
  status: Supplier['status'];
}

interface InventoryForm {
  branchId: string;
  ingredientId: string;
  inStock: string;
  reserved: string;
  incoming: string;
  lastRestockedAt: string;
}

const tabItems: Array<{ key: InventoryTab; label: string }> = [
  { key: 'ingredient', label: 'Nguyên liệu' },
  { key: 'supplier', label: 'Nhà cung cấp' },
  { key: 'inventory', label: 'Tồn kho theo chi nhánh' },
];

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

const initialIngredientForm: IngredientForm = {
  name: '',
  category: '',
  unit: '',
  minStock: '0',
  supplierId: '',
  costPerUnit: '0',
  status: 'active',
};

const initialSupplierForm: SupplierForm = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  leadTimeDays: '1',
  branchIds: [],
  status: 'active',
};

const initialInventoryForm: InventoryForm = {
  branchId: '',
  ingredientId: '',
  inStock: '0',
  reserved: '0',
  incoming: '0',
  lastRestockedAt: '',
};

function getAvailableStock(item: InventoryItem): number {
  return Math.max(item.inStock - item.reserved, 0);
}

function getInventoryHealth(item: InventoryItem, minStockMap: Map<string, number>): InventoryHealth {
  const availableStock = getAvailableStock(item);
  const minStock = minStockMap.get(item.ingredientId) ?? 0;

  if (availableStock <= 0) {
    return 'critical';
  }

  if (availableStock <= minStock) {
    return 'warning';
  }

  return 'healthy';
}

function formatDateTime(value: string): string {
  if (!value) {
    return '-';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return dateTimeFormatter.format(parsedDate);
}

function toDatetimeLocalInputValue(isoValue: string): string {
  const parsedDate = new Date(isoValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  const timezoneOffset = parsedDate.getTimezoneOffset() * 60000;
  return new Date(parsedDate.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function fromDatetimeLocalInputValue(localValue: string): string {
  if (!localValue) {
    return new Date().toISOString();
  }

  return new Date(localValue).toISOString();
}

export function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState<InventoryTab>('inventory');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);

  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);

  const [ingredientForm, setIngredientForm] = useState<IngredientForm>(initialIngredientForm);
  const [supplierForm, setSupplierForm] = useState<SupplierForm>(initialSupplierForm);
  const [inventoryForm, setInventoryForm] = useState<InventoryForm>(initialInventoryForm);

  const [ingredientFormError, setIngredientFormError] = useState<string | null>(null);
  const [supplierFormError, setSupplierFormError] = useState<string | null>(null);
  const [inventoryFormError, setInventoryFormError] = useState<string | null>(null);

  useEffect(() => {
    void loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchInventoryModuleData();
      setBranches(data.branches);
      setIngredients(data.ingredients);
      setSuppliers(data.suppliers);
      setInventory(data.inventory);
    } catch {
      setError('Không thể tải dữ liệu kho. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  const branchMap = useMemo(
    () => new Map(branches.map((item) => [item.id, item.name])),
    [branches],
  );

  const supplierMap = useMemo(
    () => new Map(suppliers.map((item) => [item.id, item.name])),
    [suppliers],
  );

  const ingredientMap = useMemo(
    () => new Map(ingredients.map((item) => [item.id, item.name])),
    [ingredients],
  );

  const ingredientMinStockMap = useMemo(
    () => new Map(ingredients.map((item) => [item.id, item.minStock])),
    [ingredients],
  );

  const keyword = searchKeyword.trim().toLowerCase();

  const filteredIngredients = useMemo(() => {
    let nextRows = ingredients;

    if (selectedBranch !== 'all') {
      const supplierIdsInBranch = new Set(
        suppliers
          .filter((item) => item.branchIds.includes(selectedBranch))
          .map((item) => item.id),
      );

      nextRows = nextRows.filter((item) => supplierIdsInBranch.has(item.supplierId));
    }

    if (keyword) {
      nextRows = nextRows.filter((item) => {
        const supplierName = supplierMap.get(item.supplierId) ?? '';

        return (
          item.name.toLowerCase().includes(keyword)
          || item.category.toLowerCase().includes(keyword)
          || item.unit.toLowerCase().includes(keyword)
          || supplierName.toLowerCase().includes(keyword)
        );
      });
    }

    return nextRows;
  }, [ingredients, keyword, selectedBranch, supplierMap, suppliers]);

  const filteredSuppliers = useMemo(() => {
    let nextRows = suppliers;

    if (selectedBranch !== 'all') {
      nextRows = nextRows.filter((item) => item.branchIds.includes(selectedBranch));
    }

    if (keyword) {
      nextRows = nextRows.filter((item) => {
        const branchNames = item.branchIds
          .map((branchId) => branchMap.get(branchId) ?? '')
          .join(' ')
          .toLowerCase();

        return (
          item.name.toLowerCase().includes(keyword)
          || item.contactName.toLowerCase().includes(keyword)
          || item.phone.toLowerCase().includes(keyword)
          || item.email.toLowerCase().includes(keyword)
          || branchNames.includes(keyword)
        );
      });
    }

    return nextRows;
  }, [branchMap, keyword, selectedBranch, suppliers]);

  const filteredInventory = useMemo(() => {
    let nextRows = inventory;

    if (selectedBranch !== 'all') {
      nextRows = nextRows.filter((item) => item.branchId === selectedBranch);
    }

    if (keyword) {
      nextRows = nextRows.filter((item) => {
        const ingredientName = ingredientMap.get(item.ingredientId) ?? '';
        const branchName = branchMap.get(item.branchId) ?? '';

        return (
          ingredientName.toLowerCase().includes(keyword)
          || branchName.toLowerCase().includes(keyword)
        );
      });
    }

    return nextRows;
  }, [branchMap, ingredientMap, inventory, keyword, selectedBranch]);

  const lowStockCount = useMemo(
    () => inventory.filter((item) => getInventoryHealth(item, ingredientMinStockMap) !== 'healthy').length,
    [ingredientMinStockMap, inventory],
  );

  const totalInventoryValue = useMemo(() => {
    const ingredientCostMap = new Map(ingredients.map((item) => [item.id, item.costPerUnit]));

    return inventory.reduce((sum, item) => {
      const unitPrice = ingredientCostMap.get(item.ingredientId) ?? 0;
      return sum + item.inStock * unitPrice;
    }, 0);
  }, [ingredients, inventory]);

  const activeSuppliersCount = useMemo(
    () => suppliers.filter((item) => item.status === 'active').length,
    [suppliers],
  );

  const inventoryRowColumns = [
    {
      key: 'ingredient',
      label: 'Nguyên liệu',
      render: (row: InventoryItem) => ingredientMap.get(row.ingredientId) ?? '-',
    },
    {
      key: 'branch',
      label: 'Chi nhánh',
      render: (row: InventoryItem) => branchMap.get(row.branchId) ?? '-',
    },
    {
      key: 'stock',
      label: 'Tồn kho',
      render: (row: InventoryItem) => `${row.inStock}`,
    },
    {
      key: 'reserved',
      label: 'Đã đặt trước',
      render: (row: InventoryItem) => `${row.reserved}`,
    },
    {
      key: 'incoming',
      label: 'Đang nhập',
      render: (row: InventoryItem) => `${row.incoming}`,
    },
    {
      key: 'updated',
      label: 'Cập nhật lần cuối',
      render: (row: InventoryItem) => formatDateTime(row.lastRestockedAt),
    },
    {
      key: 'health',
      label: 'Trạng thái',
      render: (row: InventoryItem) => {
        const health = getInventoryHealth(row, ingredientMinStockMap);

        if (health === 'critical') {
          return <StatusBadge variant="danger">Hết hàng</StatusBadge>;
        }

        if (health === 'warning') {
          return <StatusBadge variant="warning">Sắp cảnh báo</StatusBadge>;
        }

        return <StatusBadge variant="success">Ổn định</StatusBadge>;
      },
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row: InventoryItem) => (
        <div className="inventory-table-actions">
          <button
            type="button"
            className="inventory-action inventory-action--soft"
            onClick={() => handleRestock(row)}
            aria-label="Bổ sung tồn"
          >
            <PackagePlus size={14} />
          </button>
          <button
            type="button"
            className="inventory-action inventory-action--soft"
            onClick={() => openEditInventoryModal(row)}
            aria-label="Cập nhật tồn kho"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="inventory-action inventory-action--danger"
            onClick={() => handleDeleteInventory(row.id)}
            aria-label="Xóa tồn kho"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const ingredientColumns = [
    {
      key: 'name',
      label: 'Tên nguyên liệu',
      render: (row: Ingredient) => row.name,
    },
    {
      key: 'category',
      label: 'Nhóm',
      render: (row: Ingredient) => row.category,
    },
    {
      key: 'unit',
      label: 'Đơn vị',
      render: (row: Ingredient) => row.unit,
    },
    {
      key: 'minStock',
      label: 'Ngưỡng cảnh báo',
      render: (row: Ingredient) => row.minStock,
    },
    {
      key: 'supplier',
      label: 'Nhà cung cấp',
      render: (row: Ingredient) => supplierMap.get(row.supplierId) ?? '-',
    },
    {
      key: 'costPerUnit',
      label: 'Giá nhập / đơn vị',
      render: (row: Ingredient) => currencyFormatter.format(row.costPerUnit),
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: Ingredient) => (
        <StatusBadge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status === 'active' ? 'Đang sử dụng' : 'Tạm dừng'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row: Ingredient) => (
        <div className="inventory-table-actions">
          <button
            type="button"
            className="inventory-action inventory-action--soft"
            onClick={() => openEditIngredientModal(row)}
            aria-label="Sửa nguyên liệu"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="inventory-action inventory-action--danger"
            onClick={() => handleDeleteIngredient(row.id)}
            aria-label="Xóa nguyên liệu"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const supplierColumns = [
    {
      key: 'name',
      label: 'Nhà cung cấp',
      render: (row: Supplier) => row.name,
    },
    {
      key: 'contactName',
      label: 'Người liên hệ',
      render: (row: Supplier) => row.contactName,
    },
    {
      key: 'phone',
      label: 'Số điện thoại',
      render: (row: Supplier) => row.phone,
    },
    {
      key: 'email',
      label: 'Email',
      render: (row: Supplier) => row.email,
    },
    {
      key: 'branches',
      label: 'Chi nhánh phụ trách',
      render: (row: Supplier) => {
        const names = row.branchIds.map((item) => branchMap.get(item) ?? item);
        return names.length > 0 ? names.join(', ') : '-';
      },
    },
    {
      key: 'leadTimeDays',
      label: 'Thời gian giao',
      render: (row: Supplier) => `${row.leadTimeDays} ngày`,
    },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (row: Supplier) => (
        <StatusBadge variant={row.status === 'active' ? 'success' : 'default'}>
          {row.status === 'active' ? 'Đang hợp tác' : 'Tạm ngưng'}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Hành động',
      render: (row: Supplier) => (
        <div className="inventory-table-actions">
          <button
            type="button"
            className="inventory-action inventory-action--soft"
            onClick={() => openEditSupplierModal(row)}
            aria-label="Sửa nhà cung cấp"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="inventory-action inventory-action--danger"
            onClick={() => handleDeleteSupplier(row.id)}
            aria-label="Xóa nhà cung cấp"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  function resetIngredientForm() {
    setIngredientForm({
      ...initialIngredientForm,
      supplierId: suppliers[0]?.id ?? '',
    });
    setIngredientFormError(null);
  }

  function resetSupplierForm() {
    setSupplierForm({
      ...initialSupplierForm,
      branchIds: branches.length > 0 ? [branches[0].id] : [],
    });
    setSupplierFormError(null);
  }

  function resetInventoryForm() {
    setInventoryForm({
      ...initialInventoryForm,
      branchId: branches[0]?.id ?? '',
      ingredientId: ingredients[0]?.id ?? '',
      lastRestockedAt: toDatetimeLocalInputValue(new Date().toISOString()),
    });
    setInventoryFormError(null);
  }

  function openCreateIngredientModal() {
    setEditingIngredient(null);
    resetIngredientForm();
    setIngredientModalOpen(true);
  }

  function openEditIngredientModal(item: Ingredient) {
    setEditingIngredient(item);
    setIngredientForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      minStock: String(item.minStock),
      supplierId: item.supplierId,
      costPerUnit: String(item.costPerUnit),
      status: item.status,
    });
    setIngredientFormError(null);
    setIngredientModalOpen(true);
  }

  function openCreateSupplierModal() {
    setEditingSupplier(null);
    resetSupplierForm();
    setSupplierModalOpen(true);
  }

  function openEditSupplierModal(item: Supplier) {
    setEditingSupplier(item);
    setSupplierForm({
      name: item.name,
      contactName: item.contactName,
      phone: item.phone,
      email: item.email,
      leadTimeDays: String(item.leadTimeDays),
      branchIds: [...item.branchIds],
      status: item.status,
    });
    setSupplierFormError(null);
    setSupplierModalOpen(true);
  }

  function openCreateInventoryModal() {
    setEditingInventory(null);
    resetInventoryForm();
    setInventoryModalOpen(true);
  }

  function openEditInventoryModal(item: InventoryItem) {
    setEditingInventory(item);
    setInventoryForm({
      branchId: item.branchId,
      ingredientId: item.ingredientId,
      inStock: String(item.inStock),
      reserved: String(item.reserved),
      incoming: String(item.incoming),
      lastRestockedAt: toDatetimeLocalInputValue(item.lastRestockedAt),
    });
    setInventoryFormError(null);
    setInventoryModalOpen(true);
  }

  function handleDeleteIngredient(id: string) {
    const shouldDelete = globalThis.confirm('Bạn có chắc chắn muốn xóa nguyên liệu này?');
    if (!shouldDelete) {
      return;
    }

    setIngredients((prev) => prev.filter((item) => item.id !== id));
    setInventory((prev) => prev.filter((item) => item.ingredientId !== id));
  }

  function handleDeleteSupplier(id: string) {
    const shouldDelete = globalThis.confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?');
    if (!shouldDelete) {
      return;
    }

    setSuppliers((prev) => prev.filter((item) => item.id !== id));
  }

  function handleDeleteInventory(id: string) {
    const shouldDelete = globalThis.confirm('Bạn có chắc chắn muốn xóa dòng tồn kho này?');
    if (!shouldDelete) {
      return;
    }

    setInventory((prev) => prev.filter((item) => item.id !== id));
  }

  function handleRestock(item: InventoryItem) {
    setInventory((prev) => prev.map((row) => {
      if (row.id !== item.id) {
        return row;
      }

      return {
        ...row,
        inStock: row.inStock + 10,
        incoming: row.incoming > 9 ? row.incoming - 10 : 0,
        lastRestockedAt: new Date().toISOString(),
      };
    }));
  }

  function handleIngredientSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIngredientFormError(null);

    const minStock = Number(ingredientForm.minStock);
    const costPerUnit = Number(ingredientForm.costPerUnit);

    if (!ingredientForm.name.trim() || !ingredientForm.category.trim() || !ingredientForm.unit.trim()) {
      setIngredientFormError('Vui lòng điền đầy đủ thông tin nguyên liệu.');
      return;
    }

    if (!ingredientForm.supplierId) {
      setIngredientFormError('Vui lòng chọn nhà cung cấp.');
      return;
    }

    if (Number.isNaN(minStock) || minStock < 0 || Number.isNaN(costPerUnit) || costPerUnit < 0) {
      setIngredientFormError('Ngưỡng cảnh báo và giá nhập phải là số hợp lệ.');
      return;
    }

    const payload: Ingredient = {
      id: editingIngredient?.id ?? `ing-${Date.now()}`,
      name: ingredientForm.name.trim(),
      category: ingredientForm.category.trim(),
      unit: ingredientForm.unit.trim(),
      minStock,
      supplierId: ingredientForm.supplierId,
      costPerUnit,
      status: ingredientForm.status,
    };

    if (editingIngredient) {
      setIngredients((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
    } else {
      setIngredients((prev) => [payload, ...prev]);
    }

    setIngredientModalOpen(false);
  }

  function handleSupplierBranchToggle(branchId: string) {
    setSupplierForm((prev) => {
      const hasBranch = prev.branchIds.includes(branchId);

      if (hasBranch) {
        return {
          ...prev,
          branchIds: prev.branchIds.filter((item) => item !== branchId),
        };
      }

      return {
        ...prev,
        branchIds: [...prev.branchIds, branchId],
      };
    });
  }

  function handleSupplierSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSupplierFormError(null);

    const leadTimeDays = Number(supplierForm.leadTimeDays);

    if (!supplierForm.name.trim() || !supplierForm.contactName.trim()) {
      setSupplierFormError('Vui lòng nhập tên nhà cung cấp và người liên hệ.');
      return;
    }

    if (!supplierForm.phone.trim() || !supplierForm.email.trim()) {
      setSupplierFormError('Vui lòng nhập số điện thoại và email.');
      return;
    }

    if (supplierForm.branchIds.length === 0) {
      setSupplierFormError('Vui lòng chọn ít nhất 1 chi nhánh phụ trách.');
      return;
    }

    if (Number.isNaN(leadTimeDays) || leadTimeDays < 0) {
      setSupplierFormError('Thời gian giao phải là số hợp lệ.');
      return;
    }

    const payload: Supplier = {
      id: editingSupplier?.id ?? `sup-${Date.now()}`,
      name: supplierForm.name.trim(),
      contactName: supplierForm.contactName.trim(),
      phone: supplierForm.phone.trim(),
      email: supplierForm.email.trim(),
      branchIds: [...supplierForm.branchIds],
      leadTimeDays,
      status: supplierForm.status,
    };

    if (editingSupplier) {
      setSuppliers((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
    } else {
      setSuppliers((prev) => [payload, ...prev]);
    }

    setSupplierModalOpen(false);
  }

  function handleInventorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setInventoryFormError(null);

    const inStock = Number(inventoryForm.inStock);
    const reserved = Number(inventoryForm.reserved);
    const incoming = Number(inventoryForm.incoming);

    if (!inventoryForm.branchId || !inventoryForm.ingredientId) {
      setInventoryFormError('Vui lòng chọn chi nhánh và nguyên liệu.');
      return;
    }

    if (
      Number.isNaN(inStock)
      || Number.isNaN(reserved)
      || Number.isNaN(incoming)
      || inStock < 0
      || reserved < 0
      || incoming < 0
    ) {
      setInventoryFormError('Tồn kho, đã đặt trước và đang nhập phải là số hợp lệ.');
      return;
    }

    if (reserved > inStock) {
      setInventoryFormError('Số lượng đã đặt trước không thể lớn hơn tồn kho.');
      return;
    }

    const payload: InventoryItem = {
      id: editingInventory?.id ?? `inv-${Date.now()}`,
      branchId: inventoryForm.branchId,
      ingredientId: inventoryForm.ingredientId,
      inStock,
      reserved,
      incoming,
      lastRestockedAt: fromDatetimeLocalInputValue(inventoryForm.lastRestockedAt),
    };

    if (editingInventory) {
      setInventory((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
    } else {
      setInventory((prev) => [payload, ...prev]);
    }

    setInventoryModalOpen(false);
  }

  let searchPlaceholder = 'Tìm theo nguyên liệu hoặc chi nhánh...';
  if (activeTab === 'ingredient') {
    searchPlaceholder = 'Tìm theo tên nguyên liệu, nhóm, đơn vị...';
  }
  if (activeTab === 'supplier') {
    searchPlaceholder = 'Tìm theo nhà cung cấp, người liên hệ, email...';
  }

  const selectedBranchName = selectedBranch === 'all'
    ? 'Tất cả chi nhánh'
    : branchMap.get(selectedBranch) ?? 'Chi nhánh';

  return (
    <div className="inventory-page">
      <div className="inventory-page__hero">
        <div>
          <h1 className="inventory-page__title">Quản lý nguyên liệu, nhà cung cấp và tồn kho</h1>
          <p className="inventory-page__subtitle">
            Theo dõi tồn kho theo chi nhánh, quản lý nhà cung cấp và danh sách nguyên liệu cho toàn hệ thống.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            void loadPageData();
          }}
        >
          <RefreshCw size={16} />
          Làm mới dữ liệu
        </Button>
      </div>

      {error && (
        <div className="inventory-alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <Button size="sm" onClick={() => { void loadPageData(); }}>
            Thử lại
          </Button>
        </div>
      )}

      <div className="inventory-stats">
        <article className="inventory-stat-card">
          <span className="inventory-stat-card__icon inventory-stat-card__icon--brown">
            <Boxes size={20} />
          </span>
          <div>
            <p className="inventory-stat-card__value">{ingredients.length}</p>
            <p className="inventory-stat-card__label">Tổng nguyên liệu</p>
          </div>
        </article>

        <article className="inventory-stat-card">
          <span className="inventory-stat-card__icon inventory-stat-card__icon--orange">
            <Truck size={20} />
          </span>
          <div>
            <p className="inventory-stat-card__value">{activeSuppliersCount}</p>
            <p className="inventory-stat-card__label">Nhà cung cấp đang hợp tác</p>
          </div>
        </article>

        <article className="inventory-stat-card">
          <span className="inventory-stat-card__icon inventory-stat-card__icon--red">
            <CircleGauge size={20} />
          </span>
          <div>
            <p className="inventory-stat-card__value">{lowStockCount}</p>
            <p className="inventory-stat-card__label">Mức tồn cần theo dõi</p>
          </div>
        </article>

        <article className="inventory-stat-card">
          <span className="inventory-stat-card__icon inventory-stat-card__icon--green">
            <Warehouse size={20} />
          </span>
          <div>
            <p className="inventory-stat-card__value">{currencyFormatter.format(totalInventoryValue)}</p>
            <p className="inventory-stat-card__label">Giá trị tồn kho ước tính</p>
          </div>
        </article>
      </div>

      <section className="inventory-panel">
        <div className="inventory-toolbar">
          <div className="inventory-tabs" role="tablist" aria-label="Quản lý kho">
            {tabItems.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={activeTab === item.key}
                className={`inventory-tab ${activeTab === item.key ? 'inventory-tab--active' : ''}`}
                onClick={() => setActiveTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="inventory-filter-grid">
            <label className="inventory-filter">
              <span className="inventory-filter__label">Chi nhánh</span>
              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value)}
                className="inventory-select"
              >
                <option value="all">Tất cả chi nhánh</option>
                {branches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="inventory-search-wrap">
              <Input
                label="Tìm kiếm nhanh"
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder={searchPlaceholder}
              />
              <Search size={16} className="inventory-search-icon" />
            </div>

            {activeTab === 'ingredient' && (
              <Button onClick={openCreateIngredientModal}>Thêm nguyên liệu</Button>
            )}
            {activeTab === 'supplier' && (
              <Button onClick={openCreateSupplierModal}>Thêm nhà cung cấp</Button>
            )}
            {activeTab === 'inventory' && (
              <Button onClick={openCreateInventoryModal}>Thêm dòng tồn kho</Button>
            )}
          </div>
        </div>

        <div className="inventory-current-branch">
          <Building2 size={16} />
          <span>Phạm vi hiện tại: {selectedBranchName}</span>
        </div>

        {activeTab === 'ingredient' && (
          <DataTable
            columns={ingredientColumns}
            data={filteredIngredients}
            loading={loading}
            emptyText="Chưa có nguyên liệu nào phù hợp với bộ lọc hiện tại."
          />
        )}

        {activeTab === 'supplier' && (
          <DataTable
            columns={supplierColumns}
            data={filteredSuppliers}
            loading={loading}
            emptyText="Chưa có nhà cung cấp nào phù hợp với bộ lọc hiện tại."
          />
        )}

        {activeTab === 'inventory' && (
          <DataTable
            columns={inventoryRowColumns}
            data={filteredInventory}
            loading={loading}
            emptyText="Chưa có dữ liệu tồn kho cho bộ lọc này."
          />
        )}
      </section>

      <Modal
        isOpen={ingredientModalOpen}
        onClose={() => setIngredientModalOpen(false)}
        title={editingIngredient ? 'Cập nhật nguyên liệu' : 'Thêm nguyên liệu mới'}
        size="md"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setIngredientModalOpen(false)}>
              Hủy
            </Button>
            <Button form="ingredient-form" type="submit">
              {editingIngredient ? 'Lưu thay đổi' : 'Tạo nguyên liệu'}
            </Button>
          </>
        )}
      >
        <form id="ingredient-form" className="inventory-form" onSubmit={handleIngredientSubmit}>
          <Input
            label="Tên nguyên liệu"
            value={ingredientForm.name}
            onChange={(event) => setIngredientForm((prev) => ({ ...prev, name: event.target.value }))}
            required
          />

          <div className="inventory-form__row">
            <Input
              label="Nhóm"
              value={ingredientForm.category}
              onChange={(event) => setIngredientForm((prev) => ({ ...prev, category: event.target.value }))}
              required
            />
            <Input
              label="Đơn vị"
              value={ingredientForm.unit}
              onChange={(event) => setIngredientForm((prev) => ({ ...prev, unit: event.target.value }))}
              required
            />
          </div>

          <div className="inventory-form__row">
            <label className="inventory-form__field">
              <span>Nhà cung cấp</span>
              <select
                className="inventory-select"
                value={ingredientForm.supplierId}
                onChange={(event) => setIngredientForm((prev) => ({ ...prev, supplierId: event.target.value }))}
                required
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="inventory-form__field">
              <span>Trạng thái</span>
              <select
                className="inventory-select"
                value={ingredientForm.status}
                onChange={(event) => setIngredientForm((prev) => ({
                  ...prev,
                  status: event.target.value as Ingredient['status'],
                }))}
              >
                <option value="active">Đang sử dụng</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </label>
          </div>

          <div className="inventory-form__row">
            <label className="inventory-form__field">
              <span>Ngưỡng cảnh báo</span>
              <input
                type="number"
                min={0}
                value={ingredientForm.minStock}
                onChange={(event) => setIngredientForm((prev) => ({ ...prev, minStock: event.target.value }))}
                className="inventory-form__control"
              />
            </label>

            <label className="inventory-form__field">
              <span>Giá nhập / đơn vị</span>
              <input
                type="number"
                min={0}
                value={ingredientForm.costPerUnit}
                onChange={(event) => setIngredientForm((prev) => ({ ...prev, costPerUnit: event.target.value }))}
                className="inventory-form__control"
              />
            </label>
          </div>

          {ingredientFormError && <p className="inventory-form__error">{ingredientFormError}</p>}
        </form>
      </Modal>

      <Modal
        isOpen={supplierModalOpen}
        onClose={() => setSupplierModalOpen(false)}
        title={editingSupplier ? 'Cập nhật nhà cung cấp' : 'Thêm nhà cung cấp mới'}
        size="lg"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setSupplierModalOpen(false)}>
              Hủy
            </Button>
            <Button form="supplier-form" type="submit">
              {editingSupplier ? 'Lưu thay đổi' : 'Tạo nhà cung cấp'}
            </Button>
          </>
        )}
      >
        <form id="supplier-form" className="inventory-form" onSubmit={handleSupplierSubmit}>
          <div className="inventory-form__row">
            <Input
              label="Tên nhà cung cấp"
              value={supplierForm.name}
              onChange={(event) => setSupplierForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <Input
              label="Người liên hệ"
              value={supplierForm.contactName}
              onChange={(event) => setSupplierForm((prev) => ({ ...prev, contactName: event.target.value }))}
              required
            />
          </div>

          <div className="inventory-form__row">
            <Input
              label="Số điện thoại"
              value={supplierForm.phone}
              onChange={(event) => setSupplierForm((prev) => ({ ...prev, phone: event.target.value }))}
              required
            />
            <Input
              label="Email"
              type="email"
              value={supplierForm.email}
              onChange={(event) => setSupplierForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>

          <div className="inventory-form__row">
            <label className="inventory-form__field">
              <span>Thời gian giao (ngày)</span>
              <input
                type="number"
                min={0}
                value={supplierForm.leadTimeDays}
                onChange={(event) => setSupplierForm((prev) => ({ ...prev, leadTimeDays: event.target.value }))}
                className="inventory-form__control"
                required
              />
            </label>

            <label className="inventory-form__field">
              <span>Trạng thái</span>
              <select
                className="inventory-select"
                value={supplierForm.status}
                onChange={(event) => setSupplierForm((prev) => ({
                  ...prev,
                  status: event.target.value as Supplier['status'],
                }))}
              >
                <option value="active">Đang hợp tác</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </label>
          </div>

          <fieldset className="inventory-form__branch-group">
            <legend>Chi nhánh phụ trách</legend>
            <div className="inventory-form__branch-grid">
              {branches.map((item) => (
                <label key={item.id} className="inventory-check">
                  <input
                    type="checkbox"
                    checked={supplierForm.branchIds.includes(item.id)}
                    onChange={() => handleSupplierBranchToggle(item.id)}
                  />
                  <span>{item.name}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {supplierFormError && <p className="inventory-form__error">{supplierFormError}</p>}
        </form>
      </Modal>

      <Modal
        isOpen={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        title={editingInventory ? 'Cập nhật tồn kho' : 'Thêm dòng tồn kho'}
        size="md"
        footer={(
          <>
            <Button variant="ghost" onClick={() => setInventoryModalOpen(false)}>
              Hủy
            </Button>
            <Button form="inventory-form" type="submit">
              {editingInventory ? 'Lưu thay đổi' : 'Tạo dòng tồn kho'}
            </Button>
          </>
        )}
      >
        <form id="inventory-form" className="inventory-form" onSubmit={handleInventorySubmit}>
          <div className="inventory-form__row">
            <label className="inventory-form__field">
              <span>Chi nhánh</span>
              <select
                className="inventory-select"
                value={inventoryForm.branchId}
                onChange={(event) => setInventoryForm((prev) => ({ ...prev, branchId: event.target.value }))}
                required
              >
                <option value="">Chọn chi nhánh</option>
                {branches.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="inventory-form__field">
              <span>Nguyên liệu</span>
              <select
                className="inventory-select"
                value={inventoryForm.ingredientId}
                onChange={(event) => setInventoryForm((prev) => ({ ...prev, ingredientId: event.target.value }))}
                required
              >
                <option value="">Chọn nguyên liệu</option>
                {ingredients.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="inventory-form__row">
            <label className="inventory-form__field">
              <span>Tồn kho</span>
              <input
                type="number"
                min={0}
                value={inventoryForm.inStock}
                onChange={(event) => setInventoryForm((prev) => ({ ...prev, inStock: event.target.value }))}
                className="inventory-form__control"
              />
            </label>

            <label className="inventory-form__field">
              <span>Đã đặt trước</span>
              <input
                type="number"
                min={0}
                value={inventoryForm.reserved}
                onChange={(event) => setInventoryForm((prev) => ({ ...prev, reserved: event.target.value }))}
                className="inventory-form__control"
              />
            </label>
          </div>

          <div className="inventory-form__row">
            <label className="inventory-form__field">
              <span>Đang nhập</span>
              <input
                type="number"
                min={0}
                value={inventoryForm.incoming}
                onChange={(event) => setInventoryForm((prev) => ({ ...prev, incoming: event.target.value }))}
                className="inventory-form__control"
              />
            </label>

            <label className="inventory-form__field">
              <span>Lần cập nhật</span>
              <input
                type="datetime-local"
                value={inventoryForm.lastRestockedAt}
                onChange={(event) => setInventoryForm((prev) => ({ ...prev, lastRestockedAt: event.target.value }))}
                className="inventory-form__control"
              />
            </label>
          </div>

          {inventoryFormError && <p className="inventory-form__error">{inventoryFormError}</p>}
        </form>
      </Modal>
    </div>
  );
}
