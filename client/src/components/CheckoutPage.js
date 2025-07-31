import React, { useState } from 'react';
import './CheckoutPage.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { loadRazorpay } from '../utils/checkoutHndler';

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
  const handlePayment = async () => {
  const amount = total;

  try {
    const res = await fetch('http://localhost:5000/api/orders/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    const orderData = await res.json();

    const options = {
      key: 'rzp_test_soj7DcRXrQxl9G', 
      amount: orderData.amount,
      currency: 'INR',
      name: 'Dreamscape Creation',
      description: 'Art & Craft Order Payment',
      order_id: orderData.id,
      handler: function (response) {
        alert('✅ Payment successful! Payment ID: ' + response.razorpay_payment_id);
        // Optionally redirect or call order save logic here
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: '9999999999', // Optional static or dynamic
      },
      theme: {
        color: '#F37254',
      },
    };

    const razor = new window.Razorpay(options);
    razor.open();
  } catch (err) {
    console.error('Payment failed:', err);
    alert('❌ Payment could not be processed.');
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
        <button type='button' onClick={handlePayment}>Proceed to Payment</button>
      </form>
    </div>
  );
};

export default CheckoutPage;