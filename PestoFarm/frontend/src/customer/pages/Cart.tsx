import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../../AuthContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalCost,
    discountApplied,
    deliveryCharges,
    numberOfProducts
  } = useCart();

  const handleBack = () => {
    navigate(-1);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handlePlaceOrder = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const orderItems = cartItems.map(item => {
      const sizeOption = item.product.sizes.find(s => s.label === item.selectedSize);
      const price = sizeOption ? sizeOption.price : item.product.currentPrice;
      const discount = sizeOption ? sizeOption.discount : 0;
      const finalPrice = price - discount;
      return {
        productId: item.product.id,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
        price: finalPrice
      };
    });
    navigate('/direct-checkout', { state: { orderItems, from: 'cart' } });
  };

  const finalTotal = totalCost - discountApplied + deliveryCharges;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
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
            <h1 className="text-2xl font-bold text-gray-900">My Cart</h1>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13H5.4m1.6 0h10M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-2 text-gray-500">Add some products to get started!</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const sizeOption = item.product.sizes.find(s => s.label === item.selectedSize);
                const price = sizeOption ? sizeOption.price : item.product.currentPrice;
                const itemTotal = price * item.quantity;

                return (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div
                        className="w-20 h-20 flex-shrink-0 cursor-pointer"
                        onClick={() => handleProductClick(item.product.id)}
                      >
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-lg font-medium text-gray-900 cursor-pointer hover:text-green-600 transition-colors line-clamp-2"
                          onClick={() => handleProductClick(item.product.id)}
                        >
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">{item.product.brand}</p>
                        <p className="text-sm text-gray-600">Size: {item.selectedSize}</p>
                        <p className="text-lg font-bold text-green-600">&#8377;{price}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>

                      {/* Item Total & Remove */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">&#8377;{itemTotal}</p>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 text-sm mt-1 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Calculator */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Cost</span>
                    <span className="font-medium">&#8377;{totalCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount Applied</span>
                    <span className="font-medium text-green-600">-&nbsp;&#8377;{discountApplied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">&#8377;{totalCost - discountApplied}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Products</span>
                    <span className="font-medium">{numberOfProducts}</span>
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

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
