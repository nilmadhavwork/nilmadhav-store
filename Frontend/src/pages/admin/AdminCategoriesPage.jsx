import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, CheckCircle2 } from 'lucide-react';
import { categoryApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

export const AdminCategoriesPage = () => {
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getAll();
      setCategories(data || []);
    } catch (err) {
      console.warn('Failed to load categories:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toastError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, formData);
        success('Category updated successfully');
      } else {
        await categoryApi.create(formData);
        success('Category created successfully');
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Deactivate category "${name}"?`)) {
      try {
        await categoryApi.delete(id);
        success(`Category "${name}" deactivated`);
        loadCategories();
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to deactivate category');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Saree Categories & Weaves
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Manage loom categories, banner images, and descriptions.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Category</span>
        </Button>
      </div>

      {loading ? (
        <Spinner center size="lg" />
      ) : categories.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB' }}>
          <Layers size={36} color="var(--color-gold-dark)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ color: '#6B7280', marginBottom: '1.25rem' }}>No categories created yet.</p>
          <Button variant="primary" onClick={handleOpenAdd}>
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Preview Image</th>
                <th>Category Name</th>
                <th>URL Slug</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80'}
                      alt={cat.name}
                      className="admin-table-img"
                    />
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                    {cat.name}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#6B7280', fontFamily: 'monospace' }}>
                    {cat.slug}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#4B5563', maxWidth: '280px' }}>
                    {cat.description || '—'}
                  </td>
                  <td>
                    <span className={`badge ${cat.isActive !== false ? 'badge-success' : 'badge-danger'}`}>
                      {cat.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.55rem' }}
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.55rem', color: 'var(--color-danger)' }}
                        onClick={() => handleDelete(cat._id, cat.name)}
                        title="Deactivate Category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="500px"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Category / Weave Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Kanjivaram Silk"
          />

          <Input
            label="Cover Image URL (Web or Cloudinary URL)"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://..."
          />

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the weave's legacy and features..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border-subtle)' }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={submitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;
