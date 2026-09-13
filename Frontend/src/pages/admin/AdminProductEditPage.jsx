import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, X, Trash2, Check, Star } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { SAREE_FABRICS, SAREE_COLORS, SAREE_OCCASIONS } from '../../utils/constants';

export const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
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
    pattern: '',
    occasion: '',
    blouseIncluded: false,
    blouseColor: '',
    careInstructions: '',
  });
  const [discountAmount, setDiscountAmount] = useState('');

  const handlePriceChange = (newPrice) => {
    setFormData((prev) => {
      let nextDiscountPrice = prev.discountPrice;
      if (discountAmount && Number(discountAmount) > 0 && Number(newPrice) > Number(discountAmount)) {
        nextDiscountPrice = String(Number(newPrice) - Number(discountAmount));
      } else if (nextDiscountPrice && Number(nextDiscountPrice) >= Number(newPrice)) {
        nextDiscountPrice = '';
      }
      return { ...prev, price: newPrice, discountPrice: nextDiscountPrice };
    });
  };

  const handleDiscountAmountChange = (amt) => {
    setDiscountAmount(amt);
    const p = Number(formData.price || 0);
    const d = Number(amt);
    if (amt !== '' && !isNaN(d) && d > 0 && p > d) {
      setFormData((prev) => ({ ...prev, discountPrice: String(p - d) }));
    } else {
      setFormData((prev) => ({ ...prev, discountPrice: '' }));
    }
  };

  const handleDiscountPriceChange = (dp) => {
    setFormData((prev) => ({ ...prev, discountPrice: dp }));
    const p = Number(formData.price || 0);
    const offer = Number(dp);
    if (dp !== '' && !isNaN(offer) && offer > 0 && p > offer) {
      setDiscountAmount(String(p - offer));
    } else {
      setDiscountAmount('');
    }
  };

  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [cats, prodList] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll({ limit: 100 }),
        ]);
        setCategories(cats || []);

        const found = prodList?.products?.find((p) => p._id === id || p.slug === id);
        if (found) {
          const hasDisc = found.discountPrice && Number(found.discountPrice) > 0 && Number(found.discountPrice) < Number(found.price);
          const discAmt = hasDisc ? String(Number(found.price) - Number(found.discountPrice)) : '';
          setDiscountAmount(discAmt);
          setFormData({
            name: found.name || '',
            description: found.description || '',
            categoryId: found.categoryId?._id || found.categoryId || '',
            price: found.price || '',
            discountPrice: hasDisc ? String(found.discountPrice) : '',
            stock: found.stock || 0,
            sku: found.sku || '',
            fabric: found.fabric || 'Banarasi Silk',
            color: found.color || 'Red',
            pattern: found.pattern || '',
            occasion: found.occasion || '',
            blouseIncluded: Boolean(found.blouseIncluded),
            blouseColor: found.blouseColor || '',
            careInstructions: found.careInstructions || '',
          });
          setExistingImages(found.images || []);
        } else {
          toastError('Product could not be found');
        }
      } catch (err) {
        toastError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initData();
    }
  }, [id]);

  // Handle selecting new additional images
  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (existingImages.length + newPreviews.length + files.length > 6) {
      toastError('Maximum 6 total images allowed per saree.');
      return;
    }

    const previews = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  // Remove newly staged preview
  const handleRemoveNewPreview = (index) => {
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Delete existing image from Cloudinary & Database via DELETE /api/products/:id/images
  const handleDeleteExistingImage = async (publicId) => {
    if (window.confirm('Delete this image permanently from Cloudinary?')) {
      try {
        await productApi.deleteImage(id, publicId);
        setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
        success('Image removed from saree.');
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to remove image');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      // Prepare clean payload
      const dp = Number(formData.discountPrice);
      const cleanDiscountPrice = (formData.discountPrice !== '' && !isNaN(dp) && dp > 0 && dp < Number(formData.price)) ? dp : null;
      const payload = {
        ...formData,
        price: Number(formData.price),
        discountPrice: cleanDiscountPrice,
      };

      // If new files were added, submit as multipart/form-data
      if (newFiles.length > 0) {
        const data = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] !== undefined && payload[k] !== null) {
            data.append(k, payload[k]);
          }
        });
        newFiles.forEach((file) => {
          data.append('images', file);
        });
        await productApi.update(id, data, true);
      } else {
        // Submit JSON update
        await productApi.update(id, payload, false);
      }

      success('Saree details updated successfully!');
      navigate('/admin/products');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update saree details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner center size="lg" />;
  }

  return (
    <div style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/admin/products"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6B7280', fontSize: '0.9rem', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Product Catalog</span>
        </Link>
        <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
          Edit Saree: {formData.name}
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
          Update specifications, manage uploaded Cloudinary photos, and adjust inventory levels.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Core Info */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#111827', marginBottom: '1.25rem' }}>
            Basic Product Information
          </h3>

          <Input
            label="Saree Title"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="SKU Code"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
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
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#111827', marginBottom: '1.25rem' }}>
            Pricing & Inventory
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <Input
              label="Standard Retail Price (MRP in ₹)"
              type="number"
              required
              value={formData.price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="e.g. 500"
            />

            <Input
              label="Discount Amount (₹ Off, Optional)"
              type="number"
              value={discountAmount}
              onChange={(e) => handleDiscountAmountChange(e.target.value)}
              placeholder="e.g. 200 (or 0 for no discount)"
            />

            <Input
              label="Customer Offer / Selling Price (₹)"
              type="number"
              value={formData.discountPrice}
              onChange={(e) => handleDiscountPriceChange(e.target.value)}
              placeholder="e.g. 300 (auto-calculated)"
            />

            <Input
              label="Stock Units Available"
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>

          {/* Pricing Preview Helper */}
          {formData.price && Number(formData.price) > 0 && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: formData.discountPrice && Number(formData.discountPrice) > 0 && Number(formData.discountPrice) < Number(formData.price)
                ? '1px solid #FDE68A'
                : '1px solid #E5E7EB',
              backgroundColor: formData.discountPrice && Number(formData.discountPrice) > 0 && Number(formData.discountPrice) < Number(formData.price)
                ? '#FEF3C7'
                : '#F9FAFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.5rem',
              fontSize: '0.9rem',
            }}>
              {formData.discountPrice && Number(formData.discountPrice) > 0 && Number(formData.discountPrice) < Number(formData.price) ? (
                <>
                  <div>
                    <span style={{ color: '#92400E', fontWeight: 600 }}>Discount Active: </span>
                    <span style={{ color: '#1F2937' }}>Customer will pay </span>
                    <strong style={{ color: '#047857', fontSize: '1.05rem' }}>₹{Number(formData.discountPrice).toLocaleString('en-IN')}</strong>
                    <span style={{ color: '#6B7280', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                      ₹{Number(formData.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>
                      {Math.round(((Number(formData.price) - Number(formData.discountPrice)) / Number(formData.price)) * 100)}% OFF
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>
                      (Save ₹{Number(formData.price) - Number(formData.discountPrice)})
                    </span>
                  </div>
                </>
              ) : (
                <div style={{ color: '#6B7280' }}>
                  <span>No discount applied: Customer will pay full retail price </span>
                  <strong style={{ color: '#1F2937' }}>₹{Number(formData.price).toLocaleString('en-IN')}</strong>
                  <span> (no strikethrough price).</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Existing Images & Adding New Images */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '2rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#111827', marginBottom: '0.5rem' }}>
            Manage Images (Cloudinary & Local Previews)
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Current images stored in Cloudinary. Click the trash icon to delete an image via backend API.
          </p>

          {/* Existing Cloudinary Images */}
          {existingImages.length > 0 ? (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                Existing Saree Photos ({existingImages.length})
              </div>
              <div className="image-previews-grid">
                {existingImages.map((img, idx) => (
                  <div key={img.publicId || idx} className="image-preview-card">
                    <img src={img.url} alt={`Saree photo ${idx + 1}`} />
                    {img.isPrimary && <div className="image-preview-badge">Primary</div>}
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => handleDeleteExistingImage(img.publicId)}
                      title="Delete from Cloudinary"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#9CA3AF', fontStyle: 'italic', marginBottom: '1rem' }}>
              No images currently attached to this saree.
            </p>
          )}

          {/* Staged New Uploads */}
          <label className="image-upload-dropzone" style={{ display: 'block', marginTop: '1rem' }}>
            <Upload size={28} color="var(--color-gold-dark)" style={{ margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>
              Add Additional Photos
            </div>
            <div style={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
              New files will append to the existing gallery upon saving
            </div>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleNewFileChange}
              style={{ display: 'none' }}
              disabled={existingImages.length + newPreviews.length >= 6}
            />
          </label>

          {newPreviews.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                Staged for Upload ({newPreviews.length})
              </div>
              <div className="image-previews-grid">
                {newPreviews.map((p, idx) => (
                  <div key={idx} className="image-preview-card">
                    <img src={p.previewUrl} alt={`New upload preview ${idx + 1}`} />
                    <button
                      type="button"
                      className="image-preview-remove"
                      onClick={() => handleRemoveNewPreview(idx)}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Specifications */}
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
              <label className="form-label">Color</label>
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
              />
            )}
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Input
              label="Care Instructions"
              value={formData.careInstructions}
              onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingBottom: '3rem' }}>
          <Link to="/admin/products" className="btn btn-secondary">
            Cancel
          </Link>
          <Button variant="primary" type="submit" size="lg" loading={submitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductEditPage;
