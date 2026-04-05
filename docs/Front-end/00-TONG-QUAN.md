# ☕ COFFEE SHOP MANAGEMENT - HƯỚNG DẪN TỔNG QUAN FRONT-END

## 📌 Mục tiêu

Tài liệu này chia phần việc **front-end** tương ứng với phần **back-end** mà mỗi người đã nhận.
Mục tiêu là để team làm song song nhưng vẫn đồng bộ về layout, component, API service và luồng màn hình.

- **Frontend**: React + TypeScript + Vite
- **Phong cách UI**: hiện đại, ấm, dễ thao tác cho quán cà phê
- **Ưu tiên**: dashboard quản trị trước, tối ưu quy trình thao tác sau

---

## 📁 Cấu trúc thư mục FE đề xuất

```txt
FE/
├── src/
│   ├── app/
│   │   └── router.tsx              # Khai báo route chung
│   ├── layouts/
│   │   ├── AdminLayout.tsx         # Layout dashboard chính
│   │   └── AuthLayout.tsx          # Layout cho login
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── branches/
│   │   ├── tables/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── ingredients/
│   │   ├── suppliers/
│   │   ├── inventory/
│   │   ├── orders/
│   │   └── vouchers/
│   ├── components/
│   │   ├── common/                 # Button, Input, Modal, Table...
│   │   ├── layout/                 # Header, Sidebar, Breadcrumb...
│   │   └── features/               # Component theo từng module
│   ├── services/                   # Gọi API theo module
│   ├── hooks/                      # Custom hooks
│   ├── types/                      # Interface/type theo dữ liệu BE
│   ├── utils/                      # Hàm format, constants, helpers
│   └── assets/
├── package.json
└── FRONTEND_RULES.md
```

---

## 👥 Mapping người làm Back-end ↔ Front-end

| Người | Back-end đang làm | Front-end tương ứng cần làm |
|---|---|---|
| **Người 1** | Auth + Core | Login, guard route, layout, dashboard nền tảng |
| **Người 2** | Branch + Table | Màn hình chi nhánh, bàn, filter trạng thái |
| **Người 3** | Category + Product | Màn hình menu, danh mục, sản phẩm, upload ảnh |
| **Người 4** | Ingredient + Supplier + Inventory | Màn hình nguyên liệu, nhà cung cấp, tồn kho |
| **Người 5** | Order + Voucher | Màn hình tạo đơn, danh sách đơn, voucher, trạng thái đơn |

---

## 🧩 Quy ước chia việc

### 1. Người 1 làm phần nền tảng trước
Người 1 cần dựng các phần dùng chung để cả team dùng lại:
- `router`
- `AdminLayout`
- `Sidebar`, `Header`
- `AuthContext` / `useAuth`
- `ProtectedRoute`
- `api client` gọi backend
- bộ component chung như `Button`, `Input`, `Modal`, `DataTable`, `Badge`

### 2. Người 2, 3, 4 làm song song sau khi có nền tảng
Sau khi layout + auth + route cơ bản xong, ba người này có thể làm cùng lúc:
- trang danh sách
- form thêm/sửa
- filter/search
- kết nối API module của mình

### 3. Người 5 làm sau cùng ở phần chính
Người 5 phụ thuộc nhiều nhất vì màn hình order cần:
- user đăng nhập
- chi nhánh / bàn
- sản phẩm / menu
- voucher

Tuy nhiên Người 5 vẫn có thể dựng **khung UI** và **type/order flow** trước bằng mock data.

---

## 🚀 Thứ tự triển khai khuyến nghị

1. **Người 1**: Auth + Layout + Route + Shared components
2. **Người 2, 3, 4**: Làm song song các module quản trị
3. **Người 5**: Hoàn thiện POS / Order sau khi menu và bàn ổn định
4. **Cả team**: Test tích hợp, sửa giao diện, đồng bộ API

---

## 🌐 Chuẩn kết nối API

Mỗi module nên có service riêng trong `src/services/`:

```ts
// ví dụ
export const authService = {
  login: (payload) => fetch('/api/auth/login', { ... }),
};
```

Gợi ý tách file:
- `authService.ts`
- `branchService.ts`
- `tableService.ts`
- `categoryService.ts`
- `productService.ts`
- `inventoryService.ts`
- `supplierService.ts`
- `ingredientService.ts`
- `orderService.ts`
- `voucherService.ts`

---

## ✅ Definition of Done cho mỗi người

Mỗi phần front-end chỉ xem là xong khi có đủ:

- Trang list hiển thị được dữ liệu
- Có loading / empty / error state
- Có form thêm hoặc sửa dữ liệu
- Có validate cơ bản ở UI
- Có kết nối đúng API backend tương ứng
- Giao diện bám theo `FE/FRONTEND_RULES.md`

---

## 📚 Bộ tài liệu chi tiết

- `01-AUTH-CORE.md`
- `02-CUA-HANG.md`
- `03-MENU.md`
- `04-KHO-NGUYEN-LIEU.md`
- `05-ORDER.md`
- `PROJECT_FLOW.md`

Tất cả file trên nằm trong `docs/Front-end/`.
