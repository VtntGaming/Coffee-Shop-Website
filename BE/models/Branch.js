const mongoose = require('mongoose');
const slugify = require('slugify');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên chi nhánh là bắt buộc'],
    trim: true,
    unique: true,
    maxlength: [200, 'Tên chi nhánh không quá 200 ký tự']
  },
  slug: {
    type: String,
    unique: true
  },
  address: {
    type: String,
    required: [true, 'Địa chỉ là bắt buộc'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ']
  },
  openTime: {
    type: String,
    default: '07:00'
  },
  closeTime: {
    type: String,
    default: '22:00'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

branchSchema.pre('save', async function() {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  }
});

module.exports = mongoose.model('Branch', branchSchema);
