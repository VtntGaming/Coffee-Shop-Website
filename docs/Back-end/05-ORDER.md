# 🧾 NGƯỜI 5: ORDER (Order, OrderItem, Voucher)

> **Vai trò**: Quản lý đơn hàng, chi tiết đơn hàng, và voucher giảm giá
> **Độ khó**: ⭐⭐⭐⭐⭐ (PHỨC TẠP NHẤT)
> **Phụ thuộc**: Cần Người 1 (Auth), Người 2 (Branch+Table), Người 3 (Product)

---

## 📁 Các file cần tạo

```
BE/
├── models/
│   ├── Order.js               # Model đơn hàng
│   ├── OrderItem.js           # Model chi tiết đơn hàng
│   └── Voucher.js             # Model mã giảm giá
├── controllers/
│   ├── orderController.js     # Xử lý logic đơn hàng
│   └── voucherController.js   # Xử lý logic voucher
├── routes/
│   ├── orders.js              # Routes đơn hàng
│   └── vouchers.js            # Routes voucher
```

---

## 📋 CÁC BƯỚC THỰC HIỆN

### Bước 1: Pull code & tạo branch

```bash
git checkout main
git pull origin main
git checkout -b feature/order
```

### Bước 2: Viết Models Voucher trước (ít phụ thuộc nhất)

Trong lúc chờ Người 2 và 3, bạn có thể code **Voucher** trước vì nó khá độc lập.

---

## 📦 MODELS CHI TIẾT

### Model `Voucher.js` - Mã giảm giá

```javascript
const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Mã voucher là bắt buộc'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Mã voucher không quá 20 ký tự']
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Loại giảm giá là bắt buộc']
    // percentage: giảm theo %, fixed: giảm số tiền cố định
  },
  discountValue: {
    type: Number,
    required: [true, 'Giá trị giảm là bắt buộc'],
    min: [0, 'Giá trị không thể âm']
    // Nếu percentage: 10 = giảm 10%
    // Nếu fixed: 20000 = giảm 20,000đ
  },
  maxDiscount: {
    type: Number,
    default: null
    // Giảm tối đa (dùng cho percentage). VD: giảm 20% nhưng tối đa 50,000đ
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
    // Đơn hàng tối thiểu để áp dụng. VD: đơn từ 100,000đ
  },
  startDate: {
    type: Date,
    required: [true, 'Ngày bắt đầu là bắt buộc']
  },
  endDate: {
    type: Date,
    required: [true, 'Ngày kết thúc là bắt buộc']
  },
  usageLimit: {
    type: Number,
    default: null
    // Giới hạn số lần sử dụng. null = không giới hạn
  },
  usedCount: {
    type: Number,
    default: 0
    // Đã sử dụng bao nhiêu lần
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Kiểm tra voucher còn hiệu lực không
voucherSchema.methods.isValid = function() {
  const now = new Date();
  if (!this.isActive) return { valid: false, reason: 'Voucher đã bị vô hiệu hóa' };
  if (now < this.startDate) return { valid: false, reason: 'Voucher chưa đến ngày sử dụng' };
  if (now > this.endDate) return { valid: false, reason: 'Voucher đã hết hạn' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, reason: 'Voucher đã hết lượt sử dụng' };
  }
  return { valid: true };
};

// Tính số tiền giảm
voucherSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return { discount: 0, reason: `Đơn hàng tối thiểu ${this.minOrderAmount.toLocaleString('vi-VN')}đ` };
  }

  let discount = 0;

  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    // Áp dụng giới hạn giảm tối đa
    if (this.maxDiscount && discount > this.maxDiscount) {
      discount = this.maxDiscount;
    }
  } else {
    // fixed
    discount = this.discountValue;
  }

  // Không giảm quá tổng đơn hàng
  if (discount > orderAmount) {
    discount = orderAmount;
  }

  return { discount, reason: null };
};

module.exports = mongoose.model('Voucher', voucherSchema);
```

### Model `OrderItem.js` - Chi tiết đơn hàng

```javascript
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Sản phẩm là bắt buộc']
  },
  productName: {
    type: String,
    required: true
    // Lưu tên tại thời điểm đặt (phòng trường hợp product bị đổi tên)
  },
  size: {
    type: String,
    enum: ['S', 'M', 'L'],
    default: 'M'
  },
  quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [1, 'Số lượng tối thiểu là 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
    // Giá tại thời điểm đặt (theo size)
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
    // = quantity * unitPrice
  },
  note: {
    type: String,
    trim: true
    // Ghi chú: ít đá, nhiều đường, ...
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('OrderItem', orderItemSchema);
```

