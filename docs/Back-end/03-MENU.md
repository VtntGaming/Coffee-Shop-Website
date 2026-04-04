# 🍹 NGƯỜI 3: MENU (Category + Product)

> **Vai trò**: Quản lý danh mục và sản phẩm (menu quán cà phê)
> **Độ khó**: ⭐⭐⭐
> **Phụ thuộc**: Cần chờ Người 1 hoàn thành Auth middleware
> **Quan trọng**: FE sẽ dùng API này rất nhiều, cần code cẩn thận

---

## 📁 Các file cần tạo

```
BE/
├── models/
│   ├── Category.js            # Model danh mục
│   └── Product.js             # Model sản phẩm
├── controllers/
│   ├── categoryController.js  # Xử lý logic danh mục
│   └── productController.js   # Xử lý logic sản phẩm
├── routes/
│   ├── categories.js          # Routes danh mục
│   └── products.js            # Routes sản phẩm
├── middlewares/
│   └── upload.js              # Cấu hình multer upload ảnh
```

---

## 📋 CÁC BƯỚC THỰC HIỆN

### Bước 1: Pull code & tạo branch

```bash
git checkout main
git pull origin main
git checkout -b feature/menu
```

### Bước 2: Tạo middleware upload trước (không phụ thuộc ai)

Upload ảnh sản phẩm dùng **multer** (đã cài trong package.json).

---

## 📤 MIDDLEWARE UPLOAD ẢNH

### `middlewares/upload.js`

```javascript
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    // Đặt tên file: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filter: chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpeg, jpg, png, gif, webp)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

module.exports = upload;
```

> **Lưu ý**: Tạo thư mục `uploads/` trong folder `BE/` nếu chưa có.

---

## 📦 MODELS CHI TIẾT

### Model `Category.js` - Danh mục

```javascript
const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên danh mục là bắt buộc'],
    unique: true,
    trim: true,
    maxlength: [100, 'Tên danh mục không quá 100 ký tự']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Mô tả không quá 500 ký tự']
  },
  image: {
    type: String,    // Đường dẫn ảnh
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,    // Thứ tự hiển thị
    default: 0
  }
}, {
  timestamps: true
});

// Tự tạo slug
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);
```

### Model `Product.js` - Sản phẩm

```javascript
const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên sản phẩm là bắt buộc'],
    trim: true,
    maxlength: [200, 'Tên sản phẩm không quá 200 ký tự']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Mô tả không quá 1000 ký tự']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Danh mục là bắt buộc']
  },
  price: {
    type: Number,
    required: [true, 'Giá là bắt buộc'],
    min: [0, 'Giá không thể âm']
  },
  sizes: [{
    name: {
      type: String,
      enum: ['S', 'M', 'L'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  image: {
    type: String,    // Đường dẫn ảnh sản phẩm
    default: null
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Tự tạo slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, locale: 'vi' });
  }
  next();
});

// Index để tìm kiếm nhanh
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);
```

---

## 🎮 CONTROLLERS CHI TIẾT

### `categoryController.js`

```javascript
const Category = require('../models/Category');

// GET /api/categories - Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/categories/:id - Lấy 1 danh mục
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/categories - Tạo danh mục (ADMIN)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, order } = req.body;

    const categoryData = { name, description, order };

    // Nếu có upload ảnh
    if (req.file) {
      categoryData.image = '/uploads/' + req.file.filename;
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Tạo danh mục thành công',
      data: category
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/categories/:id - Cập nhật danh mục (ADMIN)
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, order, isActive } = req.body;
    const updateData = { name, description, order, isActive };

    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật danh mục thành công',
      data: category
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/categories/:id - Xóa danh mục (soft delete, ADMIN)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa danh mục'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### `productController.js`

```javascript
const Product = require('../models/Product');

// GET /api/products - Lấy tất cả sản phẩm (có filter)
exports.getAllProducts = async (req, res) => {
  try {
    const filter = { isActive: true };

    // Filter theo danh mục
    if (req.query.category) {
      filter.category = req.query.category;
    }
    // Filter theo tình trạng
    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }
    // Filter best seller
    if (req.query.isBestSeller) {
      filter.isBestSeller = req.query.isBestSeller === 'true';
    }
    // Tìm kiếm theo tên
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ isBestSeller: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/:id - Lấy 1 sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/products/slug/:slug - Lấy sản phẩm theo slug (cho FE)
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/products - Tạo sản phẩm (ADMIN)
exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, sizes, isAvailable, isBestSeller, tags } = req.body;

    const productData = {
      name, description, category, price, isAvailable, isBestSeller
    };

    // Parse sizes nếu gửi từ form-data (string)
    if (sizes && typeof sizes === 'string') {
      productData.sizes = JSON.parse(sizes);
    } else if (sizes) {
      productData.sizes = sizes;
    }

    // Parse tags
    if (tags && typeof tags === 'string') {
      productData.tags = JSON.parse(tags);
    } else if (tags) {
      productData.tags = tags;
    }

    // Ảnh upload
    if (req.file) {
      productData.image = '/uploads/' + req.file.filename;
    }

    const product = await Product.create(productData);
    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: populatedProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/products/:id - Cập nhật sản phẩm (ADMIN)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, sizes, isAvailable, isBestSeller, isActive, tags } = req.body;

    const updateData = { name, description, category, price, isAvailable, isBestSeller, isActive };

    if (sizes && typeof sizes === 'string') {
      updateData.sizes = JSON.parse(sizes);
    } else if (sizes) {
      updateData.sizes = sizes;
    }

    if (tags && typeof tags === 'string') {
      updateData.tags = JSON.parse(tags);
    } else if (tags) {
      updateData.tags = tags;
    }

    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/products/:id - Xóa sản phẩm (soft delete, ADMIN)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa sản phẩm'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🛣️ ROUTES CHI TIẾT

