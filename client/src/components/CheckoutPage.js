import React, { useState } from 'react';
import './CheckoutPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = ({ cartItems, setCartItems }) => {
  const [showMessage,setShowMessage]=useState(false);
const navigate=useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: ''
  });

  const deliveryCharge = 50;
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = subtotal + deliveryCharge;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      customerName: e.target[0].value,
      customerEmail: e.target[1].value,
      deliveryAddress: e.target[2].value,
      items: cartItems,
      subtotal,
      deliveryCharge,
      total
    };

    try {
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      console.log("Response from server",response);
      if(response.data && response.data.message){
        setCartItems([]);
        localStorage.removeItem('cartItems');
        setShowMessage(true);
         setTimeout(()=>{
          setShowMessage(false);
          navigate("/thankyou");
        },2000);
      }else{
        alert("order placed, but no message returned");
      }
    } catch (err) {
      console.error('order failed',err);
      if(err.response && err.response.data && err.response.data.message){
        alert(err.response.data.message);
      }else{
      alert('Something went wrong. Please try again.');
    }
  }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      <div className="order-summary">
        <h3>Order Summary</h3>
        {cartItems.map((item) => (
          <div key={item._id} className="checkout-item">
            <p>{item.title} x {item.quantity}</p>
            <p>₹{item.price * item.quantity}</p>
          </div>
        ))}
        <p>Subtotal: ₹{subtotal}</p>
        <p>Delivery Charge: ₹{deliveryCharge}</p>
        <h4>Total: ₹{total}</h4>
      </div>
      {showMessage && (
        <div className='sucess-message'>
          <p>Order Placed Suceesfully!</p></div>
      )}

      <form className="checkout-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <textarea
          name="address"
          placeholder="Delivery Address"
          value={formData.address}
          onChange={handleInputChange}
          required
        ></textarea>
        <button type="submit">Place Order</button>
      </form>
    </div>
  );
};

export default CheckoutPage;