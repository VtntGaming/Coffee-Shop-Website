const mongoose = require('mongoose');

// Đây là Model tạo tạm cho Người 2 để Người 4 có thể test được API có chứa `.populate('branch')`
// Người 2 sau này có thể vào đây viết đè thêm các field khác (address, phone, v.v...)
const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên chi nhánh là bắt buộc']
  }
});

module.exports = mongoose.model('Branch', branchSchema);
