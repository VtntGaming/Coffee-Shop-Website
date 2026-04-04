const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/product");
const Voucher = require("../models/Voucher");
const Table = require("../models/Table");
const Branch = require("../models/Branch");

// POST /api/orders - Tạo đơn hàng mới với danh sách sản phẩm, voucher (nếu có)
exports.createOrder = async (req, res) => {
  try {
    const {
      branch, table, orderType, items,
      voucherCode, paymentMethod,
      customerName, customerPhone, note,
    } = req.body;

    // Phải có ít nhất 1 sản phẩm
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng phải có ít nhất 1 sản phẩm",
      });
    }

    // Duyệt từng item, kiểm tra sản phẩm tồn tại và tính giá
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.product}" không tồn tại hoặc đã ngưng bán`,
        });
      }
      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" hiện đang hết hàng`,
        });
      }

      // Lấy giá theo size nếu có, không thì dùng giá mặc định
      let unitPrice = product.price;
      if (item.size && product.sizes && product.sizes.length > 0) {
        const sizeInfo = product.sizes.find((s) => s.name === item.size);
        if (sizeInfo) unitPrice = sizeInfo.price;
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        productName: product.name,
        size: item.size || "M",
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        note: item.note || "",
      });
    }

    // Xử lý voucher: kiểm tra hiệu lực và tính số tiền giảm
    let discountAmount = 0;
    let voucherId = null;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });
      if (!voucher) {
        return res.status(400).json({ success: false, message: "Mã voucher không tồn tại" });
      }

      const validity = voucher.isValid();
      if (!validity.valid) {
        return res.status(400).json({ success: false, message: validity.reason });
      }

      const discountResult = voucher.calculateDiscount(subtotal);
      if (discountResult.reason) {
        return res.status(400).json({ success: false, message: discountResult.reason });
      }

      discountAmount = discountResult.discount;
      voucherId = voucher._id;

      // Tăng số lần sử dụng voucher
      voucher.usedCount += 1;
      await voucher.save();
    }

    const totalAmount = subtotal - discountAmount;

    // Tạo đơn hàng chính
    const order = await Order.create({
      branch,
      table: table || null,
      orderType: orderType || "dine-in",
      subtotal,
      voucher: voucherId,
      discountAmount,
      totalAmount,
      paymentMethod: paymentMethod || "cash",
      customerName,
      customerPhone,
      note,
      createdBy: req.user._id,
    });

    // Tạo các OrderItem và gắn vào đơn hàng
    const createdItems = [];
    for (const item of orderItems) {
      const orderItem = await OrderItem.create({ ...item, order: order._id });
      createdItems.push(orderItem._id);
    }
    order.items = createdItems;
    await order.save();

    // Cập nhật bàn thành "occupied" nếu là dine-in
    if (table && orderType === "dine-in") {
      await Table.findByIdAndUpdate(table, { status: "occupied" });
    }

    // Populate để trả về đầy đủ thông tin
    const populatedOrder = await Order.findById(order._id)
      .populate("branch", "name")
      .populate("table", "tableNumber")
      .populate("voucher", "code discountType discountValue")
      .populate("createdBy", "fullName")
      .populate({ path: "items", populate: { path: "product", select: "name image" } });

    res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders - Lấy danh sách đơn hàng, hỗ trợ lọc theo branch/status/ngày
exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.orderType) filter.orderType = req.query.orderType;

    // Lọc theo ngày cụ thể
    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.createdAt = { $gte: date, $lt: nextDay };
    }

    // Lọc theo khoảng thời gian from - to
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("branch", "name")
        .populate("table", "tableNumber")
        .populate("createdBy", "fullName")
        .populate("voucher", "code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id - Lấy chi tiết 1 đơn hàng kèm danh sách sản phẩm
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("branch", "name address")
      .populate("table", "tableNumber floor")
      .populate("voucher", "code discountType discountValue")
      .populate("createdBy", "fullName")
      .populate({ path: "items", populate: { path: "product", select: "name image price" } });

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/status - Cập nhật trạng thái đơn hàng (pending → completed/cancelled)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Chọn: ${validStatuses.join(", ")}`,
      });
    }

    const updateData = { status };

    // Ghi nhận thời gian hoàn thành và đánh dấu đã thanh toán
    if (status === "completed") {
      updateData.completedAt = new Date();
      updateData.paymentStatus = "paid";
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate("table");

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Giải phóng bàn khi đơn hoàn thành hoặc bị hủy
    if ((status === "completed" || status === "cancelled") && order.table) {
      await Table.findByIdAndUpdate(order.table._id, { status: "available" });
    }

    // Hoàn trả lượt dùng voucher nếu hủy đơn
    if (status === "cancelled" && order.voucher) {
      await Voucher.findByIdAndUpdate(order.voucher, { $inc: { usedCount: -1 } });
    }

    res.status(200).json({
      success: true,
      message: `Đơn hàng ${order.orderNumber} đã chuyển sang ${status}`,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/payment - Cập nhật phương thức và trạng thái thanh toán
exports.updatePayment = async (req, res) => {
  try {
    const { paymentMethod, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentMethod, paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật thanh toán thành công",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
