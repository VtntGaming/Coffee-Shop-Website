# 📦 NGƯỜI 4: KHO + NGUYÊN LIỆU FRONT-END

> **Vai trò**: Xây UI cho nguyên liệu, nhà cung cấp và tồn kho
> **Độ khó**: ⭐⭐⭐
> **Phụ thuộc**: Cần Người 1 (layout/auth) và nên có dữ liệu Branch từ Người 2

---

## 🎯 Mục tiêu chính

Người 4 chịu trách nhiệm các màn hình quản trị nội bộ:
- quản lý nguyên liệu
- quản lý nhà cung cấp
- theo dõi nhập/xuất/điều chỉnh kho
- cảnh báo tồn kho thấp

---

## 📁 Các file nên tạo

```txt
FE/src/
├── pages/
│   ├── ingredients/IngredientListPage.tsx
│   ├── suppliers/SupplierListPage.tsx
│   ├── inventory/InventoryPage.tsx
│   └── inventory/InventoryForm.tsx
├── components/features/
│   ├── ingredients/IngredientTable.tsx
│   ├── suppliers/SupplierTable.tsx
│   └── inventory/LowStockAlert.tsx
├── services/
│   ├── ingredientService.ts
│   ├── supplierService.ts
│   └── inventoryService.ts
└── types/
    ├── ingredient.ts
    ├── supplier.ts
    └── inventory.ts
```

---

## 📋 Công việc cần làm

### 1. Màn hình nguyên liệu
- Danh sách nguyên liệu
- Thêm/sửa nguyên liệu
- Hiển thị đơn vị tính, mức tồn tối thiểu

### 2. Màn hình nhà cung cấp
- Danh sách NCC
- Form thêm/sửa
- Hiển thị người liên hệ, điện thoại, email

### 3. Màn hình tồn kho
- Danh sách phiếu nhập/xuất/điều chỉnh
- Filter theo chi nhánh, loại phiếu, thời gian
- Hiển thị tổng số lượng / tổng tiền
- Có cảnh báo low stock

---

## 🔌 API cần dùng

| Method | Endpoint | Mục đích |
|---|---|---|
| `GET` | `/api/ingredients` | Lấy nguyên liệu |
| `POST` | `/api/ingredients` | Tạo nguyên liệu |
| `PUT` | `/api/ingredients/:id` | Cập nhật nguyên liệu |
| `GET` | `/api/suppliers` | Lấy nhà cung cấp |
| `POST` | `/api/suppliers` | Tạo NCC |
| `PUT` | `/api/suppliers/:id` | Cập nhật NCC |
| `GET` | `/api/inventory` | Lấy lịch sử kho |
| `POST` | `/api/inventory` | Tạo phiếu nhập/xuất |

---

## ✅ Checklist hoàn thành

- [ ] Có trang ingredients
- [ ] Có trang suppliers
- [ ] Có trang inventory với filter rõ ràng
- [ ] Có low-stock alert hoặc badge cảnh báo
- [ ] Có kết nối API ổn định
- [ ] Có định dạng số lượng / tiền tệ dễ nhìn

---

## 💡 Gợi ý thực hiện

Người 4 có thể dựng sớm phần:
- bảng nguyên liệu
- bảng nhà cung cấp
- bộ filter tồn kho

Phần liên quan `branch` nên bám theo dữ liệu Người 2 để tránh lệch field.
