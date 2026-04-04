# 📦 NGƯỜI 4: KHO + NGUYÊN LIỆU (Ingredient, Supplier, Inventory)

> **Vai trò**: Quản lý nguyên liệu, nhà cung cấp, và tồn kho theo chi nhánh
> **Độ khó**: ⭐⭐⭐
> **Phụ thuộc**: Cần Người 1 (Auth) + Người 2 (Branch) hoàn thành

---

## 📁 Các file cần tạo

```
BE/
├── models/
│   ├── Ingredient.js          # Model nguyên liệu
│   ├── Supplier.js            # Model nhà cung cấp
│   └── Inventory.js           # Model tồn kho (theo chi nhánh)
├── controllers/
│   ├── ingredientController.js
│   ├── supplierController.js
│   └── inventoryController.js
├── routes/
│   ├── ingredients.js
│   ├── suppliers.js
│   └── inventory.js
```

---

## 📋 CÁC BƯỚC THỰC HIỆN

### Bước 1: Pull code & tạo branch

```bash
git checkout main
git pull origin main
git checkout -b feature/inventory
```

### Bước 2: Viết Models trước (không phụ thuộc)

Bạn có thể viết sẵn Models trong lúc chờ Người 1 và Người 2.

---

## 📦 MODELS CHI TIẾT

### Model `Ingredient.js` - Nguyên liệu

```javascript
const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên nguyên liệu là bắt buộc'],
    trim: true,
    unique: true,
    maxlength: [200, 'Tên không quá 200 ký tự']
  },
  unit: {
    type: String,
    required: [true, 'Đơn vị tính là bắt buộc'],
    trim: true,
    enum: ['kg', 'g', 'l', 'ml', 'cái', 'gói', 'hộp', 'chai', 'lon', 'túi']
  },
  description: {
    type: String,
    trim: true
  },
  minStock: {
    type: Number,
    default: 0,
    min: 0
    // Mức tồn kho tối thiểu để cảnh báo
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ingredient', ingredientSchema);
```

### Model `Supplier.js` - Nhà cung cấp

```javascript
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên nhà cung cấp là bắt buộc'],
    trim: true,
    unique: true,
    maxlength: [200, 'Tên không quá 200 ký tự']
  },
  contactPerson: {
    type: String,
    trim: true
    // Tên người liên hệ
  },
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    trim: true
  },
  supplies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
    // Danh sách nguyên liệu mà NCC này cung cấp
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
```

### Model `Inventory.js` - Tồn kho / Phiếu nhập

```javascript
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: [true, 'Nguyên liệu là bắt buộc']
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Chi nhánh là bắt buộc']
  },
  type: {
    type: String,
    enum: ['import', 'export', 'adjust'],
    required: [true, 'Loại phiếu là bắt buộc']
    // import: nhập hàng, export: xuất hàng, adjust: điều chỉnh
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [0, 'Số lượng không thể âm']
  },
  unitPrice: {
    type: Number,
    default: 0,
    min: 0
    // Giá nhập mỗi đơn vị
  },
  totalPrice: {
    type: Number,
    default: 0
    // Tổng tiền = quantity * unitPrice
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
    // NCC (chỉ cần khi type = 'import')
  },
  note: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Ai tạo phiếu này
  }
}, {
  timestamps: true
});

// Tự tính totalPrice
inventorySchema.pre('save', function(next) {
  this.totalPrice = this.quantity * this.unitPrice;
  next();
});

// Index để query nhanh
inventorySchema.index({ ingredient: 1, branch: 1 });
inventorySchema.index({ branch: 1, type: 1 });
inventorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Inventory', inventorySchema);
```

---

## 🎮 CONTROLLERS CHI TIẾT

### `ingredientController.js`

```javascript
const Ingredient = require('../models/Ingredient');

// GET /api/ingredients - Lấy tất cả nguyên liệu
exports.getAllIngredients = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.unit) {
      filter.unit = req.query.unit;
    }

    const ingredients = await Ingredient.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/ingredients/:id
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên liệu'
      });
    }

    res.status(200).json({ success: true, data: ingredient });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/ingredients - Tạo nguyên liệu (ADMIN)
exports.createIngredient = async (req, res) => {
  try {
    const { name, unit, description, minStock } = req.body;

    const ingredient = await Ingredient.create({
      name, unit, description, minStock
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nguyên liệu thành công',
      data: ingredient
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên nguyên liệu đã tồn tại'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/ingredients/:id - Cập nhật nguyên liệu (ADMIN)
exports.updateIngredient = async (req, res) => {
  try {
    const { name, unit, description, minStock, isActive } = req.body;

    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { name, unit, description, minStock, isActive },
      { new: true, runValidators: true }
    );

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên liệu'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: ingredient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/ingredients/:id - Xóa (soft delete, ADMIN)
exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên liệu'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa nguyên liệu'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### `supplierController.js`

```javascript
const Supplier = require('../models/Supplier');

