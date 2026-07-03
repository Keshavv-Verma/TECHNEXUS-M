import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { clearAuth, getToken, isTokenExpired, persistAuth } from "../utils/authUtils";
import { joinApiUrl } from "../services/api";
import { addCartItem } from "../services/cartService";
import { saveCart } from "../utils/cartUtils";

export const Context = createContext();

const AppContext = ({ children }) => {
  const [state, setstate] = useState({ categories: null, products: null });

  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartSubTotal, setCartSubTotal] = useState(0);

  // Axios Interceptors for Silent JWT Token Refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = getToken();
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config || {};
        const hadAuthHeader = Boolean(originalRequest.headers?.Authorization);

        if (
          error.response?.status === 401 &&
          hadAuthHeader &&
          !originalRequest._retry &&
          !originalRequest.url?.includes('/api/login') &&
          !originalRequest.url?.includes('/api/refresh-token')
        ) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post(
                joinApiUrl('/api/refresh-token'),
                { refreshToken }
              );
              if (response.status === 200 || response.status === 201) {
                const { token: newToken, refreshToken: newRefreshToken } = response.data;
                persistAuth({
                  token: newToken,
                  refreshToken: newRefreshToken,
                  isAdmin: localStorage.getItem('isAdmin') === 'true',
                  userId: localStorage.getItem('userId'),
                });
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Proactively refresh access token on startup if it's expired but refresh token is still valid
  useEffect(() => {
    const proactiveRefresh = async () => {
      const token = getToken();
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken || isTokenExpired(refreshToken)) return;  // No valid refresh token, skip
      if (token && !isTokenExpired(token)) return;               // Access token still good, skip

      try {
        const response = await axios.post(
          joinApiUrl('/api/refresh-token'),
          { refreshToken }
        );
        if (response.status === 200 || response.status === 201) {
          const { token: newToken, refreshToken: newRefreshToken } = response.data;
          persistAuth({
            token: newToken,
            refreshToken: newRefreshToken,
            isAdmin: localStorage.getItem('isAdmin') === 'true',
            userId: localStorage.getItem('userId'),
          });
        }
      } catch (err) {
        console.error('Proactive token refresh failed:', err);
        // Only clear auth if the refresh token itself is confirmed invalid
        clearAuth();
      }
    };
    proactiveRefresh();
  }, []);

  //code for saving state to local storage
  // useEffect(() => {
  //   const value = window.localStorage.getItem("my cart");
  //   if (cartItems !== null) setCartItems(JSON.parse(value));
  // }, []);
  // useEffect(() => {
  //   window.localStorage.setItem("my cart", JSON.stringify(cartItems));
  // }, [cartItems]);
  //
  //
  //

  //to come on top of the page
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  //real code*******************************************************************************
  useEffect(() => {
    //cart count no. on icon
    let count = 0;
    cartItems?.map((item) => (count += item.attributes.quantity));
    setCartCount(count);

    //subtotal
    let subTotal = 0;
    cartItems.map(
      (item) => (subTotal += item.attributes.price * item.attributes.quantity)
    );
    setCartSubTotal(subTotal);
  }, [cartItems]);
  //*************************************************************************************************

  const handleAddToCart = async (product, quantity) => {
    let items = [...cartItems];
    let index = items?.findIndex((p) => p.id === product?.id);
    const token = getToken();

    if (token && product?.id) {
      try {
        const persisted = await addCartItem(product.id, quantity);
        const finalQuantity = persisted?.quantity ?? quantity;

        if (index !== -1) {
          items[index].attributes.quantity += finalQuantity;
        } else {
          product.attributes.quantity = finalQuantity;
          items = [...items, product];
        }
        setCartItems(items);
        saveCart(items);
        return;
      } catch (error) {
        console.error('Failed to persist cart item to backend:', error.message || error);
        alert('Unable to add item to cart. Please try again.');
        return;
      }
    }

    if (index !== -1) {
      items[index].attributes.quantity += quantity;
    } else {
      product.attributes.quantity = quantity;
      items = [...items, product];
    }
    setCartItems(items);
    saveCart(items);
  };
  const handleRemoveFromCart = (product) => {
    // Only allow admins to remove items
    const isAdmin = localStorage.getItem('token') && localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      alert('Only admins can remove items from cart');
      return;
    }
    let items = [...cartItems];
    items = items?.filter((p) => p.id !== product?.id);
    setCartItems(items);
    saveCart(items);
  };
  const handleCartProductQuantity = (type, product) => {
    let items = [...cartItems];
    let index = items?.findIndex((p) => p.id === product?.id);
    if (type === "inc") {
      items[index].attributes.quantity += 1;
    } else if (type === "dec") {
      if (items[index].attributes.quantity === 1) return;
      items[index].attributes.quantity -= 1;
    }
    setCartItems(items);
    saveCart(items);
  };

  return (
    <Context.Provider
      value={{
        state,
        setstate,
        cartItems,
        setCartItems,
        cartCount,
        setCartCount,
        cartSubTotal,
        setCartSubTotal,
        handleAddToCart,
        handleRemoveFromCart,
        handleCartProductQuantity,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default AppContext;
