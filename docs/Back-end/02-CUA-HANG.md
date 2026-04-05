# 🏪 NGƯỜI 2: CỬA HÀNG (Branch + Table)

> **Vai trò**: Quản lý chi nhánh quán và bàn trong quán
> **Độ khó**: ⭐⭐
> **Phụ thuộc**: Cần chờ Người 1 hoàn thành Auth middleware

---

## 📁 Các file cần tạo

```
BE/
├── models/
│   ├── Branch.js              # Model chi nhánh
│   └── Table.js               # Model bàn
├── controllers/
│   ├── branchController.js    # Xử lý logic chi nhánh
│   └── tableController.js     # Xử lý logic bàn
├── routes/
│   ├── branches.js            # Routes chi nhánh
│   └── tables.js              # Routes bàn
```

---

## 📋 CÁC BƯỚC THỰC HIỆN

### Bước 1: Đợi Người 1 hoàn thành

Bạn cần đợi Người 1 làm xong:
- ✅ `middlewares/auth.js`
- ✅ `middlewares/role.js`
- ✅ `app.js` (cấu hình cơ bản)

Trong lúc chờ, bạn có thể **viết sẵn Models** trước.

### Bước 2: Pull code mới nhất

```bash
git checkout main
git pull origin main
git checkout -b feature/branch-table
```

---

## 📦 MODELS CHI TIẾT

### Model `Branch.js` - Chi nhánh

```javascript
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
    type: String,    // VD: "07:00"
    default: '07:00'
  },
  closeTime: {
    type: String,    // VD: "22:00"
    default: '22:00'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'      // Quản lý chi nhánh (từ Người 1)
  }
}, {
  timestamps: true
});

// Tự động tạo slug từ name
branchSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  }
  next();
});

module.exports = mongoose.model('Branch', branchSchema);
```

### Model `Table.js` - Bàn

```javascript
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
```

---

## 🎮 CONTROLLERS CHI TIẾT

### `branchController.js`

```javascript
const Branch = require('../models/Branch');

// GET /api/branches - Lấy tất cả chi nhánh
exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ isActive: true })
      .populate('manager', 'fullName email phone');

    res.status(200).json({
      success: true,
      count: branches.length,
      data: branches
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/branches/:id - Lấy 1 chi nhánh
exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('manager', 'fullName email phone');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chi nhánh'
      });
    }

    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/branches - Tạo chi nhánh mới (ADMIN)
exports.createBranch = async (req, res) => {
  try {
    const { name, address, phone, openTime, closeTime, manager } = req.body;

    const branch = await Branch.create({
      name, address, phone, openTime, closeTime, manager
    });

    res.status(201).json({
      success: true,
      message: 'Tạo chi nhánh thành công',
      data: branch
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên chi nhánh đã tồn tại'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/branches/:id - Cập nhật chi nhánh (ADMIN)
exports.updateBranch = async (req, res) => {
  try {
    const { name, address, phone, openTime, closeTime, manager, isActive } = req.body;

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { name, address, phone, openTime, closeTime, manager, isActive },
      { new: true, runValidators: true }
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chi nhánh'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật chi nhánh thành công',
      data: branch
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/branches/:id - Xóa chi nhánh (soft delete, ADMIN)
exports.deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chi nhánh'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa chi nhánh'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### `tableController.js`

```javascript
const Table = require('../models/Table');

