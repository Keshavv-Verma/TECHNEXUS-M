import React, { useState, useEffect } from "react";
import Search from "../Search/Search";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { TbSearch } from "react-icons/tb";
import { FaTimes } from "react-icons/fa";
import { FiGrid } from "react-icons/fi";
import { BsCart } from "react-icons/bs";
import { FiUser } from "react-icons/fi"; // Import the user icon
import "./Navbar.css";
import { clearAuth, isLoggedIn, getToken, isTokenExpired } from "../../utils/authUtils";

const nav_links = [
  {
    url: "/",
    title: "Home",
  },
  {
    url: "/electronics",
    title: "Electronics",
  },
  {
    url: "/mobandaccess",
    title: "Mobile and Accessories",
  },
  {
    url: "/more",
    title: "More",
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [clicked, setClicked] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [color, setColor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    };

    const checkAuthStatus = () => {
      const token = getToken();
      if (token && isTokenExpired(token)) {
        clearAuth();
      }
      const isAdminUser = localStorage.getItem('isAdmin');
      const authed = isLoggedIn();
      setLoggedIn(authed);
      setIsAdmin(authed && isAdminUser === 'true');
    };

    updateCartCount();
    checkAuthStatus();

    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const changeColor = () => {
    if (window.scrollY >= 90) {
      setColor(true);
    } else {
      setColor(false);
    }
  };

  window.addEventListener("scroll", changeColor);

  const menuList = nav_links.map(({ url, title }, index) => {
    return (
      <li key={index}>
        <NavLink to={url} className="menu-links nav-link-ltr">
          {title}
        </NavLink>
      </li>
    );
  });

  const handleClick = () => {
    setClicked(!clicked);
  };

  const handleSignIn = () => {
    if (isLoggedIn()) {
      clearAuth();
      setIsAdmin(false);
      setLoggedIn(false);
      window.location.reload(); // Force reload to update navbar
    } else {
      if (getToken()) clearAuth();
      navigate('/login');
    }
  };

  return (
    <>
      <div className={color ? "navbar navbar-bg" : "navbar"}>
        <div className="nav-wrapper">
          <div className="logo" onClick={() => navigate("/")}>
            <h1>
              Tech<strong>Nexus</strong>
            </h1>
          </div>

          <div className="navigation">
            <ul className={clicked ? "menu open" : "menu"} onClick={handleClick}>
              {menuList}
              {/* Mobile-only items */}
              <li className="mobile-show">
                <Link to="/orders" className="menu-links mobile-show">
                  Orders
                </Link>
              </li>
              <li className="mobile-show" onClick={() => navigate('/cart')} style={{ cursor: 'pointer' }}>
                <BsCart />
                {!!cartCount && <span className="cart-num">{cartCount}</span>}
              </li>
              <li className="mobile-show logout-item">
                <span className="menu-links" onClick={handleSignIn}>
                  {isLoggedIn() ? <span>Logout</span> : <FiUser />}
                </span>
              </li>
            </ul>
          </div>

          <div className="nav-icons">
            <span
              className="search-icon"
              onClick={() => {
                setShowSearch(true);
              }}
            >
              <TbSearch />
            </span>
            <span className="sign-in-icon mobile-hide" onClick={handleSignIn}>
              {isLoggedIn() ? <span>Logout</span> : <FiUser />}
            </span>
            {loggedIn && (
              <Link
                to="/orders"
                className="mobile-hide"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontSize: 22,
                  marginRight: 8,
                  marginTop: 2
                }}
              >
                Orders
              </Link>
            )}
            <span
              onClick={() => navigate('/cart')}
              className="cart-icon mobile-hide"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/cart')}
            >
              <BsCart />
              {!!cartCount && <span className="cart-num">{cartCount}</span>}
            </span>
            <div className="grid-icon">
              <span onClick={handleClick}>
                {clicked ? <FaTimes /> : <FiGrid />}
              </span>
            </div>
            {isAdmin && isLoggedIn() && (
              <Link 
                to="/dashboard" 
                className="mobile-hide"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  marginLeft: '16px',
                  transition: 'background-color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
      {showSearch && <Search setShowSearch={setShowSearch} />}
    </>
  );
};

export default Navbar;
