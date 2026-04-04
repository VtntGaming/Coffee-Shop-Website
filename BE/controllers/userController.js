const User = require('../models/User');

//Lấy all user
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('role')
      .select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Lấy user theo id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('role')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo user
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    // Tạo user mới — lỗi duplicate email sẽ được bắt ở catch
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role
    });

    const populatedUser = await User.findById(user._id)
      .populate('role')
      .select('-password');

    res.status(201).json({
      success: true,
      message: 'Tạo user thành công',
      data: populatedUser
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/users/:id - Cập nhật user
exports.updateUser = async (req, res) => {
  try {
    const { fullName, phone, role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, phone, role, isActive },
      { new: true, runValidators: true }
    ).populate('role').select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật thành công',
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/users/:id - Xóa user (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa user'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
