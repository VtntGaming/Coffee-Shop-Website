const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/role");

// Kiểm tra voucher (nhân viên đã đăng nhập)
router.post("/check", auth, voucherController.checkVoucher);

// ADMIN: xem danh sách và chi tiết voucher
router.get("/", auth, authorize("ADMIN"), voucherController.getAllVouchers);
router.get("/:id", auth, authorize("ADMIN"), voucherController.getVoucherById);

// ADMIN: tạo, sửa, xóa voucher
router.post("/", auth, authorize("ADMIN"), voucherController.createVoucher);
router.put("/:id", auth, authorize("ADMIN"), voucherController.updateVoucher);
router.delete("/:id", auth, authorize("ADMIN"), voucherController.deleteVoucher);

module.exports = router;
