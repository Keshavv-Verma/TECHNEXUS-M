import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    rating: 4,
    image: '',
    description: ''
  });
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        navigate('/login');
        return;
      }
      const data = await response.json();
      // API returns array directly, not wrapped in {products: [...]}
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
  }, [fetchProducts, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    
    // Validate form
    if (!newProduct.name || !newProduct.category || !newProduct.price) {
      setError('Please fill in all required fields (Name, Category, Price)');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`, {
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
      
      // Update products list
      setProducts(prevProducts => [...prevProducts, savedProduct]);
      
      // Reset form
      setNewProduct({
        name: '',
        category: '',
        price: '',
        rating: 4,
        image: '',
        description: ''
      });
      
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
      category: product.category?.name || '',
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
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

      // Update the products list
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products/${productId}`, {
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

      // Remove product from list
      setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
      setSuccess('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error.message || 'An error occurred while deleting the product');
    }
  };

  return (
    <div className="admin-dashboard-wrapper dark">
      <div className="admin-dashboard-header">
        <h1>Product Management Console</h1>
        <p className="admin-dashboard-subtitle">Add and manage your products</p>
      </div>
      
      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '6px',
          color: '#c33',
          marginBottom: '16px'
        }}>
          Error: {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          background: '#efe',
          border: '1px solid #cfc',
          borderRadius: '6px',
          color: '#3c3',
          marginBottom: '16px'
        }}>
          ✓ {success}
        </div>
      )}
      
      <div className="admin-dashboard-content">
        <div className="admin-product-form-container">
          <div className="admin-form-header">
            <h2>Add New Product</h2>
            <span className="admin-form-icon">+</span>
          </div>
          <form onSubmit={handleSubmit} className="admin-product-form">
            <div className="admin-form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                className="admin-form-select"
              >
                <option value="">Select Category</option>
                <option value="MOBANDACCESS">Mobile & Accessories</option>
                <option value="ELECTRONICS">Electronics</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Image URL</label>
              <input
                type="text"
                value={newProduct.image}
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                className="admin-form-input"
              />
            </div>

            <div className="admin-form-group">
              <label>Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="admin-form-textarea"
              />
            </div>

            <button type="submit" className="admin-submit-btn">
              Add Product
              <span className="admin-btn-icon">→</span>
            </button>
          </form>
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
                    // Edit Mode
                    <div className="admin-product-edit-form">
                      <h3 style={{ marginBottom: '12px', color: '#fff' }}>Edit Product</h3>
                      
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Product Name</label>
                        <input
                          type="text"
                          value={editData.name || ''}
                          onChange={(e) => setEditData({...editData, name: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            background: '#222',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Category</label>
                        <select
                          value={editData.category || ''}
                          onChange={(e) => setEditData({...editData, category: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            background: '#222',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="ELECTRONICS">Electronics</option>
                          <option value="MOBANDACCESS">Mobile & Accessories</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Price (₹)</label>
                        <input
                          type="number"
                          value={editData.price || ''}
                          onChange={(e) => setEditData({...editData, price: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            background: '#222',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Rating</label>
                        <input
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={editData.rating || ''}
                          onChange={(e) => setEditData({...editData, rating: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            background: '#222',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Stock</label>
                        <input
                          type="number"
                          value={editData.stock || ''}
                          onChange={(e) => setEditData({...editData, stock: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            background: '#222',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Image URL</label>
                        <input
                          type="text"
                          value={editData.image || ''}
                          onChange={(e) => setEditData({...editData, image: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            background: '#222',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '4px' }}>Description</label>
                        <textarea
                          value={editData.description || ''}
                          onChange={(e) => setEditData({...editData, description: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #444',
                            borderRadius: '4px',
                            background: '#222',
                            color: '#fff',
                            fontSize: '13px',
                            boxSizing: 'border-box',
                            minHeight: '60px',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button
                          onClick={() => handleSave(product._id)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: '#4CAF50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="admin-product-image-container">
                        <img src={product.image || 'https://via.placeholder.com/200'} alt={product.name} className="admin-product-image" />
                        <span className="admin-product-category">{product.category?.name || 'Unknown'}</span>
                      </div>
                      <div className="admin-product-details">
                        <h3 className="admin-product-name">{product.name}</h3>
                        <p className="admin-product-price">₹{product.price}</p>
                        <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>Rating: {product.rating} | Stock: {product.stock}</p>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '10px',
                            background: '#2196F3',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          style={{
                            width: '100%',
                            padding: '8px',
                            marginTop: '8px',
                            background: '#f44336',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <p style={{color: '#888', gridColumn: '1/-1'}}>No products added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
