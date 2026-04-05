# 🔄 FRONT-END PROJECT FLOW - THỨ TỰ LÀM VIỆC

## 🎯 Mục tiêu

Tài liệu này mô tả **ai làm trước**, **ai làm song song** và **ai làm sau** ở phía front-end để khớp với phần back-end của từng người.

---

## 👥 Phân vai tương ứng

| Người | Phần back-end | Phần front-end tương ứng | Mức phụ thuộc |
|---|---|---|---|
| **Người 1** | Auth + Core | Login, route, layout, dashboard, component chung | Thấp |
| **Người 2** | Branch + Table | Quản lý chi nhánh và bàn | Trung bình |
| **Người 3** | Menu | Quản lý category và product | Trung bình |
| **Người 4** | Kho + nguyên liệu | Ingredients, suppliers, inventory | Trung bình |
| **Người 5** | Order + Voucher | POS/order flow, voucher, trạng thái đơn | Cao nhất |

---

## 🚦 Thứ tự làm khuyến nghị

### Giai đoạn 1 — Làm trước

#### ✅ Người 1 làm trước
Người 1 cần hoàn thành các phần nền cho cả team:
- `router`
- `login`
- `auth context`
- `protected route`
- `admin layout`
- `sidebar/header`
- `api client`
- component chung

> Nếu chưa có phần này, các module khác vẫn làm được UI nhưng sẽ khó ghép vào app thật.

---

### Giai đoạn 2 — Làm song song

#### ✅ Người 2, Người 3, Người 4 làm song song
Sau khi Người 1 xong khung cơ bản, ba người này có thể triển khai cùng lúc:

- **Người 2**: màn hình chi nhánh và bàn
- **Người 3**: màn hình danh mục và sản phẩm
- **Người 4**: màn hình nguyên liệu, NCC, tồn kho

Ba phần này tương đối độc lập nếu đã dùng chung:
- layout
- auth
- button / input / modal / table
- api client

---

### Giai đoạn 3 — Làm sau

#### ✅ Người 5 làm sau cùng ở phần chính
Người 5 phụ thuộc nhiều vào dữ liệu của:
- Người 2: `branch`, `table`
- Người 3: `product`, `category`
- Người 1: `auth`, `layout`

Vì vậy Người 5 nên:
1. dựng trước layout trang order bằng mock data
2. chờ dữ liệu menu + bàn ổn định
3. nối API thật và hoàn thiện luồng đặt đơn

---

## 🧩 Sơ đồ phụ thuộc

```txt
Người 1 (Auth + Core)
        │
        ├──> Người 2 (Branch + Table)
        ├──> Người 3 (Menu)
        ├──> Người 4 (Inventory)
        │
        └──> Người 5 (Order)
                 ├── cần dữ liệu từ Người 2
                 └── cần dữ liệu từ Người 3
```

---

## 📅 Kế hoạch thực hiện gợi ý

### Day 1
- Người 1: dựng app shell, login, route, layout
- Người 2/3/4: chuẩn bị mock UI và types
- Người 5: phác thảo flow order

### Day 2
- Người 2/3/4: nối API thật, hoàn thiện CRUD cơ bản
- Người 1: hỗ trợ fix layout chung, auth bug
- Người 5: bắt đầu nối sản phẩm và bàn vào order

### Day 3
- Người 5: hoàn thiện tạo đơn, voucher, trạng thái đơn
- Cả team: test tích hợp, sửa lỗi UI/API, đồng bộ responsive

---

## ✅ Kết luận ngắn

- **Làm trước:** Người 1
- **Làm song song:** Người 2, 3, 4
- **Làm sau:** Người 5

Đây là thứ tự tối ưu nhất để front-end bám đúng phụ thuộc của back-end mà không chồng chéo công việc.
