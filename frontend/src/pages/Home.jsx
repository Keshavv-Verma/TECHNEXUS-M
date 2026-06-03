import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import headphones from "../assets/headphones.png";

const Home = () => {
  const navigate = useNavigate();
  const [isCollectionsVisible, setIsCollectionsVisible] = useState(false);
  const collectionsRef = useRef(null);

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
    </div>
  );
};

export default Home;
