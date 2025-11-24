import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { productService } from '../../../services/productService';
import { ProductDetail } from '../../data/productData';

// --- DATA STRUCTURES ---

interface ProductItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  sizeOptions: string[];
}

// Placeholder Data based on the structure and agricultural theme
const flowerProducts: ProductItem[] = [
  { id: 1, name: "Marigold Seed Packet - Orange Burst", brand: "Pesto Seeds", price: 120, originalPrice: 185, discount: 35, imageUrl: "/images/Marigold Seed Packet - Orange Burst.png", sizeOptions: ["10 gms", "25 gms", "50 gms"] },
  { id: 2, name: "Lotus Seed Mix - Water Monarch", brand: "Bloom Farm", price: 95, originalPrice: 130, discount: 27, imageUrl: "/images/Lotus Seed Mix - Water Monarch.png", sizeOptions: ["10 gms", "20 gms"] },
  { id: 3, name: "Rose Kit - Miniature Sunshine", brand: "Garden Joy", price: 450, originalPrice: 600, discount: 25, imageUrl: "/images/Rose Kit - Miniature Sunshine.png", sizeOptions: ["Small", "Medium", "Large"] },
  { id: 4, name: "Hibiscus moscheutos Seeds - Pink", brand: "Pesto Seeds", price: 140, originalPrice: 200, discount: 30, imageUrl: "/images/Hibiscus moscheutos Seeds - Pink.png", sizeOptions: ["10 gms", "25 gms"] },
  { id: 5, name: "Jasmine Seed Mix - Starlight Perfume", brand: "Sun Growers", price: 180, originalPrice: 250, discount: 28, imageUrl: "/images/Jasmine Seed Mix - Starlight Perfume.png", sizeOptions: ["15 gms", "40 gms"] },
];

// --- REUSABLE COMPONENTS ---

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
const ProductCard: React.FC<{ product: ProductItem }> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const saveAmount = product.originalPrice - product.price;

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when heart is clicked
    if (!user) {
      navigate('/login');
      return;
    }
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites({
        id: product.id,
        name: product.name,
        brand: product.brand,
        currentPrice: product.price,
        originalPrice: product.originalPrice,
        images: [product.imageUrl],
        description: `${product.name} by ${product.brand}`,
        sizes: product.sizeOptions.map(size => ({
          label: size,
          price: product.price,
          discount: product.discount
        })),
        reviews: 4.5,
        reviewCount: 100,
        shippingInfo: [
          { icon: 'Truck', text: 'Free Shipping available on orders above ₹499' },
          { icon: 'Check', text: 'Expected delivery in 4-7 days' }
        ],
        specifications: [
          { key: 'Brand', value: product.brand },
          { key: 'Discount', value: `${product.discount}%` }
        ],
        customerReviews: []
      });
    }
  };

  return (
    <div
      className="w-full max-w-sm p-4 bg-white rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image & Overlay */}
      <div className="relative h-60 flex items-center justify-center p-4">
        {/* Discount Tag */}
        <span className="absolute top-0 left-0 bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-br-lg rounded-tl-xl z-10">
          {product.discount}% OFF
        </span>
        {/* Wishlist Heart */}
        <div className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10" onClick={handleHeartClick}>
            <HeartIcon filled={user ? isFavorite(product.id) : false} className={user && isFavorite(product.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"} />
        </div>
        {/* Product Image */}
        <img
          src={product.imageUrl}
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
            &#8377;{product.price}
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
            className="flex-grow p-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {product.sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

// Main FlowerSeeds Component
const FlowerSeeds: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlowerProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch from API first
        let apiProducts: ProductDetail[] = [];
        try {
          // Fetch products with category filter for flowers
          apiProducts = await productService.getProductsByCategory('Flower Seeds');
        } catch (apiError) {
          console.warn('API fetch failed, falling back to static data:', apiError);
          // Fallback to static data if API fails
          apiProducts = flowerProducts.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            currentPrice: product.price,
            originalPrice: product.originalPrice,
            sizes: product.sizeOptions.map(size => ({
              label: size,
              price: product.price,
              discount: product.discount
            })),
            reviews: 4.5,
            reviewCount: 100,
            images: [product.imageUrl],
            shippingInfo: [
              { icon: 'Truck' as any, text: 'Free Shipping available on orders above ₹499' },
              { icon: 'Check' as any, text: 'Expected delivery in 4-7 days' }
            ],
            description: `${product.name} by ${product.brand}`,
            specifications: [
              { key: 'Brand', value: product.brand },
              { key: 'Discount', value: `${product.discount}%` }
            ],
            customerReviews: []
          }));
        }

        // If API returned no products, fall back to static local data
        if (!apiProducts || apiProducts.length === 0) {
          apiProducts = flowerProducts.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            currentPrice: product.price,
            originalPrice: product.originalPrice,
            sizes: product.sizeOptions.map(size => ({
              label: size,
              price: product.price,
              discount: product.discount
            })),
            reviews: 4.5,
            reviewCount: 100,
            images: [product.imageUrl],
            shippingInfo: [
              { icon: 'Truck' as any, text: 'Free Shipping available on orders above ₹499' },
              { icon: 'Check' as any, text: 'Expected delivery in 4-7 days' }
            ],
            description: `${product.name} by ${product.brand}`,
            specifications: [
              { key: 'Brand', value: product.brand },
              { key: 'Discount', value: `${product.discount}%` }
            ],
            customerReviews: []
          }));
        }

        setProducts(apiProducts);
      } catch (err) {
        console.error('Failed to load flower products:', err);
        setError('Failed to load products. Please try again.');
        // Fallback to static data on error
        setProducts(flowerProducts.map(product => ({
          id: product.id,
          name: product.name,
          brand: product.brand,
          currentPrice: product.price,
          originalPrice: product.originalPrice,
          sizes: product.sizeOptions.map(size => ({
            label: size,
            price: product.price,
            discount: product.discount
          })),
          reviews: 4.5,
          reviewCount: 100,
          images: [product.imageUrl],
          shippingInfo: [
            { icon: 'Truck' as any, text: 'Free Shipping available on orders above ₹499' },
            { icon: 'Check' as any, text: 'Expected delivery in 4-7 days' }
          ],
          description: `${product.name} by ${product.brand}`,
          specifications: [
            { key: 'Brand', value: product.brand },
            { key: 'Discount', value: `${product.discount}%` }
          ],
          customerReviews: []
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchFlowerProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          ← Back
        </button>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Flower Seeds</h1>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={{
                id: product.id,
                name: product.name,
                brand: product.brand,
                price: product.currentPrice,
                originalPrice: product.originalPrice,
                discount: Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100),
                imageUrl: product.images[0] || '/images/default-product.png',
                sizeOptions: product.sizes.map(size => size.label)
              }} />
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
              There are no flower seed products available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowerSeeds;
