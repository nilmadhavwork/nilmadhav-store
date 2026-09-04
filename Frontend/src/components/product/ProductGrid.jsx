import React from 'react';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import { PackageOpen } from 'lucide-react';

export const ProductGrid = ({
  products = [],
  loading = false,
  emptyTitle = 'No sarees found',
  emptyDescription = 'Try adjusting your filters, price range, or search terms to find what you are looking for.',
  onClearFilters,
}) => {
  if (loading) {
    return (
      <div className="product-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="card" style={{ border: '1px solid var(--color-border-subtle)' }}>
            <Skeleton height="320px" borderRadius="var(--radius-md) var(--radius-md) 0 0" />
            <div style={{ padding: '1.25rem' }}>
              <Skeleton width="40%" height="14px" style={{ marginBottom: '0.5rem' }} />
              <Skeleton width="90%" height="22px" style={{ marginBottom: '1rem' }} />
              <Skeleton width="50%" height="20px" style={{ marginBottom: '1rem' }} />
              <Skeleton width="100%" height="36px" borderRadius="var(--radius-sm)" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onClearFilters ? 'Reset Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
