import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { SAREE_FABRICS, SAREE_COLORS } from '../../utils/constants';

export const ProductFilters = ({
  categories = [],
  selectedCategory = '',
  onSelectCategory,
  selectedFabric = '',
  onSelectFabric,
  selectedColor = '',
  onSelectColor,
  minPrice = '',
  maxPrice = '',
  onPriceChange,
  sortBy = 'newest',
  onSortChange,
  onResetFilters,
  totalResults = 0,
}) => {
  const hasActiveFilters = Boolean(
    selectedCategory || selectedFabric || selectedColor || minPrice || maxPrice || sortBy !== 'newest'
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} color="var(--color-gold-dark)" />
          <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '1rem' }}>
            Refine Collections
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            ({totalResults} {totalResults === 1 ? 'saree' : 'sarees'})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="sort-select" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              Sort by:
            </label>
            <select
              id="sort-select"
              className="form-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              style={{ padding: '0.45rem 1.75rem 0.45rem 0.75rem', fontSize: '0.875rem' }}
            >
              <option value="newest">New Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="btn btn-sm btn-secondary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Control Rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
        {/* Category Picker */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Weave / Category
          </label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fabric Picker */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Fabric
          </label>
          <select
            className="form-select"
            value={selectedFabric}
            onChange={(e) => onSelectFabric(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="">All Fabrics</option>
            {SAREE_FABRICS.map((fabric) => (
              <option key={fabric} value={fabric}>
                {fabric}
              </option>
            ))}
          </select>
        </div>

        {/* Color Picker */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Color
          </label>
          <select
            className="form-select"
            value={selectedColor}
            onChange={(e) => onSelectColor(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          >
            <option value="">All Colors</option>
            {SAREE_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="form-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Price Range (₹)
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="number"
              placeholder="Min"
              className="form-input"
              value={minPrice}
              onChange={(e) => onPriceChange('min', e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
            />
            <span style={{ color: 'var(--color-text-muted)' }}>—</span>
            <input
              type="number"
              placeholder="Max"
              className="form-input"
              value={maxPrice}
              onChange={(e) => onPriceChange('max', e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
