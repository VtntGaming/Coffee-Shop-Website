const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const upload = require('../middlewares/upload');

// Public: xem sản phẩm
router.get('/', productController.getAllProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), upload.single('image'), productController.createProduct);
router.put('/:id', auth, authorize('ADMIN'), upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
