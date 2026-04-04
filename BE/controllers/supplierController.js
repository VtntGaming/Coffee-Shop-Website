/**
 * Controller: supplierController
 * Xử lý logic CRUD cho nhà cung cấp (Supplier)
 * Người 4 - Feature/inventory
 *
 * Các route sử dụng:
 *   GET    /api/suppliers        - Lấy danh sách nhà cung cấp (ADMIN)
 *   GET    /api/suppliers/:id    - Lấy 1 nhà cung cấp theo ID (ADMIN)
 *   POST   /api/suppliers        - Tạo nhà cung cấp mới (ADMIN)
 *   PUT    /api/suppliers/:id    - Cập nhật nhà cung cấp (ADMIN)
 *   DELETE /api/suppliers/:id    - Vô hiệu hóa nhà cung cấp (ADMIN, soft delete)
 */

const Supplier = require('../models/Supplier');

// =============================================
// GET /api/suppliers
// Lấy danh sách nhà cung cấp đang hoạt động
// Hỗ trợ filter: ?search=tên
// =============================================
exports.getAllSuppliers = async (req, res) => {
  try {
    const filter = { isActive: true };

    // Tìm kiếm theo tên nhà cung cấp (không phân biệt hoa thường)
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // populate('supplies') để hiển thị tên và đơn vị nguyên liệu thay vì ObjectId
    const suppliers = await Supplier.find(filter)
      .populate('supplies', 'name unit')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nhà cung cấp',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// GET /api/suppliers/:id
// Lấy thông tin chi tiết 1 nhà cung cấp
// =============================================
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate(
      'supplies',
      'name unit'
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp',
      });
    }

    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin nhà cung cấp',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// POST /api/suppliers
// Tạo nhà cung cấp mới (chỉ ADMIN)
// Body: { name, contactPerson, phone, email, address, supplies[] }
// =============================================
exports.createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, supplies } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson,
      phone,
      email,
      address,
      supplies, // Mảng ObjectId của Ingredient
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nhà cung cấp thành công',
      data: supplier,
    });
  } catch (error) {
    // Trùng tên nhà cung cấp
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên nhà cung cấp đã tồn tại trong hệ thống',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo nhà cung cấp',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// PUT /api/suppliers/:id
// Cập nhật thông tin nhà cung cấp (chỉ ADMIN)
// Body: { name, contactPerson, phone, email, address, supplies, isActive }
// =============================================
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
        message: 'Không tìm thấy nhà cung cấp',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật nhà cung cấp thành công',
      data: supplier,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên nhà cung cấp đã tồn tại trong hệ thống',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật nhà cung cấp',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// DELETE /api/suppliers/:id
// Vô hiệu hóa nhà cung cấp (soft delete, chỉ ADMIN)
// =============================================
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
        message: 'Không tìm thấy nhà cung cấp',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa nhà cung cấp thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi vô hiệu hóa nhà cung cấp',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
