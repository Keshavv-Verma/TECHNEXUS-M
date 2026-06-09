import React, { useState, useEffect } from 'react';
import { joinApiUrl } from '../../services/api';
import './SpecificationsManager.css';

const SpecificationsManager = ({ onClose, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [specifications, setSpecifications] = useState([]);
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(joinApiUrl('/api/products'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSpecifications(product.specifications || []);
    setNewSpec({ key: '', value: '' });
    setError(null);
    setSuccess(null);
  };

  const handleAddSpecification = () => {
    if (!newSpec.key.trim() || !newSpec.value.trim()) {
      setError('Please enter both key and value');
      return;
    }

    const updated = [...specifications, { key: newSpec.key.trim(), value: newSpec.value.trim() }];
    setSpecifications(updated);
    setNewSpec({ key: '', value: '' });
    setError(null);
  };

  const handleRemoveSpecification = (index) => {
    const updated = specifications.filter((_, i) => i !== index);
    setSpecifications(updated);
  };

  const handleSaveSpecifications = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(joinApiUrl(`/api/products/${selectedProduct._id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          specifications: specifications
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save specifications');
      }

      const result = await response.json();
      setSuccess('Specifications saved successfully!');
      
      // Update the product in the list
      setSelectedProduct(result.product);
      setSpecifications(result.product.specifications || []);

      if (onSuccess) {
        onSuccess(result.product);
      }

      // Auto close after 2 seconds
      setTimeout(() => {
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving specifications:', error);
      setError(error.message || 'Failed to save specifications');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecification();
    }
  };

  return (
    <div className="specs-manager-overlay">
      <div className="specs-manager-modal">
        <div className="specs-manager-header">
          <h2>Product Specifications Manager</h2>
          <button
            type="button"
            className="specs-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="specs-alert error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="specs-alert success" role="alert">
            ✓ {success}
          </div>
        )}

        <div className="specs-manager-content">
          {/* Product Selection */}
          <div className="specs-section">
            <label htmlFor="product-select" className="specs-label">
              Select Product
            </label>
            <select
              id="product-select"
              className="specs-select"
              value={selectedProduct?._id || ''}
              onChange={(e) => {
                const product = products.find(p => p._id === e.target.value);
                if (product) handleProductSelect(product);
              }}
            >
              <option value="">-- Select a product --</option>
              {products.map(product => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <>
              {/* Current Specifications */}
              <div className="specs-section">
                <div className="specs-section-header">
                  <h3>Current Specifications</h3>
                  <span className="specs-count">{specifications.length}</span>
                </div>

                {specifications.length === 0 ? (
                  <p className="specs-empty">No specifications added yet</p>
                ) : (
                  <div className="specs-list">
                    {specifications.map((spec, index) => (
                      <div key={index} className="specs-item">
                        <div className="specs-item-content">
                          <div className="specs-key">{spec.key}</div>
                          <div className="specs-value">{spec.value}</div>
                        </div>
                        <button
                          type="button"
                          className="specs-remove-btn"
                          onClick={() => handleRemoveSpecification(index)}
                          aria-label={`Remove ${spec.key}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Specification */}
              <div className="specs-section">
                <div className="specs-section-header">
                  <h3>Add Specification</h3>
                </div>

                <div className="specs-input-group">
                  <input
                    type="text"
                    placeholder="e.g., Display, Processor, RAM"
                    className="specs-input"
                    value={newSpec.key}
                    onChange={(e) => setNewSpec({...newSpec, key: e.target.value})}
                    onKeyPress={handleKeyPress}
                  />
                  <input
                    type="text"
                    placeholder="e.g., 6.1-inch OLED, Apple A17 Pro, 8GB"
                    className="specs-input"
                    value={newSpec.value}
                    onChange={(e) => setNewSpec({...newSpec, value: e.target.value})}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    type="button"
                    className="specs-add-btn"
                    onClick={handleAddSpecification}
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="specs-actions">
                <button
                  type="button"
                  className="specs-save-btn"
                  onClick={handleSaveSpecifications}
                  disabled={loading || specifications.length === 0}
                >
                  {loading ? 'Saving...' : 'Save Specifications'}
                </button>
                <button
                  type="button"
                  className="specs-cancel-btn"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecificationsManager;
