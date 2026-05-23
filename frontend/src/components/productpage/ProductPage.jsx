import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { loadCart, saveCart, normalizeCartItem, getProductId } from '../../utils/cartUtils';
import './productpage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
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

  const handleAddToCart = () => {
    const pid = String(getProductId(product));
    const cart = loadCart();
    const existingItem = cart.find((item) => item.id === pid);

    if (existingItem) {
      const stock = existingItem.stock ?? product.stock ?? 99;
      if (existingItem.quantity >= stock) {
        alert(`Only ${stock} units available`);
        return;
      }
      const updatedCart = cart.map((item) =>
        item.id === pid ? { ...item, quantity: item.quantity + 1 } : item
      );
      saveCart(updatedCart);
    } else {
      saveCart([...cart, normalizeCartItem(product, 1)]);
    }

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    saveCart([normalizeCartItem(product, 1)]);
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing product...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!product) {
    return <div className="error-container">Product not found</div>;
  }

  return (
    <div className="product-page-container">
      <div className="product-glass-container">
        <div className="product-image-section">
          <div className="main-image-container">
            <img src={product.image} alt={product.name} className="main-product-image" />
            <div className="image-overlay">
              <button className="overlay-btn wishlist-btn">
                <FiHeart />
              </button>
              <button className="overlay-btn share-btn">
                <FiShare2 />
              </button>
            </div>
          </div>
        </div>

        <div className="product-info-section">
          <div className="product-header">
            <h1>{product.name}</h1>
            <div className="product-meta">
              <div className="rating-container">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`star ${i < product.rating ? 'filled' : ''}`}>
                    ★
                  </span>
                ))}
                <span className="rating-count">({product.rating} / 5)</span>
              </div>
              <span className="product-category">{product.category?.name || 'Uncategorized'}</span>
            </div>
          </div>

          <div className="price-section">
            <h2 className="price">₹{product.price.toLocaleString('en-IN')}</h2>
            <span className="tax-info">Inclusive of all taxes</span>
          </div>

          <div className="product-description">
            <h3>Product Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-features">
            <div className="feature-item">
              <FiCheckCircle />
              <span>Genuine Product</span>
            </div>
            <div className="feature-item">
              <FiTruck />
              <span>Fast Delivery</span>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              <FiShoppingCart />
              {isAdded ? 'Added to Cart' : 'Add to Cart'}
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
