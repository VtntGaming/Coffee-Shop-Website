/**
 * ============================================
 * TYPES — Định nghĩa kiểu dữ liệu Sản phẩm (Product)
 * ============================================
 */

export interface ProductPrice {
  size: string; //'S', 'M', 'L' or other size names
  price: number;
}

export interface Product {
  _id: string;
  categoryId: string; // ID of the category
  categoryName?: string; // Optinal field for UI display convenience
  name: string;
  description?: string;
  image?: string;
  isActive: boolean;
  isBestSeller: boolean;
  prices: ProductPrice[]; // Array of sizes and prices
  tags?: string[]; // Array of strings e.g. ['Nóng', 'Lạnh', 'Mới']
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  categoryId: string;
  name: string;
  description?: string;
  image?: string;
  isActive?: boolean;
  isBestSeller?: boolean;
  prices: ProductPrice[];
  tags?: string[];
}

export interface UpdateProductPayload extends Partial<CreateProductPayload> {}