// GET /api/tables - Lấy tất cả bàn (có thể filter theo branch)
exports.getAllTables = async (req, res) => {
  try {
    const filter = { isActive: true };

    // Filter theo chi nhánh nếu có query param
    if (req.query.branch) {
      filter.branch = req.query.branch;
    }
    // Filter theo trạng thái
    if (req.query.status) {
      filter.status = req.query.status;
    }
    // Filter theo tầng
    if (req.query.floor) {
      filter.floor = req.query.floor;
    }

    const tables = await Table.find(filter)
      .populate('branch', 'name address')
      .sort({ branch: 1, floor: 1, tableNumber: 1 });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/tables/:id - Lấy 1 bàn
exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id)
      .populate('branch', 'name address');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bàn'
      });
    }

    res.status(200).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/tables - Tạo bàn mới (ADMIN)
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, branch, capacity, status, floor, description } = req.body;

    const table = await Table.create({
      tableNumber, branch, capacity, status, floor, description
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bàn thành công',
      data: table
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Số bàn đã tồn tại trong chi nhánh này'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/tables/:id - Cập nhật bàn
exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status, floor, description, isActive } = req.body;

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { tableNumber, capacity, status, floor, description, isActive },
      { new: true, runValidators: true }
    ).populate('branch', 'name address');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bàn'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật bàn thành công',
      data: table
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/tables/:id/status - Cập nhật trạng thái bàn (nhanh)
exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['available', 'occupied', 'reserved', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chọn: available, occupied, reserved, maintenance'
      });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('branch', 'name');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bàn'
      });
    }

    res.status(200).json({
      success: true,
      message: `Bàn ${table.tableNumber} đã chuyển sang ${status}`,
      data: table
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/tables/:id - Xóa bàn (soft delete, ADMIN)
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bàn'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa bàn'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🛣️ ROUTES CHI TIẾT

### `routes/branches.js`

```javascript
const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branchController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Public: ai cũng xem được danh sách chi nhánh
router.get('/', branchController.getAllBranches);
router.get('/:id', branchController.getBranchById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), branchController.createBranch);
router.put('/:id', auth, authorize('ADMIN'), branchController.updateBranch);
router.delete('/:id', auth, authorize('ADMIN'), branchController.deleteBranch);

module.exports = router;
```

### `routes/tables.js`

```javascript
const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Cần đăng nhập để xem bàn
router.get('/', auth, tableController.getAllTables);
router.get('/:id', auth, tableController.getTableById);

// ADMIN only: tạo, xóa bàn
router.post('/', auth, authorize('ADMIN'), tableController.createTable);
router.delete('/:id', auth, authorize('ADMIN'), tableController.deleteTable);

// ADMIN hoặc STAFF: cập nhật bàn, đổi trạng thái
router.put('/:id', auth, authorize('ADMIN', 'STAFF'), tableController.updateTable);
router.patch('/:id/status', auth, authorize('ADMIN', 'STAFF'), tableController.updateTableStatus);

module.exports = router;
```

---

## 📝 ĐĂNG KÝ ROUTES VÀO `app.js`

Sau khi code xong, nhờ hoặc tự thêm vào `app.js`:

```javascript
// Bỏ comment 2 dòng này trong app.js:
app.use('/api/branches', require('./routes/branches'));
app.use('/api/tables', require('./routes/tables'));
```

---

## 🧪 TEST APIs VỚI POSTMAN

### Chi nhánh

```
# 1. Tạo chi nhánh (cần ADMIN token)
POST http://localhost:3000/api/branches
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Chi nhánh Quận 1",
  "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
  "phone": "0901111111",
  "openTime": "07:00",
  "closeTime": "22:00"
}

# 2. Lấy danh sách chi nhánh
GET http://localhost:3000/api/branches

# 3. Lấy chi tiết 1 chi nhánh
GET http://localhost:3000/api/branches/<branch_id>

# 4. Cập nhật chi nhánh
PUT http://localhost:3000/api/branches/<branch_id>
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Chi nhánh Quận 1 - Updated",
  "closeTime": "23:00"
}

# 5. Xóa chi nhánh
DELETE http://localhost:3000/api/branches/<branch_id>
Authorization: Bearer <admin_token>
```

### Bàn

```
# 1. Tạo bàn (cần ADMIN token)
POST http://localhost:3000/api/tables
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "tableNumber": 1,
  "branch": "<branch_id>",
  "capacity": 4,
  "floor": 1,
  "description": "Bàn cạnh cửa sổ"
}

# 2. Lấy tất cả bàn
GET http://localhost:3000/api/tables
Authorization: Bearer <token>

# 3. Lấy bàn theo chi nhánh
GET http://localhost:3000/api/tables?branch=<branch_id>
Authorization: Bearer <token>

# 4. Lấy bàn trống
GET http://localhost:3000/api/tables?status=available
Authorization: Bearer <token>

# 5. Đổi trạng thái bàn
PATCH http://localhost:3000/api/tables/<table_id>/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "occupied"
}
```

---

## 📊 Giải thích trạng thái bàn

| Status | Ý nghĩa | Khi nào dùng |
|--------|----------|---------------|
| `available` | Trống | Bàn sẵn sàng phục vụ |
| `occupied` | Đang có khách | Khi khách ngồi vào |
| `reserved` | Đã đặt trước | Khi khách đặt bàn |
| `maintenance` | Bảo trì | Bàn hỏng, đang sửa |

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo Model `Branch`
- [ ] Tạo Model `Table`
- [ ] Tạo `branchController.js` (CRUD)
- [ ] Tạo `tableController.js` (CRUD + updateStatus)
- [ ] Tạo routes `branches.js`
- [ ] Tạo routes `tables.js`
- [ ] Đăng ký routes vào `app.js`
- [ ] Test tất cả API bằng Postman
- [ ] Push code lên branch `feature/branch-table`
- [ ] Tạo Pull Request
