import type {
  BranchOption,
  Ingredient,
  InventoryItem,
  InventoryModuleData,
  Supplier,
} from '../types/inventory';

const mockBranches: BranchOption[] = [
  { id: 'branch-1', name: 'Chi nhánh Quận 1' },
  { id: 'branch-2', name: 'Chi nhánh Quận 7' },
  { id: 'branch-3', name: 'Chi nhánh Thủ Đức' },
];

const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Nông trại Arabica Đà Lạt',
    contactName: 'Anh Hiếu',
    phone: '0909123456',
    email: 'hieu@arabicafarm.vn',
    branchIds: ['branch-1', 'branch-2'],
    leadTimeDays: 2,
    status: 'active',
  },
  {
    id: 'sup-2',
    name: 'Sữa Tươi Việt Nam',
    contactName: 'Chị Mai',
    phone: '0911222333',
    email: 'mai@freshmilk.vn',
    branchIds: ['branch-1', 'branch-2', 'branch-3'],
    leadTimeDays: 1,
    status: 'active',
  },
  {
    id: 'sup-3',
    name: 'Ngọt Nguồn Trading',
    contactName: 'Anh Long',
    phone: '0933444555',
    email: 'long@sweetsource.vn',
    branchIds: ['branch-3'],
    leadTimeDays: 3,
    status: 'inactive',
  },
];

const mockIngredients: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Hạt cà phê Arabica',
    category: 'Hạt cà phê',
    unit: 'kg',
    minStock: 8,
    supplierId: 'sup-1',
    costPerUnit: 235000,
    status: 'active',
  },
  {
    id: 'ing-2',
    name: 'Sữa tươi không đường',
    category: 'Sữa',
    unit: 'lít',
    minStock: 15,
    supplierId: 'sup-2',
    costPerUnit: 37000,
    status: 'active',
  },
  {
    id: 'ing-3',
    name: 'Siro caramel',
    category: 'Siro',
    unit: 'chai',
    minStock: 10,
    supplierId: 'sup-3',
    costPerUnit: 89000,
    status: 'inactive',
  },
  {
    id: 'ing-4',
    name: 'Bánh cookie',
    category: 'Bánh ngọt',
    unit: 'hộp',
    minStock: 6,
    supplierId: 'sup-3',
    costPerUnit: 52000,
    status: 'active',
  },
];

const mockInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    branchId: 'branch-1',
    ingredientId: 'ing-1',
    inStock: 22,
    reserved: 5,
    incoming: 0,
    lastRestockedAt: '2026-04-01T09:00:00.000Z',
  },
  {
    id: 'inv-2',
    branchId: 'branch-1',
    ingredientId: 'ing-2',
    inStock: 10,
    reserved: 2,
    incoming: 20,
    lastRestockedAt: '2026-04-03T13:25:00.000Z',
  },
  {
    id: 'inv-3',
    branchId: 'branch-2',
    ingredientId: 'ing-1',
    inStock: 6,
    reserved: 1,
    incoming: 10,
    lastRestockedAt: '2026-04-02T08:45:00.000Z',
  },
  {
    id: 'inv-4',
    branchId: 'branch-3',
    ingredientId: 'ing-3',
    inStock: 2,
    reserved: 1,
    incoming: 0,
    lastRestockedAt: '2026-03-30T10:10:00.000Z',
  },
  {
    id: 'inv-5',
    branchId: 'branch-3',
    ingredientId: 'ing-4',
    inStock: 0,
    reserved: 0,
    incoming: 12,
    lastRestockedAt: '2026-03-28T15:40:00.000Z',
  },
];

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchInventoryModuleData(): Promise<InventoryModuleData> {
  await delay(500);

  return {
    branches: mockBranches.map((item) => ({ ...item })),
    ingredients: mockIngredients.map((item) => ({ ...item })),
    suppliers: mockSuppliers.map((item) => ({ ...item, branchIds: [...item.branchIds] })),
    inventory: mockInventory.map((item) => ({ ...item })),
  };
}
