const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Cần đăng nhập để xem bàn
router.get('/', auth, tableController.getAllTables);
router.get('/:id', auth, tableController.getTableById);

// ADMIN only: tạo, xóa bàn
router.post('/', auth, authorize('ADMIN'), tableController.createTable);
router.delete('/:id', auth, authorize('ADMIN'), tableController.deleteTable);

// ADMIN hoặc STAFF: cập nhật bàn, đổi trạng thái
router.put('/:id', auth, authorize('ADMIN', 'STAFF'), tableController.updateTable);
router.patch('/:id/status', auth, authorize('ADMIN', 'STAFF'), tableController.updateTableStatus);

module.exports = router;
