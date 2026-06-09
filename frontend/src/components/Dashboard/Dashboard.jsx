import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminOrders } from '../../services/checkoutService';
import { joinApiUrl } from '../../services/api';
import SpecificationsManager from './SpecificationsManager';
import './Dashboard.css';

const formatOrderDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showSpecsManager, setShowSpecsManager] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    rating: 4,
    image: '',
    description: '',
    specifications: []
  });
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const data = await getAdminOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message || 'Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(joinApiUrl('/api/products'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (error) {
      console.error('Error:', error);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchProducts();
    fetchOrders();
  }, [fetchProducts, fetchOrders, navigate]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  const handleAddSpecToNewProduct = () => {
    if (!newSpec.key.trim() || !newSpec.value.trim()) {
      setError('Please enter both specification key and value');
      return;
    }
    setNewProduct({
      ...newProduct,
      specifications: [...newProduct.specifications, { key: newSpec.key.trim(), value: newSpec.value.trim() }]
    });
    setNewSpec({ key: '', value: '' });
    setError(null);
  };

  const handleRemoveSpecFromNewProduct = (index) => {
    setNewProduct({
      ...newProduct,
      specifications: newProduct.specifications.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      setError('Please fill in all required fields (Name, Category, Price)');
      return;
    }

    try {
      const response = await fetch(joinApiUrl('/api/products'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          rating: 4
        })
      });
      
      if (response.status === 401 || response.status === 403) {
        setError('You are not authorized. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add product');
      }

      const savedProduct = await response.json();
      console.log('Product saved:', savedProduct);
      
      setProducts(prevProducts => [...prevProducts, savedProduct]);
      
      setNewProduct({
        name: '',
        category: '',
        price: '',
        rating: 4,
        image: '',
        description: '',
        specifications: []
      });
      setNewSpec({ key: '', value: '' });
      
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.message || 'An error occurred while adding the product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setEditData({
      id: product._id,
      name: product.name,
      category: product.category?.name || product.categoryId?.name || '',
      price: product.price,
      rating: product.rating,
      image: product.image,
      description: product.description,
      stock: product.stock || 0
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (productId) => {
    setError(null);
    setSuccess(null);

    if (!editData.name || !editData.category || !editData.price) {
      setError('Please fill in all required fields (Name, Category, Price)');
      return;
    }

    try {
      const response = await fetch(joinApiUrl(`/api/products/${productId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editData.name,
          category: editData.category,
          price: Number(editData.price),
          rating: Number(editData.rating),
          image: editData.image,
          description: editData.description,
          stock: Number(editData.stock)
        })
      });

      if (response.status === 401 || response.status === 403) {
        setError('You are not authorized. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      const result = await response.json();
      console.log('Product updated:', result);

      setProducts(prevProducts =>
        prevProducts.map(p => p._id === productId ? result.product : p)
      );

      setSuccess('Product updated successfully!');
      setEditingId(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.message || 'An error occurred while updating the product');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
    setError(null);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(joinApiUrl(`/api/products/${productId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.status === 401 || response.status === 403) {
        setError('You are not authorized. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
      setSuccess('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message || 'An error occurred while deleting the product');
    }
  };

  return (
    <div className="admin-dashboard-wrapper dark" role="main">
      <div className="admin-dashboard-header">
        <h1>Admin Console</h1>
        <p className="admin-dashboard-subtitle">Manage catalog items and customer orders</p>
        <div className="admin-tabs" role="tablist" aria-label="Console Management Sections">
          <button
            type="button"
            className={activeTab === 'products' ? 'active-tab' : ''}
            onClick={() => setActiveTab('products')}
            role="tab"
            aria-selected={activeTab === 'products'}
            aria-controls="products-panel"
            id="tab-products"
          >
            Products
          </button>
          <button
            type="button"
            className={activeTab === 'specifications' ? 'active-tab' : ''}
            onClick={() => setActiveTab('specifications')}
            role="tab"
            aria-selected={activeTab === 'specifications'}
            aria-controls="specifications-panel"
            id="tab-specifications"
          >
            Specifications
          </button>
          <button
            type="button"
            className={activeTab === 'orders' ? 'active-tab' : ''}
            onClick={() => setActiveTab('orders')}
            role="tab"
            aria-selected={activeTab === 'orders'}
            aria-controls="orders-panel"
            id="tab-orders"
          >
            Orders ({orders.length})
          </button>
        </div>
      </div>
      
      {error && (
        <div className="admin-alert error" role="alert" aria-live="assertive">
          <span>Error: {error}</span>
        </div>
      )}

      {success && (
        <div className="admin-alert success" role="alert" aria-live="polite">
          <span>✓ {success}</span>
        </div>
      )}
      
      <div className="admin-dashboard-content">
        {activeTab === 'orders' && (
          <div 
            className="admin-products-overview wide" 
            id="orders-panel" 
            role="tabpanel" 
            aria-labelledby="tab-orders"
          >
            <div className="admin-overview-header">
              <h2>ACTIVE ORDERS</h2>
              <span className="admin-product-count">{orders.length} pending delivery</span>
            </div>
            {ordersLoading ? (
              <p style={{ color: '#7f7f7f', fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '12px' }}>Loading orders…</p>
            ) : orders.length === 0 ? (
              <p style={{ color: '#7f7f7f', fontSize: '13.5px' }}>No active orders. Orders appear here after customers pay.</p>
            ) : (
              <div className="order-feed-container">
                {orders.map((order) => (
                  <div key={order._id} className="admin-order-card">
                    <div className="admin-order-header">
                      <div>
                        <h3 className="admin-order-no">{order.orderNumber}</h3>
                        <p className="admin-order-date">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                      <span className="admin-order-status">{order.status}</span>
                    </div>
                    <div className="admin-order-details">
                      <p>
                        <strong>Customer:</strong>{' '}
                        {order.userId?.name || '—'} ({order.userId?.email || '—'})
                      </p>
                      <p>
                        <strong>Total:</strong> ₹{order.totalAmount?.toLocaleString('en-IN')} ·{' '}
                        <strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})
                      </p>
                      {order.deliveryAddress && (
                        <p style={{ marginTop: '6px', fontSize: '13px', color: '#dadada' }}>
                          <strong>Ship to:</strong> {order.deliveryAddress.fullName},{' '}
                          {order.deliveryAddress.houseNo}, {order.deliveryAddress.street},{' '}
                          {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                        </p>
                      )}
                    </div>
                    <ul className="admin-order-items">
                      {(order.orderItems || []).map((item, i) => (
                        <li key={i}>
                          {item.name} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
 
        {activeTab === 'products' && (
          <>
            <div 
              className="admin-product-form-container"
              id="products-panel" 
              role="tabpanel" 
              aria-labelledby="tab-products"
            >
              <div className="admin-form-header">
                <h2>Add New Product</h2>
                <span className="admin-form-icon">+</span>
              </div>
              <div className="admin-product-form-scroll">
                <form onSubmit={handleSubmit} className="admin-product-form">
                <div className="admin-form-group">
                  <label htmlFor="input-prod-name">Product Name</label>
                  <input
                    id="input-prod-name"
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="admin-form-input"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="input-prod-cat">Category</label>
                  <select
                    id="input-prod-cat"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="admin-form-select"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="MOBANDACCESS">Mobile & Accessories</option>
                    <option value="ELECTRONICS">Electronics</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label htmlFor="input-prod-price">Price (₹)</label>
                  <input
                    id="input-prod-price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    className="admin-form-input"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="input-prod-img">Image URL</label>
                  <input
                    id="input-prod-img"
                    type="text"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="admin-form-input"
                  />
                </div>

                <div className="admin-form-group">
                  <label htmlFor="input-prod-desc">Description</label>
                  <textarea
                    id="input-prod-desc"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="admin-form-textarea"
                  />
                </div>

                {/* Specifications Section */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '16px', marginTop: '16px' }}>
                  <div className="admin-form-group" style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11px', color: '#7f7f7f', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Specifications
                    </label>
                  </div>

                  {/* Current Specifications List */}
                  {newProduct.specifications.length > 0 && (
                    <div style={{ marginBottom: '12px', maxHeight: '120px', overflowY: 'auto' }}>
                      {newProduct.specifications.map((spec, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 10px',
                            marginBottom: '6px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: '#ffffff', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {spec.key}
                            </div>
                            <div style={{ color: '#dadada', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {spec.value}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecFromNewProduct(index)}
                            style={{
                              marginLeft: '8px',
                              padding: '4px 8px',
                              background: 'rgba(239, 68, 68, 0.08)',
                              color: '#fca5a5',
                              border: '1px solid rgba(239, 68, 68, 0.15)',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = '#ef4444';
                              e.target.style.color = '#ffffff';
                              e.target.style.borderColor = '#ef4444';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = 'rgba(239, 68, 68, 0.08)';
                              e.target.style.color = '#fca5a5';
                              e.target.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Specification Inputs */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                    <input
                      type="text"
                      placeholder="Key (e.g., Display)"
                      value={newSpec.key}
                      onChange={(e) => setNewSpec({...newSpec, key: e.target.value})}
                      className="admin-form-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newSpec.value}
                      onChange={(e) => setNewSpec({...newSpec, value: e.target.value})}
                      className="admin-form-input"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSpecToNewProduct}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    + Add Specification
                  </button>
                </div>

                <button type="submit" className="admin-submit-btn">
                  Add Product
                  <span className="admin-btn-icon">→</span>
                </button>
              </form>
              </div>
            </div>

            <div className="admin-products-overview">
              <div className="admin-overview-header">
                <h2>RECENTLY ADDED</h2>
                <span className="admin-product-count">{products.length} items</span>
              </div>
              <div className="admin-products-grid">
                {products && products.length > 0 ? (
                  products.map(product => (
                    <div key={product._id} className="admin-product-card">
                      {editingId === product._id ? (
                        // Card Edit Mode
                        <div className="admin-product-edit-form">
                          <h3>Edit Curation</h3>
                          
                          <div className="admin-edit-field">
                            <label htmlFor={`edit-name-${product._id}`}>Name</label>
                            <input
                              id={`edit-name-${product._id}`}
                              type="text"
                              value={editData.name || ''}
                              onChange={(e) => setEditData({...editData, name: e.target.value})}
                            />
                          </div>

                          <div className="admin-edit-field">
                            <label htmlFor={`edit-cat-${product._id}`}>Category</label>
                            <select
                              id={`edit-cat-${product._id}`}
                              value={editData.category || ''}
                              onChange={(e) => setEditData({...editData, category: e.target.value})}
                            >
                              <option value="ELECTRONICS">Electronics</option>
                              <option value="MOBANDACCESS">Mobile & Accessories</option>
                            </select>
                          </div>

                          <div className="admin-edit-field">
                            <label htmlFor={`edit-price-${product._id}`}>Price (₹)</label>
                            <input
                              id={`edit-price-${product._id}`}
                              type="number"
                              value={editData.price || ''}
                              onChange={(e) => setEditData({...editData, price: e.target.value})}
                            />
                          </div>

                          <div className="admin-edit-field">
                            <label htmlFor={`edit-rating-${product._id}`}>Rating</label>
                            <input
                              id={`edit-rating-${product._id}`}
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={editData.rating || ''}
                              onChange={(e) => setEditData({...editData, rating: e.target.value})}
                            />
                          </div>

                          <div className="admin-edit-field">
                            <label htmlFor={`edit-stock-${product._id}`}>Stock</label>
                            <input
                              id={`edit-stock-${product._id}`}
                              type="number"
                              value={editData.stock || ''}
                              onChange={(e) => setEditData({...editData, stock: e.target.value})}
                            />
                          </div>

                          <div className="admin-edit-field">
                            <label htmlFor={`edit-img-${product._id}`}>Image URL</label>
                            <input
                              id={`edit-img-${product._id}`}
                              type="text"
                              value={editData.image || ''}
                              onChange={(e) => setEditData({...editData, image: e.target.value})}
                            />
                          </div>

                          <div className="admin-edit-field">
                            <label htmlFor={`edit-desc-${product._id}`}>Description</label>
                            <textarea
                              id={`edit-desc-${product._id}`}
                              value={editData.description || ''}
                              onChange={(e) => setEditData({...editData, description: e.target.value})}
                            />
                          </div>

                          <div className="admin-edit-actions">
                            <button
                              type="button"
                              className="save"
                              onClick={() => handleSave(product._id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="cancel"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Card View Mode
                        <>
                          <div className="admin-product-image-container">
                            <img src={product.image || 'https://via.placeholder.com/200'} alt={product.name} className="admin-product-image" />
                            <span className="admin-product-category">{product.category?.name || product.categoryId?.name || 'Unknown'}</span>
                          </div>
                          <div className="admin-product-details">
                            <h3 className="admin-product-name">{product.name}</h3>
                            <p className="admin-product-price">₹{product.price.toLocaleString('en-IN')}</p>
                            <p className="admin-product-meta">⭐ {product.rating || "4.0"} · 📦 {product.stock || 0}</p>
                            <div style={{ marginTop: '12px' }}>
                              <button
                                type="button"
                                className="admin-card-btn edit"
                                onClick={() => handleEdit(product)}
                                aria-label={`Edit ${product.name}`}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="admin-card-btn delete"
                                onClick={() => handleDelete(product._id)}
                                aria-label={`Delete ${product.name}`}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#7f7f7f', gridColumn: '1/-1', fontSize: '13.5px' }}>No catalog items added yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'specifications' && (
          <div 
            className="admin-products-overview wide" 
            id="specifications-panel" 
            role="tabpanel" 
            aria-labelledby="tab-specifications"
          >
            <div className="admin-overview-header">
              <h2>PRODUCT SPECIFICATIONS</h2>
              <span className="admin-product-count">Manage product details</span>
            </div>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <p style={{ color: '#dadada', marginBottom: '20px', fontSize: '13.5px' }}>
                Add or edit specifications for your products
              </p>
              <button
                type="button"
                className="admin-submit-btn"
                onClick={() => setShowSpecsManager(true)}
                style={{ width: '200px', margin: '0 auto' }}
              >
                Open Specifications Manager
              </button>
            </div>
          </div>
        )}
      </div>

      {showSpecsManager && (
        <SpecificationsManager
          onClose={() => {
            setShowSpecsManager(false);
            fetchProducts();
          }}
          onSuccess={(updatedProduct) => {
            setProducts(prevProducts =>
              prevProducts.map(p => p._id === updatedProduct._id ? updatedProduct : p)
            );
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
