/**
 * Controller: ingredientController
 * Xử lý logic CRUD cho nguyên liệu (Ingredient)
 * Người 4 - Feature/inventory
 *
 * Các route sử dụng:
 *   GET    /api/ingredients          - Lấy danh sách nguyên liệu (có filter)
 *   GET    /api/ingredients/:id      - Lấy 1 nguyên liệu theo ID
 *   POST   /api/ingredients          - Tạo nguyên liệu mới (ADMIN)
 *   PUT    /api/ingredients/:id      - Cập nhật nguyên liệu (ADMIN)
 *   DELETE /api/ingredients/:id      - Vô hiệu hóa nguyên liệu (ADMIN, soft delete)
 */

const Ingredient = require('../models/Ingredient');

// =============================================
// GET /api/ingredients
// Lấy danh sách tất cả nguyên liệu đang hoạt động
// Hỗ trợ filter: ?search=tên&unit=kg
// =============================================
exports.getAllIngredients = async (req, res) => {
  try {
    // Mặc định chỉ lấy nguyên liệu đang hoạt động
    const filter = { isActive: true };

    // Filter theo tên (tìm kiếm gần đúng, không phân biệt hoa thường)
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    // Filter theo đơn vị tính (vd: ?unit=kg)
    if (req.query.unit) {
      filter.unit = req.query.unit;
    }

    // Sắp xếp theo tên A-Z
    const ingredients = await Ingredient.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nguyên liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// GET /api/ingredients/:id
// Lấy thông tin 1 nguyên liệu theo ID
// =============================================
exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên liệu',
      });
    }

    res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin nguyên liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// POST /api/ingredients
// Tạo nguyên liệu mới (chỉ ADMIN)
// Body: { name, unit, description, minStock }
// =============================================
exports.createIngredient = async (req, res) => {
  try {
    const { name, unit, description, minStock } = req.body;

    const ingredient = await Ingredient.create({
      name,
      unit,
      description,
      minStock,
    });

    res.status(201).json({
      success: true,
      message: 'Tạo nguyên liệu thành công',
      data: ingredient,
    });
  } catch (error) {
    // Lỗi trùng tên (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên nguyên liệu đã tồn tại trong hệ thống',
      });
    }
    // Lỗi validation Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo nguyên liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// PUT /api/ingredients/:id
// Cập nhật thông tin nguyên liệu (chỉ ADMIN)
// Body: { name, unit, description, minStock, isActive }
// =============================================
exports.updateIngredient = async (req, res) => {
  try {
    const { name, unit, description, minStock, isActive } = req.body;

    const ingredient = await Ingredient.findByIdAndUpdate(
      req.params.id,
      { name, unit, description, minStock, isActive },
      {
        new: true,           // Trả về document sau khi update
        runValidators: true, // Chạy lại validator của schema
      }
    );

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên liệu',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật nguyên liệu thành công',
      data: ingredient,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên nguyên liệu đã tồn tại trong hệ thống',
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật nguyên liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// DELETE /api/ingredients/:id
// Vô hiệu hóa nguyên liệu (soft delete, chỉ ADMIN)
// Không xóa thật để giữ lịch sử tồn kho
// =============================================
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
        message: 'Không tìm thấy nguyên liệu',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa nguyên liệu thành công',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi vô hiệu hóa nguyên liệu',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
