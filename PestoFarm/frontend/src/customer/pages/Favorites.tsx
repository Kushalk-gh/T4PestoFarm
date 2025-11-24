import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../../AuthContext';
import { ProductDetail } from '../data/productData';

// ===========================
// FAVORITES PAGE COMPONENT
// ===========================

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    favorites,
    removeFromFavorites,
    numberOfFavorites,
    isLoading,
    error,
    refetchFavorites,
  } = useFavorites();
  const { addToCart } = useCart();

  const [removingProductId, setRemovingProductId] = useState<number | null>(null);
  const [addingToCartProductId, setAddingToCartProductId] = useState<number | null>(null);

  // ===========================
  // EVENT HANDLERS
  // ===========================

  const handleBack = () => {
    navigate(-1);
  };

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleRemoveFavorite = async (
    e: React.MouseEvent,
    productId: number
  ) => {
    e.stopPropagation();

    if (!user?.jwt) {
      navigate('/login');
      return;
    }

    try {
      setRemovingProductId(productId);
      await removeFromFavorites(productId);
    } catch (err) {
      console.error('Error removing favorite:', err);
    } finally {
      setRemovingProductId(null);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent, product: ProductDetail) => {
    e.stopPropagation();

    if (!user?.jwt) {
      navigate('/login');
      return;
    }

    try {
      setAddingToCartProductId(product.id);
      const defaultSize =
        product.sizes && product.sizes.length > 0
          ? product.sizes[0].label
          : 'Default';
      addToCart(product, defaultSize, 1);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCartProductId(null);
    }
  };

  const handleRefreshFavorites = async () => {
    try {
      await refetchFavorites();
    } catch (err) {
      console.error('Error refreshing favorites:', err);
    }
  };

  // ===========================
  // RENDER: LOADING STATE
  // ===========================

  if (isLoading && numberOfFavorites === 0 && !error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-3">
            <Loader2 size={32} className="animate-spin text-green-600" />
            <span className="text-xl font-medium text-gray-700">
              Loading your PestoFarm...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER: ERROR STATE
  // ===========================

  if (error && numberOfFavorites === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-red-200">
          <div className="flex items-start space-x-4">
            <AlertTriangle size={28} className="text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-700 mb-2">
                Error Loading Favorites
              </h3>
              <p className="text-gray-700 mb-4">{error}</p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefreshFavorites}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <RefreshCw size={18} />
                  <span>Try Again</span>
                </button>
                {!user?.jwt && (
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    <span>Log In</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER: EMPTY STATE
  // ===========================

  if (numberOfFavorites === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-md border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors font-medium p-2 rounded-lg hover:bg-gray-100"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Back</span>
              </button>
              <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
                <Heart className="text-red-500" size={28} />
                <span>My Favorites</span>
              </h1>
              <div className="w-24"></div>
            </div>
          </div>
        </div>

        {/* Empty Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center bg-white rounded-xl shadow-lg border border-gray-200 py-16">
            <Heart className="mx-auto h-32 w-32 text-gray-300 mb-6" />
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              Your Favorites List is Empty
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Start exploring our products and add your favorites to your wishlist!
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-colors"
            >
              <ShoppingCart size={24} />
              <span>Explore Products</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===========================
  // RENDER: FAVORITES GRID
  // ===========================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors font-medium p-2 rounded-lg hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center space-x-3">
              <Heart className="text-red-500" size={28} />
              <span>My Favorites ({numberOfFavorites})</span>
            </h1>
            <button
              onClick={handleRefreshFavorites}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-green-600"
              title="Refresh favorites"
              aria-label="Refresh favorites"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product: ProductDetail) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer group flex flex-col h-full"
              onClick={() => handleProductClick(product.id)}
            >
              {/* Image Container */}
              <div className="relative h-56 flex items-center justify-center p-4 bg-gray-50 overflow-hidden">
                {/* Remove Button */}
                <button
                  onClick={(e) => handleRemoveFavorite(e, product.id)}
                  disabled={removingProductId === product.id}
                  className="absolute top-3 right-3 p-3 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all border border-gray-200 opacity-90 group-hover:opacity-100 z-10 disabled:opacity-50"
                  aria-label={`Remove ${product.name} from favorites`}
                  title="Remove from favorites"
                >
                  {removingProductId === product.id ? (
                    <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
                  ) : (
                    <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                  )}
                </button>

                {/* Product Image */}
                <img
                  src={
                    product.images?.[0] ||
                    'https://placehold.co/200x200/f0f0f0/999999?text=No+Image'
                  }
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://placehold.co/200x200/f0f0f0/999999?text=No+Image';
                  }}
                />
              </div>

              {/* Product Information */}
              <div className="p-4 flex flex-col flex-grow">
                {/* Product Name */}
                <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-2 flex-grow">
                  {product.name}
                </h3>

                {/* Brand */}
                <p className="text-sm text-gray-500 mb-3 font-medium">
                  {product.brand}
                </p>

                {/* Price Section */}
                <div className="flex items-baseline mb-3">
                  <span className="text-2xl font-extrabold text-green-700">
                    ₹{product.currentPrice?.toFixed(0)}
                  </span>
                  {product.originalPrice > product.currentPrice && (
                    <>
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        ₹{product.originalPrice?.toFixed(0)}
                      </span>
                      <span className="ml-2 text-sm font-bold text-orange-600">
                        {Math.round(
                          ((product.originalPrice - product.currentPrice) /
                            product.originalPrice) *
                            100
                        )}
                        % off
                      </span>
                    </>
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.reviews || 0)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-xs font-semibold text-gray-700">
                    {product.reviews?.toFixed(1)} ({product.reviewCount || 0})
                  </span>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={addingToCartProductId === product.id}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {addingToCartProductId === product.id ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
