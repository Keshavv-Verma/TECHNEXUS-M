import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinApiUrl } from '../services/api';
import './home.css';

export default function Mobandaccess() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    fetch(joinApiUrl('/api/products/category/MOBANDACCESS'))
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

  const handleProductClick = (productId) => {
    navigate(`/productpage/${productId}`);
  };

  const token = localStorage.getItem('token');
  const handleDelete = async (e, productId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(joinApiUrl(`/api/products/${productId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
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
    <div className="home-discovery" style={{ paddingTop: '140px', minHeight: '80vh' }}>
      <div className="section-header" style={{ alignItems: 'center', textAlign: 'center', marginBottom: '60px' }}>
        <p className="section-tag">Category</p>
        <h1 className="section-title" style={{ fontSize: '32px' }}>Mobile & Accessories</h1>
      </div>
      <div className="discovery-grid">
        {products.map((product) => {
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
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                      e.currentTarget.style.color = '#ef4444';
                    }}
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
    </div>
  );
}