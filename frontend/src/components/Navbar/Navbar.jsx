import React, { useState, useEffect, useCallback, useRef } from "react";
import Search from "../Search/Search";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { TbSearch } from "react-icons/tb";
import { FaTimes } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { BsCart } from "react-icons/bs";
import { FiUser, FiLogOut, FiPackage } from "react-icons/fi";
import "./Navbar.css";
import { getCartItems } from "../../services/cartService";
import { saveCart } from "../../utils/cartUtils";
import {
  clearAuth,
  isLoggedIn,
  getToken,
  isTokenExpired,
  AUTH_CHANGED_EVENT,
} from "../../utils/authUtils";

const nav_links = [
  { url: "/", title: "Home" },
  { url: "/electronics", title: "Electronics" },
  { url: "/mobandaccess", title: "Mobile and Accessories" },
  { url: "/more", title: "More" },
];

const navLinkClass = ({ isActive }) =>
  `tn-navbar__link nav-link-ltr${isActive ? " tn-navbar__link--active" : ""}`;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [clicked, setClicked] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [color, setColor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const isMountedRef = useRef(true);
  const cartLoadingRef = useRef(false);

  const updateCartCount = useCallback(async () => {
    if (cartLoadingRef.current) {
      return;
    }

    if (isLoggedIn()) {
      cartLoadingRef.current = true;
      try {
        const items = await getCartItems();
        if (!isMountedRef.current) return;
        saveCart(items, { silent: true });
        const count = items.reduce((total, item) => total + (item.quantity || 0), 0);
        setCartCount(count);
        return;
      } catch (error) {
        console.error('Failed to load cart items for badge count:', error.message || error);
        setCartCount(0);
        return;
      } finally {
        cartLoadingRef.current = false;
      }
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    setCartCount(count);
  }, []);

  const checkAuthStatus = useCallback(() => {
    const token = getToken();
    const refreshToken = localStorage.getItem('refreshToken');
    // Only clear auth if the access token is expired AND there is no valid refresh token
    if (token && isTokenExpired(token) && (!refreshToken || isTokenExpired(refreshToken))) {
      clearAuth();
    }
    const isAdminUser = localStorage.getItem("isAdmin");
    const authed = isLoggedIn();
    setLoggedIn(authed);
    setIsAdmin(authed && isAdminUser === "true");
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    updateCartCount();
    checkAuthStatus();

    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", updateCartCount);
    window.addEventListener(AUTH_CHANGED_EVENT, updateCartCount);
    window.addEventListener("storage", checkAuthStatus);
    window.addEventListener(AUTH_CHANGED_EVENT, checkAuthStatus);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener(AUTH_CHANGED_EVENT, updateCartCount);
      window.removeEventListener("storage", checkAuthStatus);
      window.removeEventListener(AUTH_CHANGED_EVENT, checkAuthStatus);
    };
  }, [updateCartCount, checkAuthStatus]);

  useEffect(() => {
    const onScroll = () => setColor(window.scrollY >= 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setClicked(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!clicked) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setClicked(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [clicked]);

  const handleClick = () => setClicked((prev) => !prev);

  const handleSignIn = () => {
    if (isLoggedIn()) {
      clearAuth();
      setIsAdmin(false);
      setLoggedIn(false);
      setClicked(false);
      navigate("/");
    } else {
      if (getToken()) clearAuth();
      setClicked(false);
      navigate("/login");
    }
  };

  const closeDrawer = () => setClicked(false);

  const authed = isLoggedIn();

  return (
    <>
      <header
        className={`navbar tn-navbar${color ? " navbar-bg tn-navbar--scrolled" : ""}`}
        role="banner"
      >
        <div className="nav-wrapper tn-navbar__inner">
          <div
            className="logo tn-navbar__brand"
            onClick={() => navigate("/")}
            onKeyDown={(e) => e.key === "Enter" && navigate("/")}
            role="button"
            tabIndex={0}
            aria-label="TechNexus home"
          >
            <h1>
              Tech<strong>Nexus</strong>
            </h1>
          </div>

          <nav className="navigation tn-navbar__nav" aria-label="Primary">
            <ul className="menu tn-navbar__menu">
              {nav_links.map(({ url, title }) => (
                <li key={url}>
                  <NavLink to={url} className={navLinkClass} end={url === "/"}>
                    {title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav-icons tn-navbar__actions">
            <button
              type="button"
              className="tn-navbar__icon-btn search-icon"
              onClick={() => setShowSearch(true)}
              aria-label="Open search"
            >
              <TbSearch aria-hidden />
            </button>

            {loggedIn && (
              <Link
                to="/orders"
                className="tn-navbar__icon-btn tn-navbar__text-link mobile-hide"
                aria-label="View orders"
              >
                <FiPackage aria-hidden />
                <span className="tn-navbar__text-link-label">Orders</span>
              </Link>
            )}

            <button
              type="button"
              className="tn-navbar__icon-btn cart-icon mobile-hide"
              onClick={() => navigate("/cart")}
              aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
            >
              <BsCart aria-hidden />
              {!!cartCount && (
                <span className="cart-num tn-navbar__badge" aria-hidden>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="tn-navbar__icon-btn sign-in-icon mobile-hide"
              onClick={handleSignIn}
              aria-label={authed ? "Log out" : "Sign in"}
            >
              {authed ? (
                <>
                  <FiLogOut aria-hidden />
                  <span className="sign-in-text">Logout</span>
                </>
              ) : (
                <FiUser aria-hidden />
              )}
            </button>

            {isAdmin && authed && (
              <Link to="/dashboard" className="tn-navbar__dashboard mobile-hide">
                Dashboard
              </Link>
            )}

            <button
              type="button"
              className="tn-navbar__icon-btn grid-icon"
              onClick={handleClick}
              aria-label={clicked ? "Close menu" : "Open menu"}
              aria-expanded={clicked}
              aria-controls="tn-mobile-drawer"
            >
              {clicked ? <FaTimes aria-hidden /> : <FiMenu aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`tn-navbar__drawer-root${clicked ? " tn-navbar__drawer-root--open" : ""}`}
        aria-hidden={!clicked}
      >
        <button
          type="button"
          className="tn-navbar__backdrop"
          onClick={closeDrawer}
          aria-label="Close menu"
          tabIndex={clicked ? 0 : -1}
        />
        <aside
          id="tn-mobile-drawer"
          className={`menu tn-navbar__drawer${clicked ? " open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="tn-navbar__drawer-header">
            <span className="tn-navbar__drawer-title">Menu</span>
            <button
              type="button"
              className="tn-navbar__icon-btn"
              onClick={closeDrawer}
              aria-label="Close menu"
            >
              <FaTimes aria-hidden />
            </button>
          </div>

          <ul className="tn-navbar__drawer-list">
            {nav_links.map(({ url, title }) => (
              <li key={`drawer-${url}`}>
                <NavLink
                  to={url}
                  className={navLinkClass}
                  end={url === "/"}
                  onClick={closeDrawer}
                >
                  {title}
                </NavLink>
              </li>
            ))}

            <li className="mobile-show">
              <Link to="/orders" className="menu-links mobile-show" onClick={closeDrawer}>
                Orders
              </Link>
            </li>

            <li
              className="mobile-show tn-navbar__drawer-cart"
              onClick={() => {
                closeDrawer();
                navigate("/cart");
              }}
              onKeyDown={(e) => e.key === "Enter" && navigate("/cart")}
              role="button"
              tabIndex={0}
            >
              <BsCart aria-hidden />
              <span>Cart</span>
              {!!cartCount && <span className="tn-navbar__drawer-badge">{cartCount}</span>}
            </li>

            {isAdmin && authed && (
              <li className="mobile-show">
                <Link
                  to="/dashboard"
                  className="tn-navbar__dashboard tn-navbar__dashboard--drawer"
                  onClick={closeDrawer}
                >
                  Dashboard
                </Link>
              </li>
            )}

            <li className="mobile-show logout-item">
              <button
                type="button"
                className="tn-navbar__drawer-auth"
                onClick={handleSignIn}
              >
                {authed ? (
                  <>
                    <FiLogOut aria-hidden />
                    <span>Logout</span>
                  </>
                ) : (
                  <>
                    <FiUser aria-hidden />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </li>
          </ul>
        </aside>
      </div>

      {showSearch && <Search setShowSearch={setShowSearch} />}
    </>
  );
};

export default Navbar;
