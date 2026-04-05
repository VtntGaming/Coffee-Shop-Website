require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
// Người 4: Kho + Nguyên liệu
const ingredientRoutes = require('./routes/ingredients');
const supplierRoutes = require('./routes/suppliers');
const inventoryRoutes = require('./routes/inventory');
const branchRoutes = require('./routes/branches');
const tableRoutes = require('./routes/tables');

// Khởi tạo app Express
const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Kết nối MongoDB
connectDB();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    // Cho phép request không có Origin (Postman, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
// Người 4: Kho + Nguyên liệu
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/categories", require("./routes/categories"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/vouchers", require("./routes/vouchers"));
// Serve ảnh tĩnh
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/branches", branchRoutes);
app.use("/api/tables", tableRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.json({
    message: "Coffee Shop API",
    status: "OK",
    version: "1.0.0",
  });
});

// Middleware xử lý lỗi 404
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Middleware xử lý lỗi server
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server đang chạy tại http://localhost:${PORT}`);
  console.log(` Môi trường: ${process.env.NODE_ENV || "development"}`);
});
