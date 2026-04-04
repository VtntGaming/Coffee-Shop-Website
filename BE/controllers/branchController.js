const Branch = require('../models/Branch');

// GET / api/branches - Lấy tất cả chi nhánh
exports.getAllBranches = async (req, res) => {
    try {
        const branches = await Branch.find({ isActive: true})
            .populate('manager', 'fullName email phone'); // Lấy thông tin quản lý chi nhánh

        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// GET / api/branches/:id - Lấy chi nhánh theo ID
exports.getBranchById = async (req, res) => {
    try {
        const branch = await Branch.findById(req.params.id)

    // Kiểm tra nếu chi nhánh không tồn
    if (!branch) {
        return res.status(404).json({
            success: false,
            message: 'Chi nhánh không tồn tại'
        }); 
    }
    // Kiểm tra nếu chi nhánh đã bị xóa
    res.status(200).json({
        success: true,
        data: branch
    });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// POST / api/branches - Tạo chi nhánh mới
exports.createBranch = async (req, res) => {
    try {
        const { name, address, phone, openTime, closeTime, manager } = req.body;

        // Tạo chi nhánh mới - Lỗi duplivate  name sẽ được bắt ở catch
        const branch = await Branch.create({
            name,
            address,
            phone,
            openTime,
            closeTime,
            manager
        });

        // Trả về chi nhánh mới tạo
        res.status(201).json({
            success: true,
            data: branch
        });
    } catch (error) {
        // Kiểm tra lỗi duplicate 
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Tên chi nhánh đã tồn tại'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// PUT / api/branches/:id - Cập nhật chi nhánh
exports.updateBranch = async (req, res) => {
    try {
        const { name, address, phone, openTime, closeTime, manager } = req.body;

        // Cập nhật chi nhánh
        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            { name, address, phone, openTime, closeTime, manager, isActive },
            { new: true, runValidators: true }
        );

        // Kiểm tra nếu chi nhánh không tồn tại
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Chi nhánh không tồn tại'
            });
        }

        // Trả về chi nhánh đã cập nhật
        res.status(200).json({
            success: true,
            message: 'Cập nhật chi nhánh thành công',
            data: branch
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// DELETE / api/branches/:id - Xóa chi nhánh (thay đổi trạng thái isActive)
exports.deleteBranch = async (req, res) => {
    try {
        // Soft delete: chỉ set isActive = false, không xóa dữ liệu 
        const branch = await Branch.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        // Kiểm tra nếu chi nhánh không tồn tại
        if( !branch ) {
            return res.status(404).json({
                success: false,
                message: 'Chi nhánh không tồn tại'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Đã vô hiệu hóa chi nhánh thành công',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};
