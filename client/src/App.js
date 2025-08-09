import React, {useState}from "react";
import { BrowserRouter as Router, Routes, Route, } from "react-router-dom";
import {ToastContainer,toast}from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import ProductList from "./components/ProductList";
import About from "./components/About";
import Contact from "./components/Contact";
import CartPage from "./components/CartPage";
import CheckoutPage from "./components/CheckoutPage";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import ThankYou from "./pages/ThankYou";
import "./App.css";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Testimonials from "./components/Testimonials";
import AdminDashboard from "./pages/AdminDashboard";



function App() {
  
  const[cartItems,setCartItems]=useState([]);
  
 

  
  /*const handleAddToCart=(product)=>{
    setCartItems((prev)=>[...prev,product]);
  };*/
  const handleAddToCart = (product) => {
  const exists = cartItems.find((item) => item._id === product._id);
  if (exists) {
    setCartItems(cartItems.map((item) =>
      item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  } else {
    setCartItems([...cartItems, { ...product, quantity: 1 }]);
  }
};
const handleRemoveFromCart=(productId)=>{
    const updatedCart=cartItems.filter((item)=>item._id!==productId);
    setCartItems(updatedCart);
  };

const handleUpdateQuantity = (productId, newQuantity) => {
  if(newQuantity<1) return;
    setCartItems(cartItems.map((item)=>
    item._id===productId?{...item,quantity:newQuantity}:item)
    );
};
  return (
    <Router>
      <div className="app-wrapper">
      <ScrollToTop/>
      <Navbar  cartCount={cartItems.length}/>
      <div className="content-wrap">
      <Routes>
        <Route path='/' element={
          <>
          <HeroSection/>
          <div id="product-list">
          <ProductList 
           onAddToCart={handleAddToCart}
           />
           <Testimonials/>
          </div>
          </>
        }/>
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart"element={<CartPage cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} onUpdateQuantity={handleUpdateQuantity}/>}
        />
        <Route path="/checkout" element={<CheckoutPage cartItems={cartItems} setCartItems={setCartItems}/>}/>
        
        <Route path="/thankyou" element={<ThankYou/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/product/:id" element={<ProductDetails onAddToCart={handleAddToCart}/>}/>
        <Route path="/wishlist" element={<Wishlist/>}/>
        <Route path="/admin" element={<AdminDashboard/>}/>
      
      </Routes>
      </div>
      
      <Footer/>
      <ToastContainer/>
      </div>
          </Router>
  );
}export default App;