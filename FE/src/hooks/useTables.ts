/**
 * ============================================
 * USE TABLES — Hook quản lý trạng thái bàn
 *
 * Cách dùng:
 *   const { tables, loading, error, loadTables } = useTables();
 * ============================================
 */
import { useState, useCallback } from 'react';
import * as tableService from '../services/tableService';
import type { Table, TablePayload, TableStatus } from '../types/table';

interface UseTablesReturn {
  tables: Table[];
  loading: boolean;
  error: string | null;
  loadTables: (branchId: string) => Promise<void>;
  createTable: (branchId: string, payload: TablePayload) => Promise<void>;
  updateTable: (id: string, payload: TablePayload) => Promise<void>;
  updateTableStatus: (id: string, status: TableStatus) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export function useTables(): UseTablesReturn {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Tải danh sách bàn
   */
  const loadTables = useCallback(async (branchId: string) => {
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
  }, []);

  /**
   * Tạo bàn mới
   */
  const createTable = useCallback(async (branchId: string, payload: TablePayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await tableService.createTable(branchId, payload);
      if (response.success) {
        await loadTables(branchId);
      } else {
        setError(response.message || 'Lỗi khi tạo bàn');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [loadTables]);

  /**
   * Cập nhật bàn
   */
  const updateTable = useCallback(async (id: string, payload: TablePayload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await tableService.updateTable(id, payload);
      if (response.success) {
        // Cập nhật state thay vì reload toàn bộ
        setTables((prev) =>
          prev.map((table) => (table._id === id ? { ...table, ...payload } : table))
        );
      } else {
        setError(response.message || 'Lỗi khi cập nhật bàn');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cập nhật trạng thái bàn
   */
  const updateTableStatus = useCallback(async (id: string, status: TableStatus) => {
    try {
      const response = await tableService.updateTableStatus(id, status);
      if (response.success) {
        // Cập nhật state lại
        setTables((prev) =>
          prev.map((table) => (table._id === id ? { ...table, status } : table))
        );
      } else {
        setError(response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    }
  }, []);

  /**
   * Xóa bàn
   */
  const deleteTable = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await tableService.deleteTable(id);
      if (response.success) {
        setTables((prev) => prev.filter((table) => table._id !== id));
      } else {
        setError(response.message || 'Không thể xóa bàn');
      }
    } catch (err) {
      setError('Có lỗi xảy ra');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    tables,
    loading,
    error,
    loadTables,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
    setError,
  };
}
