export interface BranchOption {
  id: string;
  name: string;
}

export type IngredientStatus = 'active' | 'inactive';

export interface Ingredient extends Record<string, unknown> {
  id: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  supplierId: string;
  costPerUnit: number;
  status: IngredientStatus;
}

export type SupplierStatus = 'active' | 'inactive';

export interface Supplier extends Record<string, unknown> {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  branchIds: string[];
  leadTimeDays: number;
  status: SupplierStatus;
}

export interface InventoryItem extends Record<string, unknown> {
  id: string;
  branchId: string;
  ingredientId: string;
  inStock: number;
  reserved: number;
  incoming: number;
  lastRestockedAt: string;
}

export interface InventoryModuleData {
  branches: BranchOption[];
  ingredients: Ingredient[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
}
