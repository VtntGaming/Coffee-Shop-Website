# Coffee Shop Website - Backend Documentation

## Mục lục
1. [Tổng quan](#tổng-quan)
2. [Cấu trúc dự án](#cấu-trúc-dự-án)
3. [Công nghệ sử dụng](#công-nghệ-sử-dụng)
4. [Cấu trúc Database (MongoDB)](#cấu-trúc-database-mongodb)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [Cách chạy dự án](#cách-chạy-dự-án)
8. [Quy trình làm việc nhóm](#quy-trình-làm-việc-nhóm)
9. [Các tính năng chính](#các-tính-năng-chính)

---

## Tổng quan

Dự án **Coffee Shop Website** là hệ thống quản lý quán cà phê bao gồm:
- **Frontend**: Giao diện người dùng (web)
- **Backend**: API xử lý logic, kết nối database
- **Database**: MongoDB lưu trữ dữ liệu

---

## Cấu trúc dự án

```
Coffee-Shop-Website/
│
├── BE/                          # Backend (Node.js + Express)
│   ├── config/
│   │   └── db.js               # Kết nối MongoDB
│   │
│   ├── controllers/             # Xử lý logic cho từng route
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── user.controller.js
│   │   ├── category.controller.js
│   │   ├── branch.controller.js
│   │   ├── table.controller.js
│   │   ├── voucher.controller.js
│   │   ├── inventory.controller.js
│   │   ├── ingredient.controller.js
│   │   └── supplier.controller.js
│   │
│   ├── models/                 # Schema Database (MongoDB)
│   │   ├── index.js            # Export tất cả models
│   │   ├── user.model.js       # Người dùng
│   │   ├── role.model.js      # Vai trò
│   │   ├── product.model.js    # Sản phẩm
│   │   ├── category.model.js  # Danh mục
│   │   ├── order.model.js     # Đơn hàng
│   │   ├── orderItem.model.js # Chi tiết đơn hàng
│   │   ├── branch.model.js    # Chi nhánh
│   │   ├── table.model.js     # Bàn
│   │   ├── voucher.model.js   # Mã giảm giá
│   │   ├── ingredient.model.js # Nguyên liệu
│   │   ├── inventory.model.js # Tồn kho
│   │   └── supplier.model.js  # Nhà cung cấp
│   │
│   ├── routes/                 # Định nghĩa API endpoints
│   │   ├── index.js           # Router chính
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── branch.routes.js
│   │   ├── table.routes.js
│   │   ├── voucher.routes.js
│   │   ├── inventory.routes.js
│   │   ├── ingredient.routes.js
│   │   └── supplier.routes.js
│   │
│   ├── middlewares/            # Middleware xử lý
│   │   ├── auth.middleware.js  # Kiểm tra đăng nhập
│   │   ├── role.middleware.js  # Kiểm tra quyền
│   │   ├── upload.middleware.js # Upload file
│   │   └── error.middleware.js # Xử lý lỗi
│   │
│   ├── utils/                  # Hàm tiện ích
│   │   ├── jwt.util.js         # Tạo/verify JWT token
│   │   ├── bcrypt.util.js      # Mã hóa password
│   │   ├── email.util.js       # Gửi email
│   │   └── validation.util.js  # Validation helpers
│   │
│   ├── validators/             # Validation cho request
│   │   ├── auth.validator.js
│   │   ├── product.validator.js
│   │   └── order.validator.js
│   │
│   ├── .env                    # Biến môi trường
│   ├── server.js               # Entry point
│   └── package.json
│
├── FE/                          # Frontend (React/Vue)
│   └── ...
│
├── docs/                         # Tài liệu
│   └── PROJECT_FLOW.md
│
└── README.md
```

---

## Công nghệ sử dụng

### Backend
| Công nghệ | Mục đích |
|-----------|----------|
| **Node.js** | Runtime JavaScript |
| **Express.js** | Framework Web API |
| **Mongoose** | ODM cho MongoDB |
| **MongoDB** | Database |

### Authentication & Security
| Công nghệ | Mục đích |
|-----------|----------|
| **JWT** | Xác thực người dùng |
| **bcrypt** | Mã hóa password |
| **express-validator** | Validation input |

### Utilities
| Công nghệ | Mục đích |
|-----------|----------|
| **nodemailer** | Gửi email |
| **multer** | Upload file |
| **exceljs** | Xuất Excel |
| **slugify** | Tạo URL-friendly slug |
| **cors** | Cho phép Cross-Origin |

---

## Cấu trúc Database (MongoDB)

### 1. User - Người dùng
```javascript
{
  _id: ObjectId,
  name: String,              // Họ tên
  email: String,             // Email (unique)
  password: String,           // Password (đã mã hóa)
  phone: String,              // Số điện thoại
  avatar: String,            // URL ảnh đại diện
  address: String,            // Địa chỉ
  role: ObjectId,             // Tham chiếu Role
  branch: ObjectId,           // Chi nhánh (nếu là nhân viên)
  isActive: Boolean,          // Trạng thái hoạt động
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Role - Vai trò
```javascript
{
  _id: ObjectId,
  name: String,              // Tên vai trò (Admin, Staff, Customer)
  permissions: [String],      // Danh sách quyền
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Product - Sản phẩm
```javascript
{
  _id: ObjectId,
  name: String,              // Tên sản phẩm
  slug: String,               // URL-friendly slug
  description: String,        // Mô tả
  price: Number,              // Giá bán
  cost: Number,               // Giá vốn
  image: String,              // URL ảnh
  category: ObjectId,         // Tham chiếu Category
  isAvailable: Boolean,       // Còn hàng không
  isFeatured: Boolean,       // Sản phẩm nổi bật
  ingredients: [{
    ingredient: ObjectId,    // Nguyên liệu
    quantity: Number          // Số lượng cần dùng
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Category - Danh mục
```javascript
{
  _id: ObjectId,
  name: String,              // Tên danh mục
  slug: String,              // URL-friendly slug
  description: String,       // Mô tả
  image: String,             // Ảnh danh mục
  parentCategory: ObjectId,  // Danh mục cha (nullable)
  isActive: Boolean,         // Trạng thái
  sortOrder: Number,         // Thứ tự sắp xếp
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Order - Đơn hàng
```javascript
{
  _id: ObjectId,
  orderNumber: String,       // Mã đơn hàng (auto-generated)
  customer: ObjectId,         // Tham chiếu User (khách hàng)
  branch: ObjectId,            // Chi nhánh
  table: ObjectId,             // Bàn (nếu có)
  items: [{
    product: ObjectId,        // Sản phẩm
    quantity: Number,
    price: Number,             // Giá tại thời điểm đặt
    toppings: [String],        // Topping thêm
    notes: String              // Ghi chú
  }],
  subtotal: Number,           // Tổng phụ
  discount: Number,           // Giảm giá
  voucher: ObjectId,          // Mã voucher (nếu có)
  total: Number,              // Tổng cộng
  paymentMethod: String,      // Phương thức thanh toán
  paymentStatus: String,      // Trạng thái thanh toán
  orderStatus: String,        // Trạng thái đơn hàng
  notes: String,              // Ghi chú
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Branch - Chi nhánh
```javascript
{
  _id: ObjectId,
  name: String,              // Tên chi nhánh
  address: String,           // Địa chỉ
  phone: String,             // Số điện thoại
  image: String,             // Ảnh chi nhánh
  openingHours: {
    open: String,            // Giờ mở cửa
    close: String            // Giờ đóng cửa
  },
  isActive: Boolean,         // Trạng thái hoạt động
  location: {
    type: "Point",
    coordinates: [Number]    // [longitude, latitude]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Table - Bàn
```javascript
{
  _id: ObjectId,
  number: String,            // Số bàn
  branch: ObjectId,           // Chi nhánh
  capacity: Number,           // Số người tối đa
  status: String,            // Trạng thái (available, occupied, reserved)
  createdAt: Date,
  updatedAt: Date
}
```

### 8. Voucher - Mã giảm giá
```javascript
{
  _id: ObjectId,
  code: String,               // Mã voucher (unique)
  type: String,               // Loại: 'percentage', 'fixed'
  value: Number,             // Giá trị giảm
  minOrderValue: Number,     // Đơn hàng tối thiểu
  maxDiscount: Number,       // Giảm tối đa
  usageLimit: Number,       // Số lần sử dụng tối đa
  usedCount: Number,         // Số lần đã sử dụng
  validFrom: Date,           // Ngày bắt đầu
  validTo: Date,             // Ngày kết thúc
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Ingredient - Nguyên liệu
```javascript
{
  _id: ObjectId,
  name: String,              // Tên nguyên liệu
  unit: String,              // Đơn vị (kg, lít, cái)
  supplier: ObjectId,         // Nhà cung cấp
  createdAt: Date,
  updatedAt: Date
}
```

### 10. Inventory - Tồn kho
```javascript
{
  _id: ObjectId,
  ingredient: ObjectId,       // Nguyên liệu
  branch: ObjectId,           // Chi nhánh
  quantity: Number,           // Số lượng tồn
  minQuantity: Number,        // Số lượng tối thiểu
  maxQuantity: Number,        // Số lượng tối đa
  lastRestocked: Date,        // Ngày nhập kho gần nhất
  createdAt: Date,
  updatedAt: Date
}
```

### 11. Supplier - Nhà cung cấp
```javascript
{
  _id: ObjectId,
  name: String,              // Tên nhà cung cấp
  contactPerson: String,     // Người liên hệ
  phone: String,            // Số điện thoại
  email: String,            // Email
  address: String,          // Địa chỉ
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| POST | `/api/auth/logout` | Đăng xuất |
| POST | `/api/auth/refresh-token` | Làm mới token |
| POST | `/api/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

### Users
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/users` | Lấy danh sách users (Admin) |
| GET | `/api/users/:id` | Lấy thông tin user |
| POST | `/api/users` | Tạo user mới (Admin) |
| PUT | `/api/users/:id` | Cập nhật user |
| DELETE | `/api/users/:id` | Xóa user (Admin) |

### Products
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/products` | Lấy danh sách sản phẩm |
| GET | `/api/products/:id` | Lấy chi tiết sản phẩm |
| GET | `/api/products/slug/:slug` | Lấy theo slug |
| POST | `/api/products` | Tạo sản phẩm (Admin) |
| PUT | `/api/products/:id` | Cập nhật sản phẩm (Admin) |
| DELETE | `/api/products/:id` | Xóa sản phẩm (Admin) |
| GET | `/api/products/featured` | Sản phẩm nổi bật |

### Categories
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/categories` | Lấy danh sách danh mục |
| GET | `/api/categories/:id` | Lấy chi tiết danh mục |
| POST | `/api/categories` | Tạo danh mục (Admin) |
| PUT | `/api/categories/:id` | Cập nhật danh mục (Admin) |
| DELETE | `/api/categories/:id` | Xóa danh mục (Admin) |

### Orders
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/orders` | Lấy danh sách đơn hàng |
| GET | `/api/orders/:id` | Lấy chi tiết đơn hàng |
| POST | `/api/orders` | Tạo đơn hàng mới |
| PUT | `/api/orders/:id` | Cập nhật đơn hàng |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái (Staff) |
| DELETE | `/api/orders/:id` | Hủy đơn hàng |
| GET | `/api/orders/user/:userId` | Đơn hàng của user |

### Branches
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/branches` | Lấy danh sách chi nhánh |
| GET | `/api/branches/:id` | Lấy chi tiết chi nhánh |
| POST | `/api/branches` | Tạo chi nhánh (Admin) |
| PUT | `/api/branches/:id` | Cập nhật chi nhánh (Admin) |
| DELETE | `/api/branches/:id` | Xóa chi nhánh (Admin) |

### Tables
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/tables` | Lấy danh sách bàn |
| GET | `/api/tables/:id` | Lấy chi tiết bàn |
| POST | `/api/tables` | Tạo bàn (Admin) |
| PUT | `/api/tables/:id` | Cập nhật bàn |
| DELETE | `/api/tables/:id` | Xóa bàn (Admin) |
| PUT | `/api/tables/:id/status` | Cập nhật trạng thái bàn |

### Vouchers
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/vouchers` | Lấy danh sách voucher |
| GET | `/api/vouchers/:id` | Lấy chi tiết voucher |
| GET | `/api/vouchers/code/:code` | Tìm theo mã |
| POST | `/api/vouchers` | Tạo voucher (Admin) |
| PUT | `/api/vouchers/:id` | Cập nhật voucher (Admin) |
| DELETE | `/api/vouchers/:id` | Xóa voucher (Admin) |

### Inventory
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/inventory` | Lấy danh sách tồn kho |
| GET | `/api/inventory/low-stock` | Nguyên liệu sắp hết |
| POST | `/api/inventory` | Nhập kho (Admin) |
| PUT | `/api/inventory/:id` | Cập nhật tồn kho |
| GET | `/api/inventory/branch/:branchId` | Tồn kho theo chi nhánh |

---

## Authentication & Authorization

### JWT Token Flow
```
1. User đăng nhập → Server tạo Access Token + Refresh Token
2. Access Token gửi về client (lưu trong memory/state)
3. Refresh Token gửi về client (lưu trong HTTP-only cookie)
4. Request API → Gửi Access Token trong Header
5. Access Token hết hạn → Dùng Refresh Token lấy token mới
```

### User Roles
| Role | Permissions |
|------|-------------|
| **Customer** | Xem sản phẩm, đặt hàng, xem đơn hàng |
| **Staff** | Quản lý đơn hàng, quản lý bàn |
| **Admin** | Toàn quyền |

### Protected Routes
```javascript
// Middleware kiểm tra đăng nhập
const auth = require("./middlewares/auth.middleware");

// Routes yêu cầu đăng nhập
router.get("/profile", auth, userController.getProfile);

// Routes yêu cầu quyền Admin
router.delete("/users/:id", auth, requireRole("Admin"), userController.delete);
```

---

## Cách chạy dự án

### 1. Cài đặt dependencies
```bash
cd BE
npm install
```

### 2. Cấu hình Environment
Tạo file `.env` trong folder `BE`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/coffeeshop
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/coffeeshop

# JWT
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Frontend URL (cho CORS)
FRONTEND_URL=http://localhost:3000

# Email (cho nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Chạy server
```bash
# Development (auto-restart khi code thay đổi)
npm run dev

# Production
npm start
```

### 4. Kiểm tra
Truy cập: http://localhost:5000

---

## Quy trình làm việc nhóm

### 1. Git Branching Strategy
```
main (code ổn định, release)
   │
   ├── develop (tích hợp các feature)
   │   │
   │   ├── feature/user-auth
   │   ├── feature/product-management
   │   ├── feature/order-system
   │   └── ...
   │
   └── hotfix/fix-bug
```

### 2. Phân công Model
| Người phụ trách | Models | Chức năng |
|----------------|--------|-----------|
| Linh | Branch, Table | Quản lý chi nhánh, bàn |
| Minh | Order, OrderItem | Hệ thống đặt hàng |
| Vân | Voucher | Mã giảm giá |
| Hùng | Inventory, Ingredient, Supplier | Quản lý kho |
| Leader | User, Role, Auth | Hệ thống user + auth |

### 3. Quy trình commit
```bash
# Tạo branch cho feature mới
git checkout -b feature/your-name-model

# Code xong, commit
git add .
git commit -m "feat: add branch and table models"

# Push lên remote
git push origin feature/your-name-model

# Tạo Pull Request để review và merge
```

---

## Các tính năng chính

### 🛒 Đặt hàng
- Đặt hàng tại quầy (Order tại chỗ)
- Đặt hàng mang đi
- Áp dụng mã giảm giá
- Thanh toán online/offline

### 📦 Quản lý sản phẩm
- CRUD sản phẩm
- Phân loại theo danh mục
- Sản phẩm nổi bật
- Topping/Size options

### 🏪 Quản lý chi nhánh
- Nhiều chi nhánh
- Xem vị trí trên bản đồ
- Giờ mở/đóng cửa

### 🪑 Quản lý bàn
- Đặt bàn trước
- Trạng thái bàn (trống/đã đặt/đang sử dụng)
- Tính số khách

### 📊 Quản lý kho
- Theo dõi nguyên liệu
- Cảnh báo sắp hết hàng
- Nhập kho từ nhà cung cấp

### 🎫 Mã giảm giá
- Giảm theo % hoặc số tiền
- Giới hạn số lần sử dụng
- Giới hạn đơn hàng tối thiểu

### 👥 Phân quyền
- Admin: Toàn quyền
- Staff: Quản lý đơn hàng, bàn
- Customer: Đặt hàng, xem profile

---

## Error Response Format

```javascript
// Thành công
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}

// Thất bại
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email không hợp lệ",
    "details": [...]
  }
}

// Phân trang
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Liên hệ

Nếu có thắc mắc về dự án, vui lòng tạo Issue trên GitHub hoặc liên hệ trực tiếp với team members.
