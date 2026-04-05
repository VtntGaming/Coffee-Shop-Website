const mongoose = require("mongoose");

// Schema đơn hàng chính, chứa thông tin thanh toán và trạng thái
const orderSchema = new mongoose.Schema(
  {
    // Mã đơn hàng tự sinh (VD: ORD-20260404-001)
    orderNumber: {
      type: String,
      unique: true,
    },
    // Chi nhánh xử lý đơn
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Chi nhánh là bắt buộc"],
    },
    // Bàn đặt hàng (null nếu mang đi)
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      default: null,
    },
    // Loại đơn: dine-in (tại bàn) hoặc takeaway (mang đi)
    orderType: {
      type: String,
      enum: ["dine-in", "takeaway"],
      default: "dine-in",
    },
    // Danh sách các OrderItem thuộc đơn này
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],
    // Tổng tiền chưa giảm giá
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Voucher áp dụng (nếu có)
    voucher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },
    // Số tiền được giảm
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Tổng tiền sau giảm = subtotal - discountAmount
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "transfer", "momo", "zalopay"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    // Trạng thái đơn hàng theo luồng: pending → confirmed → preparing → ready → completed
    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    // Nhân viên tạo đơn
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Tự tạo mã đơn hàng dạng ORD-YYYYMMDD-XXX trước khi lưu
orderSchema.pre("save", async function () {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Đếm số đơn trong ngày để đánh số thứ tự
    const count = await mongoose.model("Order").countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    });
    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(3, "0")}`;
  }
});

// Index tối ưu cho lọc và thống kê
orderSchema.index({ branch: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
