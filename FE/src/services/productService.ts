/**
 * Team member khác muốn gọi API chỉ cần:
 *   import apiClient from '../services/apiClient';
 *   await apiClient.get('/branches');
 *   await apiClient.post('/orders', data);
 * ============================================
 */
import apiClient from './apiClient';
import type { ApiResponse } from '../types/auth';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/product';

// Địa chỉ máy chủ (không bao gồm /api)
const API_BASE_URL = 'http://localhost:3000';

/**
 * Helper để map dữ liệu từ Backend về Frontend
 */
function mapProductResponse(data: any): Product {
  let imageUrl = data.image;
  
  // Nếu là ảnh tải lên (có đường dẫn tương đối), thêm tiền tố URL máy chủ
  if (imageUrl && imageUrl.startsWith('/uploads')) {
    imageUrl = `${API_BASE_URL}${imageUrl}`;
  }

  return {
    ...data,
    image: imageUrl,
    categoryId: data.category?._id || data.category || '',
    categoryName: data.category?.name || '',
    isActive: data.isActive !== undefined ? data.isActive : data.isAvailable,
    prices: data.sizes?.map((s: any) => ({ size: s.name, price: s.price })) || []
  };
}

/**
 * Lấy danh sách sản phẩm (có hỗ trợ filter, search)
 * GET /api/products
 */
export async function getProducts(params?: any): Promise<ApiResponse<Product[]>> {
  const response = await apiClient.get<ApiResponse<any[]>>('/products', {
    params,
  });
  
  return {
    ...response.data,
    data: response.data.data?.map(mapProductResponse) as Product[]
  };
}

/**
 * Lấy chi tiết một sản phẩm
 * GET /api/products/:id
 */
export async function getProductById(id: string): Promise<ApiResponse<Product>> {
  const response = await apiClient.get<ApiResponse<any>>(`/products/${id}`);
  return {
    ...response.data,
    data: mapProductResponse(response.data.data)
  };
}

/**
 * Tạo sản phẩm mới
 * POST /api/products
 */
export async function createProduct(
  payload: CreateProductPayload | FormData
): Promise<ApiResponse<Product>> {
  let finalPayload = payload;
  
  // Nếu là JSON thông thường, map lại dữ liệu
  if (!(payload instanceof FormData)) {
    finalPayload = {
      ...payload,
      category: payload.categoryId,
      isAvailable: payload.isActive,
      price: payload.prices?.[0]?.price || 0,
      sizes: payload.prices?.map(p => ({ name: p.size, price: p.price })) || []
    } as any;
  }

  const response = await apiClient.post<ApiResponse<any>>(
    '/products',
    finalPayload,
    {
       headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    }
  );
  
  return {
    ...response.data,
    data: mapProductResponse(response.data.data)
  };
}

/**
 * Cập nhật sản phẩm
 * PUT /api/products/:id
 */
export async function updateProduct(
  id: string,
  payload: UpdateProductPayload | FormData
): Promise<ApiResponse<Product>> {
  let finalPayload = payload;

  if (!(payload instanceof FormData)) {
    finalPayload = {
      ...payload,
      category: payload.categoryId,
      isAvailable: payload.isActive,
      price: payload.prices?.[0]?.price,
      sizes: payload.prices?.map(p => ({ name: p.size, price: p.price }))
    } as any;
  }

  const response = await apiClient.put<ApiResponse<any>>(
    `/products/${id}`,
    finalPayload,
    {
       headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    }
  );
  
  return {
    ...response.data,
    data: mapProductResponse(response.data.data)
  };
}

/**
 * Xóa mềm sản phẩm (hoặc ẩn)
 * DELETE /api/products/:id
 */
export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
  return response.data;
}
