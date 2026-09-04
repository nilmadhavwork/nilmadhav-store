import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import { categoryApi } from '../../api/categoryApi';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilters from '../../components/product/ProductFilters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Parse filters from URL
  const selectedCategory = searchParams.get('category') || '';
  const selectedFabric = searchParams.get('fabric') || '';
  const selectedColor = searchParams.get('color') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const searchQuery = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sortBy = searchParams.get('sort') || 'newest';

  // Load categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await categoryApi.getAll();
        setCategories(cats || []);
      } catch (err) {
        console.warn('Failed to load categories:', err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products matching URL filters
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
      };
      if (selectedCategory) params.category = selectedCategory;
      if (selectedFabric) params.fabric = selectedFabric;
      if (selectedColor) params.color = selectedColor;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (searchQuery) params.search = searchQuery;

      const res = await productApi.getAll(params);
      let list = res?.products || [];

      // Client-side sort if needed
      if (sortBy === 'price_asc') {
        list = [...list].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      } else if (sortBy === 'price_desc') {
        list = [...list].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      }

      setProducts(list);
      setTotalPages(res?.totalPages || 1);
      setTotalResults(res?.totalResults || list.length);
    } catch (err) {
      console.warn('Failed to fetch products:', err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedFabric, selectedColor, minPrice, maxPrice, searchQuery, page, sortBy]);

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  // Update query params helper
  const updateQuery = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePriceChange = (type, val) => {
    const key = type === 'min' ? 'minPrice' : 'maxPrice';
    updateQuery(key, val);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', newPage.toString());
      setSearchParams(newParams);
    }
  };

  return (
    <div className="section">
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div className="section-subtitle">Nilmadhav Atelier</div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Handcrafted Saree Collections'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            Explore pure silk drapes, rich zari borders, and celebrated festive weaves from India's finest handlooms.
          </p>
        </div>

        {/* Filters Bar */}
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(val) => updateQuery('category', val)}
          selectedFabric={selectedFabric}
          onSelectFabric={(val) => updateQuery('fabric', val)}
          selectedColor={selectedColor}
          onSelectColor={(val) => updateQuery('color', val)}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={handlePriceChange}
          sortBy={sortBy}
          onSortChange={(val) => updateQuery('sort', val)}
          onResetFilters={handleResetFilters}
          totalResults={totalResults}
        />

        {/* Product Grid */}
        <ProductGrid
          products={products}
          loading={loading}
          onClearFilters={handleResetFilters}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '3.5rem',
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1;
              const isActive = p === page;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ minWidth: '36px', padding: '0.4rem 0.6rem' }}
                >
                  {p}
                </button>
              );
            })}

            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
