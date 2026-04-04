const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Số bàn là bắt buộc']
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Chi nhánh là bắt buộc']
  },
  capacity: {
    type: Number,
    required: [true, 'Số chỗ ngồi là bắt buộc'],
    min: [1, 'Bàn phải có ít nhất 1 chỗ'],
    max: [20, 'Bàn không quá 20 chỗ']
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  floor: {
    type: Number,
    default: 1,
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Mỗi số bàn phải unique trong cùng chi nhánh
tableSchema.index({ tableNumber: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
