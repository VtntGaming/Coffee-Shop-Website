/**
 * Model: Ingredient (Nguyên liệu)
 * Lưu thông tin các nguyên liệu dùng trong pha chế / vận hành quán
 * Người 4 - Feature/inventory
 */

const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    // Tên nguyên liệu (phải duy nhất, vd: "Cà phê robusta", "Sữa đặc")
    name: {
      type: String,
      required: [true, 'Tên nguyên liệu là bắt buộc'],
      trim: true,
      unique: true,
      maxlength: [200, 'Tên không quá 200 ký tự'],
    },

    // Đơn vị tính (kg, g, lít, ml, ...)
    unit: {
      type: String,
      required: [true, 'Đơn vị tính là bắt buộc'],
      trim: true,
      enum: {
        values: ['kg', 'g', 'l', 'ml', 'cái', 'gói', 'hộp', 'chai', 'lon', 'túi'],
        message: 'Đơn vị không hợp lệ. Chỉ chấp nhận: kg, g, l, ml, cái, gói, hộp, chai, lon, túi',
      },
    },

    // Mô tả thêm về nguyên liệu (không bắt buộc)
    description: {
      type: String,
      trim: true,
    },

    // Mức tồn kho tối thiểu — nếu tồn kho <= minStock thì cảnh báo "sắp hết"
    minStock: {
      type: Number,
      default: 0,
      min: [0, 'Mức tồn tối thiểu không thể âm'],
    },

    // Trạng thái hoạt động (soft delete: false = đã ẩn / vô hiệu hóa)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Tự động thêm createdAt và updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model('Ingredient', ingredientSchema);
