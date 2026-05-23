import React, { useState } from "react";
import "./Carousel.css";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import image1 from "../../assets/banner4.jpg";
import image2 from "../../assets/banner5.jpg";
import image3 from "../../assets/banner6.jpg";

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [
    {
      url: image1,
      text: "Better Devices for Better Life",
    },
    {
      url: image2,
      text: "Technology for your Convenience",
    },
    {
      url: image3,
      text: "Gadgets at Affordable Prices",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="slider-container">
      <div
        className="slider"
        style={{
          backgroundImage: `url(${images[currentSlide].url})`,
        }}
      >
        <div className="slide-text">{images[currentSlide].text}</div>
      </div>
      <button onClick={prevSlide} className="prev-btn">
        <IoIosArrowBack />
      </button>
      <button onClick={nextSlide} className="next-btn">
        <IoIosArrowForward />
      </button>
    </div>
  );
};

export default Carousel;