### Model `Order.js` - Đơn hàng

```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
    // Mã đơn: ORD-20260404-001
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Chi nhánh là bắt buộc']
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table'
    // Có thể null nếu mang đi (takeaway)
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway'],
    default: 'dine-in'
    // dine-in: ăn tại quán, takeaway: mang đi
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem'
  }],
  subtotal: {
    type: Number,
    default: 0,
    min: 0
    // Tổng tiền chưa giảm giá
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher'
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
    // Số tiền được giảm
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
    // Tổng tiền sau giảm = subtotal - discountAmount
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'momo', 'zalopay'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  note: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
    // Nhân viên tạo đơn
  },
  completedAt: {
    type: Date
    // Thời gian hoàn thành
  }
}, {
  timestamps: true
});

// Tự tạo orderNumber trước khi save
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    // Đếm số đơn trong ngày
    const count = await mongoose.model('Order').countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      }
    });

    this.orderNumber = `ORD-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// Index
orderSchema.index({ branch: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
```

---

## 🎮 CONTROLLERS CHI TIẾT

### `voucherController.js`

```javascript
const Voucher = require('../models/Voucher');

// GET /api/vouchers - Lấy tất cả voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === 'true') filter.isActive = true;

    const vouchers = await Voucher.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vouchers/:id
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/vouchers/check - Kiểm tra voucher có hợp lệ không
exports.checkVoucher = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Mã voucher không tồn tại'
      });
    }

    // Kiểm tra hiệu lực
    const validity = voucher.isValid();
    if (!validity.valid) {
      return res.status(400).json({
        success: false,
        message: validity.reason
      });
    }

    // Tính giảm giá
    const result = voucher.calculateDiscount(orderAmount || 0);
    if (result.reason) {
      return res.status(400).json({
        success: false,
        message: result.reason
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voucher hợp lệ',
      data: {
        voucherId: voucher._id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        estimatedDiscount: result.discount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/vouchers - Tạo voucher (ADMIN)
exports.createVoucher = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      maxDiscount, minOrderAmount, startDate, endDate, usageLimit
    } = req.body;

    const voucher = await Voucher.create({
      code, description, discountType, discountValue,
      maxDiscount, minOrderAmount, startDate, endDate, usageLimit
    });

    res.status(201).json({
      success: true,
      message: 'Tạo voucher thành công',
      data: voucher
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Mã voucher đã tồn tại'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/vouchers/:id - Cập nhật voucher (ADMIN)
exports.updateVoucher = async (req, res) => {
  try {
    const updateData = req.body;

    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật voucher thành công',
      data: voucher
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/vouchers/:id
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy voucher'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa voucher'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### `orderController.js` ⭐ (PHẦN QUAN TRỌNG NHẤT)

```javascript
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const Table = require('../models/Table');

// POST /api/orders - Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
  try {
    const {
      branch, table, orderType, items,
      voucherCode, paymentMethod,
      customerName, customerPhone, note
    } = req.body;

    // ====== 1. Validate items ======
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm'
      });
    }

    // ====== 2. Tạo OrderItems & tính subtotal ======
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      // Lấy thông tin sản phẩm
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.product}" không tồn tại hoặc đã ngưng bán`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" hiện đang hết hàng`
        });
      }

      // Tính giá theo size
      let unitPrice = product.price; // Giá mặc định
      if (item.size && product.sizes && product.sizes.length > 0) {
        const sizeInfo = product.sizes.find(s => s.name === item.size);
        if (sizeInfo) {
          unitPrice = sizeInfo.price;
        }
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product: product._id,
        productName: product.name,
        size: item.size || 'M',
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        note: item.note || ''
      });
    }

    // ====== 3. Xử lý Voucher ======
    let discountAmount = 0;
    let voucherId = null;

    if (voucherCode) {
      const voucher = await Voucher.findOne({ code: voucherCode.toUpperCase() });

      if (!voucher) {
        return res.status(400).json({
          success: false,
          message: 'Mã voucher không tồn tại'
        });
      }

      // Kiểm tra hiệu lực
      const validity = voucher.isValid();
      if (!validity.valid) {
        return res.status(400).json({
          success: false,
          message: validity.reason
        });
      }

      // Tính giảm giá
      const discountResult = voucher.calculateDiscount(subtotal);
      if (discountResult.reason) {
        return res.status(400).json({
          success: false,
          message: discountResult.reason
        });
      }

      discountAmount = discountResult.discount;
      voucherId = voucher._id;

      // Tăng usedCount
      voucher.usedCount += 1;
      await voucher.save();
    }

    // ====== 4. Tính tổng tiền ======
    const totalAmount = subtotal - discountAmount;

    // ====== 5. Tạo Order ======
    const order = await Order.create({
      branch,
      table: table || null,
      orderType: orderType || 'dine-in',
      subtotal,
      voucher: voucherId,
      discountAmount,
      totalAmount,
      paymentMethod: paymentMethod || 'cash',
      customerName,
      customerPhone,
      note,
      createdBy: req.user._id
    });

    // ====== 6. Tạo OrderItems (gắn orderId) ======
    const createdItems = [];
    for (const item of orderItems) {
      const orderItem = await OrderItem.create({
        ...item,
        order: order._id
      });
      createdItems.push(orderItem._id);
    }

    // Cập nhật items vào order
    order.items = createdItems;
    await order.save();

    // ====== 7. Cập nhật trạng thái bàn (nếu dine-in) ======
    if (table && orderType === 'dine-in') {
      await Table.findByIdAndUpdate(table, { status: 'occupied' });
    }

    // ====== 8. Trả kết quả ======
    const populatedOrder = await Order.findById(order._id)
      .populate('branch', 'name')
      .populate('table', 'tableNumber')
      .populate('voucher', 'code discountType discountValue')
      .populate('createdBy', 'fullName')
      .populate({
        path: 'items',
        populate: { path: 'product', select: 'name image' }
      });

    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: populatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders - Lấy danh sách đơn hàng
exports.getAllOrders = async (req, res) => {
  try {
    const filter = {};

    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
    if (req.query.orderType) filter.orderType = req.query.orderType;

    // Filter theo ngày
    if (req.query.date) {
      const date = new Date(req.query.date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.createdAt = { $gte: date, $lt: nextDay };
    }

    // Filter theo khoảng thời gian
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('branch', 'name')
        .populate('table', 'tableNumber')
        .populate('createdBy', 'fullName')
        .populate('voucher', 'code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id - Lấy chi tiết 1 đơn hàng
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('branch', 'name address')
      .populate('table', 'tableNumber floor')
      .populate('voucher', 'code discountType discountValue')
      .populate('createdBy', 'fullName')
      .populate({
        path: 'items',
        populate: { path: 'product', select: 'name image price' }
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/status - Cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Trạng thái không hợp lệ. Chọn: ${validStatuses.join(', ')}`
      });
    }

    const updateData = { status };

    // Nếu hoàn thành, ghi nhận thời gian
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.paymentStatus = 'paid';
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('table');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Giải phóng bàn khi hoàn thành hoặc hủy
    if ((status === 'completed' || status === 'cancelled') && order.table) {
      await Table.findByIdAndUpdate(order.table._id, { status: 'available' });
    }

    // Nếu hủy đơn, hoàn lại voucher
    if (status === 'cancelled' && order.voucher) {
      await Voucher.findByIdAndUpdate(order.voucher, { $inc: { usedCount: -1 } });
    }

    res.status(200).json({
      success: true,
      message: `Đơn hàng ${order.orderNumber} đã chuyển sang ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/orders/:id/payment - Cập nhật thanh toán
exports.updatePayment = async (req, res) => {
  try {
    const { paymentMethod, paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentMethod, paymentStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thanh toán thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/stats/revenue - Thống kê doanh thu
exports.getRevenueStats = async (req, res) => {
  try {
    const { branch, from, to } = req.query;

    const matchStage = {
      status: 'completed',
      paymentStatus: 'paid'
    };

    if (branch) {
      matchStage.branch = require('mongoose').Types.ObjectId.createFromHexString(branch);
    }

    if (from || to) {
      matchStage.completedAt = {};
      if (from) matchStage.completedAt.$gte = new Date(from);
      if (to) matchStage.completedAt.$lte = new Date(to);
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$discountAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    // Thống kê theo ngày
    const dailyStats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          totalDiscount: 0,
          avgOrderValue: 0
        },
        daily: dailyStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/stats/best-sellers - Top sản phẩm bán chạy
exports.getBestSellers = async (req, res) => {
  try {
    const { branch, limit: topN } = req.query;

    const matchStage = {};
    if (branch) {
      matchStage['order.branch'] = require('mongoose').Types.ObjectId.createFromHexString(branch);
    }

    const bestSellers = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: 'order',
          foreignField: '_id',
          as: 'order'
        }
      },
      { $unwind: '$order' },
      { $match: { 'order.status': 'completed', ...matchStage } },
      {
        $group: {
          _id: '$product',
          productName: { $first: '$productName' },
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(topN) || 10 }
    ]);

    res.status(200).json({
      success: true,
      data: bestSellers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

---

## 🛣️ ROUTES CHI TIẾT

### `routes/vouchers.js`

```javascript
const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Kiểm tra voucher (nhân viên/khách)
router.post('/check', auth, voucherController.checkVoucher);

// Xem voucher (ADMIN)
router.get('/', auth, authorize('ADMIN'), voucherController.getAllVouchers);
router.get('/:id', auth, authorize('ADMIN'), voucherController.getVoucherById);

// ADMIN only: tạo, sửa, xóa
router.post('/', auth, authorize('ADMIN'), voucherController.createVoucher);
router.put('/:id', auth, authorize('ADMIN'), voucherController.updateVoucher);
router.delete('/:id', auth, authorize('ADMIN'), voucherController.deleteVoucher);

module.exports = router;
```

### `routes/orders.js`

```javascript
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middlewares/auth');
const authorize = require('../middlewares/role');

// Cần đăng nhập cho tất cả
router.use(auth);

// Thống kê (ADMIN)
router.get('/stats/revenue', authorize('ADMIN'), orderController.getRevenueStats);
router.get('/stats/best-sellers', authorize('ADMIN'), orderController.getBestSellers);

// Xem đơn hàng (ADMIN + STAFF)
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);

// Tạo đơn hàng (ADMIN + STAFF)
router.post('/', orderController.createOrder);

// Cập nhật trạng thái (ADMIN + STAFF)
router.patch('/:id/status', orderController.updateOrderStatus);

// Cập nhật thanh toán (ADMIN + STAFF)
router.patch('/:id/payment', orderController.updatePayment);

module.exports = router;
```

---

## 📝 ĐĂNG KÝ ROUTES VÀO `app.js`

```javascript
// Bỏ comment 2 dòng này trong app.js:
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vouchers', require('./routes/vouchers'));
```

---

## 🧪 TEST APIs VỚI POSTMAN

### Voucher

```
# 1. Tạo voucher giảm %
POST http://localhost:3000/api/vouchers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "GIAM20",
  "description": "Giảm 20%, tối đa 50k",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 50000,
  "minOrderAmount": 100000,
  "startDate": "2026-04-01",
  "endDate": "2026-12-31",
  "usageLimit": 100
}

# 2. Tạo voucher giảm cố định
POST http://localhost:3000/api/vouchers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "code": "GIAM30K",
  "description": "Giảm 30,000đ",
  "discountType": "fixed",
  "discountValue": 30000,
  "minOrderAmount": 80000,
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "usageLimit": 50
}

# 3. Kiểm tra voucher
POST http://localhost:3000/api/vouchers/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "GIAM20",
  "orderAmount": 200000
}
```

### Đơn hàng

```
# 1. Tạo đơn hàng (QUAN TRỌNG NHẤT)
POST http://localhost:3000/api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "branch": "<branch_id>",
  "table": "<table_id>",
  "orderType": "dine-in",
  "items": [
    {
      "product": "<product_id_1>",
      "size": "M",
      "quantity": 2,
      "note": "Ít đá"
    },
    {
      "product": "<product_id_2>",
      "size": "L",
      "quantity": 1
    }
  ],
  "voucherCode": "GIAM20",
  "paymentMethod": "cash",
  "customerName": "Nguyen Van A",
  "customerPhone": "0901234567"
}

# 2. Tạo đơn mang đi (không cần table)
POST http://localhost:3000/api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "branch": "<branch_id>",
  "orderType": "takeaway",
  "items": [
    {
      "product": "<product_id>",
      "size": "M",
      "quantity": 1
    }
  ],
  "paymentMethod": "momo"
}

# 3. Lấy danh sách đơn hàng
GET http://localhost:3000/api/orders
Authorization: Bearer <token>

# 4. Lấy đơn theo chi nhánh
GET http://localhost:3000/api/orders?branch=<branch_id>
Authorization: Bearer <token>

# 5. Lấy đơn theo trạng thái
GET http://localhost:3000/api/orders?status=pending
Authorization: Bearer <token>

# 6. Lấy đơn theo ngày
GET http://localhost:3000/api/orders?date=2026-04-04
Authorization: Bearer <token>

# 7. Chi tiết đơn hàng
GET http://localhost:3000/api/orders/<order_id>
Authorization: Bearer <token>

# 8. Cập nhật trạng thái
PATCH http://localhost:3000/api/orders/<order_id>/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}

# Lần lượt chuyển: pending → confirmed → preparing → ready → completed

# 9. Cập nhật thanh toán
PATCH http://localhost:3000/api/orders/<order_id>/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentMethod": "card",
  "paymentStatus": "paid"
}

# 10. Thống kê doanh thu (ADMIN)
GET http://localhost:3000/api/orders/stats/revenue?from=2026-04-01&to=2026-04-30
Authorization: Bearer <admin_token>

# 11. Top sản phẩm bán chạy (ADMIN)
GET http://localhost:3000/api/orders/stats/best-sellers?limit=5
Authorization: Bearer <admin_token>
```

---

## 📊 FLOW TẠO ĐƠN HÀNG

```
Nhân viên tạo đơn
        │
        ▼
┌─────────────────────┐
│ Validate items      │ ← Kiểm tra sản phẩm có tồn tại, còn bán?
│ (product, quantity)  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Tính giá theo size  │ ← Mỗi item lấy giá theo size (S/M/L)
│ Tính subtotal       │ ← subtotal = sum(unitPrice * quantity)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Áp voucher          │ ← Kiểm tra hiệu lực → tính discount
│ (nếu có)            │ ← Tăng usedCount
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ totalAmount =       │
│ subtotal - discount  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Tạo Order           │
│ Tạo OrderItems      │
│ Đổi trạng thái bàn  │ ← Nếu dine-in: bàn → occupied
└─────────┬───────────┘
          │
          ▼
      Trả kết quả
```

---

## 📊 Trạng thái đơn hàng

```
pending → confirmed → preparing → ready → completed
   │
   └──→ cancelled (có thể hủy bất cứ lúc nào trước completed)
```

| Status | Ý nghĩa | Ai thao tác |
|--------|----------|-------------|
| `pending` | Vừa tạo, chờ xác nhận | Tự động khi tạo |
| `confirmed` | Đã xác nhận | STAFF/ADMIN |
| `preparing` | Đang pha chế | STAFF |
| `ready` | Đã pha xong, chờ phục vụ | STAFF |
| `completed` | Hoàn thành | STAFF/ADMIN |
| `cancelled` | Đã hủy | ADMIN |

---

## 💡 MẸO DÀNH CHO NGƯỜI 5

1. **Lưu tên sản phẩm vào OrderItem**: Phòng khi product bị đổi tên, lịch sử đơn vẫn đúng
2. **Lưu unitPrice vào OrderItem**: Phòng khi giá thay đổi
3. **Voucher**: Phải kiểm tra cả hiệu lực VÀ số lượng sử dụng
4. **Hủy đơn**: Phải hoàn lại usedCount cho voucher + giải phóng bàn
5. **Aggregate**: Dùng cho thống kê doanh thu, top bán chạy
6. **Route stats trước /:id**: Express sẽ match `/stats/revenue` trước `/:id`

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Tạo Model `Voucher` (+ methods isValid, calculateDiscount)
- [ ] Tạo Model `OrderItem`
- [ ] Tạo Model `Order` (+ auto orderNumber)
- [ ] Tạo `voucherController.js` (CRUD + check)
- [ ] Tạo `orderController.js`:
  - [ ] createOrder (TẠO ĐƠN - phức tạp nhất)
  - [ ] getAllOrders (filter, phân trang)
  - [ ] getOrderById (chi tiết)
  - [ ] updateOrderStatus (đổi trạng thái + giải phóng bàn)
  - [ ] updatePayment
  - [ ] getRevenueStats (thống kê doanh thu)
  - [ ] getBestSellers (top bán chạy)
- [ ] Tạo routes `vouchers.js`
- [ ] Tạo routes `orders.js`
- [ ] Đăng ký routes vào `app.js`
- [ ] Test tạo đơn hàng (có và không voucher)
- [ ] Test flow trạng thái đơn hàng
- [ ] Test thống kê
- [ ] Push code lên branch `feature/order`
- [ ] Tạo Pull Request
