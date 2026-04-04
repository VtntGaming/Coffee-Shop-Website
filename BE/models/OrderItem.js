const mongoose = require("mongoose");

// Schema chi tiết từng sản phẩm trong đơn hàng (snapshot giá tại lúc đặt)
const orderItemSchema = new mongoose.Schema(
  {
    // Đơn hàng chứa item này
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    // Sản phẩm được đặt
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Sản phẩm là bắt buộc"],
    },
    // Lưu tên SP tại thời điểm đặt (phòng trường hợp SP bị đổi tên sau)
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    // Size đã chọn
    size: {
      type: String,
      enum: ["S", "M", "L"],
      default: "M",
    },
    quantity: {
      type: Number,
      required: [true, "Số lượng là bắt buộc"],
      min: [1, "Số lượng tối thiểu là 1"],
    },
    // Giá đơn vị tại thời điểm đặt (theo size)
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    // Thành tiền = quantity * unitPrice
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Index để truy vấn nhanh các item theo đơn hàng
orderItemSchema.index({ order: 1 });
orderItemSchema.index({ product: 1 });

module.exports = mongoose.model("OrderItem", orderItemSchema);
