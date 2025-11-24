import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../../AuthContext';

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolderName: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentMethod: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orderItems, shippingInfo, paymentInfo, setPaymentInfo } = useOrder();
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (orderItems.length === 0 || !shippingInfo) {
      navigate('/shipping-info');
      return;
    }
  }, [user, orderItems.length, shippingInfo, navigate]);

  const handlePaymentMethodChange = (method: 'razorpay' | 'cod') => {
    setPaymentMethod(method);
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  const validateCardNumber = (cardNumber: string) => {
    // Remove spaces and check if it's 13-19 digits
    const cleaned = cardNumber.replace(/\s+/g, '');
    const cardRegex = /^\d{13,19}$/;
    return cardRegex.test(cleaned);
  };

  const validateExpiryDate = (expiry: string) => {
    // MM/YY format
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) return false;

    const [month, year] = expiry.split('/').map(Number);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return false;
    }
    return true;
  };

  const validateCVV = (cvv: string) => {
    // 3 or 4 digits
    const cvvRegex = /^\d{3,4}$/;
    return cvvRegex.test(cvv);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'razorpay') {
      // Validate card details
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardHolderName) {
        alert('Please fill in all card details.');
        return;
      }

      // Card number validation
      if (!validateCardNumber(cardDetails.cardNumber)) {
        alert('Please enter a valid card number (13-19 digits).');
        return;
      }

      // Expiry date validation
      if (!validateExpiryDate(cardDetails.expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY) that is not in the past.');
        return;
      }

      // CVV validation
      if (!validateCVV(cardDetails.cvv)) {
        alert('Please enter a valid CVV (3-4 digits).');
        return;
      }

      // Placeholder for Razorpay integration
      setIsLoading(true);

      // Simulate Razorpay payment process
      // In real implementation, integrate with Razorpay SDK
      try {
        // Placeholder: Load Razorpay script if not loaded
        if (!window.Razorpay) {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          document.body.appendChild(script);
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }

        // Placeholder: Create order on backend
        // const orderResponse = await fetch('/api/create-order', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ amount: calculateTotal(), currency: 'INR' }),
        // });
        // const orderData = await orderResponse.json();

        // Simulate order creation
        const orderData = {
          id: 'order_' + Date.now(),
          amount: calculateTotal() * 100, // Razorpay expects amount in paisa
          currency: 'INR',
        };

        const options = {
          key: 'YOUR_RAZORPAY_KEY_ID', // Replace with actual key
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'PestoFarm',
          description: 'Purchase from PestoFarm',
          order_id: orderData.id,
          handler: function (response: any) {
            // Payment success callback
            console.log('Payment successful:', response);
            setPaymentInfo({
              method: 'razorpay',
              transactionId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
            });
            navigate('/order-review');
          },
          prefill: {
            name: shippingInfo?.name || '',
            email: user?.email || '',
            contact: shippingInfo?.phone || '',
          },
          theme: {
            color: '#22c55e', // Green theme matching site
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (error) {
        console.error('Payment error:', error);
        alert('Payment failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Cash on Delivery
      setPaymentInfo({ method: 'cod' });
      navigate('/order-review');
    }
  };

  const calculateTotal = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = 0; // Placeholder for discount logic
    const deliveryCharges = 50; // Placeholder
    const taxes = subtotal * 0.18; // 18% GST
    return subtotal - discount + deliveryCharges + taxes;
  };

  const handleBack = () => {
    navigate('/shipping-info');
  };

  if (!user || orderItems.length === 0 || !shippingInfo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Payment Method</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

          {/* Order Amount Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-700">Order Amount</span>
              <span className="text-2xl font-bold text-green-600">&#8377;{calculateTotal().toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Payment Method Selection */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <input
                  id="razorpay"
                  name="paymentMethod"
                  type="radio"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => handlePaymentMethodChange('razorpay')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <label htmlFor="razorpay" className="ml-3 block text-sm font-medium text-gray-700">
                  Pay with Razorpay (Credit/Debit Card, UPI, Net Banking)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="cod"
                  name="paymentMethod"
                  type="radio"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => handlePaymentMethodChange('cod')}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                />
                <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                  Cash on Delivery
                </label>
              </div>
            </div>

            {/* Card Details for Razorpay */}
            {paymentMethod === 'razorpay' && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Card Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleCardInputChange}
                      placeholder="MM/YY"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleCardInputChange}
                      placeholder="123"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                      maxLength={4}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Holder Name</label>
                  <input
                    type="text"
                    name="cardHolderName"
                    value={cardDetails.cardHolderName}
                    onChange={handleCardInputChange}
                    placeholder="John Doe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {/* Razorpay Setup Note */}
            {paymentMethod === 'razorpay' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Razorpay Integration Setup</h4>
                <p className="text-sm text-blue-700">
                  To enable Razorpay payments, install the Razorpay SDK and configure your API keys.
                  Replace 'YOUR_RAZORPAY_KEY_ID' with your actual key from the Razorpay dashboard.
                  For backend integration, create an endpoint to generate order IDs.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:bg-gray-400"
              >
                {isLoading ? 'Processing...' : paymentMethod === 'razorpay' ? 'Pay Now' : 'Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
