import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Grid, List as ListIcon } from 'lucide-react';
import { ProductCard } from '../../components/features/products/ProductCard';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ProductForm } from './ProductForm';
import { ProductDetailDrawer } from './ProductDetailDrawer';
import * as productService from '../../services/productService';
import * as categoryService from '../../services/categoryService';
import type { Product } from '../../types/product';
import type { Category } from '../../types/category';
import './ProductListPage.css';

export function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts(),
        categoryService.getAllCategories(),
      ]);

      if (prodRes.success && prodRes.data) {
        const enrichedProducts = prodRes.data.map(p => ({
          ...p,
          categoryName: catRes.data?.find(c => c._id === p.categoryId)?.name
        }));
        setProducts(enrichedProducts);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? p.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    setCurrentProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsFormOpen(true);
  };

  const handleView = (product: Product) => {
    setCurrentProduct(product);
    setIsDetailOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món này không?')) {
      try {
        const res = await productService.deleteProduct(id);
        if (res.success) {
          fetchData();
        } else {
          alert(res.message || 'Lỗi khi xóa sản phẩm');
        }
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa sản phẩm');
      }
    }
  };

  const handleSuccess = () => {
    setIsFormOpen(false);
    fetchData();
  };

  return (
    <div className="products-page">
      <header className="products-page__header">
        <div>
          <h1 className="products-page__title">Quản lý Sản phẩm</h1>
          <p className="products-page__subtitle">Danh sách các món trong thực đơn hiện tại.</p>
        </div>
        <div className="products-page__actions">
          <Button onClick={handleAdd}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Thêm món mới
          </Button>
        </div>
      </header>

      <div className="products-page__toolbar">
        <div className="products-page__toolbar-left">
          <div className="products-page__search-box">
            <Input
              placeholder="Tìm tên món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="products-page__filter-box">
            <select
              className="products-page__select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-page__toolbar-right">
          <div className="products-page__view-toggle">
            <button
              className={`products-page__view-btn ${viewMode === 'grid' ? 'products-page__view-btn--active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`products-page__view-btn ${viewMode === 'list' ? 'products-page__view-btn--active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={18} />
            </button>
          </div>
          <Button variant="ghost" onClick={fetchData} title="Làm mới">
            <RefreshCw size={18} className={loading ? 'spin' : ''} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="products-page__loading">
          <RefreshCw size={32} className="spin" />
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-page__empty">
          <div className="products-page__empty-icon">☕</div>
          <h3>Không tìm thấy món nào</h3>
          <p>Hãy thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
          <Button variant="secondary" onClick={() => { setSearchTerm(''); setSelectedCategory(''); }}>Xóa bộ lọc</Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'products-page__grid' : 'products-page__list'}>
          {filteredProducts.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => !loading && setIsFormOpen(false)}
        title={currentProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        size="lg"
      >
        <ProductForm
          product={currentProduct}
          categories={categories}
          onSuccess={handleSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <ProductDetailDrawer
        product={currentProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
}
