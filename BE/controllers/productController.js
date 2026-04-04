const Product = require('../models/product');
const Category = require('../models/category');

exports.getAllProducts = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }
    if (req.query.isBestSeller) {
      filter.isBestSeller = req.query.isBestSeller === 'true';
    }
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ isBestSeller: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, category, price, sizes, isAvailable, isBestSeller, tags } = req.body;

    const productData = {
      name, description, category, price, isAvailable, isBestSeller
    };

    if (sizes && typeof sizes === 'string') {
      productData.sizes = JSON.parse(sizes);
    } else if (sizes) {
      productData.sizes = sizes;
    }

    if (tags && typeof tags === 'string') {
      productData.tags = JSON.parse(tags);
    } else if (tags) {
      productData.tags = tags;
    }

    if (req.file) {
      productData.image = '/uploads/' + req.file.filename;
    }

    const product = await Product.create(productData);
    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: populatedProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, category, price, sizes, isAvailable, isBestSeller, isActive, tags } = req.body;

    const updateData = { name, description, category, price, isAvailable, isBestSeller, isActive };

    if (sizes && typeof sizes === 'string') {
      updateData.sizes = JSON.parse(sizes);
    } else if (sizes) {
      updateData.sizes = sizes;
    }

    if (tags && typeof tags === 'string') {
      updateData.tags = JSON.parse(tags);
    } else if (tags) {
      updateData.tags = tags;
    }

    if (req.file) {
      updateData.image = '/uploads/' + req.file.filename;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Đã vô hiệu hóa sản phẩm'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
