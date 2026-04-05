import { X, Star, Clock, Tag, Utensils } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import type { Product } from '../../types/product';
import './ProductDetailDrawer.css';

interface ProductDetailDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailDrawer({ product, isOpen, onClose }: ProductDetailDrawerProps) {
  if (!product) return null;

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}

      {/* Drawer */}
      <div className={`product-drawer ${isOpen ? 'product-drawer--open' : ''}`}>
        <header className="product-drawer__header">
          <h2>Chi tiết sản phẩm</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Đóng">
            <X size={20} />
          </button>
        </header>

        <div className="product-drawer__content">
          <section className="product-drawer__section hero">
            <div className="hero__image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="hero__no-image">No Image</div>
              )}
              {product.isBestSeller && (
                <div className="hero__badge">
                  <Star size={12} fill="currentColor" /> Bán chạy
                </div>
              )}
            </div>

            <div className="hero__details">
              <h1 className="hero__name">
                {product.name}
              </h1>
              <div className="hero__meta">
                <StatusBadge variant={product.isActive ? 'success' : 'default'}>
                  {product.isActive ? 'Đang kinh doanh' : 'Ngừng kinh doanh'}
                </StatusBadge>
                <span className="hero__category">
                  <Utensils size={14} /> {product.categoryName || 'Chưa phân loại'}
                </span>
              </div>
            </div>
          </section>

          <section className="product-drawer__section">
            <h3 className="section-title"><Clock size={16} /> Bảng giá & Kích cỡ</h3>
            <div className="price-grid">
              {product.prices?.map((p, idx) => (
                <div key={idx} className="price-item">
                  <span className="price-item__size">{p.size}</span>
                  <span className="price-item__value">{p.price.toLocaleString()}đ</span>
                </div>
              ))}
              {(!product.prices || product.prices.length === 0) && (
                <p style={{ fontSize: '13px', color: '#999' }}>Chưa cập nhật giá</p>
              )}
            </div>
          </section>

          {product.tags && product.tags.length > 0 && (
            <section className="product-drawer__section">
              <h3 className="section-title"><Tag size={16} /> Nhãn sản phẩm</h3>
              <div className="tags-list">
                {product.tags.map(tag => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="product-drawer__section">
            <h3 className="section-title">Mô tả chi tiết</h3>
            <p className="product-drawer__description">
              {product.description || 'Không có mô tả cho sản phẩm này.'}
            </p>
          </section>
        </div>

        <footer className="product-drawer__footer">
          <Button variant="secondary" onClick={onClose} fullWidth>Đóng</Button>
        </footer>
      </div>
    </>
  );
}
