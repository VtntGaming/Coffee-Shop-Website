type ModuleItem = {
  title: string;
  description: string;
  badge: string;
};

type StatItem = {
  label: string;
  value: string;
};

const stats: StatItem[] = [
  { label: 'Trạng thái', value: 'Ready UI' },
  { label: 'Công nghệ', value: 'React + TS' },
  { label: 'Mục tiêu', value: 'Landing cơ bản' }
];

const modules: ModuleItem[] = [
  {
    title: 'Auth & Users',
    description: 'Khung giao diện cho đăng nhập, tài khoản và phân quyền người dùng.',
    badge: 'Core'
  },
  {
    title: 'Chi nhánh & Bàn',
    description: 'Khu vực dành cho quản lý cửa hàng, sơ đồ bàn và trạng thái phục vụ.',
    badge: 'Store'
  },
  {
    title: 'Menu & Sản phẩm',
    description: 'Hiển thị danh mục đồ uống, món nổi bật và mô tả sản phẩm.',
    badge: 'Menu'
  },
  {
    title: 'Kho nguyên liệu',
    description: 'Màn hình tổng quan về tồn kho, nhà cung cấp và nhập hàng.',
    badge: 'Inventory'
  },
  {
    title: 'Đơn hàng',
    description: 'Nơi theo dõi đơn tại quầy, mang đi hoặc phục vụ tại bàn.',
    badge: 'Order'
  },
  {
    title: 'Voucher',
    description: 'Không gian dành cho khuyến mãi, giảm giá và ưu đãi thành viên.',
    badge: 'Promo'
  }
];

function App() {
  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <span className="hero__eyebrow">Coffee Shop Website</span>
          <h1>Coffee Shop Website</h1>
          <p>
            Đây là giao diện khởi tạo ban đầu trong thư mục <strong>FE</strong>, sẵn sàng để mở
            rộng thêm router, API và các màn hình nghiệp vụ sau này.
          </p>

          <div className="hero__actions">
            <button type="button">Khám phá giao diện</button>
            <a href="#modules">Xem các module</a>
          </div>
        </div>

        <div className="hero__panel">
          <p className="panel__title">Tổng quan nhanh</p>
          <div className="stats-grid">
            {stats.map((stat) => (
              <article key={stat.label} className="stat-card">
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section className="section section--intro">
          <div>
            <p className="section__tag">Giới thiệu</p>
            <h2>Giao diện mẫu bám theo cấu trúc backend hiện tại</h2>
          </div>
          <p className="section__text">
            Front-end này chưa kết nối chức năng thật, nhưng đã có bố cục rõ ràng để tiếp tục phát
            triển cho các phần như xác thực, menu, kho, đơn hàng và báo cáo.
          </p>
        </section>

        <section id="modules" className="section">
          <div className="section__header">
            <div>
              <p className="section__tag">Modules</p>
              <h2>Các khu vực giao diện đề xuất</h2>
            </div>
            <span className="section__hint">UI placeholder</span>
          </div>

          <div className="module-grid">
            {modules.map((item) => (
              <article key={item.title} className="module-card">
                <span className="module-card__badge">{item.badge}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
