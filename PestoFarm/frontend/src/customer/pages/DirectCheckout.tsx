import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../../AuthContext';
import { productDetails } from '../data/productData';

const DirectCheckout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { orderItems, setOrderItems, clearOrder } = useOrder();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get items from location state or use existing orderItems
    const stateItems = location.state?.items || location.state?.orderItems;
    if (stateItems) {
      setOrderItems(stateItems);
    } else if (orderItems.length === 0) {
      navigate('/cart');
    }
  }, [user, location.state, orderItems.length, navigate, setOrderItems]);

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountApplied = orderItems.reduce((sum, item) => {
    // Assuming discount is part of the item or calculate based on product data
    // For now, using 0 as discount since it's not passed in orderItems
    return sum;
  }, 0);
  const deliveryCharges = totalAmount > 499 ? 0 : 50; // Free delivery above ₹499
  const finalTotal = totalAmount - discountApplied + deliveryCharges;

  const handleProceedToShipping = () => {
    navigate('/shipping-info');
  };

  const handleBack = () => {
    if (location.state?.from === 'product') {
      navigate(`/product/${location.state.productId}`);
    } else {
      navigate('/cart');
    }
  };

  if (!user || orderItems.length === 0) {
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
            <h1 className="text-2xl font-bold text-gray-900">Direct Checkout</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Product Summary</h2>
            <div className="space-y-4">
{orderItems.map((item) => {
                const product = productDetails.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium text-green-600">&#8377;{item.price * item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">&#8377;{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-medium">&#8377;{deliveryCharges}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>&#8377;{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={handleProceedToShipping}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              Proceed to Shipping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectCheckout;
