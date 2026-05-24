import React from "react";
import "./home.css";
import Carousel from "../components/Carousel/Carousel";
import LedSection from "../components/LedSection/LedSection";
import AddSection from "../components/AddSection/AddSection";

const Home = () => {
  return (
    <div>
      <Carousel />
      <div className="main-content new-container">
        <div className="layout">
          <LedSection />
          <AddSection />
        </div>
      </div>
    </div>
  );
};

export default Home;
