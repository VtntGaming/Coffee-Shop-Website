const mongoose = require('mongoose');

// Tạo schema cho vai trò
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên vai trò là bắt buộc'],
    unique: true,
    enum: ['ADMIN', 'STAFF'],
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Xuất model Role
module.exports = mongoose.model('Role', roleSchema);
