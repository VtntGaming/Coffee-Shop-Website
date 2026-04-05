const mongoose = require("mongoose");

// Schema quản lý mã giảm giá (voucher) cho đơn hàng
const voucherSchema = new mongoose.Schema(
  {
    // Mã voucher duy nhất, tự động viết hoa (VD: GIAM20, SALE50)
    code: {
      type: String,
      required: [true, "Mã voucher là bắt buộc"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // Loại giảm: percentage (%) hoặc fixed (số tiền cố định)
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Loại giảm giá là bắt buộc"],
    },
    // Giá trị giảm (VD: 20 = giảm 20% hoặc 30000 = giảm 30k)
    discountValue: {
      type: Number,
      required: [true, "Giá trị giảm là bắt buộc"],
      min: [0, "Giá trị không thể âm"],
    },
    // Giảm tối đa (dùng cho percentage, VD: giảm 20% nhưng tối đa 50k)
    maxDiscount: {
      type: Number,
      default: null,
    },
    // Đơn hàng tối thiểu để áp dụng voucher
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: [true, "Ngày bắt đầu là bắt buộc"],
    },
    endDate: {
      type: Date,
      required: [true, "Ngày kết thúc là bắt buộc"],
    },
    // Giới hạn số lần sử dụng (null = không giới hạn)
    usageLimit: {
      type: Number,
      default: null,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Kiểm tra voucher còn hiệu lực không (active, chưa hết hạn, còn lượt)
voucherSchema.methods.isValid = function () {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: "Voucher đã bị vô hiệu hóa" };
  if (now < this.startDate) return { valid: false, reason: "Voucher chưa đến ngày sử dụng" };
  if (now > this.endDate) return { valid: false, reason: "Voucher đã hết hạn" };
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: "Voucher đã hết lượt sử dụng" };
  }
  return { valid: true };
};

// Tính số tiền giảm dựa trên tổng đơn hàng, trả về { discount, reason }
voucherSchema.methods.calculateDiscount = function (orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return { discount: 0, reason: `Đơn hàng tối thiểu ${this.minOrderAmount.toLocaleString("vi-VN")}đ` };
  }

  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    discount = this.discountValue;
  }

  // Không giảm quá tổng đơn hàng
  if (discount > orderAmount) discount = orderAmount;

  return { discount, reason: null };
};

module.exports = mongoose.model("Voucher", voucherSchema);
