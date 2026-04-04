# 👑 NGƯỜI 1: AUTH + CORE (NỀN TẢNG)

> **Vai trò**: Xây dựng hệ thống xác thực (Authentication) và phân quyền (Authorization)
> **Độ khó**: ⭐⭐⭐⭐
> **Ưu tiên**: 🔴 LÀM TRƯỚC TIÊN - Cả team phụ thuộc vào phần này

---

## 📁 Các file cần tạo

```
BE/
├── config/
│   └── db.js                    # Kết nối MongoDB
├── models/
│   ├── User.js                  # Model người dùng
│   └── Role.js                  # Model vai trò
├── controllers/
│   ├── authController.js        # Xử lý đăng ký, đăng nhập
│   └── userController.js        # CRUD user (admin)
├── routes/
│   ├── auth.js                  # Routes đăng ký, đăng nhập
│   └── users.js                 # Routes quản lý user
├── middlewares/
│   ├── auth.js                  # Middleware xác thực JWT
│   └── role.js                  # Middleware phân quyền
└── app.js                       # Cấu hình Express app
```

---

## 📋 CÁC BƯỚC THỰC HIỆN

### Bước 1: Tạo cấu trúc thư mục

```bash
cd BE
mkdir config models controllers routes middlewares utils uploads
```

### Bước 2: Cấu hình kết nối MongoDB (`config/db.js`)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Bước 3: Tạo file `.env`

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/coffee_shop
JWT_SECRET=coffee_shop_secret_key_2026
JWT_EXPIRES_IN=7d
```

### Bước 4: Cấu hình `app.js`

```javascript
require('dotenv').config(); // Nếu dùng dotenv, cần npm install dotenv
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDB = require('./config/db');

// Kết nối DB
connectDB();

const app = express();

// Middleware cơ bản
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes - Thêm dần khi mỗi người hoàn thành
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
// app.use('/api/branches', require('./routes/branches'));   // Người 2
// app.use('/api/tables', require('./routes/tables'));       // Người 2
// app.use('/api/categories', require('./routes/categories'));// Người 3
// app.use('/api/products', require('./routes/products'));   // Người 3
// app.use('/api/ingredients', require('./routes/ingredients'));// Người 4
// app.use('/api/suppliers', require('./routes/suppliers')); // Người 4
// app.use('/api/inventory', require('./routes/inventory')); // Người 4
// app.use('/api/orders', require('./routes/orders'));       // Người 5
// app.use('/api/vouchers', require('./routes/vouchers'));   // Người 5

// Xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
```

---

## 📦 MODELS CHI TIẾT

### Model `Role.js`

```javascript
const mongoose = require('mongoose');

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

module.exports = mongoose.model('Role', roleSchema);
```

### Model `User.js`

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
    select: false // Không trả về password khi query
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(0[3|5|7|8|9])+([0-9]{8})$/, 'Số điện thoại không hợp lệ']
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch' // Liên kết với chi nhánh (Người 2 tạo)
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password trước khi save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

---

## 🔐 MIDDLEWARES CHI TIẾT

### Middleware `auth.js` - Xác thực JWT

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập. Vui lòng cung cấp token.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user từ token
    const user = await User.findById(decoded.id).populate('role');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ hoặc tài khoản đã bị vô hiệu hóa.'
      });
    }

    // Gắn user vào request để các route sau dùng
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token đã hết hạn' });
    }
    return res.status(500).json({ success: false, message: 'Lỗi xác thực' });
  }
};

module.exports = auth;
```

### Middleware `role.js` - Phân quyền

```javascript
/**
 * Middleware kiểm tra quyền truy cập theo role
 * Sử dụng: authorize('ADMIN') hoặc authorize('ADMIN', 'STAFF')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user đã được gắn từ middleware auth
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: `Role "${req.user.role.name}" không có quyền thực hiện hành động này`
      });
    }

    next();
  };
};

module.exports = authorize;
```

---

## 🎮 CONTROLLERS CHI TIẾT

### `authController.js`

```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Lấy role STAFF làm mặc định
    let staffRole = await Role.findOne({ name: 'STAFF' });
    if (!staffRole) {
      // Tự tạo role nếu chưa có (chạy lần đầu)
      staffRole = await Role.create({ name: 'STAFF', description: 'Nhân viên' });
    }

    // Tạo user mới
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: staffRole._id
    });

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: staffRole.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng ký',
      error: error.message
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user (bao gồm password vì select: false)
    const user = await User.findOne({ email })
      .select('+password')
      .populate('role');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra tài khoản active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // So sánh password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    });
  }
};

// GET /api/auth/me - Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role').populate('branch');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin',
      error: error.message
    });
  }
};
```

