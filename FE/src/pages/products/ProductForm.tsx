import { useState, useEffect } from 'react';
import { Camera, X, Plus, Trash2 } from 'lucide-react';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import * as productService from '../../services/productService';
import type { Category } from '../../types/category';
import type { Product, CreateProductPayload, ProductPrice } from '../../types/product';
import './ProductForm.css';

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, categories, onSuccess, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductPayload>({
    name: '',
    categoryId: categories[0]?._id || '',
    description: '',
    image: '',
    isActive: true,
    isBestSeller: false,
    prices: [{ size: 'Mặc định', price: 0 }],
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [imgError, setImgError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setImgError(false); // Reset error when image URL changes
  }, [formData.image]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        description: product.description || '',
        image: product.image || '',
        isActive: product.isActive,
        isBestSeller: product.isBestSeller,
        prices: product.prices.length > 0 ? [...product.prices] : [{ size: 'Mặc định', price: 0 }],
        tags: [...(product.tags || [])],
      });
    }
  }, [product, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo preview URL cho ảnh nội bộ
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: previewUrl }));
      setImgError(false);
    }
  };

  const handlePriceChange = (index: number, field: keyof ProductPrice, value: string | number) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData(prev => ({ ...prev, prices: newPrices }));
  };

  const addPriceRow = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...prev.prices, { size: '', price: 0 }]
    }));
  };

  const removePriceRow = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData(prev => ({
        ...prev,
        prices: prev.prices.filter((_, i) => i !== index)
      }));
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: formData.tags?.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      let res;
      
      // Sử dụng FormData nếu có tệp được chọn
      if (selectedFile) {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description || '');
        data.append('categoryId', formData.categoryId);
        data.append('isActive', String(formData.isActive));
        data.append('isBestSeller', String(formData.isBestSeller));
        data.append('prices', JSON.stringify(formData.prices));
        data.append('tags', JSON.stringify(formData.tags || []));
        data.append('image', selectedFile);

        if (product) {
          res = await productService.updateProduct(product._id, data as any);
        } else {
          res = await productService.createProduct(data as any);
        }
      } else {
        // Gửi JSON như bình thường nếu chỉ có URL
        if (product) {
          res = await productService.updateProduct(product._id, formData);
        } else {
          res = await productService.createProduct(formData);
        }
      }

      if (res.success) onSuccess();
      else setSubmitError(res.message || 'Lỗi khi lưu sản phẩm');
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <div className="product-form__grid">
        <div className="product-form__col">
          <div className="image-upload">
            <div className="image-preview" onClick={() => document.getElementById('product-image-file')?.click()}>
              {formData.image && !imgError ? (
                <img 
                  src={formData.image} 
                  alt="Preview" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="image-preview__placeholder">
                  <Camera size={32} />
                  <span>Chọn ảnh</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              id="product-image-file" 
              hidden 
              accept="image/*" 
              onChange={handleFileChange} 
            />
            <Input
              label="Hoặc dán URL Ảnh"
              name="image"
              value={selectedFile ? '' : formData.image}
              onChange={handleChange}
              placeholder="https://..."
              disabled={!!selectedFile}
            />
            {selectedFile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {setSelectedFile(null); setFormData(p => ({...p, image: ''}));}}
                style={{ marginTop: '8px', color: '#dc3545' }}
              >
                Xóa ảnh đã chọn
              </Button>
            )}
          </div>
        </div>

        <div className="product-form__col">
          <Input label="Tên món" name="name" value={formData.name} onChange={handleChange} required />

          <Select
            label="Danh mục"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            options={categories.map(c => ({ value: c._id, label: c.name }))}
            required
          />

          <div className="product-form__checkbox-row">
            <div className="checkbox-group">
              <input type="checkbox" id="isBestSeller" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange as any} />
              <label htmlFor="isBestSeller">Best Seller ⭐</label>
            </div>
            <div className="checkbox-group">
              <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange as any} />
              <label htmlFor="isActive">Đang bán ☕</label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section__header">
          <h4 className="form-section__title">Giá & Kích cỡ</h4>
          <Button type="button" variant="secondary" size="sm" onClick={addPriceRow}>
            <Plus size={14} style={{ marginRight: '6px' }} /> Thêm size
          </Button>
        </div>
        <div className="price-list">
          {formData.prices.map((p, idx) => (
            <div key={idx} className="price-row">
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Tên size (Vd: S, M, L...)"
                  value={p.size}
                  onChange={(e) => handlePriceChange(idx, 'size', e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  type="number"
                  placeholder="Giá (VND)"
                  value={p.price}
                  onChange={(e) => handlePriceChange(idx, 'price', Number(e.target.value))}
                />
              </div>
              {formData.prices.length > 1 && (
                <button type="button" className="price-row__remove" onClick={() => removePriceRow(idx)}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <Input
          label="Tags (Nhấn Enter để thêm)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="Ví dụ: Nóng, Lạnh, Mới..."
        />
        <div className="tags-container">
          {formData.tags?.map(tag => (
            <span key={tag} className="tag-chip">
              {tag} <X size={12} onClick={() => removeTag(tag)} style={{ cursor: 'pointer' }} />
            </span>
          ))}
        </div>
      </div>

      <div className="input-group">
        <label className="input-group__label">Mô tả sản phẩm</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange as any}
          className="input-group__input product-form__textarea"
        />
      </div>

      {submitError && <p className="submit-error">{submitError}</p>}

      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>Hủy</Button>
        <Button type="submit" loading={loading}>Lưu sản phẩm</Button>
      </div>
    </form>
  );
}
