const Voucher = require("../models/Voucher");

// GET /api/vouchers - Lấy danh sách voucher, hỗ trợ lọc theo active
exports.getAllVouchers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === "true") filter.isActive = true;

    const vouchers = await Voucher.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/vouchers/:id - Lấy chi tiết 1 voucher theo ID
exports.getVoucherById = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }
    res.status(200).json({ success: true, data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/vouchers/check - Kiểm tra voucher hợp lệ và tính tiền giảm ước tính
exports.checkVoucher = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) {
      return res.status(404).json({ success: false, message: "Mã voucher không tồn tại" });
    }

    // Kiểm tra hiệu lực (active, hạn, lượt)
    const validity = voucher.isValid();
    if (!validity.valid) {
      return res.status(400).json({ success: false, message: validity.reason });
    }

    // Tính giảm giá ước tính
    const result = voucher.calculateDiscount(orderAmount || 0);
    if (result.reason) {
      return res.status(400).json({ success: false, message: result.reason });
    }

    res.status(200).json({
      success: true,
      message: "Voucher hợp lệ",
      data: {
        voucherId: voucher._id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        estimatedDiscount: result.discount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/vouchers - Tạo voucher mới (ADMIN)
exports.createVoucher = async (req, res) => {
  try {
    const {
      code, description, discountType, discountValue,
      maxDiscount, minOrderAmount, startDate, endDate, usageLimit,
    } = req.body;

    const voucher = await Voucher.create({
      code, description, discountType, discountValue,
      maxDiscount, minOrderAmount, startDate, endDate, usageLimit,
    });

    res.status(201).json({
      success: true,
      message: "Tạo voucher thành công",
      data: voucher,
    });
  } catch (error) {
    // Trả lỗi rõ ràng nếu mã voucher đã tồn tại (duplicate key)
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Mã voucher đã tồn tại" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/vouchers/:id - Cập nhật thông tin voucher (ADMIN)
exports.updateVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }

    res.status(200).json({
      success: true,
      message: "Cập nhật voucher thành công",
      data: voucher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/vouchers/:id - Vô hiệu hóa voucher (soft delete, chỉ set isActive = false)
exports.deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Không tìm thấy voucher" });
    }

    res.status(200).json({
      success: true,
      message: "Đã vô hiệu hóa voucher",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
