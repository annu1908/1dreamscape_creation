import React, { useState, useEffect } from 'react';
import './CheckoutPage.css';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { useCart } from '../context/CartContext';

// Valid coupon codes
const COUPONS = {
  'DREAM10':    { discount: 10, type: 'percent', label: '10% off' },
  'WELCOME20':  { discount: 20, type: 'percent', label: '20% off for new customers' },
  'ARTLOVER15': { discount: 15, type: 'percent', label: '15% off' },
  'FLAT100':    { discount: 100, type: 'flat',   label: '₹100 flat off' },
};

const CheckoutPage = () => {
  const { cartItems, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', email: '', address: '', phone: '' });
  const [user, setUser] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const navigate = useNavigate();

  const deliveryCharge = 50;
  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedCoupon.discount) / 100);
    } else {
      discountAmount = Math.min(appliedCoupon.discount, subtotal);
    }
  }
  const total = subtotal - discountAmount + deliveryCharge;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        name: parsedUser.name || '',
        email: parsedUser.email || '',
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) { setCouponError('Please enter a coupon code.'); return; }
    const coupon = COUPONS[code];
    if (!coupon) {
      setCouponError('Invalid coupon code. Try DREAM10 or WELCOME20.');
      setAppliedCoupon(null);
    } else {
      setAppliedCoupon({ ...coupon, code });
      setCouponError('');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handlePayment = async () => {
    if (!user) {
      alert('⚠️ Please login to proceed with the order.');
      navigate('/login');
      return;
    }
    if (!formData.address.trim()) {
      alert('⚠️ Please enter your delivery address.');
      return;
    }

    try {
      const { data: orderData } = await API.post('/api/orders/create-order', { amount: total });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Dreamscape Creation',
        description: `Order Payment${appliedCoupon ? ` (${appliedCoupon.code} applied)` : ''}`,
        order_id: orderData.id,
        handler: async function (response) {
          const orderDetails = {
            customerName: formData.name,
            customerEmail: formData.email,
            deliveryAddress: formData.address,
            items: cartItems,
            subtotal,
            deliveryCharge,
            total,
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          try {
            const saveRes = await API.post('/api/orders', orderDetails);
            clearCart();
            navigate('/thankyou', { state: { orderId: saveRes.data.orderId } });
          } catch (err) {
            alert('✅ Payment succeeded, but saving order failed.');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone || '',
        },
        theme: { color: '#d86b94' },
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

      <div className="checkout-layout">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="checkout-item">
              <span>{item.title} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}

          <div className="order-summary-divider"></div>

          <div className="order-summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {/* Coupon Section */}
          <div className="coupon-section">
            {!appliedCoupon ? (
              <>
                <div className="coupon-input-row">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button className="coupon-apply-btn" onClick={handleApplyCoupon}>Apply</button>
                </div>
                {couponError && <p className="coupon-error">{couponError}</p>}
                <p className="coupon-hint">Try: DREAM10, WELCOME20, FLAT100</p>
              </>
            ) : (
              <div className="coupon-applied">
                <span>🎉 <strong>{appliedCoupon.code}</strong> — {appliedCoupon.label}</span>
                <button className="coupon-remove-btn" onClick={handleRemoveCoupon}>Remove</button>
              </div>
            )}
          </div>

          {appliedCoupon && (
            <div className="order-summary-row discount-row">
              <span>Discount ({appliedCoupon.code})</span>
              <span className="discount-value">− ₹{discountAmount}</span>
            </div>
          )}

          <div className="order-summary-row">
            <span>Delivery Charge</span>
            <span>₹{deliveryCharge}</span>
          </div>

          <div className="order-summary-divider"></div>

          <div className="order-summary-row total-row">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="checkout-form-section">
          <h3>Delivery Details</h3>
          <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Your Name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea name="address" placeholder="House no., Street, City, State, PIN" value={formData.address} onChange={handleInputChange} required rows={4}></textarea>
            </div>

            <button type="button" className="pay-btn" onClick={handlePayment}>
              <span>🔒</span> Pay ₹{total} Securely
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;