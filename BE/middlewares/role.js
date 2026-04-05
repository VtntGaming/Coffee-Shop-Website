const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user đã được gắn từ middleware auth
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    if (!roles.includes(req.user.role.name)) {
      return res.status(403).json({
        success: false,
        message: `Role "${req.user.role.name}" không có quyền thực hiện hành động này`
      });
    }

    next();
  };
};

module.exports = authorize;
