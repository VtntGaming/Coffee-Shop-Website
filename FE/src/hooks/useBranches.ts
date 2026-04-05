/**
 * ============================================
 * USE BRANCHES — Hook quản lý trạng thái chi nhánh
 *
 * Cách dùng:
 *   const { branches, loading, error, loadBranches } = useBranches();
 * ============================================
 */
import { useState, useCallback } from 'react';
import * as branchService from '../services/branchService';
import type { Branch, BranchPayload } from '../types/branch';

interface UseBranchesReturn {
  branches: Branch[];
  loading: boolean;
  error: string | null;
  loadBranches: () => Promise<void>;
  createBranch: (payload: BranchPayload) => Promise<void>;
  updateBranch: (id: string, payload: BranchPayload) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useBranches(): UseBranchesReturn {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tải danh sách chi nhánh
   */
  const loadBranches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await branchService.getAllBranches();
      if (response.success && response.data) {
        setBranches(response.data);
      } else {
        setError(response.message || 'Không thể tải chi nhánh');
      }
    } catch (err) {
      setError('Có lỗi khi tải chi nhánh');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tạo chi nhánh mới
   */
  const createBranch = useCallback(async (payload: BranchPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await branchService.createBranch(payload);
      if (response.success) {
        await loadBranches();
      } else {
        setError(response.message || 'Lỗi khi tạo chi nhánh');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadBranches]);

  /**
   * Cập nhật chi nhánh
   */
  const updateBranch = useCallback(async (id: string, payload: BranchPayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await branchService.updateBranch(id, payload);
      if (response.success) {
        await loadBranches();
      } else {
        setError(response.message || 'Lỗi khi cập nhật chi nhánh');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadBranches]);

  /**
   * Xóa chi nhánh
   */
  const deleteBranch = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

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
  }, [loadBranches]);

  return {
    branches,
    loading,
    error,
    loadBranches,
    createBranch,
    updateBranch,
    deleteBranch,
    setError,
  };
}
