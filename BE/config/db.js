require("dotenv").config();
const mongoose = require("mongoose");

/**
 * Kết nối MongoDB sử dụng Mongoose
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/coffeeshop";
    const conn = await mongoose.connect(uri);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Xử lý sự kiện khi MongoDB kết nối thành công
mongoose.connection.on("connected", () => {
  console.log(" Mongoose connected to MongoDB");
});

// Xử lý sự kiện khi MongoDB bị ngắt kết nối
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Xử lý lỗi MongoDB
mongoose.connection.on("error", (err) => {
  console.error(`MongoDB Error: ${err}`);
});

module.exports = connectDB;
