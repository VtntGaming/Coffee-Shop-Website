const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// register
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // Lấy role STAFF làm mặc định
    let staffRole = await Role.findOne({ name: 'STAFF' });
    if (!staffRole) {
      staffRole = await Role.create({ name: 'STAFF', description: 'Nhân viên' });
    }

    // Tạo user mới — lỗi duplicate email sẽ được bắt ở catch
    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: staffRole._id
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: staffRole.name
        }
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng ký',
      error: error.message
    });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tìm user (bao gồm password vì select: false)
    const user = await User.findOne({ email })
      .select('+password')
      .populate('role');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra tài khoản active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị vô hiệu hóa'
      });
    }

    // So sánh password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role.name
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message
    });
  }
};

// GET /api/auth/me - Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin',
      error: error.message
    });
  }
};
