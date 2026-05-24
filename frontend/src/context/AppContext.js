import { createContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { clearAuth } from "../utils/authUtils";
import { joinApiUrl } from "../services/api";

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
        const token = localStorage.getItem("token");
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
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              // Create a raw request to refresh token (avoids infinite loop)
              const response = await axios.post(
                joinApiUrl('/api/refresh-token'),
                { refreshToken }
              );
              if (response.status === 200 || response.status === 201) {
                const { token: newToken, refreshToken: newRefreshToken } = response.data;
                localStorage.setItem("token", newToken);
                if (newRefreshToken) {
                  localStorage.setItem("refreshToken", newRefreshToken);
                }
                // Retry original request with the new access token
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return axios(originalRequest);
              }
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              clearAuth();
              window.location.href = "/login";
            }
          } else {
            clearAuth();
            window.location.href = "/login";
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

  const handleAddToCart = (product, quantity) => {
    let items = [...cartItems];
    let index = items?.findIndex((p) => p.id === product?.id);
    if (index !== -1) {
      items[index].attributes.quantity += quantity;
    } else {
      product.attributes.quantity = quantity;
      items = [...items, product];
    }
    setCartItems(items);
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
