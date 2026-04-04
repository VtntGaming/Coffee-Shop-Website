# ☕ COFFEE SHOP MANAGEMENT - HƯỚNG DẪN TỔNG QUAN

## 📌 Giới thiệu dự án

Đây là project **Quản lý quán cà phê** (Coffee Shop Management) sử dụng:

- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Template Engine**: EJS
- **Authentication**: JWT (jsonwebtoken) + bcrypt

---

## 📁 Cấu trúc thư mục Backend (chuẩn MVC)

Mỗi người cần tạo file theo đúng cấu trúc sau trong folder `BE/`:

```
BE/
├── bin/
│   └── www                    # Entry point (đã có sẵn)
├── config/
│   └── db.js                  # Kết nối MongoDB
├── models/                    # Mongoose schemas
│   ├── User.js                # (Người 1)
│   ├── Role.js                # (Người 1)
│   ├── Branch.js              # (Người 2)
│   ├── Table.js               # (Người 2)
│   ├── Category.js            # (Người 3)
│   ├── Product.js             # (Người 3)
│   ├── Ingredient.js          # (Người 4)
│   ├── Supplier.js            # (Người 4)
│   ├── Inventory.js           # (Người 4)
│   ├── Order.js               # (Người 5)
│   ├── OrderItem.js           # (Người 5)
│   └── Voucher.js             # (Người 5)
├── routes/                    # Express routes
│   ├── auth.js                # (Người 1)
│   ├── users.js               # (Người 1)
│   ├── branches.js            # (Người 2)
│   ├── tables.js              # (Người 2)
│   ├── categories.js          # (Người 3)
│   ├── products.js            # (Người 3)
│   ├── ingredients.js         # (Người 4)
│   ├── suppliers.js           # (Người 4)
│   ├── inventory.js           # (Người 4)
│   ├── orders.js              # (Người 5)
│   └── vouchers.js            # (Người 5)
├── controllers/               # Business logic
│   ├── authController.js      # (Người 1)
│   ├── userController.js      # (Người 1)
│   ├── branchController.js    # (Người 2)
│   ├── tableController.js     # (Người 2)
│   ├── categoryController.js  # (Người 3)
│   ├── productController.js   # (Người 3)
│   ├── ingredientController.js# (Người 4)
│   ├── supplierController.js  # (Người 4)
│   ├── inventoryController.js # (Người 4)
│   ├── orderController.js     # (Người 5)
│   └── voucherController.js   # (Người 5)
├── middlewares/
│   ├── auth.js                # (Người 1) - Xác thực JWT
│   ├── role.js                # (Người 1) - Phân quyền ADMIN/STAFF
│   ├── upload.js              # (Người 3) - Multer upload ảnh
│   └── validate.js            # Dùng chung - express-validator
├── uploads/                   # Thư mục chứa ảnh upload
├── utils/
│   └── helpers.js             # Hàm tiện ích dùng chung
├── app.js                     # Express app config
├── package.json
└── .env                       # Biến môi trường (KHÔNG push lên git)
```

---

## 🚀 Hướng dẫn cài đặt & chạy project

### 1. Clone project

```bash
git clone <repo-url>
cd Coffee-Shop-Website/BE
```

### 2. Cài dependencies

```bash
npm install
```

### 3. Tạo file `.env` trong folder `BE/`

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/coffee_shop
JWT_SECRET=coffee_shop_secret_key_2026
JWT_EXPIRES_IN=7d
```

### 4. Tạo file kết nối database `config/db.js`

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

### 5. Chạy project

```bash
npm start
```

Server sẽ chạy tại `http://localhost:3000`

---

## 🔀 Quy trình làm việc với Git

### Quy tắc branch

| Người | Branch name |
|-------|------------|
| Người 1 (Auth+Core) | `feature/auth` |
| Người 2 (Branch+Table) | `feature/branch-table` |
| Người 3 (Menu) | `feature/menu` |
| Người 4 (Kho+NL) | `feature/inventory` |
| Người 5 (Order) | `feature/order` |

