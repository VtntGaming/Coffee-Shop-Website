/**
 * Controller: inventoryController
 * Xử lý logic nhập hàng, xuất hàng, xem tồn kho, và lịch sử giao dịch
 * Người 4 - Feature/inventory
 *
 * Các route sử dụng:
 *   POST /api/inventory/import       - Nhập hàng (ADMIN)
 *   POST /api/inventory/export       - Xuất hàng (ADMIN)
 *   GET  /api/inventory/stock        - Xem tồn kho theo chi nhánh
 *   GET  /api/inventory/low-stock    - Danh sách nguyên liệu sắp hết
 *   GET  /api/inventory/history      - Lịch sử nhập/xuất (có phân trang)
 *
 * LOGIC TỒNG KHO:
 *   Tồn kho hiện tại = Tổng nhập (import) + Điều chỉnh (adjust) - Tổng xuất (export)
 */

const mongoose = require('mongoose');
const Inventory = require('../models/Inventory');
require('../models/Branch'); // Gọi tạm model Branch của Người 2 để Mongoose nhận diện được khi chạy populate

// =========================================================
// HELPER FUNCTION: Tính tồn kho hiện tại của 1 nguyên liệu tại 1 chi nhánh
// Dùng nội bộ trong controller này (không export ra route)
// =========================================================
const calculateStock = async (ingredientId, branchId) => {
  const result = await Inventory.aggregate([
    {
      $match: {
        ingredient: new mongoose.Types.ObjectId(ingredientId),
        branch: new mongoose.Types.ObjectId(branchId),
      },
    },
    {
      $group: {
        _id: null,
        // Tổng số lượng nhập
        totalImport: {
          $sum: { $cond: [{ $eq: ['$type', 'import'] }, '$quantity', 0] },
        },
        // Tổng số lượng xuất
        totalExport: {
          $sum: { $cond: [{ $eq: ['$type', 'export'] }, '$quantity', 0] },
        },
        // Tổng điều chỉnh (có thể âm hoặc dương)
        totalAdjust: {
          $sum: { $cond: [{ $eq: ['$type', 'adjust'] }, '$quantity', 0] },
        },
      },
    },
  ]);

  if (result.length === 0) return 0;

  // Tồn kho = nhập + điều chỉnh - xuất
  return result[0].totalImport + result[0].totalAdjust - result[0].totalExport;
};

