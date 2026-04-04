/**
 * Model: Supplier (Nhà cung cấp)
 * Lưu thông tin các nhà cung cấp nguyên liệu cho quán cà phê
 * Người 4 - Feature/inventory
 */

const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    // Tên nhà cung cấp (phải duy nhất)
    name: {
      type: String,
      required: [true, 'Tên nhà cung cấp là bắt buộc'],
      trim: true,
      unique: true,
      maxlength: [200, 'Tên không quá 200 ký tự'],
    },

    // Tên người liên hệ tại nhà cung cấp (không bắt buộc)
    contactPerson: {
      type: String,
      trim: true,
    },

    // Số điện thoại liên hệ (bắt buộc)
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
    },

    // Email liên hệ (không bắt buộc, lưu dạng chữ thường)
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Địa chỉ nhà cung cấp
    address: {
      type: String,
      trim: true,
    },

    // Danh sách các nguyên liệu mà nhà cung cấp này cung cấp
    // Tham chiếu tới model Ingredient
    supplies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingredient',
      },
    ],

    // Trạng thái hoạt động (soft delete)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Supplier', supplierSchema);
