# 🏪 NGƯỜI 2: CỬA HÀNG (BRANCH + TABLE) - HỌC TẬP

> **Ngày viết**: 4 tháng 4, 2026
> **Dành cho**: Intern mới - Learn as you go!

---

## 📚 MỤC LỤC

1. [Tổng quan](#-tổng-quan)
2. [Files tạo](#-files-tạo)
3. [Cách chạy test](#-cách-chạy-test)
4. [Hiểu code step-by-step](#-hiểu-code-step-by-step)
5. [Common mistakes](#-common-mistakes)
6. [Nếu code không chạy](#-nếu-code-không-chạy)

---

## 📌 Tổng quan

### Code structure

```
BE/
├── models/                    ← Database schemas
│   ├── branch.model.js       (Chi nhánh)
│   └── table.model.js        (Bàn)
│
├── controllers/               ← Business logic (xử lý các hàm)
│   ├── branchController.js
│   └── tableController.js
│
├── routes/                    ← API endpoints
│   ├── branches.js
│   └── tables.js
│
└── server.js                 ← Main app (có import routes ở đây)
```

### API Overview

**Branch (Chi nhánh):**
```
POST   /api/branches              ← Tạo chi nhánh (ADMIN)
GET    /api/branches              ← Lấy tất cả chi nhánh
GET    /api/branches/active       ← Lấy chi nhánh hoạt động (public)
GET    /api/branches/:id          ← Lấy chi nhánh theo ID
PUT    /api/branches/:id          ← Cập nhật chi nhánh (ADMIN)
DELETE /api/branches/:id          ← Xóa chi nhánh (ADMIN)
```

**Table (Bàn):**
```
POST   /api/tables                         ← Tạo bàn (ADMIN)
GET    /api/tables                         ← Lấy tất cả bàn
GET    /api/tables/:id                     ← Lấy bàn theo ID
PUT    /api/tables/:id                     ← Cập nhật bàn (ADMIN)
DELETE /api/tables/:id                     ← Xóa bàn (ADMIN)
GET    /api/tables/branch/:branchId        ← Lấy bàn theo chi nhánh
GET    /api/tables/branch/:branchId/available  ← Lấy bàn trống
PUT    /api/tables/:id/status              ← Cập nhật trạng thái bàn (STAFF)
```

---

## 📁 Files tạo

| File | Dòng | Mô tả |
|------|------|-------|
| `controllers/branchController.js` | 180+ | Logic xử lý chi nhánh |
| `controllers/tableController.js` | 280+ | Logic xử lý bàn |
| `routes/branches.js` | 60+ | Định nghĩa API branch |
| `routes/tables.js` | 100+ | Định nghĩa API table |
| `INTERN_GUIDE.js` | 400+ | Hướng dẫn học tập |
| `API_EXAMPLES.js` | 500+ | Ví dụ request/response |

**Models** (sử dụng từ lớp Người 1):
- ✅ `models/branch.model.js` (có sẵn)
- ✅ `models/table.model.js` (có sẵn)

---

## 🚀 Cách chạy test

### Bước 1: Setup environment
```bash
cd d:/DEMO SANG5/BE

# Cài dependencies (nếu chưa cài)
npm install

# Tạo file .env (nếu chưa có)
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/coffee_shop
# JWT_SECRET=coffee_shop_secret_key_2026
```

### Bước 2: Chạy server
```bash
npm run dev
# Kết quả: 🚀 Server đang chạy tại http://localhost:3000
```

### Bước 3: Test API (dùng Postman)
1. Tạo POST request đến `http://localhost:3000/api/auth/login` để lấy JWT token
2. Dùng token đó trong header `Authorization: Bearer <token>`
3. Test các endpoints Branch & Table

**Xem chi tiết: File `API_EXAMPLES.js`**

---

## 💡 Hiểu code step-by-step

### 1️⃣ Đọc Model trước

**branch.model.js:**
```javascript
const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,           // ← Bắt buộc phải có
    trim: true               // ← Xóa khoảng trắng đầu cuối
  },
  address: String,           // ← Địa chỉ
  phone: String,             // ← Số điện thoại
  openTime: String,          // ← Giờ mở ("07:00")
  closeTime: String,         // ← Giờ đóng ("22:00")
  isActive: Boolean          // ← Đang hoạt động?
})
```

**table.model.js:**
```javascript
const tableSchema = new mongoose.Schema({
  tableNumber: String,       // ← Số bàn ("1", "A1", ...)
  
  branch: {
    type: ObjectId,
    ref: 'Branch'            // ← Liên kết đến Branch model
  },
  
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Reserved']  // ← Chỉ 3 giá trị này
  },
  
  capacity: Number,          // ← Sức chứa (người)
  location: String,          // ← Vị trí ("Tầng 1")
  note: String              // ← Ghi chú
})

// Index: Đảm bảo số bàn duy nhất trong cùng chi nhánh
tableSchema.index({ branch: 1, tableNumber: 1 }, { unique: true });
```

### 2️⃣ Đọc Controller tiếp

**Pattern cơ bản:**
```javascript
exports.createBranch = async (req, res) => {
  try {
    // Bước 1: Lấy dữ liệu từ request
    const { name, address, phone } = req.body;

    // Bước 2: Validate dữ liệu (kiểm tra hợp lệ)
    const existing = await Branch.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Tên đã tồn tại'
      });
    }

    // Bước 3: Lưu vào database
    const branch = await Branch.create({ name, address, phone });

    // Bước 4: Trả về response
    res.status(201).json({
      success: true,
      message: 'Tạo thành công',
      data: branch
    });
  } catch (error) {
    // Bước 5: Xử lý lỗi
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### 3️⃣ Đọc Routes cuối

```javascript
// Middleware chain: auth → authorize('ADMIN') → controller
router.post('/', auth, authorize('ADMIN'), branchController.createBranch);

// Middleware chạy lần lượt:
// 1. auth        → Check token JWT
// 2. authorize   → Check role
// 3. Controller  → Execute function
```

---

## ⚠️ Common mistakes

### ❌ Mistake 1: Route order

❌ **SAI:**
```javascript
router.get('/:id', ...);
router.get('/branch/:branchId', ...);  // Không bao giờ được gọi!
```

✅ **ĐÚNG:**
```javascript
router.get('/branch/:branchId', ...);  // Route cụ thể TRƯỚC
router.get('/:id', ...);               // Route tổng quát SAU
```

### ❌ Mistake 2: Forget middleware

❌ **SAI:**
```javascript
router.post('/', branchController.createBranch);  // Không check quyền!
```

✅ **ĐÚNG:**
```javascript
router.post('/', auth, authorize('ADMIN'), branchController.createBranch);
```

### ❌ Mistake 3: Missing status code

❌ **SAI:**
```javascript
const table = await Table.findById(id);
if (!table) {
  res.json({ success: false, message: 'Not found' });  // Không có status code
}
```

✅ **ĐÚNG:**
```javascript
const table = await Table.findById(id);
if (!table) {
  return res.status(404).json({ success: false, message: 'Not found' });
  //     ↑ return    ↑ status code
}
```

### ❌ Mistake 4: Forgot return statement

❌ **SAI:**
```javascript
if (!table) {
  res.status(404).json({ ... });
}
// Code vẫn chạy tiếp! Gửi 2 response!
res.status(200).json({ data: table });
```

✅ **ĐÚNG:**
```javascript
if (!table) {
  return res.status(404).json({ ... });  // ← return!
}
res.status(200).json({ data: table });
```

### ❌ Mistake 5: Duplicate _id

Mongoose tự động tạo `_id` field, không cần tạo lại!

---

## 🔧 Nếu code không chạy

### 1. Server không start

```bash
# Lỗi: Port 3000 đang được sử dụng
# Cách fix:
# - Đóng process khác dùng port 3000
# - Hoặc đổi PORT=5000 trong .env

# Lỗi: Cannot find module
npm install

# Lỗi: MongoDB connection error
# Cách fix:
# - Chạy MongoDB: mongod
# - Hoặc kiểm tra MONGODB_URI trong .env
```

### 2. API trả về 401 (Unauthorized)

```
Nguyên nhân: Token không hợp lệ hoặc thiếu
Cách fix:
1. Check header Authorization: Bearer <token>
2. Token hết hạn? → Login lại
3. Token format sai? → Phải có "Bearer " prefix
```

### 3. API trả về 403 (Forbidden)

```
Nguyên nhân: Role không đủ quyền
Cách fix:
1. POST /api/auth/login với tài khoản ADMIN
2. Lấy token ADMIN
3. Dùng token đó để test POST /api/branches
```

### 4. Get 400 (Bad Request)

```
Nguyên nhân: Dữ liệu gửi lên không hợp lệ
Cách fix:
1. Check message error: "Tên chi nhánh đã tồn tại"?
2. Xem controller validate logic
3. Gửi dữ liệu đầy đủ theo request body schema
```

### 5. Get 500 (Internal Server Error)

```
Nguyên nhân: Bug trong code
Cách fix:
1. Check server terminal → thấy error gì?
2. Thêm console.log() để debug
3. Xem stack trace error
```

---

## 📖 Tài liệu thêm

- **INTERN_GUIDE.js** → Hướng dẫn chi tiết từng khái niệm
- **API_EXAMPLES.js** → Ví dụ thực tế request/response
- **branchController.js** → Code đầy đủ with comments
- **tableController.js** → Code đầy đủ with comments

---

## 🎓 Các bài học chính

✅ **Middleware & Authentication** → Cách bảo vệ API  
✅ **Database Relationship** → Branch ↔ Table (1-N)  
✅ **CRUD Operations** → Create, Read, Update, Delete  
✅ **Error Handling** → try-catch, status codes  
✅ **Validation** → Kiểm tra dữ liệu hợp lệ  
✅ **RESTful API** → Cách thiết kế API đúng chuẩn  

---

## 🚀 Next steps (Sau khi Người 2 xong)

1. Người 3 làm MENU (Category + Product)
2. Người 4 làm KHO (Ingredient + Supplier + Inventory)
3. Người 5 làm ORDER (Order + Voucher)

---

**Happy coding! 💻**

*Nếu có câu hỏi, hãy đọc file `INTERN_GUIDE.js` trước*