### `userController.js`

```javascript
const User = require('../models/User');
const Role = require('../models/Role');

// GET /api/users - Lấy danh sách users (ADMIN only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('role')
      .populate('branch')
      .select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id - Lấy thông tin 1 user
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role')
      .populate('branch');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/:id - Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const { fullName, phone, role, branch, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, role, branch, isActive },
      { new: true, runValidators: true }
    ).populate('role').populate('branch');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/users/:id - Xóa user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa user'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🛣️ ROUTES CHI TIẾT

### `routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (cần đăng nhập)
router.get('/me', auth, authController.getMe);

module.exports = router;
```

### `routes/users.js`

```javascript
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Tất cả routes phải đăng nhập + là ADMIN
router.use(auth);
router.use(authorize('ADMIN'));

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
```

---

## 🧪 TEST APIs VỚI POSTMAN

### 1. Đăng ký

```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyen Van A",
  "email": "admin@coffee.com",
  "password": "123456",
  "phone": "0901234567"
}
```

### 2. Đăng nhập

```
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@coffee.com",
  "password": "123456"
}
```

### 3. Lấy thông tin cá nhân (cần token)

```
GET http://localhost:3000/api/auth/me
Authorization: Bearer <token_nhận_được_từ_login>
```

### 4. Danh sách users (cần ADMIN)

```
GET http://localhost:3000/api/users
Authorization: Bearer <admin_token>
```

---

## 🌱 Tạo dữ liệu ban đầu (Seed Data)

Tạo file `seed.js` để khởi tạo Role và Admin đầu tiên:

```javascript
// seed.js - Chạy: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Role = require('./models/Role');
const User = require('./models/User');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Tạo Roles
    const adminRole = await Role.findOneAndUpdate(
      { name: 'ADMIN' },
      { name: 'ADMIN', description: 'Quản trị viên' },
      { upsert: true, new: true }
    );

    const staffRole = await Role.findOneAndUpdate(
      { name: 'STAFF' },
      { name: 'STAFF', description: 'Nhân viên' },
      { upsert: true, new: true }
    );

    console.log('✅ Roles created:', adminRole.name, staffRole.name);

    // Tạo Admin user
    const existingAdmin = await User.findOne({ email: 'admin@coffee.com' });
    if (!existingAdmin) {
      await User.create({
        fullName: 'Admin',
        email: 'admin@coffee.com',
        password: '123456',
        phone: '0901234567',
        role: adminRole._id
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    mongoose.disconnect();
    console.log('✅ Seed completed');
  } catch (error) {
    console.error('❌ Seed error:', error);
    mongoose.disconnect();
  }
};

seedDB();
```

---

## 📌 CÁCH OTHER MEMBERS SỬ DỤNG AUTH CỦA BẠN

Hướng dẫn cho các thành viên khác sử dụng middleware:

```javascript
// Trong routes của người khác, import middleware:
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Route ai cũng truy cập được (sau khi đăng nhập)
router.get('/products', auth, productController.getAll);

// Route chỉ ADMIN mới được truy cập
router.post('/products', auth, authorize('ADMIN'), productController.create);

// Route ADMIN hoặc STAFF đều được
router.get('/orders', auth, authorize('ADMIN', 'STAFF'), orderController.getAll);
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo cấu trúc thư mục đầy đủ
- [ ] Tạo file `.env`
- [ ] Tạo `config/db.js`
- [ ] Cấu hình `app.js`
- [ ] Tạo Model `Role`
- [ ] Tạo Model `User`
- [ ] Tạo Middleware `auth.js` (JWT)
- [ ] Tạo Middleware `role.js` (authorize)
- [ ] Tạo `authController.js` (register, login, getMe)
- [ ] Tạo `userController.js` (CRUD users)
- [ ] Tạo routes `auth.js` + `users.js`
- [ ] Tạo `seed.js` để khởi tạo dữ liệu
- [ ] Test tất cả API bằng Postman
- [ ] Push code lên branch `feature/auth`
- [ ] Thông báo cho team biết auth đã xong
