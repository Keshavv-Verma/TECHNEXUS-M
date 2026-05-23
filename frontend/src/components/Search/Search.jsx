import React, { useState, useEffect, useRef } from 'react'
import { IoClose, IoSearch } from 'react-icons/io5'
import './Search.css'
import { useNavigate } from 'react-router-dom'

const Search = ({setShowSearch}) => {

  const[query,setQuery] = useState("");
  const[searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const onChange = (e) => {
    setQuery(e.target.value);
  }

  // Search products when query changes
  useEffect(() => {
    if (query.length > 0) {
      console.log('Searching for:', query);
      fetch(`${process.env.REACT_APP_API_URL}/api/products`)
        .then(res => res.json())
        .then(data => {
          console.log('API response:', data);
          let products = [];
          
          // Handle different response formats
          if (Array.isArray(data)) {
            products = data;
          } else if (data.products && Array.isArray(data.products)) {
            products = data.products;
          } else if (data.data && Array.isArray(data.data)) {
            products = data.data;
          }
          
          console.log('Products to search:', products);
          
          if (products.length > 0) {
            const filtered = products.filter(product => 
              (product.name && product.name.toLowerCase().includes(query.toLowerCase())) ||
              (product.description && product.description.toLowerCase().includes(query.toLowerCase()))
            );
            console.log('Filtered results:', filtered);
            setSearchResults(filtered);
          }
        })
        .catch(err => console.error('Search error:', err));
    } else {
      setSearchResults([]);
    }
  }, [query]);

  // Close search when clicking outside
  const handleBackdropClick = (e) => {
    if (modalRef.current && e.target === modalRef.current) {
      setShowSearch(false);
    }
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className='search-backdrop' ref={modalRef} onClick={handleBackdropClick}>
      <div className='search-modal-container'>
        <div className="search-header">
          <div className="search-input-wrapper">
            <IoSearch className="search-icon" />
            <input 
              ref={inputRef}
              type="text"
              autoFocus
              placeholder='Search for products...' 
              value={query}
              onChange={onChange}
              className="search-input"
            />
            <IoClose 
              onClick={() => setShowSearch(false)} 
              className='search-close-btn'
              size={24}
            />
          </div>
        </div>

        <div className="search-results-container">
          {searchResults && searchResults.length > 0 ? (
            <div className="search-results-list">
              {searchResults.map((product) => (
                <div 
                  key={product.id} 
                  className="search-result-card" 
                  onClick={() => {
                    navigate("/productpage/" + product.id)
                    setShowSearch(false)
                  }}
                >
                  <img 
                    src={product.image || 'https://via.placeholder.com/80'} 
                    alt={product.name}
                    className="search-result-image"
                  />
                  <div className="search-result-info">
                    <h4 className="search-result-name">{product.name}</h4>
                    <p className="search-result-price">₹{product.price}</p>
                  </div>
                  <span className="search-arrow">→</span>
                </div>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="search-empty">
              <p>No products found for "{query}"</p>
              <p style={{fontSize: '12px', color: '#666', marginTop: '8px'}}>Try searching for different keywords</p>
            </div>
          ) : (
            <div className="search-empty">
              <p>Start typing to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Search;
