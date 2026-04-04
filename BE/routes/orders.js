const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/role");

// Tất cả route orders đều yêu cầu đăng nhập
router.use(auth);

// Xem danh sách và chi tiết đơn hàng
router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderById);

// Tạo đơn hàng mới
router.post("/", orderController.createOrder);

// Cập nhật trạng thái đơn hàng (ADMIN + STAFF)
router.patch("/:id/status", orderController.updateOrderStatus);

// Cập nhật thanh toán (ADMIN + STAFF)
router.patch("/:id/payment", orderController.updatePayment);

module.exports = router;
