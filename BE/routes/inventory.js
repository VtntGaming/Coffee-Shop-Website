/**
 * Routes: inventory
 * Định nghĩa các endpoint cho quản lý tồn kho (nhập/xuất/lịch sử)
 * Người 4 - Feature/inventory
 *
 * Base path: /api/inventory
 * Tất cả route đều yêu cầu đăng nhập (auth middleware)
 */

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Áp dụng middleware auth cho toàn bộ route trong file này
router.use(auth);

// ============================================
// GET /api/inventory/stock      → Xem tồn kho theo chi nhánh (ADMIN + STAFF)
// GET /api/inventory/low-stock  → Danh sách nguyên liệu sắp hết (ADMIN + STAFF)
// GET /api/inventory/history    → Lịch sử nhập/xuất (ADMIN + STAFF)
// ============================================
router.get('/stock', inventoryController.getStock);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/history', inventoryController.getHistory);

// ============================================
// POST /api/inventory/import    → Tạo phiếu nhập hàng (chỉ ADMIN)
// POST /api/inventory/export    → Tạo phiếu xuất hàng (chỉ ADMIN)
// ============================================
router.post('/import', authorize('ADMIN'), inventoryController.importGoods);
router.post('/export', authorize('ADMIN'), inventoryController.exportGoods);

module.exports = router;
