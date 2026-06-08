import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinApiUrl } from '../services/api';
import './home.css';
import '../components/Category/Category.css';
import { FiSliders, FiX, FiCheck } from 'react-icons/fi';

const getBrandName = (productName) => {
  if (!productName) return "Other";
  const name = productName.toLowerCase();
  if (name.includes("samsung")) return "Samsung";
  if (name.includes("zebronics")) return "Zebronics";
  if (name.includes("sounce")) return "Sounce";
  if (name.includes("redmi")) return "Redmi";
  if (name.includes("oneplus")) return "OnePlus";
  if (name.includes("iqoo") || name.includes("vivo")) return "iQOO/vivo";
  if (name.includes("iphone") || name.includes("i phone") || name.includes("apple")) return "Apple";
  if (name.includes("boat")) return "boAt";
  
  const firstWord = productName.trim().split(" ")[0];
  if (!firstWord) return "Other";
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
};

export default function Electronics() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Filter & Sort state
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(0);
  const [sortBy, setSortBy] = useState('default');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    fetch(joinApiUrl('/api/products/category/ELECTRONICS'))
      .then(response => {
        console.log('Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        const productArray = Array.isArray(data) ? data : [];
        setProducts(productArray);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setProducts([]);
      });
  }, []);

  // Lock body scroll when mobile filters are open
  useEffect(() => {
    if (isMobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFilterOpen]);

  // Compute unique brands and price bounds from fetched products
  const { uniqueBrands, minPrice, maxPrice } = useMemo(() => {
    const brands = new Set();
    let min = Infinity;
    let max = 0;
    
    products.forEach(p => {
      const price = p.price;
      brands.add(getBrandName(p.name));
      if (price < min) min = price;
      if (price > max) max = price;
    });
    
    return {
      uniqueBrands: Array.from(brands),
      minPrice: min === Infinity ? 0 : min,
      maxPrice: max === 0 ? 100000 : max
    };
  }, [products]);

  // Reset filter selections when products load/change
  useEffect(() => {
    setSelectedMaxPrice(maxPrice);
    setSelectedBrands([]);
    setSortBy('default');
  }, [maxPrice]);

  // Filtered & Sorted products list
  const filteredAndSortedProducts = useMemo(() => {
    let results = products.filter(p => {
      const price = p.price;
      const brand = getBrandName(p.name);
      
      if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) return false;
      if (price > selectedMaxPrice) return false;
      
      return true;
    });

    if (sortBy === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      results.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === 'name-asc') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  }, [products, selectedBrands, selectedMaxPrice, sortBy]);

  const handleBrandChange = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(prev => prev.filter(b => b !== brand));
    } else {
      setSelectedBrands(prev => [...prev, brand]);
    }
  };

  const handleReset = () => {
    setSelectedBrands([]);
    setSelectedMaxPrice(maxPrice);
    setSortBy('default');
  };

  const handleProductClick = (productId) => {
    navigate(`/productpage/${productId}`);
  };

  const handleDelete = async (e, productId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const activeToken = localStorage.getItem('token');
        const response = await fetch(joinApiUrl(`/api/products/${productId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${activeToken}`
          }
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId));
          alert('Product deleted successfully!');
        } else if (response.status === 401 || response.status === 403) {
          alert('You are not authorized to delete products. Please ensure you are logged in as an admin.');
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Delete failed: ${errorData.error || errorData.message || 'Unknown error'}`);
          console.error('Delete failed with status:', response.status, errorData);
        }
      } catch (error) {
        alert('An error occurred while deleting the product. Please try again.');
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="category-main-content">
      <div className="category-layout">
        <div className="category-header-row">
          <h1 className="category-title">Pure Electronics</h1>
          <button 
            className="mobile-filter-toggle-btn"
            onClick={() => setIsMobileFilterOpen(true)}
          >
            <FiSliders /> Filters & Sorting
          </button>
        </div>

        <div className="category-content-container">
          {/* Catalogue Filter Sidebar */}
          <aside className={`category-filter-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3>Catalogue Filters</h3>
              <button 
                className="sidebar-close-btn"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <FiX />
              </button>
            </div>

            {/* Sorting Widget */}
            <div className="filter-section">
              <h4 className="filter-section-title">Sort By</h4>
              <select 
                className="filter-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating-desc">Customer Rating</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>

            {/* Price Range Slider Widget */}
            <div className="filter-section">
              <h4 className="filter-section-title">Price Range</h4>
              <div className="price-slider-info">
                <span>₹{minPrice.toLocaleString('en-IN')}</span>
                <span className="price-highlight">Max: ₹{selectedMaxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                className="filter-price-slider"
                min={minPrice}
                max={maxPrice}
                step={100}
                value={selectedMaxPrice || maxPrice}
                onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
              />
            </div>

            {/* Brand Checkboxes Widget */}
            {uniqueBrands.length > 0 && (
              <div className="filter-section">
                <h4 className="filter-section-title">Brands</h4>
                <div className="brands-list-container">
                  {uniqueBrands.map(brand => {
                    const isChecked = selectedBrands.includes(brand);
                    return (
                      <label key={brand} className="brand-checkbox-label">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleBrandChange(brand)}
                          style={{ display: 'none' }}
                        />
                        <span className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                          {isChecked && <FiCheck />}
                        </span>
                        <span className="brand-name-text">{brand}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset Filters CTA */}
            {(selectedBrands.length > 0 || selectedMaxPrice < maxPrice || sortBy !== 'default') && (
              <button className="filter-reset-btn" onClick={handleReset}>
                Reset All Filters
              </button>
            )}
          </aside>

          {/* Products Grid Area */}
          <div className="category-products-wrapper">
            {filteredAndSortedProducts.length === 0 ? (
              <div className="no-products-found">
                <h3>No matching products found</h3>
                <p>Try relaxing your filters or price slider to see more products.</p>
                <button className="btn-secondary" onClick={handleReset}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="discovery-grid">
                {filteredAndSortedProducts.map((product) => {
                  const currentId = product._id || product.id;
                  return (
                    <div
                      key={currentId}
                      className="discovery-card"
                      onClick={() => handleProductClick(currentId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleProductClick(currentId)}
                    >
                      <div style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
                        {isAdmin && (
                          <button
                            className="discovery-wishlist-btn"
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              borderColor: 'rgba(239, 68, 68, 0.15)'
                            }}
                            onClick={(e) => handleDelete(e, currentId)}
                            aria-label="Delete product"
                          >
                            ×
                          </button>
                        )}
                        <button
                          className="discovery-wishlist-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert('Added to wishlist!');
                          }}
                          aria-label="Add to wishlist"
                        >
                          ♡
                        </button>
                      </div>
                      <div className="discovery-img-wrapper">
                        <img
                          src={product.image}
                          alt={product.name}
                          loading="lazy"
                        />
                      </div>
                      <div className="discovery-details">
                        <h2 className="discovery-card-title">{product.name}</h2>
                        <div className="discovery-card-footer">
                          <div className="discovery-price-group">
                            <p className="discovery-price">₹{product.price.toLocaleString('en-IN')}</p>
                          </div>
                          <span className="discovery-rating">⭐ {product.rating || "4.5"}/5</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileFilterOpen && (
        <div 
          className="sidebar-mobile-backdrop"
          onClick={() => setIsMobileFilterOpen(false)}
        />
      )}
    </div>
  );
}