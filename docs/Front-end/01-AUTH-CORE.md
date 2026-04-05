# 👑 NGƯỜI 1: AUTH + CORE FRONT-END

> **Vai trò**: Dựng nền tảng giao diện chung cho toàn bộ FE
> **Độ ưu tiên**: 🔴 Cao nhất - cần làm trước
> **Phụ thuộc**: Không phụ thuộc phần FE khác

---

## 🎯 Mục tiêu chính

Người 1 chịu trách nhiệm dựng phần móng để cả team dùng chung:

- đăng nhập
- lưu trạng thái người dùng
- bảo vệ route
- layout dashboard
- router tổng
- component dùng chung
- cấu hình gọi API

---

## 📁 Các file nên tạo

```txt
FE/src/
├── app/
│   └── router.tsx
├── layouts/
│   ├── AuthLayout.tsx
│   └── AdminLayout.tsx
├── pages/
│   ├── auth/LoginPage.tsx
│   └── dashboard/DashboardPage.tsx
├── components/
│   ├── common/Button.tsx
│   ├── common/Input.tsx
│   ├── common/Modal.tsx
│   ├── common/DataTable.tsx
│   ├── common/StatusBadge.tsx
│   └── layout/Sidebar.tsx
├── hooks/useAuth.ts
├── services/authService.ts
├── services/apiClient.ts
├── types/auth.ts
└── utils/storage.ts
```

---

## 📋 Công việc cần làm

### 1. Dựng bộ khung app
- Cấu hình router cho toàn app
- Tạo layout admin có `Sidebar + Header + Main content`
- Tạo route `Login`, `Dashboard`, `404`

### 2. Làm xác thực
- Form `LoginPage`
- Gọi `POST /api/auth/login`
- Lưu token vào `localStorage` hoặc `sessionStorage`
- Tạo `ProtectedRoute` để chặn người chưa đăng nhập
- Có logic logout rõ ràng

### 3. Tạo nền tảng dùng chung
- `apiClient` dùng chung cho các module khác
- Tự thêm `Authorization: Bearer <token>` khi gọi API
- Xử lý lỗi `401/403` tập trung
- Tạo component chung để người khác dùng lại

### 4. Dựng dashboard cơ bản
- Hiển thị lời chào user
- Placeholder cho các khối thống kê
- Link sang các module: Branch, Menu, Inventory, Order

---

## 🔌 API cần dùng

| Method | Endpoint | Mục đích |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập |
| `POST` | `/api/auth/register` | Có thể dùng cho tạo user thử nghiệm |
| `GET` | `/api/users` | Admin xem danh sách người dùng |

---

## ✅ Checklist hoàn thành

- [ ] Có thể login thành công
- [ ] Route bảo vệ hoạt động đúng
- [ ] Có layout chung cho toàn app
- [ ] Có component dùng chung cho cả team
- [ ] Có `apiClient` để người 2-5 dùng lại
- [ ] Giao diện theo đúng `FRONTEND_RULES.md`

---

## 🤝 Bàn giao cho team

Sau khi xong, Người 1 cần báo team các phần sau đã sẵn sàng:

- cấu trúc thư mục chuẩn
- tên route chuẩn
- component chung đang dùng
- cách gọi `apiClient`
- cách lấy `user`, `token`, `role`
