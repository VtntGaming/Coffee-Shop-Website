# 🏪 NGƯỜI 2: CỬA HÀNG FRONT-END (Branch + Table)

> **Vai trò**: Xây màn hình quản lý chi nhánh và bàn
> **Độ khó**: ⭐⭐
> **Phụ thuộc**: Cần Người 1 hoàn thành layout, route và auth cơ bản

---

## 🎯 Mục tiêu chính

Người 2 phụ trách phần giao diện quản trị cho:
- danh sách chi nhánh
- tạo / sửa chi nhánh
- danh sách bàn theo chi nhánh
- cập nhật trạng thái bàn nhanh

---

## 📁 Các file nên tạo

```txt
FE/src/
├── pages/
│   ├── branches/BranchListPage.tsx
│   ├── branches/BranchForm.tsx
│   ├── tables/TableListPage.tsx
│   └── tables/TableStatusModal.tsx
├── components/features/
│   ├── branches/BranchCard.tsx
│   └── tables/TableGrid.tsx
├── services/
│   ├── branchService.ts
│   └── tableService.ts
└── types/
    ├── branch.ts
    └── table.ts
```

---

## 📋 Công việc cần làm

### 1. Trang quản lý chi nhánh
- Hiển thị danh sách chi nhánh
- Form thêm/sửa chi nhánh
- Có trạng thái `active/inactive`
- Hiển thị địa chỉ, giờ mở cửa, quản lý chi nhánh

### 2. Trang quản lý bàn
- Lọc bàn theo chi nhánh
- Lọc theo trạng thái: `available`, `occupied`, `reserved`, `maintenance`
- Hiển thị dạng bảng hoặc grid
- Cho phép cập nhật trạng thái nhanh

### 3. Trải nghiệm người dùng
- Có search/filter rõ ràng
- Badge màu theo trạng thái bàn
- Có loading / empty / error state

---

## 🔌 API cần dùng

| Method | Endpoint | Mục đích |
|---|---|---|
| `GET` | `/api/branches` | Lấy danh sách chi nhánh |
| `GET` | `/api/branches/:id` | Chi tiết chi nhánh |
| `POST` | `/api/branches` | Tạo chi nhánh |
| `PUT` | `/api/branches/:id` | Cập nhật chi nhánh |
| `GET` | `/api/tables` | Lấy danh sách bàn |
| `GET` | `/api/tables/:id` | Chi tiết bàn |
| `POST` | `/api/tables` | Tạo bàn |
| `PUT/PATCH` | `/api/tables/:id/status` | Cập nhật trạng thái bàn |

---

## ✅ Checklist hoàn thành

- [ ] Có trang danh sách chi nhánh
- [ ] Có trang/khung quản lý bàn
- [ ] Có filter theo chi nhánh và trạng thái
- [ ] Có modal hoặc form thêm/sửa
- [ ] Kết nối API ổn định
- [ ] Giao diện đồng bộ với layout chung

---

## 💡 Gợi ý làm song song

Trong lúc chờ API hoàn chỉnh, Người 2 có thể:
- dựng UI bằng mock data trước
- chuẩn bị `types` và `services`
- thống nhất format status badge với Người 1
