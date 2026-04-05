const Branch = require('../models/Branch');

// GET /api/branches - Lấy tất cả chi nhánh (active)
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/branches/:id - Lấy chi nhánh theo ID
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

    res.status(200).json({
      success: true,
      data: branch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// POST /api/branches - Tạo chi nhánh mới (ADMIN)
exports.createBranch = async (req, res) => {
  try {
    const { name, address, phone, openTime, closeTime, manager } = req.body;

    // Tạo chi nhánh mới — lỗi duplicate name sẽ được bắt ở catch
    const branch = await Branch.create({
      name,
      address,
      phone,
      openTime,
      closeTime,
      manager: manager || null  // manager là optional
    });

    res.status(201).json({
      success: true,
      message: 'Tạo chi nhánh thành công',
      data: branch
    });
  } catch (error) {
    // Kiểm tra lỗi duplicate (error code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tên chi nhánh đã tồn tại'
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE /api/branches/:id - Xóa chi nhánh (soft delete, ADMIN)
exports.deleteBranch = async (req, res) => {
  try {
    // Soft delete: chỉ set isActive = false, không xóa dữ liệu
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

