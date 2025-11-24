import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../../AuthContext';
import { productDetails } from '../data/productData';

const OrderReview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orderItems, shippingInfo, paymentInfo, placeOrder } = useOrder();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (orderItems.length === 0 || !shippingInfo || !paymentInfo) {
      navigate('/payment-method');
      return;
    }
  }, [user, orderItems.length, shippingInfo, paymentInfo, navigate]);

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTaxes = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateDeliveryCharges = () => {
    return 50; // Fixed delivery charge
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxes() + calculateDeliveryCharges();
  };

  const handlePlaceOrder = async () => {
    // Place the order
    try {
      const order = await placeOrder();
      // Add the new order to the orders list immediately for OrderConfirmation to find it
      // This is a temporary solution until backend integration is complete
      navigate('/order-confirmation', { state: { orderId: order.id } });
    } catch (error) {
      console.error('Error placing order:', error);
      // Handle error (e.g., show toast or alert)
      alert('Failed to place order. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/payment-method');
  };

  if (!user || orderItems.length === 0 || !shippingInfo || !paymentInfo) {
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
            <h1 className="text-2xl font-bold text-gray-900">Order Review</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Products */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {orderItems.map((item) => {
                  const product = productDetails.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{product.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">&#8377;{item.price * item.quantity}</p>
                        <p className="text-sm text-gray-600">&#8377;{item.price} each</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>
              <div className="text-gray-700">
                <p className="font-medium">{shippingInfo.name}</p>
                <p>{shippingInfo.street}</p>
                <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
                <p>Phone: {shippingInfo.phone}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h2>
              <div className="text-gray-700">
                <p className="font-medium">
                  {paymentInfo.method === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                </p>
                {paymentInfo.method === 'razorpay' && paymentInfo.transactionId && (
                  <p className="text-sm text-gray-600">Transaction ID: {paymentInfo.transactionId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">&#8377;{calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes (18% GST)</span>
                  <span className="font-medium">&#8377;{calculateTaxes().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-medium">&#8377;{calculateDeliveryCharges().toFixed(2)}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>&#8377;{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;
