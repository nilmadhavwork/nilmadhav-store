import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Star, Check } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { SAREE_FABRICS, SAREE_COLORS, SAREE_OCCASIONS } from '../../utils/constants';

export const AdminProductAddPage = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    discountPrice: '',
    stock: '',
    sku: '',
    fabric: 'Banarasi Silk',
    color: 'Red',
    pattern: 'Floral Jaal',
    occasion: 'Bridal & Wedding',
    blouseIncluded: true,
    blouseColor: '',
    careInstructions: 'Dry clean only',
  });

  // Multiple Selected Image Files & Previews
  const [selectedFiles, setSelectedFiles] = useState([]); // Array of File objects
  const [filePreviews, setFilePreviews] = useState([]); // Array of { file, previewUrl, isPrimary }

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const list = await categoryApi.getAll();
        setCategories(list || []);
        if (list && list.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: list[0]._id }));
        }
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Handle Multi-file Selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (filePreviews.length + files.length > 6) {
      toastError('Maximum 6 images allowed per saree.');
      return;
    }

    const newPreviews = files.map((file, idx) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: filePreviews.length === 0 && idx === 0,
    }));

    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove a staged image preview
  const handleRemovePreview = (index) => {
    setFilePreviews((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Ensure at least one is primary if list is not empty
      if (updated.length > 0 && !updated.some((p) => p.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  // Set staged image as primary
  const handleSetPrimary = (index) => {
    setFilePreviews((prev) =>
      prev.map((p, i) => ({
        ...p,
        isPrimary: i === index,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return toastError('Please enter a saree title');
    if (!formData.categoryId) return toastError('Please select a category');
    if (!formData.price || isNaN(formData.price)) return toastError('Please enter a valid price');
    if (!formData.stock || isNaN(formData.stock)) return toastError('Please enter available stock count');
    if (!formData.sku.trim()) return toastError('Please enter a unique SKU code');

    try {
      setSubmitting(true);

      // Construct multipart/form-data for backend
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);
      data.append('price', Number(formData.price));
      if (formData.discountPrice) {
        data.append('discountPrice', Number(formData.discountPrice));
      }
      data.append('stock', Number(formData.stock));
      data.append('sku', formData.sku);
      data.append('fabric', formData.fabric);
      data.append('color', formData.color);
      data.append('pattern', formData.pattern);
      data.append('occasion', formData.occasion);
      data.append('blouseIncluded', formData.blouseIncluded);
      data.append('blouseColor', formData.blouseColor);
      data.append('careInstructions', formData.careInstructions);

      // Reorder so primary file is first in FormData array
      const sortedPreviews = [...filePreviews].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
      sortedPreviews.forEach((item) => {
        data.append('images', item.file);
      });

      await productApi.create(data);
      success(`Saree "${formData.name}" added successfully to catalog!`);
      navigate('/admin/products');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to create product. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/admin/products"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6B7280', fontSize: '0.9rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Product Catalog</span>
        </Link>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
          Add New Saree to Atelier
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
          Upload high-resolution multi-angle photos and specify textile craftsmanship attributes.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: Core Information */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#111827', marginBottom: '1.25rem' }}>
            Basic Product Information
          </h3>

          <Input
            label="Saree Title"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Royal Crimson Zari Banarasi Katan Silk Saree"
          />

          <div className="admin-form-row-2">
            <div className="form-group">
              <label className="form-label">
                Category / Loom Type <span className="required">*</span>
              </label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                disabled={loadingCategories}
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Unique SKU Code"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. BAN-CRM-001"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the weave, zari motifs, pallu detailing, and drape..."
            />
          </div>
        </div>

        {/* SECTION 2: Pricing & Inventory */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#111827', marginBottom: '1.25rem' }}>
            Pricing & Inventory
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Standard Retail Price (₹)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 14500"
            />

            <Input
              label="Discounted Offer Price (₹, Optional)"
              type="number"
              value={formData.discountPrice}
              onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
              placeholder="Leave blank if no discount"
            />

            <Input
              label="Available Stock Quantity"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="e.g. 15"
            />
          </div>
        </div>

        {/* SECTION 3: MULTI-IMAGE UPLOAD (Requirement Highlight) */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#111827' }}>
              Multiple Product Imagery (Max 6 Images)
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              {filePreviews.length} of 6 selected
            </span>
          </div>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Select multiple high-resolution photos showing pallu, border, pleats, and full drape. Click "Set Primary" on any card to designate the main catalog photo.
          </p>

          {/* Upload Drop Area */}
          <label className="image-upload-dropzone" style={{ display: 'block' }}>
            <Upload size={32} color="var(--color-gold-dark)" style={{ margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
              Click to select multiple saree images
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
              Supported: JPG, PNG, WEBP (Max 5MB each, up to 6 files)
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={filePreviews.length >= 6}
            />
          </label>

          {/* Previews Grid */}
          {filePreviews.length > 0 && (
            <div className="image-previews-grid">
              {filePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className={`image-preview-card ${preview.isPrimary ? 'primary' : ''}`}
                >
                  <img src={preview.previewUrl} alt={`Preview ${idx + 1}`} />

                  {preview.isPrimary ? (
                    <div className="image-preview-badge">Primary</div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        left: '4px',
                        right: '4px',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        padding: '2px 0',
                        borderRadius: '2px',
                        textAlign: 'center',
                      }}
                    >
                      Set Primary
                    </button>
                  )}

                  <button
                    type="button"
                    className="image-preview-remove"
                    onClick={() => handleRemovePreview(idx)}
                    title="Remove image"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 4: Specifications & Blouse Attributes */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid #E5E7EB', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#111827', marginBottom: '1.25rem' }}>
            Artisanal Specifications
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Fabric</label>
              <select
                className="form-select"
                value={formData.fabric}
                onChange={(e) => setFormData({ ...formData, fabric: e.target.value })}
              >
                {SAREE_FABRICS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Color</label>
              <select
                className="form-select"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                {SAREE_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Weave Pattern"
              value={formData.pattern}
              onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
              placeholder="e.g. Floral Jaal, Temple Border"
            />

            <div className="form-group">
              <label className="form-label">Occasion</label>
              <select
                className="form-select"
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              >
                {SAREE_OCCASIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-row-2" style={{ marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.95rem' }}>
                <input
                  type="checkbox"
                  checked={formData.blouseIncluded}
                  onChange={(e) => setFormData({ ...formData, blouseIncluded: e.target.checked })}
                  style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                />
                <span>Unstitched Blouse Piece Included</span>
              </label>
            </div>

            {formData.blouseIncluded && (
              <Input
                label="Blouse Color / Detailing"
                value={formData.blouseColor}
                onChange={(e) => setFormData({ ...formData, blouseColor: e.target.value })}
                placeholder="e.g. Running Silk with Zari Border"
              />
            )}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Input
              label="Care Instructions"
              value={formData.careInstructions}
              onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
              placeholder="e.g. Dry clean only. Wrap in muslin cloth."
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingBottom: '3rem' }}>
          <Link to="/admin/products" className="btn btn-secondary">
            Cancel
          </Link>
          <Button variant="primary" type="submit" size="lg" loading={submitting}>
            Publish Saree to Store
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductAddPage;
