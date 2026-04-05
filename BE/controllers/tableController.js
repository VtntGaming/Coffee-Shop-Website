const Table = require('../models/Table');
const Branch = require('../models/Branch');

// GET /api/tables - Lấy tất cả bàn (có thể lọc theo branch/status/floor)
exports.getAllTables = async (req, res) => {
  try {
    // Xây dựng filter từ query params
    const filter = { isActive: true };
    if (req.query.branch && req.query.branch.length === 24) filter.branch = req.query.branch;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.floor) filter.floor = parseInt(req.query.floor);

    const tables = await Table.find(filter)
      .populate('branch', 'name address');

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/tables/:id - Lấy thông tin 1 bàn
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

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// POST /api/tables - Tạo bàn mới (ADMIN)
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, branch, capacity, status, floor, description } = req.body;

    // Kiểm tra chi nhánh có tồn tại không
    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        message: 'Chi nhánh không tồn tại'
      });
    }

    // Tạo bàn mới (unique constraint trên tableNumber + branch sẽ được kiểm tra)
    const table = await Table.create({
      tableNumber,
      branch,
      capacity,
      status,
      floor,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Tạo bàn thành công',
      data: table
    });
  } catch (error) {
    // Lỗi duplicate tableNumber trong chi nhánh
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Bàn số này đã tồn tại trong chi nhánh'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PUT /api/tables/:id - Cập nhật bàn (ADMIN/STAFF)
exports.updateTable = async (req, res) => {
  try {
    const { tableNumber, capacity, status, floor, description } = req.body;

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { tableNumber, capacity, status, floor, description },
      { new: true, runValidators: true }
    );

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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// PATCH /api/tables/:id/status - Cập nhật trạng thái bàn (ADMIN/STAFF)
exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Kiểm tra status hợp lệ
    const validStatus = ['available', 'occupied', 'reserved', 'maintenance'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
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
      message: 'Cập nhật trạng thái thành công',
      data: table
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE /api/tables/:id - Xóa bàn (soft delete, ADMIN)
exports.deleteTable = async (req, res) => {
  try {
    // Soft delete: set isActive = false
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