// =============================================
// POST /api/inventory/import
// Tạo phiếu NHẬP hàng (chỉ ADMIN)
// Body: { ingredient, branch, quantity, unitPrice, supplier, note }
// =============================================
exports.importGoods = async (req, res) => {
  try {
    const { ingredient, branch, quantity, unitPrice, supplier, note } = req.body;

    // Tạo phiếu nhập — totalPrice được tự tính bởi pre-save hook trong model
    const inventory = await Inventory.create({
      ingredient,
      branch,
      type: 'import',
      quantity,
      unitPrice: unitPrice || 0,
      supplier,    // ObjectId nhà cung cấp (không bắt buộc)
      note,
      createdBy: req.user._id, // Lấy từ middleware auth
    });

    // Populate để trả về thông tin đầy đủ thay vì chỉ ObjectId
    const populated = await Inventory.findById(inventory._id)
      .populate('ingredient', 'name unit')
      .populate('branch', 'name')
      .populate('supplier', 'name')
      .populate('createdBy', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Nhập hàng thành công',
      data: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phiếu nhập hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// POST /api/inventory/export
// Tạo phiếu XUẤT hàng (chỉ ADMIN)
// Body: { ingredient, branch, quantity, note }
// Kiểm tra tồn kho trước khi cho xuất
// =============================================
exports.exportGoods = async (req, res) => {
  try {
    const { ingredient, branch, quantity, note } = req.body;

    // Kiểm tra tồn kho hiện tại trước khi xuất
    const currentStock = await calculateStock(ingredient, branch);

    if (currentStock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Không đủ hàng để xuất! Tồn kho hiện tại: ${currentStock}`,
      });
    }

    // Tạo phiếu xuất (unitPrice = 0 vì xuất nội bộ)
    const inventory = await Inventory.create({
      ingredient,
      branch,
      type: 'export',
      quantity,
      unitPrice: 0,
      note,
      createdBy: req.user._id,
    });

    const populated = await Inventory.findById(inventory._id)
      .populate('ingredient', 'name unit')
      .populate('branch', 'name')
      .populate('createdBy', 'fullName');

    res.status(201).json({
      success: true,
      message: 'Xuất hàng thành công',
      data: populated,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phiếu xuất hàng',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// GET /api/inventory/stock?branch=<branchId>
// Xem tồn kho tổng hợp theo chi nhánh
// Dùng MongoDB Aggregation để tính: nhập - xuất + điều chỉnh
// =============================================
exports.getStock = async (req, res) => {
  try {
    const { branch } = req.query;

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp chi nhánh (query param: ?branch=<id>)',
      });
    }

    // Aggregation Pipeline: Tính tồn kho cho từng nguyên liệu tại chi nhánh
    const stockData = await Inventory.aggregate([
      // Bước 1: Lọc theo chi nhánh
      {
        $match: {
          branch: new mongoose.Types.ObjectId(branch),
        },
      },

      // Bước 2: Nhóm theo nguyên liệu, tính tổng nhập / xuất / điều chỉnh
      {
        $group: {
          _id: '$ingredient',
          totalImport: {
            $sum: { $cond: [{ $eq: ['$type', 'import'] }, '$quantity', 0] },
          },
          totalExport: {
            $sum: { $cond: [{ $eq: ['$type', 'export'] }, '$quantity', 0] },
          },
          totalAdjust: {
            $sum: { $cond: [{ $eq: ['$type', 'adjust'] }, '$quantity', 0] },
          },
        },
      },

      // Bước 3: Tính tồn kho thực tế
      {
        $addFields: {
          currentStock: {
            $subtract: [
              { $add: ['$totalImport', '$totalAdjust'] },
              '$totalExport',
            ],
          },
        },
      },

      // Bước 4: Join với collection ingredients để lấy tên, đơn vị, minStock
      {
        $lookup: {
          from: 'ingredients',
          localField: '_id',
          foreignField: '_id',
          as: 'ingredient',
        },
      },
      { $unwind: '$ingredient' },

      // Bước 5: Định dạng output và đánh dấu "sắp hết" nếu currentStock <= minStock
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
          isLowStock: { $lte: ['$currentStock', '$ingredient.minStock'] },
        },
      },

      // Bước 6: Sắp xếp theo tên nguyên liệu
      { $sort: { ingredientName: 1 } },
    ]);

    res.status(200).json({
      success: true,
      count: stockData.length,
      data: stockData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tính tồn kho',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// GET /api/inventory/low-stock?branch=<branchId>
// Lấy danh sách nguyên liệu có tồn kho <= minStock (sắp hết)
// =============================================
exports.getLowStock = async (req, res) => {
  try {
    const { branch } = req.query;

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp chi nhánh (query param: ?branch=<id>)',
      });
    }

    // Tương tự getStock nhưng chỉ lấy các nguyên liệu isLowStock = true
    const stockData = await Inventory.aggregate([
      {
        $match: {
          branch: new mongoose.Types.ObjectId(branch),
        },
      },
      {
        $group: {
          _id: '$ingredient',
          totalImport: {
            $sum: { $cond: [{ $eq: ['$type', 'import'] }, '$quantity', 0] },
          },
          totalExport: {
            $sum: { $cond: [{ $eq: ['$type', 'export'] }, '$quantity', 0] },
          },
          totalAdjust: {
            $sum: { $cond: [{ $eq: ['$type', 'adjust'] }, '$quantity', 0] },
          },
        },
      },
      {
        $addFields: {
          currentStock: {
            $subtract: [
              { $add: ['$totalImport', '$totalAdjust'] },
              '$totalExport',
            ],
          },
        },
      },
      {
        $lookup: {
          from: 'ingredients',
          localField: '_id',
          foreignField: '_id',
          as: 'ingredient',
        },
      },
      { $unwind: '$ingredient' },

      // Chỉ giữ lại các nguyên liệu có tồn kho <= minStock
      {
        $match: {
          $expr: { $lte: ['$currentStock', '$ingredient.minStock'] },
        },
      },
      {
        $project: {
          _id: 0,
          ingredientId: '$_id',
          ingredientName: '$ingredient.name',
          unit: '$ingredient.unit',
          minStock: '$ingredient.minStock',
          currentStock: 1,
        },
      },
      { $sort: { currentStock: 1 } }, // Sắp xếp tồn kho thấp nhất lên đầu
    ]);

    res.status(200).json({
      success: true,
      count: stockData.length,
      message:
        stockData.length > 0
          ? '⚠️ Có nguyên liệu sắp hết! Cần nhập thêm hàng.'
          : '✅ Tất cả nguyên liệu đều đủ hàng.',
      data: stockData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra nguyên liệu sắp hết',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// =============================================
// GET /api/inventory/history
// Lấy lịch sử nhập/xuất kho (có phân trang)
// Query params: branch, ingredient, type, from, to, page, limit
// =============================================
exports.getHistory = async (req, res) => {
  try {
    const filter = {};

    // Filter theo chi nhánh
    if (req.query.branch) filter.branch = req.query.branch;

    // Filter theo nguyên liệu
    if (req.query.ingredient) filter.ingredient = req.query.ingredient;

    // Filter theo loại phiếu (import / export / adjust)
    if (req.query.type) filter.type = req.query.type;

    // Filter theo khoảng thời gian (from và to theo dạng YYYY-MM-DD)
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) {
        // Lấy đến hết ngày "to" (23:59:59)
        const toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    // Phân trang
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Thực hiện 2 query song song: lấy dữ liệu và đếm tổng
    const [records, total] = await Promise.all([
      Inventory.find(filter)
        .populate('ingredient', 'name unit')
        .populate('branch', 'name')
        .populate('supplier', 'name')
        .populate('createdBy', 'fullName')
        .sort({ createdAt: -1 }) // Mới nhất lên đầu
        .skip(skip)
        .limit(limit),
      Inventory.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử nhập/xuất',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
