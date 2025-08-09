import React from "react";
import Slider from "react-slick";
import "./Testimonials.css"; // Create this file for custom styles

const testimonials = [
  {
    name: "Neha Sharma",
    review: "The embroidered handkerchief was even more beautiful than I imagined! Packaging was lovely and heartfelt."
  },
  {
    name: "Ritika Mehra",
    review: "The detailing in the resin piece was outstanding. It was packed beautifully and arrived safely. Loved it!"
  },
  {
    name: "Aman Verma",
    review: "Gave it as a gift and the reaction was priceless. Thank you for making something so personal and unique!"
  }
  // Add more reviews here
];

const Testimonials = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div className="testimonial-section">
      <h2>What Our Customers Say</h2>
      <Slider {...settings}>
        {testimonials.map((item, index) => (
          <div key={index} className="testimonial-card">
            <p className="review">“{item.review}”</p>
            <p className="reviewer">— {item.name}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Testimonials;