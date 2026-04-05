const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Public: ai cũng xem được danh sách chi nhánh
router.get('/', branchController.getAllBranches);
router.get('/:id', branchController.getBranchById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), branchController.createBranch);
router.put('/:id', auth, authorize('ADMIN'), branchController.updateBranch);
router.delete('/:id', auth, authorize('ADMIN'), branchController.deleteBranch);

module.exports = router;
