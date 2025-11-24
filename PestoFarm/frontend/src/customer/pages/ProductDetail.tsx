import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Truck, Check, Star, UserCircle, Zap } from 'lucide-react';
import { productDetails, ProductDetail as ProductDetailType } from '../data/productData';
import { useAuth } from '../../AuthContext';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useOrder } from '../contexts/OrderContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { reviewService, ReviewEligibility } from '../../services/reviewService';

// Component to display star rating
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-0.5 text-yellow-500">
      {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} size={16} fill="currentColor" />)}
      {hasHalfStar && <Star key="half" size={16} fill="none" className="half-star" />}
      {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} size={16} fill="none" stroke="currentColor" className="text-gray-300" />)}
    </div>
  );
};

// Main Product Detail Component
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, cartItems, removeFromCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [selectedSize, setSelectedSize] = useState<{ label: string; price: number; discount: number } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState<ReviewEligibility | null>(null);

  const product = productDetails.find(p => p.id === parseInt(id || '0'));

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  // Set default selected size if not set
  if (!selectedSize && product.sizes.length > 0) {
    setSelectedSize(product.sizes[0]);
  }

  const price = selectedSize?.price || product.currentPrice;
  const discountAmount = selectedSize?.discount || (product.originalPrice - product.currentPrice);
  const finalPrice = price - discountAmount;
  const discountPercentage = Math.round((discountAmount / price) * 100);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  // Check if product is in cart (considering selected size)
  const isInCart = cartItems.some(item => item.product.id === product.id && item.selectedSize === selectedSize?.label);

  // Handle Add to Cart / Remove from Cart
  const handleCartAction = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isInCart) {
      // Remove from cart (removes all instances of this product, regardless of size)
      removeFromCart(product.id);
    } else {
      addToCart(product, selectedSize?.label || product.sizes[0].label, quantity);
    }
  };

  // Handle Favorite / Unfavorite
  const handleFavoriteAction = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  // Handle Write Review Button
  const handleWriteReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check eligibility
    try {
      const eligibility = await reviewService.checkReviewEligibility(product.id, user.jwt!);
      setReviewEligibility(eligibility);
      if (eligibility.eligible) {
        setShowReviewForm(true);
      }
    } catch (error) {
      setReviewEligibility({ eligible: false, message: 'Unable to check eligibility. Please try again.' });
    }
  };

  // Handle Review Submission
  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setReviewEligibility(null);
    // Refresh reviews if needed
  };

  // Render Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return <p className="text-gray-700 leading-relaxed">{product.description}</p>;
      case 'specifications':
        return (
          <ul className="list-disc list-inside space-y-2">
            {product.specifications.map((spec, index) => (
              <li key={index} className="flex">
                <span className="font-semibold text-gray-700 w-32 md:w-48 flex-shrink-0">{spec.key}:</span>
                <span className="text-gray-600">{spec.value}</span>
              </li>
            ))}
          </ul>
        );
      case 'reviews':
        if (showReviewForm) {
          return (
            <ReviewForm
              productId={product.id}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowReviewForm(false)}
            />
          );
        }

        return (
          <div className="space-y-6">
            {/* Overall Rating Summary */}
            <div className="flex items-baseline space-x-2 pb-4 border-b border-gray-200">
              <span className="text-4xl font-bold text-gray-800">{product.reviews}</span>
              <StarRating rating={product.reviews} />
              <span className="text-lg text-gray-600">({product.reviewCount} Reviews)</span>
            </div>

            {/* Review Eligibility Message */}
            {reviewEligibility && !reviewEligibility.eligible && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">{reviewEligibility.message}</p>
              </div>
            )}

            {/* Real Reviews from API */}
            <ReviewList productId={product.id} />

            {/* Call to action for reviews */}
            <div className="mt-8 text-center">
              <button
                onClick={handleWriteReview}
                className="bg-green-600 text-white py-2 px-5 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Write a Review
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-8">
      {/* Header Mockup */}
      <header className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-green-700">PestoFarm Store</h1>
      </header>

      <main className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT COLUMN: Image Gallery */}
          <div className="flex flex-col">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-lg mb-4 aspect-square">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Thumbnail Selector (Responsive Horizontal Scroll) */}
            <div className="flex overflow-x-auto space-x-3 pb-2">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-150 flex-shrink-0 ${
                    index === currentImageIndex ? 'border-green-600 shadow-md' : 'border-gray-300 hover:border-green-400'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="lg:pl-8">
            {/* Product Header */}
            <p className="text-sm font-semibold text-green-600 mb-1">{product.brand}</p>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h2>

            {/* Ratings */}
            <div className="flex items-center mb-6 space-x-2">
              <StarRating rating={product.reviews} />
              <span className="text-sm font-medium text-gray-600">
                {product.reviews} ({product.reviewCount} Reviews)
              </span>
            </div>

            {/* Price and Discount */}
            <div className="flex items-baseline space-x-3 mb-6 border-b pb-4">
              <span className="text-4xl font-bold text-red-600">
                ₹{finalPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xl line-through text-gray-500">
                ₹{price.toLocaleString('en-IN')}
              </span>
              <span className="text-base font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                {discountPercentage}% OFF
              </span>
            </div>

            {/* Size/Quantity Selector */}
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-800 mb-2">Select Quantity/Size:</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                      selectedSize?.label === size.label
                        ? 'bg-green-600 text-white border-green-700 shadow-md'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {size.label} - ₹{size.price.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Counter & Actions */}
            <div className="flex items-center space-x-6 mb-8">
              <div className="flex items-center border border-gray-300 rounded-lg shadow-sm">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 rounded-l-lg transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center text-lg font-semibold text-gray-800 py-2">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 rounded-r-lg transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                className={`flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-bold text-lg shadow-lg transition-colors ${
                  isInCart
                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-400/50'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-green-400/50'
                }`}
                onClick={handleCartAction}
              >
                <ShoppingCart size={20} />
                <span>{isInCart ? 'Remove from Cart' : 'Add to Cart'}</span>
              </button>

              {/* Favorite Button */}
              <button
                className={`p-3 rounded-lg transition-colors ${
                  isFavorite(product.id)
                    ? 'bg-red-100 text-red-600 border-2 border-red-400 hover:bg-red-50'
                    : 'border-2 border-red-400 text-red-600 hover:bg-red-50'
                }`}
                onClick={handleFavoriteAction}
              >
                <Heart size={24} fill={isFavorite(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Buy Now Button */}
            <div className="mb-8">
              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  const orderItem = {
                    productId: product.id,
                    selectedSize: selectedSize?.label || product.sizes[0].label,
                    quantity,
                    price: finalPrice,
                  };
                  navigate('/direct-checkout', { state: { items: [orderItem], from: 'product', productId: product.id } });
                }}
                className="w-full flex items-center justify-center space-x-2 py-4 px-8 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-xl rounded-lg shadow-lg transition-colors"
              >
                <Zap size={24} />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Delivery/Shipping Info */}
            <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
              {product.shippingInfo.map((item, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                  <item.icon size={18} className="text-green-500 flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Tabs */}
        <div className="mt-12">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 mb-6 flex overflow-x-auto space-x-4">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 text-lg font-semibold capitalize transition-colors duration-200 whitespace-nowrap ${
                  activeTab === tab
                    ? 'text-green-600 border-b-4 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            {renderTabContent()}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
