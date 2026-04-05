/**
 * Routes: suppliers
 * Định nghĩa các endpoint cho quản lý nhà cung cấp
 * Người 4 - Feature/inventory
 *
 * Base path: /api/suppliers
 * Tất cả endpoints yêu cầu ADMIN
 */

const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// ============================================
// GET /api/suppliers          → Lấy danh sách NCC (chỉ ADMIN)
// GET /api/suppliers/:id      → Lấy 1 NCC (chỉ ADMIN)
// POST /api/suppliers         → Tạo NCC (chỉ ADMIN)
// PUT  /api/suppliers/:id     → Cập nhật NCC (chỉ ADMIN)
// DELETE /api/suppliers/:id   → Vô hiệu hóa NCC (chỉ ADMIN)
// ============================================
router.get('/', auth, authorize('ADMIN'), supplierController.getAllSuppliers);
router.get('/:id', auth, authorize('ADMIN'), supplierController.getSupplierById);
router.post('/', auth, authorize('ADMIN'), supplierController.createSupplier);
router.put('/:id', auth, authorize('ADMIN'), supplierController.updateSupplier);
router.delete('/:id', auth, authorize('ADMIN'), supplierController.deleteSupplier);

module.exports = router;
