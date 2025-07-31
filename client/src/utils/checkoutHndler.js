import axios from 'axios';

export const loadRazorpay = (amount) => {
  const options = {
    key: 'rzp_test_soj7DcRXrQxl9G', // Replace with your Razorpay Test Key
    amount: amount * 100, // amount in paisa
    currency: 'INR',
    name: 'ShilpSaaz',
    description: 'Order Payment',
    image: '/logo.png',
    handler: function (response) {
      alert('Payment successful!');
      console.log(response);
      // Optionally navigate to Thank You Page
      window.location.href = "/ThankYou";
    },
    prefill: {
      name: 'Annu Sandhu',
      email: 'customer@example.com',
      contact: '9999999999',
    },
    theme: {
      color: '#3399cc',
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};