// GET /api/suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const suppliers = await Supplier.find(filter)
      .populate('supplies', 'name unit')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('supplies', 'name unit');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/suppliers - Tạo NCC (ADMIN)
exports.createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, supplies } = req.body;

    const supplier = await Supplier.create({
      name, contactPerson, phone, email, address, supplies
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nhà cung cấp thành công',
      data: supplier
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên nhà cung cấp đã tồn tại'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/suppliers/:id - Cập nhật NCC (ADMIN)
exports.updateSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, supplies, isActive } = req.body;

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, contactPerson, phone, email, address, supplies, isActive },
      { new: true, runValidators: true }
    ).populate('supplies', 'name unit');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: supplier
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa nhà cung cấp'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### `inventoryController.js`

```javascript
const Inventory = require('../models/Inventory');
const Ingredient = require('../models/Ingredient');

// POST /api/inventory/import - Nhập hàng
exports.importGoods = async (req, res) => {
  try {
    const { ingredient, branch, quantity, unitPrice, supplier, note } = req.body;

    const inventory = await Inventory.create({
      ingredient,
      branch,
      type: 'import',
      quantity,
      unitPrice,
      supplier,
      note,
      createdBy: req.user._id
    });

    const populated = await Inventory.findById(inventory._id)
      .populate('ingredient', 'name unit')
      .populate('branch', 'name')
      .populate('supplier', 'name')
      .populate('createdBy', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Nhập hàng thành công',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/inventory/export - Xuất hàng
exports.exportGoods = async (req, res) => {
  try {
    const { ingredient, branch, quantity, note } = req.body;

    // Kiểm tra tồn kho trước khi xuất
    const currentStock = await exports.calculateStock(ingredient, branch);
    if (currentStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Không đủ hàng! Tồn kho hiện tại: ${currentStock}`
      });
    }

    const inventory = await Inventory.create({
      ingredient,
      branch,
      type: 'export',
      quantity,
      note,
      createdBy: req.user._id
    });

    const populated = await Inventory.findById(inventory._id)
      .populate('ingredient', 'name unit')
      .populate('branch', 'name')
      .populate('createdBy', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Xuất hàng thành công',
      data: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/inventory/stock - Xem tồn kho theo chi nhánh
exports.getStock = async (req, res) => {
  try {
    const { branch } = req.query;

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn chi nhánh (query param: branch)'
      });
    }

    // Tính tồn kho = tổng nhập - tổng xuất cho mỗi nguyên liệu
    const stockData = await Inventory.aggregate([
      { $match: { branch: require('mongoose').Types.ObjectId.createFromHexString(branch) } },
      {
        $group: {
          _id: '$ingredient',
          totalImport: {
            $sum: {
              $cond: [{ $eq: ['$type', 'import'] }, '$quantity', 0]
            }
          },
          totalExport: {
            $sum: {
              $cond: [{ $eq: ['$type', 'export'] }, '$quantity', 0]
            }
          },
          totalAdjust: {
            $sum: {
              $cond: [{ $eq: ['$type', 'adjust'] }, '$quantity', 0]
            }
          }
        }
      },
      {
        $addFields: {
          currentStock: {
            $subtract: [
              { $add: ['$totalImport', '$totalAdjust'] },
              '$totalExport'
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'ingredients',
          localField: '_id',
          foreignField: '_id',
          as: 'ingredient'
        }
      },
      { $unwind: '$ingredient' },
      {
        $project: {
          _id: 0,
          ingredientId: '$_id',
          ingredientName: '$ingredient.name',
          unit: '$ingredient.unit',
          minStock: '$ingredient.minStock',
          totalImport: 1,
          totalExport: 1,
          totalAdjust: 1,
          currentStock: 1,
          isLowStock: { $lte: ['$currentStock', '$ingredient.minStock'] }
        }
      },
      { $sort: { ingredientName: 1 } }
    ]);

    res.status(200).json({
      success: true,
      count: stockData.length,
      data: stockData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/inventory/low-stock - Nguyên liệu sắp hết
exports.getLowStock = async (req, res) => {
  try {
    const { branch } = req.query;

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn chi nhánh'
      });
    }

    const stockData = await Inventory.aggregate([
      { $match: { branch: require('mongoose').Types.ObjectId.createFromHexString(branch) } },
      {
        $group: {
          _id: '$ingredient',
          totalImport: {
            $sum: { $cond: [{ $eq: ['$type', 'import'] }, '$quantity', 0] }
          },
          totalExport: {
            $sum: { $cond: [{ $eq: ['$type', 'export'] }, '$quantity', 0] }
          }
        }
      },
      {
        $addFields: {
          currentStock: { $subtract: ['$totalImport', '$totalExport'] }
        }
      },
      {
        $lookup: {
          from: 'ingredients',
          localField: '_id',
          foreignField: '_id',
          as: 'ingredient'
        }
      },
      { $unwind: '$ingredient' },
      {
        $match: {
          $expr: { $lte: ['$currentStock', '$ingredient.minStock'] }
        }
      },
      {
        $project: {
          _id: 0,
          ingredientId: '$_id',
          ingredientName: '$ingredient.name',
          unit: '$ingredient.unit',
          minStock: '$ingredient.minStock',
          currentStock: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: stockData.length,
      message: stockData.length > 0 ? '⚠️ Có nguyên liệu sắp hết!' : '✅ Tất cả nguyên liệu đều đủ',
      data: stockData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/inventory/history - Lịch sử nhập/xuất
exports.getHistory = async (req, res) => {
  try {
    const filter = {};

    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.ingredient) filter.ingredient = req.query.ingredient;
    if (req.query.type) filter.type = req.query.type;

    // Filter theo khoảng thời gian
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [records, total] = await Promise.all([
      Inventory.find(filter)
        .populate('ingredient', 'name unit')
        .populate('branch', 'name')
        .populate('supplier', 'name')
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Tính tồn kho của 1 nguyên liệu tại 1 chi nhánh
exports.calculateStock = async (ingredientId, branchId) => {
  const result = await Inventory.aggregate([
    {
      $match: {
        ingredient: require('mongoose').Types.ObjectId.createFromHexString(ingredientId),
        branch: require('mongoose').Types.ObjectId.createFromHexString(branchId)
      }
    },
    {
      $group: {
        _id: null,
        totalImport: {
          $sum: { $cond: [{ $eq: ['$type', 'import'] }, '$quantity', 0] }
        },
        totalExport: {
          $sum: { $cond: [{ $eq: ['$type', 'export'] }, '$quantity', 0] }
        }
      }
    }
  ]);

  if (result.length === 0) return 0;
  return result[0].totalImport - result[0].totalExport;
};
```

---

## 🛣️ ROUTES CHI TIẾT

### `routes/ingredients.js`

```javascript
const express = require('express');
const router = express.Router();
const ingredientController = require('../controllers/ingredientController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// ADMIN/STAFF xem nguyên liệu
router.get('/', auth, ingredientController.getAllIngredients);
router.get('/:id', auth, ingredientController.getIngredientById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), ingredientController.createIngredient);
router.put('/:id', auth, authorize('ADMIN'), ingredientController.updateIngredient);
router.delete('/:id', auth, authorize('ADMIN'), ingredientController.deleteIngredient);

module.exports = router;
```

### `routes/suppliers.js`

```javascript
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// ADMIN xem NCC
router.get('/', auth, authorize('ADMIN'), supplierController.getAllSuppliers);
router.get('/:id', auth, authorize('ADMIN'), supplierController.getSupplierById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), supplierController.createSupplier);
router.put('/:id', auth, authorize('ADMIN'), supplierController.updateSupplier);
router.delete('/:id', auth, authorize('ADMIN'), supplierController.deleteSupplier);

module.exports = router;
```

### `routes/inventory.js`

```javascript
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Cần đăng nhập cho tất cả
router.use(auth);

// Xem tồn kho, lịch sử (ADMIN + STAFF)
router.get('/stock', inventoryController.getStock);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/history', inventoryController.getHistory);

// Nhập/xuất hàng (ADMIN only)
router.post('/import', authorize('ADMIN'), inventoryController.importGoods);
router.post('/export', authorize('ADMIN'), inventoryController.exportGoods);

module.exports = router;
```

---

## 📝 ĐĂNG KÝ ROUTES VÀO `app.js`

```javascript
// Bỏ comment 3 dòng này trong app.js:
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/inventory', require('./routes/inventory'));
```

---

## 🧪 TEST APIs VỚI POSTMAN

### Nguyên liệu

```
# 1. Tạo nguyên liệu
POST http://localhost:3000/api/ingredients
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Cà phê robusta",
  "unit": "kg",
  "description": "Cà phê robusta Đăk Lăk",
  "minStock": 5
}

# Tạo thêm vài nguyên liệu
{
  "name": "Sữa đặc",
  "unit": "hộp",
  "minStock": 20
}

{
  "name": "Đường",
  "unit": "kg",
  "minStock": 10
}

# 2. Lấy danh sách nguyên liệu
GET http://localhost:3000/api/ingredients
Authorization: Bearer <token>

# 3. Tìm kiếm
GET http://localhost:3000/api/ingredients?search=cà phê
Authorization: Bearer <token>
```

### Nhà cung cấp

```
# 1. Tạo NCC
POST http://localhost:3000/api/suppliers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Công ty Cà phê ABC",
  "contactPerson": "Nguyễn Văn A",
  "phone": "0901234567",
  "email": "contact@abc.com",
  "address": "123 Đường A, TP.HCM",
  "supplies": ["<ingredient_id_1>", "<ingredient_id_2>"]
}
```

### Nhập/Xuất kho

```
# 1. Nhập hàng
POST http://localhost:3000/api/inventory/import
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "ingredient": "<ingredient_id>",
  "branch": "<branch_id>",
  "quantity": 50,
  "unitPrice": 150000,
  "supplier": "<supplier_id>",
  "note": "Nhập hàng tháng 4"
}

# 2. Xuất hàng
POST http://localhost:3000/api/inventory/export
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "ingredient": "<ingredient_id>",
  "branch": "<branch_id>",
  "quantity": 5,
  "note": "Xuất cho quầy pha chế"
}

# 3. Xem tồn kho theo chi nhánh
GET http://localhost:3000/api/inventory/stock?branch=<branch_id>
Authorization: Bearer <token>

# 4. Xem nguyên liệu sắp hết
GET http://localhost:3000/api/inventory/low-stock?branch=<branch_id>
Authorization: Bearer <token>

# 5. Xem lịch sử nhập/xuất
GET http://localhost:3000/api/inventory/history?branch=<branch_id>
Authorization: Bearer <token>

# 6. Filter lịch sử theo loại
GET http://localhost:3000/api/inventory/history?type=import&branch=<branch_id>
Authorization: Bearer <token>

# 7. Filter theo thời gian
GET http://localhost:3000/api/inventory/history?from=2026-04-01&to=2026-04-30
Authorization: Bearer <token>
```

---

## 📊 Giải thích logic tồn kho

```
Tồn kho hiện tại = Tổng nhập (import) + Điều chỉnh (adjust) - Tổng xuất (export)

VD:
- Nhập 50kg cà phê     → import +50
- Xuất 10kg cho pha chế → export +10
- Tồn kho = 50 - 10 = 40kg

Nếu tồn kho <= minStock → Cảnh báo "sắp hết"
```

| Type | Ý nghĩa | Khi nào dùng |
|------|----------|---------------|
| `import` | Nhập hàng | Mua nguyên liệu từ NCC |
| `export` | Xuất hàng | Dùng cho pha chế, bán |
| `adjust` | Điều chỉnh | Kiểm kê, hao hụt, sai lệch |

---

## 💡 MẸO DÀNH CHO NGƯỜI 4

1. **Aggregation Pipeline**: Phần tồn kho dùng MongoDB Aggregate - nếu chưa quen, đọc thêm tại [MongoDB Aggregation docs](https://www.mongodb.com/docs/manual/aggregation/)
2. **ObjectId**: Khi dùng trong aggregate, phải chuyển string thành ObjectId
3. **minStock**: Là ngưỡng cảnh báo, khi tồn kho <= minStock thì "low stock"
4. **Không xóa cứng**: Phiếu nhập/xuất **không bao giờ xóa**, chỉ xem lịch sử

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo Model `Ingredient`
- [ ] Tạo Model `Supplier`
- [ ] Tạo Model `Inventory`
- [ ] Tạo `ingredientController.js` (CRUD)
- [ ] Tạo `supplierController.js` (CRUD)
- [ ] Tạo `inventoryController.js` (import, export, stock, lowStock, history)
- [ ] Tạo routes `ingredients.js`
- [ ] Tạo routes `suppliers.js`
- [ ] Tạo routes `inventory.js`
- [ ] Đăng ký routes vào `app.js`
- [ ] Test nhập hàng
- [ ] Test xuất hàng (kiểm tra validation tồn kho)
- [ ] Test xem tồn kho + low stock
- [ ] Push code lên branch `feature/inventory`
- [ ] Tạo Pull Request
