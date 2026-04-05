# 🧾 NGƯỜI 5: ORDER FRONT-END (Order + Voucher)

> **Vai trò**: Xây giao diện tạo đơn, quản lý đơn hàng và voucher
> **Độ khó**: ⭐⭐⭐⭐⭐
> **Phụ thuộc**: Cần Người 1 (auth/layout), Người 2 (branch/table), Người 3 (menu/product)

---

## 🎯 Mục tiêu chính

Người 5 phụ trách phần giao diện phức tạp nhất của FE:
- tạo đơn hàng mới
- chọn bàn / kiểu đơn
- chọn sản phẩm và số lượng
- áp voucher
- đổi trạng thái đơn
- xem lịch sử đơn hàng

---

## 📁 Các file nên tạo

```txt
FE/src/
├── pages/
│   ├── orders/OrderListPage.tsx
│   ├── orders/CreateOrderPage.tsx
│   ├── orders/OrderDetailPage.tsx
│   └── vouchers/VoucherListPage.tsx
├── components/features/
│   ├── orders/OrderStatusBadge.tsx
│   ├── orders/ProductPicker.tsx
│   ├── orders/CartPanel.tsx
│   └── vouchers/VoucherForm.tsx
├── services/
│   ├── orderService.ts
│   └── voucherService.ts
└── types/
    ├── order.ts
    └── voucher.ts
```

---

## 📋 Công việc cần làm

### 1. Trang danh sách đơn hàng
- Hiển thị mã đơn, chi nhánh, bàn, tổng tiền, trạng thái
- Filter theo trạng thái / thời gian / chi nhánh
- Xem chi tiết đơn

### 2. Trang tạo đơn (POS mini)
- Chọn chi nhánh
- Chọn bàn hoặc takeaway
- Chọn sản phẩm từ menu
- Tăng/giảm số lượng
- Nhập ghi chú món
- Áp voucher
- Tính tạm tính / giảm giá / tổng tiền

### 3. Trang voucher
- Danh sách voucher
- Form thêm/sửa voucher
- Kiểm tra trạng thái còn hạn / hết hạn / đã khóa

### 4. Trải nghiệm người dùng
- Status badge rõ ràng: `pending`, `confirmed`, `preparing`, `ready`, `completed`, `cancelled`
- Hành động cập nhật trạng thái nhanh
- Tối ưu thao tác cho nhân viên thu ngân

---

## 🔌 API cần dùng

| Method | Endpoint | Mục đích |
|---|---|---|
| `GET` | `/api/orders` | Danh sách đơn |
| `GET` | `/api/orders/:id` | Chi tiết đơn |
| `POST` | `/api/orders` | Tạo đơn |
| `PUT` | `/api/orders/:id` | Sửa đơn |
| `PUT/PATCH` | `/api/orders/:id/status` | Cập nhật trạng thái |
| `GET` | `/api/vouchers` | Danh sách voucher |
| `POST` | `/api/vouchers/check` | Kiểm tra voucher |
| `POST` | `/api/vouchers` | Tạo voucher |
| `GET` | `/api/products` | Lấy menu cho order |
| `GET` | `/api/tables` | Lấy bàn khả dụng |

---

## ✅ Checklist hoàn thành

- [ ] Có trang danh sách đơn hàng
- [ ] Có màn hình tạo đơn hoạt động
- [ ] Có áp voucher và tính tiền đúng ở UI
- [ ] Có cập nhật trạng thái đơn
- [ ] Có loading / empty / error state
- [ ] Flow thao tác đủ nhanh và dễ dùng

---

## 💡 Gợi ý triển khai

Trong lúc chờ module khác ổn định, Người 5 có thể làm trước:
- `type` cho order/voucher
- status badge
- layout trang order
- cart panel với mock data

Khi Người 2 và 3 bàn giao API ổn định thì nối dữ liệu thật vào.
