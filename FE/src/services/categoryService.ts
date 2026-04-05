import apiClient from './apiClient';
import type { ApiResponse } from '../types/auth';
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/category';

/**
 * Helper để map dữ liệu từ Backend về Frontend
 */
function mapCategoryResponse(data: any): Category {
  return {
    ...data,
    categoryId: data._id
  } as any;
}

/**
 * Lấy tất cả danh mục
 * GET /api/categories
 */
export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  const response = await apiClient.get<ApiResponse<any[]>>('/categories');
  return {
    ...response.data,
    data: response.data.data?.map(mapCategoryResponse) as Category[]
  };
}

/**
 * Tạo danh mục mới
 * POST /api/categories
 */
export async function createCategory(
  payload: CreateCategoryPayload | FormData
): Promise<ApiResponse<Category>> {
  const response = await apiClient.post<ApiResponse<any>>(
    '/categories',
    payload,
    {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    }
  );
  return {
    ...response.data,
    data: mapCategoryResponse(response.data.data)
  };
}

/**
 * Cập nhật danh mục
 * PUT /api/categories/:id
 */
export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload | FormData
): Promise<ApiResponse<Category>> {
  const response = await apiClient.put<ApiResponse<any>>(
    `/categories/${id}`,
    payload,
    {
      headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    }
  );
  return {
    ...response.data,
    data: mapCategoryResponse(response.data.data)
  };
}

/**
 * Xóa mềm danh mục (hoặc ẩn)
 * DELETE /api/categories/:id
 */
export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  const response = await apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
  return response.data;
}
