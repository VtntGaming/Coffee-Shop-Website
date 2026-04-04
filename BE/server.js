require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import routes (sẽ thêm sau khi tạo routes)
// const productRoutes = require("./routes/product.routes");
// const userRoutes = require("./routes/user.routes");
// const orderRoutes = require("./routes/order.routes");
// const categoryRoutes = require("./routes/category.routes");

// Khởi tạo app Express
const app = express();

// Kết nối MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (sẽ thêm sau khi tạo routes)
// app.use("/api/products", productRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/categories", categoryRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.json({
    message: "☕ Coffee Shop API Server",
    status: "Running",
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
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📦 Môi trường: ${process.env.NODE_ENV || "development"}`);
});
