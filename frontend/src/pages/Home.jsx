import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import headphones from "../assets/headphones.png";
import InfiniteMenu from "../components/InfiniteMenu/InfiniteMenu";
import { joinApiUrl } from "../services/api";
import { FiSliders } from "react-icons/fi";

const getBrandName = (productName) => {
  if (!productName) return "Other";
  const firstWord = productName.trim().split(" ")[0];
  if (!firstWord) return "Other";
  return firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
};

const Home = () => {
  const navigate = useNavigate();
  const [isCollectionsVisible, setIsCollectionsVisible] = useState(false);
  const collectionsRef = useRef(null);
  
  // Showcase filter state
  const [allProducts, setAllProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('default');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    fetch(joinApiUrl('/api/products'))
      .then(res => res.json())
      .then(data => {
        let products = [];
        if (Array.isArray(data)) {
          products = data;
        } else if (data.products && Array.isArray(data.products)) {
          products = data.products;
        } else if (data.data && Array.isArray(data.data)) {
          products = data.data;
        }
        setAllProducts(products);
      })
      .catch(err => {
        console.error("Failed to fetch products for InfiniteMenu:", err);
      });
  }, []);

  const uniqueBrands = useMemo(() => {
    const brands = new Set();
    const filteredByCategory = allProducts.filter(p => {
      if (activeCategory === 'ALL') return true;
      const catName = p.category?.name || p.categoryName || '';
      return catName.toUpperCase() === activeCategory.toUpperCase();
    });
    filteredByCategory.forEach(p => {
      const name = p.name || p.title || '';
      brands.add(getBrandName(name));
    });
    return Array.from(brands);
  }, [allProducts, activeCategory]);

  useEffect(() => {
    setSelectedBrands([]);
  }, [activeCategory]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const resetFilters = () => {
    setSortBy('default');
    setSelectedBrands([]);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (sortBy !== 'default') count++;
    if (selectedBrands.length > 0) count++;
    return count;
  }, [sortBy, selectedBrands]);

  const menuItems = useMemo(() => {
    let results = allProducts.filter(product => {
      if (activeCategory === 'ALL') return true;
      const catName = product.category?.name || product.categoryName || '';
      return catName.toUpperCase() === activeCategory.toUpperCase();
    });

    if (selectedBrands.length > 0) {
      results = results.filter(product => {
        const name = product.name || product.title || '';
        return selectedBrands.includes(getBrandName(name));
      });
    }

    if (sortBy === 'price-asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating-desc') {
      results.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
    } else if (sortBy === 'name-asc') {
      const getProductName = (p) => p.name || p.title || '';
      results.sort((a, b) => getProductName(a).localeCompare(getProductName(b)));
    }

    return results.map(product => {
      const id = product.id || product._id;
      const attributes = product.attributes || product;
      const name = attributes.name || attributes.title;
      const price = attributes.price;
      const image = (attributes.img?.data?.[0]?.attributes?.url) || product.image || 'https://via.placeholder.com/300?text=Product';
      
      return {
        image: image,
        link: `/productpage/${id}`,
        title: name,
        description: `₹${price.toLocaleString('en-IN')}`,
        price: price,
        category: attributes.category?.name || attributes.categoryName || 'Gear',
        subcategory: attributes.subcategory || '',
        rating: attributes.rating || 4,
        specifications: attributes.specifications || []
      };
    });
  }, [allProducts, activeCategory, sortBy, selectedBrands]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCollectionsVisible(true);
          // Trigger animation once to preserve design performance
          if (collectionsRef.current) {
            observer.unobserve(collectionsRef.current);
          }
        }
      },
      {
        threshold: 0.15, // Trigger when 15% of the collections container is in view
        rootMargin: "0px 0px -50px 0px" // Subtle offset for visual comfort
      }
    );

    if (collectionsRef.current) {
      observer.observe(collectionsRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleOpenAI = () => {
    // Summon the globally active, redesigned AI Assistant panel smoothly
    const aiButton = document.querySelector(".ai-assistant-button");
    if (aiButton) {
      aiButton.click();
    } else {
      alert("TechNexus AI Assistant is initializing. Please try again in a moment.");
    }
  };

  const handleScrollToCollections = () => {
    document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-workspace">
      {/* 1. Hero Experience */}
      <section className="home-hero">
        <div className="hero-content">
          <p className="hero-subtitle">TechNexus Curation</p>
          <h1 className="hero-title">Quiet Technology.<br />Refined Performance.</h1>
          <p className="hero-desc">
            A premium collection of high-end consumer electronics designed for modern workspaces, curated for absolute simplicity and functional craftsmanship.
          </p>
        </div>
        <div className="hero-showcase">
          <img src={headphones} alt="NTC Obsidian Professional Studio Wireless Headphones" />
        </div>
        <button className="hero-scroll-btn" onClick={handleScrollToCollections} aria-label="Scroll to curated collections">
          <span>Explore Catalog</span>
          <div className="scroll-indicator-line" />
        </button>
      </section>

      {/* 2. Featured Collections */}
      <section id="collections" className="home-collections" ref={collectionsRef}>
        <div className="section-header">
          <p className="section-tag">Collections</p>
          <h2 className="section-title">Curated Focus</h2>
        </div>
        <div className={`collections-split ${isCollectionsVisible ? "visible" : ""}`}>
          <div 
            className="collection-panel"
            onClick={() => navigate("/electronics")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/electronics")}
          >
            <div className="collection-info">
              <h3 className="collection-title">Pure Electronics</h3>
              <p className="collection-desc">Ultra-high-definition displays, professional systems, and smart home curators.</p>
            </div>
            <div className="collection-trigger">
              Explore Collection <span>→</span>
            </div>
          </div>

          <div 
            className="collection-panel"
            onClick={() => navigate("/mobandaccess")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate("/mobandaccess")}
          >
            <div className="collection-info">
              <h3 className="collection-title">Essentials</h3>
              <p className="collection-desc">High-performance smartphones, tactile components, and gym accessories.</p>
            </div>
            <div className="collection-trigger">
              Explore Collection <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AI Shopping Assistant Section */}
      <section className="home-ai-showcase">
        <div className="ai-showcase-card">
          <div className="ai-showcase-left">
            <div className="ai-status-badge">TechNexus Intelligence</div>
            <h2 className="ai-showcase-title">Curated setups, designed in real time.</h2>
            <p className="ai-showcase-desc">
              TechNexus AI operates silently in the background, examining specification matrices and budget thresholds to compile custom shopping curations.
            </p>
            <button className="ai-advisor-trigger" onClick={handleOpenAI} aria-label="Open AI Shopping Advisor">
              Consult Advisor →
            </button>
          </div>
          <div className="ai-showcase-right">
            <div className="ai-mock-card">
              <span className="ai-mock-title">Active Advice</span>
              <p className="ai-mock-text">"Analyzing acoustic response curves for wireless gym headphones."</p>
            </div>
            <div className="ai-mock-card second">
              <span className="ai-mock-title">Top Curation</span>
              <p className="ai-mock-text">"Smart TV recommendations matches: 4K UHD smart models with Chromecast built-in."</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Customer Experience */}
      <section className="home-highlights">
        <div className="highlights-grid">
          <div className="highlight-col">
            <p className="highlight-tag">01 / LOGISTICS</p>
            <h3 className="highlight-title">Curated Transport</h3>
            <p className="highlight-desc">White-glove logistical transit directly from curated facilities, ensuring secure, pristine device drop-offs.</p>
          </div>
          <div className="highlight-col">
            <p className="highlight-tag">02 / INTEGRITY</p>
            <h3 className="highlight-title">Secure Commerce</h3>
            <p className="highlight-desc">Encrypted Stripe payments, robust order tracking, and clear invoice logs for timeless peace of mind.</p>
          </div>
          <div className="highlight-col">
            <p className="highlight-tag">03 / DURATION</p>
            <h3 className="highlight-title">Lifetime Integrity</h3>
            <p className="highlight-desc">Hardware curations backed by verified guarantees, built for reliable day-to-day operations.</p>
          </div>
        </div>
      </section>

      {/* 5. Social Proof */}
      <section className="home-reviews">
        <div className="reviews-carousel">
          <blockquote className="review-quote">
            "TechNexus curates technology rather than merely listing it. An absolute masterclass in quiet elegance, pristine typographic visual hierarchy, and functional restraint."
          </blockquote>
          <cite className="review-author">— Design Gazette Review</cite>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="home-cta">
        <div className="cta-container">
          <h2 className="cta-title">Refine Your Workspace.</h2>
          <button className="cta-btn" onClick={() => navigate("/electronics")} aria-label="Browse full catalog">
            Browse Curation
          </button>
        </div>
      </section>

      {/* 7. Animated 3D Showcase */}
      {allProducts.length > 0 && (
        <section className="home-infinite-showcase">
          <div className="section-header text-center">
            <p className="section-tag">Interactive Catalog</p>
            <h2 className="section-title">The Obsidian Sphere</h2>
            <p className="section-subtitle">
              Drag, rotate, and interact with our product gallery in a 3D responsive environment.
            </p>
          </div>

          {/* Category tabs and flyout filters */}
          <div className="showcase-controls">
            <div className="showcase-categories">
              <button
                className={`category-pill ${activeCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveCategory('ALL')}
              >
                All Products
              </button>
              <button
                className={`category-pill ${activeCategory === 'ELECTRONICS' ? 'active' : ''}`}
                onClick={() => setActiveCategory('ELECTRONICS')}
              >
                Electronics
              </button>
              <button
                className={`category-pill ${activeCategory === 'MOBANDACCESS' ? 'active' : ''}`}
                onClick={() => setActiveCategory('MOBANDACCESS')}
              >
                Mobiles & Accessories
              </button>
            </div>

            <div className="showcase-filter-wrapper" ref={filterDropdownRef}>
              <button
                className={`showcase-filter-toggle ${isFilterOpen ? 'active' : ''}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FiSliders className="filter-icon" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="filter-count-badge">{activeFiltersCount}</span>
                )}
              </button>

              {isFilterOpen && (
                <div className="showcase-filter-dropdown">
                  <div className="dropdown-section">
                    <h4 className="dropdown-section-title">Sort By</h4>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="dropdown-select"
                    >
                      <option value="default">Default</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Rating: Highest First</option>
                      <option value="name-asc">Name: A to Z</option>
                    </select>
                  </div>

                  <div className="dropdown-section">
                    <h4 className="dropdown-section-title">Brands</h4>
                    <div className="dropdown-brands-list">
                      {uniqueBrands.map((brand, bIdx) => {
                        const isChecked = selectedBrands.includes(brand);
                        return (
                          <label key={bIdx} className="brand-checkbox-label">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                } else {
                                  setSelectedBrands([...selectedBrands, brand]);
                                }
                              }}
                              className="brand-checkbox"
                            />
                            <span className="brand-checkbox-text">{brand}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button className="dropdown-reset-btn" onClick={resetFilters}>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="infinite-menu-wrapper">
            {menuItems.length > 0 ? (
              <InfiniteMenu items={menuItems} scale={1.1} />
            ) : (
              <div className="showcase-empty-state">
                <p>No products match your active filters.</p>
                <button onClick={resetFilters} className="dropdown-reset-btn">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
