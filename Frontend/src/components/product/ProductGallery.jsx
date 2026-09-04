import React, { useState } from 'react';

export const ProductGallery = ({ images = [], productName = 'Saree' }) => {
  const defaultFallback =
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85';

  const imageList = images && images.length > 0
    ? images.map((img) => (typeof img === 'string' ? { url: img } : img))
    : [{ url: defaultFallback, isPrimary: true }];

  // Find primary image index or default to 0
  const primaryIdx = imageList.findIndex((img) => img.isPrimary);
  const initialActive = primaryIdx >= 0 ? primaryIdx : 0;

  const [activeIndex, setActiveIndex] = useState(initialActive);

  const activeImage = imageList[activeIndex]?.url || defaultFallback;

  return (
    <div className="gallery-container">
      {/* Thumbnail Strip */}
      {imageList.length > 1 && (
        <div className="gallery-thumbnails" role="tablist" aria-label="Product image thumbnails">
          {imageList.map((img, idx) => (
            <button
              key={img.publicId || idx}
              type="button"
              className={`gallery-thumb ${idx === activeIndex ? 'active' : ''}`}
              onClick={() => setActiveIndex(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              aria-label={`View image ${idx + 1} of ${productName}`}
            >
              <img
                src={img.url}
                alt={`${productName} thumbnail ${idx + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = defaultFallback;
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Main Stage Image */}
      <div className="gallery-main">
        <img
          src={activeImage}
          alt={productName}
          onError={(e) => {
            e.currentTarget.src = defaultFallback;
          }}
        />
      </div>
    </div>
  );
};

export default ProductGallery;
