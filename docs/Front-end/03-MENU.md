# 🍹 NGƯỜI 3: MENU FRONT-END (Category + Product)

> **Vai trò**: Xây giao diện quản lý menu, danh mục và sản phẩm
> **Độ khó**: ⭐⭐⭐
> **Phụ thuộc**: Cần Người 1 hoàn thành auth, layout, component chung

---

## 🎯 Mục tiêu chính

Người 3 phụ trách phần UI liên quan đến menu quán cà phê:
- danh mục sản phẩm
- danh sách sản phẩm
- thêm/sửa sản phẩm
- upload ảnh sản phẩm
- tìm kiếm và filter menu

---

## 📁 Các file nên tạo

```txt
FE/src/
├── pages/
│   ├── categories/CategoryListPage.tsx
│   ├── categories/CategoryForm.tsx
│   ├── products/ProductListPage.tsx
│   ├── products/ProductForm.tsx
│   └── products/ProductDetailDrawer.tsx
├── components/features/
│   ├── categories/CategoryTable.tsx
│   └── products/ProductCard.tsx
├── services/
│   ├── categoryService.ts
│   └── productService.ts
└── types/
    ├── category.ts
    └── product.ts
```

---

## 📋 Công việc cần làm

### 1. Trang danh mục
- Danh sách category
- Tạo / sửa / ẩn category
- Cho phép upload ảnh nếu backend hỗ trợ

### 2. Trang sản phẩm
- Hiển thị list sản phẩm
- Search theo tên
- Filter theo danh mục / trạng thái bán / best seller
- Form thêm/sửa sản phẩm
- Nhập giá, size, tag, ảnh sản phẩm

### 3. Trải nghiệm quản trị
- Bảng dữ liệu rõ ràng
- Có preview ảnh khi upload
- Có phân trang nếu dữ liệu nhiều

---

## 🔌 API cần dùng

| Method | Endpoint | Mục đích |
|---|---|---|
| `GET` | `/api/categories` | Lấy danh mục |
| `POST` | `/api/categories` | Tạo danh mục |
| `PUT` | `/api/categories/:id` | Sửa danh mục |
| `DELETE` | `/api/categories/:id` | Ẩn/xóa mềm danh mục |
| `GET` | `/api/products` | Lấy sản phẩm |
| `GET` | `/api/products/:id` | Chi tiết sản phẩm |
| `POST` | `/api/products` | Tạo sản phẩm |
| `PUT` | `/api/products/:id` | Sửa sản phẩm |
| `DELETE` | `/api/products/:id` | Ẩn/xóa mềm sản phẩm |

---

## ✅ Checklist hoàn thành

- [ ] Có màn hình category hoạt động
- [ ] Có màn hình product hoạt động
- [ ] Có search/filter/pagination cơ bản
- [ ] Có upload/preview ảnh hợp lý
- [ ] Dữ liệu map đúng từ backend sang UI
- [ ] Có loading / empty / error state

---

## 🤝 Lưu ý phối hợp

Người 3 nên phối hợp sớm với:
- **Người 1** để dùng chung modal/form/table
- **Người 5** vì màn hình order sẽ lấy dữ liệu sản phẩm từ phần này
