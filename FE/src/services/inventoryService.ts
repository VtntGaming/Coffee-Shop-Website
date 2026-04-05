import type {
  BranchOption,
  Ingredient,
  InventoryItem,
  InventoryModuleData,
  Supplier,
} from '../types/inventory';

import apiClient from './apiClient';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  message?: string;
}

interface BackendIngredient {
  _id: string;
  name: string;
  unit: string;
  description?: string;
  minStock?: number;
  isActive?: boolean;
}

interface BackendSupplier {
  _id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  supplies?: Array<{ _id?: string } | string>;
  isActive?: boolean;
}

interface BackendBranch {
  _id: string;
  name: string;
}

type BackendReference = string | { _id?: string; name?: string };

interface BackendInventoryHistory {
  _id: string;
  ingredient: BackendReference;
  branch: BackendReference;
  supplier?: BackendReference;
  type: 'import' | 'export' | 'adjust';
  quantity: number;
  unitPrice?: number;
  createdAt: string;
}

function getRefId(value: BackendReference | undefined): string {
  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value._id ?? '';
}

function getRefName(value: BackendReference | undefined): string {
  if (!value || typeof value === 'string') {
    return '';
  }

  return value.name ?? '';
}

async function fetchAllHistory(): Promise<BackendInventoryHistory[]> {
  const firstPage = await apiClient.get<ApiEnvelope<BackendInventoryHistory[]>>('/inventory/history', {
    params: { page: 1, limit: 200 },
  });

  const allRows = [...(firstPage.data.data ?? [])];
  const totalPages = firstPage.data.totalPages ?? 1;

  if (totalPages <= 1) {
    return allRows;
  }

  const requests: Array<Promise<{ data: ApiEnvelope<BackendInventoryHistory[]> }>> = [];
  for (let page = 2; page <= totalPages; page += 1) {
    requests.push(
      apiClient.get<ApiEnvelope<BackendInventoryHistory[]>>('/inventory/history', {
        params: { page, limit: 200 },
      }),
    );
  }

  const pages = await Promise.all(requests);
  pages.forEach((response) => {
    allRows.push(...(response.data.data ?? []));
  });

  return allRows;
}

