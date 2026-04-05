# ☕ Coffee Shop Website — Frontend Design Rules

> Tài liệu quy chuẩn thiết kế giao diện dành cho toàn bộ dev làm việc trong thư mục `FE/`.
> Mục tiêu là giữ cho front-end **đồng nhất, hiện đại, dễ mở rộng và dễ bảo trì**.

---

## 1. Mục tiêu chung

- Front-end phải **hiện đại, sạch sẽ, dễ mở rộng và dễ maintain**.
- Ưu tiên sử dụng **React + TypeScript**, **không dùng JavaScript thuần** cho source chính.
- Giao diện phải phù hợp với mô hình **quản lý quán cà phê**: thân thiện, rõ ràng, thao tác nhanh.

---

## 2. Định hướng thiết kế UI

- Phong cách: **modern, clean, warm, professional**.
- Cảm hứng màu sắc: **coffee / café / neutral**.
- Ưu tiên trải nghiệm cho **dashboard quản trị**, nhưng vẫn có thể mở rộng cho trang khách hàng.
- Không làm giao diện quá rối, quá nhiều màu hoặc quá nhiều hiệu ứng.

---

## 3. Hệ màu khuyến nghị

- Màu chủ đạo: **nâu cà phê, cam đất, kem, trắng, xám đậm**.
- Toàn team nên dùng **cùng một design system màu sắc**, không để mỗi màn hình một kiểu.

| Vai trò | Màu gợi ý |
|---|---|
| Primary | `#8B5E3C` |
| Secondary | `#C97C3D` |
| Accent | `#F4E7DA` |
| Background | `#FFFAF5` hoặc `#F8F5F2` |
| Text | `#1F2937` |
| Success | `#16A34A` |
| Warning | `#D97706` |
| Error | `#DC2626` |

---

## 4. Typography

- Font đề xuất: **Inter**, **Be Vietnam Pro**, hoặc **Segoe UI**.
- Tiêu đề cần rõ ràng, dễ đọc, độ đậm vừa phải.
- Kích thước gợi ý:
  - `H1`: `32px - 40px`
  - `H2`: `24px - 28px`
  - `H3`: `18px - 22px`
  - `Body`: `14px - 16px`
  - `Caption`: `12px - 13px`
- Không dùng quá nhiều loại font trong cùng một project.

---

## 5. Bố cục chung

Mỗi trang nên có bố cục ổn định:

- `Header`
- `Sidebar` nếu là trang admin / dashboard
- `Main content`
- `Footer` đơn giản nếu cần

### Quy tắc layout
- Spacing nên đồng nhất theo hệ: `8px`, `12px`, `16px`, `24px`, `32px`.
- `Card`, `Table`, `Form`, `Modal` cần thống nhất style bo góc và đổ bóng.
- Nội dung quan trọng phải dễ quét mắt và dễ thao tác.

---

## 6. Các trang nên có ở giai đoạn đầu

- `Login`
- `Dashboard`
- `Quản lý người dùng`
- `Quản lý chi nhánh / bàn`
- `Menu / sản phẩm`
- `Kho nguyên liệu`
- `Đơn hàng`
- `Voucher / khuyến mãi`
- `404 page / Empty state / Loading state`

---

## 7. Quy tắc component

- Ưu tiên tách component nhỏ, có thể tái sử dụng.
- Nên có các component dùng chung như:
  - `Button`
  - `Input`
  - `Select`
  - `Card`
  - `Modal`
  - `Table`
  - `Badge`
  - `EmptyState`
  - `LoadingSpinner`
- Tên component phải rõ nghĩa, không đặt tên mơ hồ.
- Không viết logic quá lớn trong một file component.

---

## 8. Responsive design

- Giao diện phải dùng tốt trên **laptop trước**, sau đó tối ưu cho **tablet** và **mobile**.
- Breakpoint gợi ý:
  - `Mobile`: `< 640px`
  - `Tablet`: `640px - 1023px`
  - `Desktop`: `>= 1024px`
