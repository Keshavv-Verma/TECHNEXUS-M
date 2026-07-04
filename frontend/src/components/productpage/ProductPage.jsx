import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { saveCart, normalizeCartItem, getProductId } from '../../utils/cartUtils';
import { joinApiUrl } from '../../services/api';
import { addCartItem, getCartItems } from '../../services/cartService';
import { isLoggedIn, redirectToLogin } from '../../utils/authUtils';
import Notification from '../Notification/Notification';
import './productpage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdded, setIsAdded] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const isOutOfStock = product?.stock <= 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(joinApiUrl(`/api/products/${id}`));
        if (!response.ok) throw new Error('Product not found');
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (isOutOfStock) {
      alert('Product is out of stock');
      return;
    }
    const pid = String(getProductId(product) || id);

    if (!isLoggedIn()) {
      redirectToLogin(navigate, `/product/${pid}`);
      return;
    }

    try {
      await addCartItem(pid, 1);
      const items = await getCartItems();
      saveCart(items);
      setIsAdded(true);
      setShowNotification(true);
      setTimeout(() => setIsAdded(false), 2000);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Backend cart add failed:', error.message || error);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    if (isOutOfStock) {
      alert('Product is out of stock');
      return;
    }
    const pid = String(getProductId(product) || id);
    const normalizedProduct = { ...product, id: pid };

    if (isLoggedIn()) {
      try {
        await addCartItem(pid, 1);
        const items = await getCartItems();
        saveCart(items);
      } catch (error) {
        console.error('Backend cart add failed:', error.message || error);
      }
    } else {
      saveCart([normalizeCartItem(normalizedProduct, 1)]);
    }

    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p>Loading Curated Device...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">Curation Error: {error}</div>;
  }

  if (!product) {
    return <div className="error-container">Curation Not Found</div>;
  }

  return (
    <div className="product-page-container" role="main">
      <div className="product-glass-container">
        <div className="product-image-section">
          <div className="main-image-container">
            <img src={product.image} alt={product.name} className="main-product-image" />
            <div className="image-overlay">
              <button 
                className="overlay-btn wishlist-btn" 
                onClick={() => alert(`"${product.name}" added to your curated wishlist.`)}
                aria-label="Add product to wishlist"
              >
                <FiHeart aria-hidden="true" />
              </button>
              <button 
                className="overlay-btn share-btn"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Curated product link copied to clipboard.');
                }}
                aria-label="Share product curation"
              >
                <FiShare2 aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="product-info-section">
          <div className="product-header">
            <span className="product-category" aria-label={`Category: ${product.category?.name || product.categoryId?.name || 'Uncategorized'}`}>
              {product.category?.name || product.categoryId?.name || 'Curated Catalog'}
            </span>
            <h1>{product.name}</h1>
            <div className="product-meta">
              <div className="rating-container" aria-label={`Rating: ${product.rating} stars out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`star ${i < Math.round(product.rating || 4) ? 'filled' : ''}`} aria-hidden="true">
                    ★
                  </span>
                ))}
                <span className="rating-count">({product.rating || "4.5"} / 5)</span>
              </div>
            </div>
          </div>

          <div className="price-section">
            <h2 className="price">₹{product.price.toLocaleString('en-IN')}</h2>
            <span className="tax-info">Inclusive of all local duties & taxes</span>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          {product.specifications && product.specifications.length > 0 && (
            <div className="product-specifications">
              <h3>Specifications</h3>
              <div className="specs-list">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="spec-item">
                    <span className="spec-key">{spec.key}:</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="product-features">
            <div className="feature-item">
              <FiCheckCircle aria-hidden="true" />
              <span>Genuine Integrity</span>
            </div>
            <div className="feature-item">
              <FiTruck aria-hidden="true" />
              <span>Priority Transport</span>
            </div>
          </div>

          <div className="stock-status-row">
            <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
              {isOutOfStock ? 'Out of stock' : `In stock: ${product.stock}`}
            </span>
          </div>

          <div className="action-buttons">
            <button
              className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              aria-label={isAdded ? "Added to cart successfully" : "Add curated device to shopping cart"}
            >
              <FiShoppingCart aria-hidden="true" />
              {isAdded ? 'Added to Cart' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button 
              className="buy-now-btn" 
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              aria-label="Buy curated device now"
            >
              {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
            </button>
          </div>
        </div>
      </div>
      {showNotification && (
        <Notification
          message="Product added to cart!"
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;
