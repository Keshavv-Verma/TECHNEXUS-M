import React, { useContext, useEffect, useState, useMemo } from 'react'
import { useParams } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import Products from '../Products/Products';
import './Category.css';
import { Context } from '../../context/AppContext';
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
  // Fallback to the first word
  const firstWord = productName.trim().split(" ")[0];
  if (!firstWord) return "Other";
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
};

const Category = () => {
    const { setstate } = useContext(Context);
    const { id } = useParams();
    const { data } = useFetch(`/api/products?categoryId=${id}`);
    
    // States for filters
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedMaxPrice, setSelectedMaxPrice] = useState(0);
    const [sortBy, setSortBy] = useState('default');
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Derived states
    const productsList = useMemo(() => data?.data || [], [data]);
    
    const categoryTitle = useMemo(() => {
        return productsList?.[0]?.attributes?.categories?.data?.[0]?.attributes?.title || "Category Products";
    }, [productsList]);

    // Get all unique brands and min/max prices from products list
    const { uniqueBrands, minPrice, maxPrice } = useMemo(() => {
        const brands = new Set();
        let min = Infinity;
        let max = 0;
        
        productsList.forEach(item => {
            const price = item.attributes.price;
            brands.add(getBrandName(item.attributes.title));
            if (price < min) min = price;
            if (price > max) max = price;
        });
        
        return {
            uniqueBrands: Array.from(brands),
            minPrice: min === Infinity ? 0 : min,
            maxPrice: max === 0 ? 100000 : max
        };
    }, [productsList]);

    // Reset filters when category changes or when page first loads
    useEffect(() => {
        setSelectedBrands([]);
        setSelectedMaxPrice(maxPrice);
        setSortBy('default');
    }, [id, maxPrice]);

    // Sync state.products with loaded data just in case other components need it
    useEffect(() => {
        setstate((prev) => ({ ...prev, products: data }));
    }, [data, setstate]);

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

    // Filtered & Sorted products list
    const filteredAndSortedProducts = useMemo(() => {
        let results = productsList.filter(item => {
            const price = item.attributes.price;
            const brand = getBrandName(item.attributes.title);
            
            // Brand check
            if (selectedBrands.length > 0 && !selectedBrands.includes(brand)) {
                return false;
            }
            // Price check
            if (price > selectedMaxPrice) {
                return false;
            }
            return true;
        });

        // Sorting
        if (sortBy === 'price-asc') {
            results.sort((a, b) => a.attributes.price - b.attributes.price);
        } else if (sortBy === 'price-desc') {
            results.sort((a, b) => b.attributes.price - a.attributes.price);
        } else if (sortBy === 'rating-desc') {
            results.sort((a, b) => (b.attributes.rating || 0) - (a.attributes.rating || 0));
        } else if (sortBy === 'name-asc') {
            results.sort((a, b) => a.attributes.title.localeCompare(b.attributes.title));
        }
        
        return results;
    }, [productsList, selectedBrands, selectedMaxPrice, sortBy]);

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

    return (
        <div className='category-main-content'>
            <div className='category-layout'>
                <div className='category-header-row'>
                    <h1 className='category-title'>{categoryTitle}</h1>
                    <button 
                        className='mobile-filter-toggle-btn'
                        onClick={() => setIsMobileFilterOpen(true)}
                    >
                        <FiSliders /> Filters & Sorting
                    </button>
                </div>

                <div className='category-content-container'>
                    {/* Catalogue Filter Sidebar */}
                    <aside className={`category-filter-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
                        <div className='sidebar-header'>
                            <h3>Catalogue Filters</h3>
                            <button 
                                className='sidebar-close-btn'
                                onClick={() => setIsMobileFilterOpen(false)}
                            >
                                <FiX />
                            </button>
                        </div>

                        {/* Sorting Widget */}
                        <div className='filter-section'>
                            <h4 className='filter-section-title'>Sort By</h4>
                            <select 
                                className='filter-sort-select'
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value='default'>Featured</option>
                                <option value='price-asc'>Price: Low to High</option>
                                <option value='price-desc'>Price: High to Low</option>
                                <option value='rating-desc'>Customer Rating</option>
                                <option value='name-asc'>Name: A to Z</option>
                            </select>
                        </div>

                        {/* Price Range Slider Widget */}
                        <div className='filter-section'>
                            <h4 className='filter-section-title'>Price Range</h4>
                            <div className='price-slider-info'>
                                <span>₹{minPrice.toLocaleString('en-IN')}</span>
                                <span className='price-highlight'>Max: ₹{selectedMaxPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <input 
                                type='range' 
                                className='filter-price-slider'
                                min={minPrice}
                                max={maxPrice}
                                step={100}
                                value={selectedMaxPrice || maxPrice}
                                onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
                            />
                        </div>

                        {/* Brand Checkboxes Widget */}
                        {uniqueBrands.length > 0 && (
                            <div className='filter-section'>
                                <h4 className='filter-section-title'>Brands</h4>
                                <div className='brands-list-container'>
                                    {uniqueBrands.map(brand => {
                                        const isChecked = selectedBrands.includes(brand);
                                        return (
                                            <label key={brand} className='brand-checkbox-label'>
                                                <input 
                                                    type='checkbox'
                                                    checked={isChecked}
                                                    onChange={() => handleBrandChange(brand)}
                                                    style={{ display: 'none' }}
                                                />
                                                <span className={`custom-checkbox ${isChecked ? 'checked' : ''}`}>
                                                    {isChecked && <FiCheck />}
                                                </span>
                                                <span className='brand-name-text'>{brand}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Reset Filters CTA */}
                        {(selectedBrands.length > 0 || selectedMaxPrice < maxPrice || sortBy !== 'default') && (
                            <button className='filter-reset-btn' onClick={handleReset}>
                                Reset All Filters
                            </button>
                        )}
                    </aside>

                    {/* Products Grid Content Area */}
                    <div className='category-products-wrapper'>
                        {filteredAndSortedProducts.length === 0 ? (
                            <div className='no-products-found'>
                                <h3>No matching products found</h3>
                                <p>Try relaxing your filters or price slider to see more products.</p>
                                <button className='btn-secondary' onClick={handleReset}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <Products innerPage={true} productsData={{ data: filteredAndSortedProducts }} />
                        )}
                    </div>
                </div>
            </div>
            
            {/* Mobile Sidebar Overlay Backdrop */}
            {isMobileFilterOpen && (
                <div 
                    className='sidebar-mobile-backdrop'
                    onClick={() => setIsMobileFilterOpen(false)}
                />
            )}
        </div>
    )
}

export default Category
