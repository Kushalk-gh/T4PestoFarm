import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductDetail, productDetails } from '../data/productData';
import { useAuth } from '../../AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { productService } from '../../services/productService';
import { Truck, Check } from 'lucide-react';
 
const LocationPage: React.FC = () => {
  const { location } = useParams<{ location: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first with retry logic
        let apiProducts: ProductDetail[] = [];
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            // For now, fetch all products and filter by location logic
            // TODO: Implement location-based coordinates for better filtering
            apiProducts = await productService.getProducts();
            // If API returns empty, fall back to static data
            if (!apiProducts || apiProducts.length === 0) {
              console.warn('API returned no products, falling back to static data');
              apiProducts = productDetails;
            }
            break; // Success, exit retry loop
          } catch (apiError) {
            retryCount++;
            console.warn(`API fetch failed (attempt ${retryCount}/${maxRetries}):`, apiError);
            if (retryCount >= maxRetries) {
              console.warn('Max retries reached, falling back to static data');
              // Fallback to static data if API fails after retries
              apiProducts = productDetails;
            } else {
              // Wait before retrying (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            }
          }
        }

        // Filter products based on location
        let filteredProducts: ProductDetail[] = [];

        if (location) {
          const locationLower = location.toLowerCase();

          switch (locationLower) {
            case 'bengaluru':
              // All existing products
              filteredProducts = apiProducts;
              break;
            case 'hassan':
              // Shows first 8 products
              filteredProducts = apiProducts.slice(0, 8);
              break;
            case 'tumkur':
              // Shows first 5 products
              filteredProducts = apiProducts.slice(0, 5);
              break;
            case 'mysore':
              // Shows first 12 products
              filteredProducts = apiProducts.slice(0, 12);
              break;
            case 'mangalore':
              // Shows first 7 products
              filteredProducts = apiProducts.slice(0, 7);
              break;
            default:
              // Default to all products if location not recognized
              filteredProducts = apiProducts;
              break;
          }
        }

        setProducts(filteredProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError('Failed to load products. Please try again.');
        // Fallback to static data on error
        setProducts(productDetails);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchProducts();
    }
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <img src="/front-page-image.png" alt="PestoFarm Front Page" style={{ width: '100%', height: '1000px' }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Products in {location ? location.charAt(0).toUpperCase() + location.slice(1) : 'Unknown Location'}
          </h1>
          <p className="text-gray-600">
            Discover products available in your selected location
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-gray-500">
              There are no products available in {location} at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline SVG for Heart Icon (Wishlist)
const HeartIcon = ({ filled = false, className = '' }) => (
  <svg
    className={`w-6 h-6 cursor-pointer ${className} transition-colors duration-200`}
    fill={filled ? "red" : "none"}
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

// Product Card Component (matches image_2d6c04.png design)
const ProductCard: React.FC<{ product: ProductDetail }> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const saveAmount = product.originalPrice - product.currentPrice;
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].label);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when heart is clicked
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

  // Placeholder handlers for Buy Now and Add to Cart
  // TODO: Integrate with actual cart context/state and checkout flow
  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Navigate to direct checkout with the product
    const orderItem = {
      productId: product.id,
      selectedSize: selectedSize,
      quantity: 1,
      price: product.currentPrice
    };
    navigate('/direct-checkout', { state: { items: [orderItem] } });
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Add product to cart
    addToCart(product, selectedSize);
  };

  return (
    <div
      className="flex-shrink-0 w-[calc(100vw/3.2)] lg:w-96 p-4 bg-white rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
      style={{ minWidth: '320px', maxWidth: '380px' }} // Ensures responsiveness but locks min-width for scrolling
      onClick={handleCardClick}
    >
      {/* Image & Overlay */}
      <div className="relative h-60 flex items-center justify-center p-4">
        {/* Discount Tag */}
        <span className="absolute top-0 left-0 bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-br-lg rounded-tl-xl z-10">
          {Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100)}% OFF
        </span>
        {/* Wishlist Heart */}
        <div className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10" onClick={handleHeartClick}>
            <HeartIcon filled={user ? isFavorite(product.id) : false} className={user && isFavorite(product.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"} />
        </div>
        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Product Details */}
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-800 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{product.brand}</p>

        {/* Price & Save */}
        <div className="flex items-center mt-3 text-lg font-bold">
          <span className="text-green-600">
            &#8377;{product.currentPrice}
          </span>
          <span className="ml-2 text-base text-gray-400 line-through font-normal">
            &#8377;{product.originalPrice}
          </span>
        </div>
        <p className="text-sm font-medium text-green-700 mt-1">
          Save &#8377;{saveAmount}
        </p>

        {/* Size Selection (Text Field/Dropdown) */}
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <label htmlFor={`size-${product.id}`} className="text-sm text-gray-600 mr-2">
            Size
          </label>
          <select
            id={`size-${product.id}`}
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {product.sizes.map((size) => (
              <option key={size.label} value={size.label}>
                {size.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
            aria-label={`Buy ${product.name} now`}
          >
            Buy Now
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 border border-green-300 font-medium py-2 px-4 rounded-lg shadow-md transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:outline-none"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
