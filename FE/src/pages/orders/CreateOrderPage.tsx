/**
 * ============================================
 * CREATE ORDER PAGE — Trang tạo đơn hàng (POS mini)
 *
 * Chức năng:
 *   - Chọn chi nhánh → chọn bàn hoặc takeaway
 *   - Chọn sản phẩm từ menu (tìm kiếm, filter theo danh mục)
 *   - Tăng giảm số lượng, chọn size
 *   - Nhập mã voucher
 *   - Tính tạm tính / giảm giá / tổng tiền
 *   - Tạo đơn và quay về danh sách
 * ============================================
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Coffee, Plus } from 'lucide-react';
import { Button, Input } from '../../components/common';
import { CartPanel, type CartItem } from '../../components/features/orders/CartPanel';
import * as orderService from '../../services/orderService';
import * as branchService from '../../services/branchService';
import * as tableService from '../../services/tableService';
import * as voucherService from '../../services/voucherService';
import { getProducts } from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import type { Branch } from '../../types/branch';
import type { Table } from '../../types/table';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import type { OrderType, PaymentMethod, CreateOrderPayload } from '../../types/order';
import './CreateOrderPage.css';

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const API_BASE_URL = 'http://localhost:3000';

export function CreateOrderPage() {
  const navigate = useNavigate();

  // Data loading
  const [branches, setBranches] = useState<Branch[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Order settings
  const [selectedBranch, setSelectedBranch] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [selectedTable, setSelectedTable] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');

  // Product search/filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherLoading, setVoucherLoading] = useState(false);

  // Submit
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    loadBranches();
    loadProducts();
    loadCategories();
  }, []);

  // Load tables when branch changes
  useEffect(() => {
    if (selectedBranch) {
      loadTables(selectedBranch);
    } else {
      setTables([]);
      setSelectedTable('');
    }
  }, [selectedBranch]);

  async function loadBranches() {
    try {
      const res = await branchService.getAllBranches();
      if (res.success && res.data) {
        setBranches(res.data);
        if (res.data.length > 0) {
          setSelectedBranch(res.data[0]._id);
        }
      }
    } catch { /* ignore */ }
  }

  async function loadTables(branchId: string) {
    try {
      const res = await tableService.getAllTables(branchId);
      if (res.success && res.data) {
        setTables(res.data.filter(t => t.status === 'available'));
      }
    } catch { /* ignore */ }
  }

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const res = await getProducts();
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch { /* ignore */ }
    finally { setLoadingProducts(false); }
  }

  async function loadCategories() {
    try {
      const res = await categoryService.getAllCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch { /* ignore */ }
  }

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.isActive);
    if (filterCategory) {
      result = result.filter(p => p.categoryId === filterCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term));
    }
    return result;
  }, [products, filterCategory, searchTerm]);

  // Subtotal / total calculation
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [cartItems]);

  const total = Math.max(0, subtotal - voucherDiscount);

  // Add product to cart
  function handleAddToCart(product: Product, size: string = 'M') {
    const priceInfo = product.prices?.find(p => p.size === size);
    const unitPrice = priceInfo?.price || product.prices?.[0]?.price || 0;

    // Check if already in cart with same size
    const existingIndex = cartItems.findIndex(
      item => item.product === product._id && item.size === (size as 'S' | 'M' | 'L')
    );

    if (existingIndex >= 0) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, {
        product: product._id,
        productName: product.name,
        size: size as 'S' | 'M' | 'L',
        quantity: 1,
        unitPrice,
        image: product.image,
      }]);
    }

    // Reset voucher if cart changes
    if (voucherApplied) {
      setVoucherApplied(false);
      setVoucherDiscount(0);
    }
  }

  function handleUpdateQuantity(index: number, qty: number) {
    if (qty < 1) return;
    const updated = [...cartItems];
    updated[index].quantity = qty;
    setCartItems(updated);

    if (voucherApplied) {
      setVoucherApplied(false);
      setVoucherDiscount(0);
    }
  }

  function handleRemoveItem(index: number) {
    setCartItems(cartItems.filter((_, i) => i !== index));
    if (voucherApplied) {
      setVoucherApplied(false);
      setVoucherDiscount(0);
    }
  }

  async function handleApplyVoucher() {
    if (!voucherCode.trim()) return;
    setVoucherLoading(true);
    try {
      const res = await voucherService.checkVoucher(voucherCode, subtotal);
      if (res.success && res.data) {
        setVoucherDiscount(res.data.estimatedDiscount);
        setVoucherApplied(true);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Mã voucher không hợp lệ');
    } finally {
      setVoucherLoading(false);
    }
  }

  async function handleSubmit() {
    setError('');

    if (!selectedBranch) {
      setError('Vui lòng chọn chi nhánh');
      return;
    }
    if (orderType === 'dine-in' && !selectedTable) {
      setError('Vui lòng chọn bàn cho đơn tại bàn');
      return;
    }
    if (cartItems.length === 0) {
      setError('Vui lòng chọn ít nhất 1 sản phẩm');
      return;
    }

    const payload: CreateOrderPayload = {
      branch: selectedBranch,
      table: orderType === 'dine-in' ? selectedTable : null,
      orderType,
      items: cartItems.map(item => ({
        product: item.product,
        size: item.size,
        quantity: item.quantity,
        note: item.note,
      })),
      voucherCode: voucherApplied ? voucherCode : undefined,
      paymentMethod,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      note: note.trim() || undefined,
    };

    setSubmitting(true);
    try {
      const res = await orderService.createOrder(payload);
      if (res.success) {
        alert(`Tạo đơn hàng ${res.data.orderNumber} thành công!`);
        navigate('/admin/orders');
      } else {
        setError(res.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn');
    } finally {
      setSubmitting(false);
    }
  }

  function getProductImage(product: Product): string {
    if (product.image) {
      if (product.image.startsWith('http')) return product.image;
      return `${API_BASE_URL}${product.image}`;
    }
    return '';
  }

  return (
    <div className="create-order-page">
      {/* Header */}
      <header className="create-order-page__header">
        <Button variant="ghost" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft size={18} style={{ marginRight: '6px' }} />
          Quay lại
        </Button>
        <h1>Tạo đơn hàng mới</h1>
      </header>

      {error && <div className="create-order-page__error">{error}</div>}

      <div className="create-order-page__body">
        {/* Left: Product picker */}
        <div className="create-order-page__left">
          {/* Order settings */}
          <div className="order-settings">
            <div className="order-settings__row">
              <div className="order-settings__field">
                <label className="input-group__label">Chi nhánh <span className="input-group__required">*</span></label>
                <select
                  className="input-group__input"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="">Chọn chi nhánh</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="order-settings__field">
                <label className="input-group__label">Loại đơn</label>
                <div className="order-settings__toggle">
                  <button
                    className={`order-settings__toggle-btn ${orderType === 'dine-in' ? 'active' : ''}`}
                    onClick={() => setOrderType('dine-in')}
                    type="button"
                  >
                    Tại bàn
                  </button>
                  <button
                    className={`order-settings__toggle-btn ${orderType === 'takeaway' ? 'active' : ''}`}
                    onClick={() => { setOrderType('takeaway'); setSelectedTable(''); }}
                    type="button"
                  >
                    Mang đi
                  </button>
                </div>
              </div>

              {orderType === 'dine-in' && (
                <div className="order-settings__field">
                  <label className="input-group__label">Bàn <span className="input-group__required">*</span></label>
                  <select
                    className="input-group__input"
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                  >
                    <option value="">Chọn bàn</option>
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>Bàn {t.tableNumber} ({t.capacity} chỗ)</option>
                    ))}
                  </select>
                  {tables.length === 0 && selectedBranch && (
                    <span style={{ fontSize: '12px', color: '#d97706' }}>Không có bàn trống</span>
                  )}
                </div>
              )}

              <div className="order-settings__field">
                <label className="input-group__label">Thanh toán</label>
                <select
                  className="input-group__input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="card">Thẻ</option>
                  <option value="transfer">Chuyển khoản</option>
                  <option value="momo">MoMo</option>
                  <option value="zalopay">ZaloPay</option>
                </select>
              </div>
            </div>

            <div className="order-settings__row">
              <Input
                label="Tên khách hàng"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tùy chọn..."
              />
              <Input
                label="SĐT khách hàng"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Tùy chọn..."
              />
              <Input
                label="Ghi chú đơn hàng"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tùy chọn..."
              />
            </div>
          </div>

          {/* Product search/filter */}
          <div className="product-picker__toolbar">
            <div className="product-picker__search">
              <Search size={16} className="product-picker__search-icon" />
              <input
                type="text"
                className="product-picker__search-input"
                placeholder="Tìm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="product-picker__categories">
              <button
                className={`product-picker__cat-btn ${!filterCategory ? 'active' : ''}`}
                onClick={() => setFilterCategory('')}
              >
                Tất cả
              </button>
              {categories
                .filter(c => c.isActive)
                .map((cat) => (
                  <button
                    key={cat._id}
                    className={`product-picker__cat-btn ${filterCategory === cat._id ? 'active' : ''}`}
                    onClick={() => setFilterCategory(cat._id)}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="product-picker__grid">
            {loadingProducts ? (
              <p className="product-picker__loading">Đang tải sản phẩm...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="product-picker__empty">Không tìm thấy sản phẩm</p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-card__image">
                    {product.image ? (
                      <img src={getProductImage(product)} alt={product.name} />
                    ) : (
                      <Coffee size={32} color="#ccc" />
                    )}
                    {product.isBestSeller && (
                      <span className="product-card__badge">Best Seller</span>
                    )}
                  </div>
                  <div className="product-card__info">
                    <h4 className="product-card__name">{product.name}</h4>
                    <div className="product-card__prices">
                      {product.prices?.length > 0 ? (
                        product.prices.map((p) => (
                          <span key={p.size} className="product-card__price">
                            {p.size}: {currencyFormatter.format(p.price)}
                          </span>
                        ))
                      ) : (
                        <span className="product-card__price">Chưa có giá</span>
                      )}
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="product-card__tags">
                        {product.tags.map((tag) => (
                          <span key={tag} className="product-card__tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="product-card__add-buttons">
                    {product.prices?.length > 0 ? (
                      product.prices.map((p) => (
                        <button
                          key={p.size}
                          className="product-card__add-btn"
                          onClick={() => handleAddToCart(product, p.size)}
                          title={`Thêm size ${p.size}`}
                        >
                          <Plus size={14} /> {p.size}
                        </button>
                      ))
                    ) : (
                      <button
                        className="product-card__add-btn"
                        onClick={() => handleAddToCart(product, 'M')}
                      >
                        <Plus size={14} /> Thêm
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="create-order-page__right">
          <CartPanel
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            voucherCode={voucherCode}
            onVoucherCodeChange={setVoucherCode}
            onApplyVoucher={handleApplyVoucher}
            voucherDiscount={voucherDiscount}
            voucherApplied={voucherApplied}
            voucherLoading={voucherLoading}
            subtotal={subtotal}
            total={total}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