export async function fetchInventoryModuleData(): Promise<InventoryModuleData> {
  const [ingredientsRes, suppliersRes, branchesRes, historyRows] = await Promise.all([
    apiClient.get<ApiEnvelope<BackendIngredient[]>>('/ingredients'),
    apiClient.get<ApiEnvelope<BackendSupplier[]>>('/suppliers').catch(() => null),
    apiClient.get<ApiEnvelope<BackendBranch[]>>('/branches').catch(() => null),
    fetchAllHistory().catch(() => []),
  ]);

  const backendIngredients = ingredientsRes.data.data ?? [];
  const backendSuppliers = suppliersRes?.data?.data ?? [];

  const branchMap = new Map<string, string>();
  (branchesRes?.data?.data ?? []).forEach((item) => {
    branchMap.set(item._id, item.name);
  });
  historyRows.forEach((row) => {
    const branchId = getRefId(row.branch);
    const branchName = getRefName(row.branch);
    if (!branchId) {
      return;
    }

    if (!branchMap.has(branchId)) {
      branchMap.set(branchId, branchName || 'Chi nhánh');
    }
  });

  const branches: BranchOption[] = Array.from(branchMap.entries()).map(([id, name]) => ({
    id,
    name,
  }));

  const allBranchIds = branches.map((item) => item.id);

  const supplierByIngredient = new Map<string, string>();
  const suppliers: Supplier[] = backendSuppliers.map((item) => {
    (item.supplies ?? []).forEach((supply) => {
      const ingredientId = typeof supply === 'string' ? supply : (supply._id ?? '');
      if (ingredientId && !supplierByIngredient.has(ingredientId)) {
        supplierByIngredient.set(ingredientId, item._id);
      }
    });

    return {
      id: item._id,
      name: item.name,
      contactName: item.contactPerson ?? '-',
      phone: item.phone,
      email: item.email ?? '-',
      branchIds: [...allBranchIds],
      leadTimeDays: 1,
      status: item.isActive === false ? 'inactive' : 'active',
    };
  });

  const latestImportPriceMap = new Map<string, { price: number; createdAt: number }>();
  historyRows.forEach((row) => {
    if (row.type !== 'import') {
      return;
    }

    const ingredientId = getRefId(row.ingredient);
    if (!ingredientId) {
      return;
    }

    const createdAtTime = new Date(row.createdAt).getTime();
    const prev = latestImportPriceMap.get(ingredientId);
    if (!prev || createdAtTime > prev.createdAt) {
      latestImportPriceMap.set(ingredientId, {
        price: row.unitPrice ?? 0,
        createdAt: createdAtTime,
      });
    }
  });

  const ingredients: Ingredient[] = backendIngredients.map((item) => ({
    id: item._id,
    name: item.name,
    category: item.description?.trim() || 'Nguyên liệu',
    unit: item.unit,
    minStock: item.minStock ?? 0,
    supplierId: supplierByIngredient.get(item._id) ?? '',
    costPerUnit: latestImportPriceMap.get(item._id)?.price ?? 0,
    status: item.isActive === false ? 'inactive' : 'active',
  }));

  const groupedInventory = new Map<string, InventoryItem>();
  historyRows.forEach((row) => {
    const ingredientId = getRefId(row.ingredient);
    const branchId = getRefId(row.branch);
    if (!ingredientId || !branchId) {
      return;
    }

    const key = `${branchId}:${ingredientId}`;
    const existing = groupedInventory.get(key);
    const current = existing ?? {
      id: key,
      branchId,
      ingredientId,
      inStock: 0,
      reserved: 0,
      incoming: 0,
      lastRestockedAt: row.createdAt,
    };

    if (row.type === 'import') {
      current.inStock += row.quantity;
    } else if (row.type === 'export') {
      current.inStock -= row.quantity;
    } else {
      current.inStock += row.quantity;
    }

    if (new Date(row.createdAt).getTime() > new Date(current.lastRestockedAt).getTime()) {
      current.lastRestockedAt = row.createdAt;
    }

    groupedInventory.set(key, current);
  });

  const inventory = Array.from(groupedInventory.values()).map((item) => ({
    ...item,
    inStock: Math.max(item.inStock, 0),
  }));

  return {
    branches,
    ingredients,
    suppliers,
    inventory,
  };
}

// ----------------------------------------------------
// MUTATIONS (CRUD cho FE)
// ----------------------------------------------------

export async function createIngredientApi(data: Partial<BackendIngredient>) {
  const res = await apiClient.post<ApiEnvelope<BackendIngredient>>('/ingredients', data);
  return res.data.data;
}

export async function updateIngredientApi(id: string, data: Partial<BackendIngredient>) {
  const res = await apiClient.put<ApiEnvelope<BackendIngredient>>(`/ingredients/${id}`, data);
  return res.data.data;
}

export async function deleteIngredientApi(id: string) {
  const res = await apiClient.delete(`/ingredients/${id}`);
  return res.data;
}

export async function createSupplierApi(data: Partial<BackendSupplier>) {
  const res = await apiClient.post<ApiEnvelope<BackendSupplier>>('/suppliers', data);
  return res.data.data;
}

export async function updateSupplierApi(id: string, data: Partial<BackendSupplier>) {
  const res = await apiClient.put<ApiEnvelope<BackendSupplier>>(`/suppliers/${id}`, data);
  return res.data.data;
}

export async function deleteSupplierApi(id: string) {
  const res = await apiClient.delete(`/suppliers/${id}`);
  return res.data;
}

export async function importInventoryApi(data: { ingredient: string; branch: string; quantity: number; unitPrice: number; supplier?: string; note?: string }) {
  const res = await apiClient.post('/inventory/import', data);
  return res.data;
}

export async function exportInventoryApi(data: { ingredient: string; branch: string; quantity: number; note?: string }) {
  const res = await apiClient.post('/inventory/export', data);
  return res.data;
}
