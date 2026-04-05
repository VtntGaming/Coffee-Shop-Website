const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const upload = require('../middlewares/upload');

// Public: xem danh mục
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), upload.single('image'), categoryController.createCategory);
router.put('/:id', auth, authorize('ADMIN'), upload.single('image'), categoryController.updateCategory);
router.delete('/:id', auth, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