- Bảng dữ liệu lớn cần có xử lý responsive hợp lý, tránh vỡ layout.

---

## 9. UX rules

- Nút bấm quan trọng phải dễ thấy, rõ màu, dễ click.
- Form phải có label đầy đủ, thông báo lỗi rõ ràng.
- Trạng thái `loading`, `empty`, `error` là **bắt buộc**.
- Xóa / cập nhật dữ liệu phải có xác nhận nếu là thao tác quan trọng.
- Ưu tiên tốc độ thao tác cho nhân viên và admin.

---

## 10. Accessibility

- Màu chữ và nền phải đủ độ tương phản.
- Nút, input, link phải có trạng thái `hover`, `focus`, `disabled`.
- Không chỉ phân biệt trạng thái bằng màu sắc duy nhất.
- Ảnh hoặc icon quan trọng nên có text hỗ trợ khi cần.

---

## 11. Icon & hình ảnh

- Icon phải đồng bộ cùng một bộ, ví dụ: `lucide-react`, `react-icons`.
- Không dùng quá nhiều kiểu icon khác nhau trong cùng dự án.
- Ảnh sản phẩm nên có tỉ lệ thống nhất, ưu tiên `1:1` hoặc `4:3`.

---

## 12. Quy tắc code front-end

- Dùng **TypeScript** cho tất cả `component`, `page`, `hook`, `utility`.
- Cấu trúc thư mục nên rõ ràng:

```txt
src/
├── pages/
├── components/
├── layouts/
├── services/
├── types/
├── hooks/
└── assets/
```

- Không hard-code dữ liệu nếu có thể tách ra `constants` hoặc `mock data`.
- Tên biến, tên component nên viết bằng **tiếng Anh** để dễ maintain.
- Text giao diện có thể viết bằng **tiếng Việt** nếu phù hợp với nghiệp vụ dự án.

---

## 13. Quy tắc đặt tên

- `Component`: dùng **PascalCase**
  Ví dụ: `ProductCard.tsx`, `DashboardLayout.tsx`

- `Hook`: dùng **camelCase** và bắt đầu bằng `use`
  Ví dụ: `useAuth.ts`, `useProducts.ts`

- `CSS class` / `style naming`: phải thống nhất và dễ đọc.

---

## 14. Kết nối backend sau này

- Front-end phải để sẵn khả năng kết nối API trong thư mục `services/`.
- Mỗi module nên có file service riêng.
- Xử lý `loading`, `error`, `success` phải rõ ràng.
- Chuẩn bị sẵn kiểu dữ liệu (`types` / `interfaces`) theo backend.

---

## 15. Những điều không được làm

- Không dùng JavaScript cho source chính.
- Không copy quá nhiều `inline style` lung tung.
- Không để mỗi page một style khác nhau hoàn toàn.
- Không viết component vừa xử lý UI vừa ôm quá nhiều nghiệp vụ phức tạp.
- Không merge code nếu giao diện bị vỡ layout hoặc màu sắc lệch hệ thống.

---

## 16. Nguyên tắc làm việc nhóm

- Trước khi thêm màn hình mới, cần bám theo rule này.
- Nếu cần sửa design system, phải thống nhất với cả team.
- Ưu tiên tái sử dụng component thay vì viết lại từ đầu.
- Mỗi pull request front-end nên có ảnh chụp màn hình hoặc mô tả UI đã thay đổi.

---

## 17. Hướng phát triển đề xuất

### Phase 1
- Dựng layout tổng thể
- Thêm các page cơ bản
- Dùng dữ liệu mẫu

### Phase 2
- Thêm router
- State management nhẹ
- Service API

### Phase 3
- Kết nối thật với backend
- Tối ưu UX
- Hoàn thiện trải nghiệm người dùng

---

## 18. Kết luận

Tài liệu này là rule chung cho toàn bộ dev front-end trong thư mục `FE/`.
Mọi implementation mới nên tuân theo các quy tắc trên để giữ cho dự án **đồng bộ, đẹp và chuyên nghiệp**.
