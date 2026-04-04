/**
 * Routes: ingredients
 * Định nghĩa các endpoint cho quản lý nguyên liệu
 * Người 4 - Feature/inventory
 *
 * Base path: /api/ingredients
 */

const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// ============================================
// GET /api/ingredients          → Lấy danh sách nguyên liệu (ADMIN + STAFF)
// GET /api/ingredients/:id      → Lấy 1 nguyên liệu (ADMIN + STAFF)
// ============================================
router.get('/', auth, ingredientController.getAllIngredients);
router.get('/:id', auth, ingredientController.getIngredientById);

// ============================================
// POST /api/ingredients         → Tạo nguyên liệu (chỉ ADMIN)
// PUT  /api/ingredients/:id     → Cập nhật nguyên liệu (chỉ ADMIN)
// DELETE /api/ingredients/:id   → Vô hiệu hóa nguyên liệu (chỉ ADMIN)
// ============================================
router.post('/', auth, authorize('ADMIN'), ingredientController.createIngredient);
router.put('/:id', auth, authorize('ADMIN'), ingredientController.updateIngredient);
router.delete('/:id', auth, authorize('ADMIN'), ingredientController.deleteIngredient);

module.exports = router;
