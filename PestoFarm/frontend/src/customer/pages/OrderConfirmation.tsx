import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../../AuthContext';

const OrderConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { orders, clearOrder } = useOrder();

  const orderId = location.state?.orderId;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      navigate('/my-orders');
      return;
    }

    // Remove auto-redirect for viewing order details
  }, [user, orderId, navigate]);

  const currentOrder = orders.find(order => order.id === orderId);

  const handleViewOrders = () => {
    navigate('/my-orders');
  };

  const handleContinueShopping = () => {
    clearOrder();
    navigate('/');
  };

  if (!user || !currentOrder) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Details</h1>

          {/* Order ID */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="text-lg font-bold text-gray-900">{currentOrder.id}</p>
          </div>

          {/* Order Details */}
          <div className="text-left mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Items</span>
                <span className="font-medium">{currentOrder.totalItem || currentOrder.items.length} item(s)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-bold text-green-600">&#8377;{(currentOrder.totalSellingPrice || currentOrder.total).toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method</span>
                <span className="font-medium">
                  {String(currentOrder.paymentDetails?.method || currentOrder.payment?.method || '').toLowerCase() === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Order Date</span>
                <span className="font-medium">{new Date(currentOrder.orderDate || currentOrder.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="text-left mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Shipping Address</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{(currentOrder.shippingAddress || currentOrder.shipping).name}</p>
              <p className="text-gray-700">{(currentOrder.shippingAddress || currentOrder.shipping).street}</p>
              <p className="text-gray-700">{(currentOrder.shippingAddress || currentOrder.shipping).city}, {(currentOrder.shippingAddress || currentOrder.shipping).state} {(currentOrder.shippingAddress || currentOrder.shipping).zip}</p>
              <p className="text-gray-700">Phone: {(currentOrder.shippingAddress || currentOrder.shipping).phone}</p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-medium">Order Status: {currentOrder.orderStatus || currentOrder.status}</span>
            </div>
          </div>

          {/* Back to Orders message */}
          <p className="text-sm text-gray-600 mb-6">
            View your order details and track your order status.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleViewOrders}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={handleContinueShopping}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