### Workflow

```bash
# 1. Lấy code mới nhất từ main
git checkout main
git pull origin main

# 2. Tạo/chuyển sang branch của mình
git checkout -b feature/ten-branch

# 3. Code xong thì commit
git add .
git commit -m "feat: mô tả ngắn"

# 4. Push lên remote
git push origin feature/ten-branch

# 5. Tạo Pull Request trên GitHub để merge vào main
```

### Quy tắc commit message

```
feat: thêm tính năng mới
fix: sửa bug
docs: cập nhật tài liệu
refactor: tái cấu trúc code
```

---

## 👥 Phân công chi tiết

| # | Vai trò | Models | Độ khó | File hướng dẫn |
|---|---------|--------|--------|----------------|
| 1 | 👑 AUTH + CORE | User, Role | ⭐⭐⭐⭐ | `01-AUTH-CORE.md` |
| 2 | 🏪 CỬA HÀNG | Branch, Table | ⭐⭐ | `02-CUA-HANG.md` |
| 3 | 🍹 MENU | Category, Product | ⭐⭐⭐ | `03-MENU.md` |
| 4 | 📦 KHO + NGUYÊN LIỆU | Ingredient, Supplier, Inventory | ⭐⭐⭐ | `04-KHO-NGUYEN-LIEU.md` |
| 5 | 🧾 ORDER | Order, OrderItem, Voucher | ⭐⭐⭐⭐⭐ | `05-ORDER.md` |

---

## 🔗 Sơ đồ phụ thuộc giữa các phần

```
Người 1 (Auth) ──────────────────────────────┐
  │                                           │
  ├── Middleware auth + role ──> TẤT CẢ đều dùng
  │                                           │
Người 2 (Branch+Table) ──┐                   │
  │                       │                   │
Người 3 (Menu) ──────────┤                   │
  │                       ├──> Người 5 (Order) cần dùng
Người 4 (Kho+NL) ────────┘                   │
                                              │
```

**Thứ tự triển khai khuyến nghị:**

1. ✅ **Người 1** làm xong Auth + Middleware TRƯỚC (cả team chờ)
2. ✅ **Người 2, 3, 4** làm SONG SONG sau khi có Auth
3. ✅ **Người 5** bắt đầu sau khi Người 2 + 3 xong cơ bản

---

## 📋 Quy chuẩn API Response

Tất cả API nên trả về theo format thống nhất:

### Thành công

```json
{
  "success": true,
  "message": "Mô tả kết quả",
  "data": { ... }
}
```

### Lỗi

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "error": "Chi tiết lỗi (chỉ hiện ở dev)"
}
```

---

## 📋 Quy chuẩn HTTP Status Code

| Code | Ý nghĩa |
|------|----------|
| 200 | OK - Thành công |
| 201 | Created - Tạo mới thành công |
| 400 | Bad Request - Dữ liệu gửi lên sai |
| 401 | Unauthorized - Chưa đăng nhập |
| 403 | Forbidden - Không có quyền |
| 404 | Not Found - Không tìm thấy |
| 500 | Internal Server Error - Lỗi server |

---

## 🧪 Test API

Sử dụng **Postman** hoặc **Thunder Client** (extension VS Code) để test API.

Mỗi người tạo 1 collection riêng trong Postman theo tên module của mình.

---

## ⚠️ Lưu ý quan trọng

1. **KHÔNG push file `.env`** lên git (đã có trong `.gitignore`)
2. **KHÔNG push `node_modules/`** lên git
3. Mỗi người chỉ sửa file trong phạm vi của mình
4. Nếu cần sửa file chung (`app.js`), báo cho team trước
5. Luôn `git pull` trước khi code
6. Đặt tên biến, hàm bằng **tiếng Anh**, comment có thể bằng tiếng Việt
