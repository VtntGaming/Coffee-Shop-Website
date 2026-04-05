import { Edit2, Star, Info, Trash2 } from 'lucide-react';
import { StatusBadge } from '../../common/StatusBadge';
import { Button } from '../../common/Button';
import type { Product } from '../../../types/product';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductCard({ product, onEdit, onView, onDelete }: ProductCardProps) {
  const minPrice = (product.prices?.length > 0)
    ? Math.min(...product.prices.map(p => p.price))
    : 0;

  return (
    <div className="product-card">
      {/* Ảnh sản phẩm */}
      <div className="product-card__image-container">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__no-image">No Image</div>
        )}

        {/* Badge Best Seller */}
        {product.isBestSeller && (
          <div className="product-card__best-seller" title="Bán chạy">
            <Star size={12} fill="currentColor" />
            <span>Best Seller</span>
          </div>
        )}

        {/* Trạng thái ẩn/hiện */}
        <div className="product-card__status">
          <StatusBadge variant={product.isActive ? 'success' : 'default'}>
            {product.isActive ? 'Đang bán' : 'Ngừng bán'}
          </StatusBadge>
        </div>
      </div>

      {/* Nội dung */}
      <div className="product-card__info">
        <div className="product-card__header">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__category">{product.categoryName || 'Chưa phân loại'}</p>
        </div>

        <div className="product-card__footer">
          <span className="product-card__price">
            {minPrice.toLocaleString('vi-VN')}đ
            {product.prices.length > 1 && <small>+</small>}
          </span>
          <div className="product-card__actions">
            <Button variant="ghost" size="sm" onClick={() => onView(product)} title="Xem chi tiết">
              <Info size={16} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onEdit(product)} title="Sửa">
              <Edit2 size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(product._id)} 
              title="Xóa"
              style={{ color: '#dc3545' }}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
