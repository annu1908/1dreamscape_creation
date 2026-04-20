import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import "./App.css";

// Lazy-loaded routes for code splitting
const ProductList = lazy(() => import("./components/ProductList"));
const HeroSection = lazy(() => import("./components/HeroSection"));
const Testimonials = lazy(() => import("./components/Testimonials"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const CartPage = lazy(() => import("./components/CartPage"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const ThankYou = lazy(() => import("./pages/ThankYou"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));

// Loading fallback
const PageLoader = () => (
  <div className="loading-spinner" style={{ minHeight: '60vh' }}>
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="app-wrapper">
          {/* Default SEO meta tags */}
          <Helmet>
            <title>Dreamscape Creations — Handcrafted Art & Gifts</title>
            <meta name="description" content="Discover unique handcrafted resin art, embroidery, crochet, and sketches. Each piece is lovingly made by hand in India. Shop premium handmade gifts at Dreamscape Creations." />
            <meta name="keywords" content="handmade, resin art, embroidery, crochet, sketches, handcrafted gifts, India, artisan" />
            <meta property="og:title" content="Dreamscape Creations — Handcrafted Art & Gifts" />
            <meta property="og:description" content="Unique handcrafted resin art, embroidery, crochet and more. Made with love in India." />
            <meta property="og:type" content="website" />
          </Helmet>

          <ScrollToTop />
          <Navbar />
          <div className="content-wrap">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path='/' element={
                  <>
                    <HeroSection />
                    <div id="product-list">
                      <ProductList />
                      <Testimonials />
                    </div>
                  </>
                } />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                <Route path="/thankyou" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
          <Footer />
          <ToastContainer />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;