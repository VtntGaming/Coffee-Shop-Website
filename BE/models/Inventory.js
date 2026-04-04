/**
 * Model: Inventory (Phiếu nhập/xuất/điều chỉnh tồn kho)
 * Mỗi bản ghi là 1 phiếu giao dịch (nhập hàng, xuất hàng, hoặc điều chỉnh số lượng)
 * Tồn kho thực tế được tính bằng: tổng nhập + điều chỉnh - tổng xuất
 * Người 4 - Feature/inventory
 */

const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    // Nguyên liệu liên quan (bắt buộc)
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ingredient',
      required: [true, 'Nguyên liệu là bắt buộc'],
    },

    // Chi nhánh thực hiện giao dịch (bắt buộc)
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Chi nhánh là bắt buộc'],
    },

    // Loại giao dịch:
    //   import  = nhập hàng từ nhà cung cấp
    //   export  = xuất hàng cho pha chế / sử dụng
    //   adjust  = điều chỉnh (kiểm kê, hao hụt, ...)
    type: {
      type: String,
      enum: {
        values: ['import', 'export', 'adjust'],
        message: 'Loại phiếu không hợp lệ. Chấp nhận: import, export, adjust',
      },
      required: [true, 'Loại phiếu là bắt buộc'],
    },

    // Số lượng giao dịch (không âm)
    quantity: {
      type: Number,
      required: [true, 'Số lượng là bắt buộc'],
      min: [0, 'Số lượng không thể âm'],
    },

    // Giá nhập mỗi đơn vị (chỉ áp dụng khi type = 'import')
    unitPrice: {
      type: Number,
      default: 0,
      min: [0, 'Đơn giá không thể âm'],
    },

    // Tổng tiền = quantity * unitPrice (tự tính qua pre-save hook)
    totalPrice: {
      type: Number,
      default: 0,
    },

    // Nhà cung cấp — chỉ điền khi type = 'import'
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },

    // Ghi chú thêm cho phiếu
    note: {
      type: String,
      trim: true,
    },

    // Người tạo phiếu (bắt buộc, lấy từ req.user trong controller)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Người tạo phiếu là bắt buộc'],
    },
  },
  {
    timestamps: true,
  }
);

// ========== PRE-SAVE HOOK ==========
// Tự động tính totalPrice trước khi lưu
inventorySchema.pre('save', function () {
  this.totalPrice = this.quantity * this.unitPrice;
});

// ========== INDEXES ==========
// Tăng tốc query tồn kho theo nguyên liệu + chi nhánh
inventorySchema.index({ ingredient: 1, branch: 1 });
// Query theo loại phiếu trong 1 chi nhánh
inventorySchema.index({ branch: 1, type: 1 });
// Sắp xếp lịch sử theo thời gian giảm dần
inventorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inventory', inventorySchema);
