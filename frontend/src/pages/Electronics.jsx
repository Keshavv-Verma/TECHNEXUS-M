import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Electronics() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);

    fetch(`${process.env.REACT_APP_API_URL}/api/products/category/ELECTRONICS`)
      .then(response => {
        console.log('Response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Fetched data:', data);
        // Ensure data is an array
        const productArray = Array.isArray(data) ? data : [];
        console.log('Product array:', productArray);
        setProducts(productArray);
      })
      .catch(error => {
        console.error('Fetch error:', error);
        setProducts([]); // Set empty array on error
      });
  }, []);

  const handleProductClick = (productId) => {
    navigate(`/productpage/${productId}`);
  };
  const handleDelete = async (e, productId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const activeToken = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '132px 16px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>Top Trending Deals</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
        {products.map((product) => {
          const currentId = product._id || product.id;
          return (
            <div
              key={currentId}
              style={{
                position: 'relative',
                backgroundColor: '#1e1e1e',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onClick={() => handleProductClick(currentId)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 10, display: 'flex', gap: '8px' }}>
                {isAdmin && (
                  <button
                    style={{
                      backgroundColor: '#ff4444',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={(e) => handleDelete(e, currentId)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                      e.currentTarget.style.backgroundColor = '#ff0000';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.backgroundColor = '#ff4444';
                    }}
                  >
                    ×
                  </button>
                )}
              <button
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  padding: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Added to wishlist!');
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                }}
                aria-label="Add to wishlist"
              >
                ♡
              </button>
            </div>
            <div style={{
              aspectRatio: '1',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#ffffff',
              padding: '16px'
            }}>
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  transition: 'transform 0.3s ease'
                }}
              />
            </div>
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h2 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                minHeight: '42px'
              }}>{product.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color: i < Math.round(product.rating || 4) ? '#fbbf24' : '#6b7280',
                        fontSize: '16px'
                      }}
                    >
                      ★
                    </span>
                 ))}
                </div>
              </div>
              <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#10b981' }}>₹{product.price.toLocaleString('en-IN')}</p>
            </div>
           </div>
          );
        })}
      </div>
    </div>
  );
}