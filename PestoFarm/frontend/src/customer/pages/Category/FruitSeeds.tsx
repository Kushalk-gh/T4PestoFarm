import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';

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
const fruitProducts: ProductItem[] = [
  { id: 11, name: "Strawberry Sapling - Sweetheart", brand: "Berry Good", price: 350, originalPrice: 480, discount: 27, imageUrl: "/images/Strawberry Sapling - Sweetheart.png", sizeOptions: ["Single Plant", "Pack of 3"] },
  { id: 12, name: "Watermelon Seeds - Sugar Baby", brand: "Field Fresh", price: 220, originalPrice: 300, discount: 27, imageUrl: "/images/Watermelon Seeds - Sugar Baby.png", sizeOptions: ["10 gms", "25 gms"] },
  { id: 13, name: "Pineapple Slips - Gold Medal", brand: "Field Fresh", price: 550, originalPrice: 750, discount: 27, imageUrl: "/images/Pineapple Slips - Gold Medal.png", sizeOptions: ["Small", "Large"] },
  { id: 14, name: "Blueberry Cuttings - Blue Velvet", brand: "Pesto Seeds", price: 175, originalPrice: 250, discount: 30, imageUrl: "/images/Blueberry Cuttings - Blue Velvet.png", sizeOptions: ["10 gms", "20 gms"] },
  { id: 15, name: "Pomegranate Cuttings - Ruby Red Heirloom", brand: "Exotic Fruit Co", price: 300, originalPrice: 400, discount: 25, imageUrl: "/images/Pomegranate Cuttings - Ruby Red Heirloom.png", sizeOptions: ["5 gms", "10 gms"] },
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
    e.stopPropagation();
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
        sizes: product.sizeOptions.map(s => ({ label: s, price: product.price, discount: product.discount })),
        reviews: 4.5,
        reviewCount: 10,
        shippingInfo: [],
        specifications: [],
        customerReviews: []
      });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="w-full max-w-sm p-4 bg-white rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
    >
      {/* Image & Overlay */}
      <div className="relative h-60 flex items-center justify-center p-4">
        {/* Discount Tag */}
        <span className="absolute top-0 left-0 bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-br-lg rounded-tl-xl z-10">
          {product.discount}% OFF
        </span>
        {/* Wishlist Heart */}
        <div className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md z-10" onClick={handleHeartClick}>
          <HeartIcon filled={user ? isFavorite(product.id) : false} className={user && isFavorite(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} />
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
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
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

// Main FruitSeeds Component
const FruitSeeds: React.FC = () => {
  const navigate = useNavigate();

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
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Fruit Seeds</h1>

        {/* Single Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fruitProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FruitSeeds;
