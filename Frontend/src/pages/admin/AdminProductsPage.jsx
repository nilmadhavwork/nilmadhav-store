import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { formatCurrency } from '../../utils/formatters';

export const AdminProductsPage = () => {
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll({ limit: 50 });
      setProducts(res?.products || []);
    } catch (err) {
      console.warn('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to deactivate "${name}"? It will be removed from customer listings.`)) {
      try {
        await productApi.delete(id);
        success(`Product "${name}" deactivated.`);
        loadProducts();
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to deactivate product');
      }
    }
  };

  const filteredProducts = products.filter((p) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query) ||
      p.fabric?.toLowerCase().includes(query) ||
      (typeof p.categoryId === 'object' && p.categoryId?.name?.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-primary-dark)', marginBottom: '0.25rem' }}>
            Saree Catalog & Stock
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>
            Manage inventory counts, pricing, artisanal details, and image galleries.
          </p>
        </div>

        <Link to="/admin/products/add" className="btn btn-primary">
          <Plus size={18} />
          <span>Add New Saree</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #E5E7EB', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, SKU, fabric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
          Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> sarees
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <Spinner center size="lg" />
      ) : filteredProducts.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <p style={{ color: '#6B7280', marginBottom: '1rem' }}>No sarees found matching your query.</p>
          <Link to="/admin/products/add" className="btn btn-primary btn-sm">
            Add Saree Now
          </Link>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Saree Title & SKU</th>
                <th>Category</th>
                <th>Fabric & Color</th>
                <th>Price (₹)</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const imgUrl = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=150&q=80';
                const catName = typeof p.categoryId === 'object' ? p.categoryId?.name : 'Handloom';
                const isOutOfStock = p.stock <= 0;

                return (
                  <tr key={p._id}>
                    <td>
                      <img src={imgUrl} alt={p.name} className="admin-table-img" />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary-dark)', maxWidth: '240px' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        SKU: <strong>{p.sku}</strong> ({p.images?.length || 0} images)
                      </div>
                    </td>
                    <td>{catName}</td>
                    <td>
                      <div>{p.fabric || 'Pure Silk'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{p.color || 'Standard'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{formatCurrency(p.discountPrice || p.price)}</div>
                      {p.discountPrice && (
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textDecoration: 'line-through' }}>
                          {formatCurrency(p.price)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isOutOfStock ? 'badge-danger' : p.stock < 5 ? 'badge-warning' : 'badge-success'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <Link
                          to={`/products/${p.slug || p._id}`}
                          target="_blank"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="View on store"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.55rem' }}
                          title="Edit product"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.55rem', color: 'var(--color-danger)' }}
                          onClick={() => handleDeleteProduct(p._id, p.name)}
                          title="Deactivate product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