### `routes/categories.js`

```javascript
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const upload = require('../middlewares/upload');

// Public: xem danh mục
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), upload.single('image'), categoryController.createCategory);
router.put('/:id', auth, authorize('ADMIN'), upload.single('image'), categoryController.updateCategory);
router.delete('/:id', auth, authorize('ADMIN'), categoryController.deleteCategory);

module.exports = router;
```

### `routes/products.js`

```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');
const upload = require('../middlewares/upload');

// Public: xem sản phẩm
router.get('/', productController.getAllProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), upload.single('image'), productController.createProduct);
router.put('/:id', auth, authorize('ADMIN'), upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
```

---

## 📝 ĐĂNG KÝ ROUTES VÀO `app.js`

```javascript
// Bỏ comment 2 dòng này trong app.js:
app.use('/api/categories', require('./routes/categories'));
app.use('/api/products', require('./routes/products'));

// Thêm dòng này để serve ảnh tĩnh:
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

---

## 🧪 TEST APIs VỚI POSTMAN

### Danh mục

```
# 1. Tạo danh mục (ADMIN, form-data vì có ảnh)
POST http://localhost:3000/api/categories
Authorization: Bearer <admin_token>
Body (form-data):
  - name: "Cà phê"
  - description: "Các loại cà phê"
  - order: 1
  - image: [chọn file ảnh]

# 2. Tạo danh mục (JSON, không ảnh)
POST http://localhost:3000/api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Trà",
  "description": "Các loại trà",
  "order": 2
}

# 3. Lấy tất cả danh mục
GET http://localhost:3000/api/categories
```

### Sản phẩm

```
# 1. Tạo sản phẩm (form-data)
POST http://localhost:3000/api/products
Authorization: Bearer <admin_token>
Body (form-data):
  - name: "Cà phê sữa đá"
  - description: "Cà phê phin truyền thống pha sữa đặc"
  - category: "<category_id>"
  - price: 35000
  - sizes: '[{"name":"S","price":29000},{"name":"M","price":35000},{"name":"L","price":45000}]'
  - isBestSeller: true
  - image: [chọn file ảnh]

# 2. Lấy tất cả sản phẩm
GET http://localhost:3000/api/products

# 3. Lấy sản phẩm theo danh mục
GET http://localhost:3000/api/products?category=<category_id>

# 4. Tìm kiếm sản phẩm
GET http://localhost:3000/api/products?search=cà phê

# 5. Phân trang
GET http://localhost:3000/api/products?page=1&limit=10

# 6. Lấy sản phẩm bán chạy
GET http://localhost:3000/api/products?isBestSeller=true

# 7. Lấy theo slug (cho FE)
GET http://localhost:3000/api/products/slug/ca-phe-sua-da
```

---

## 💡 MẸO CHO NGƯỜI 3

1. **Sizes**: Dùng mảng object cho các size (S, M, L) với giá riêng từng size
2. **Upload ảnh**: Khi gửi form-data có file, `sizes` và `tags` phải gửi dạng JSON string
3. **Slug**: Tự động tạo từ tên, tiện cho URL thân thiện (VD: `/ca-phe-sua-da`)
4. **Phân trang**: Luôn trả về `page`, `totalPages`, `total` cho FE
5. **Tìm kiếm**: Dùng regex `$options: 'i'` để tìm không phân biệt hoa thường

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo `middlewares/upload.js` (multer)
- [ ] Tạo thư mục `uploads/`
- [ ] Tạo Model `Category`
- [ ] Tạo Model `Product`
- [ ] Tạo `categoryController.js` (CRUD)
- [ ] Tạo `productController.js` (CRUD + search + pagination)
- [ ] Tạo routes `categories.js`
- [ ] Tạo routes `products.js`
- [ ] Đăng ký routes vào `app.js`
- [ ] Thêm serve static uploads vào `app.js`
- [ ] Test tất cả API bằng Postman
- [ ] Test upload ảnh
- [ ] Push code lên branch `feature/menu`
- [ ] Tạo Pull Request
