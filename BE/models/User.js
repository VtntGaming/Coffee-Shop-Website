const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Tạo schema cho người dùng
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Họ tên là bắt buộc'],
    trim: true,
    minlength: [2, 'Họ tên phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Họ tên không quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ']
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'Vai trò là bắt buộc']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password trước khi save
// Lưu ý: Mongoose 8+ với async middleware KHÔNG dùng next() — chỉ return hoặc await
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// So sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Xuất model User
module.exports = mongoose.model('User', userSchema);
