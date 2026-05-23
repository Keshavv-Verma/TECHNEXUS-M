import React, { useEffect, useContext, useState } from "react";
import Hcategory from "../components/Homecategory/HomeCategory";
import Products from "../components/Products/Products";
import "./home.css";
import { fetchDataFromApi } from "../services/api";
import { Context } from "../context/AppContext";
import Carousel from "../components/Carousel/Carousel";
import LedSection from "../components/LedSection/LedSection";
import AddSection from "../components/AddSection/AddSection";

const Home = () => {
  const { setstate } =
    useContext(Context); /* setstate = {categories: null, products: null} */

  const [products, setProducts] = useState();
  const [categories, setCategories] = useState();

  useEffect(() => {
    getCategories();
    getProducts();
  }, []);

  useEffect(() => {
    setstate({ products, categories });
  }, [products, categories, setstate]);

  const getProducts = () => {
    fetchDataFromApi("/api/products?populate=*").then((res) => {
      setProducts(res);
    });
  };

  const getCategories = () => {
    fetchDataFromApi("/api/categories?populate=*").then((res) => {
      setCategories(res);
    });
  };

  return (
    <div>
      <Carousel />
      <div className="main-content new-container">
        <div className="layout">
          <Hcategory />
          <LedSection />
          <Products headingText="All Products" />
          <AddSection />
        </div>
      </div>
    </div>
  );
};

export default Home;
