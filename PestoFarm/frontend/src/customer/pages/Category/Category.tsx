import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productDetails, ProductDetail } from '../../data/productData';
import { useAuth } from '../../../AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';

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

// Product Card Component
const ProductCard: React.FC<{ product: ProductDetail }> = ({ product }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const saveAmount = product.originalPrice - product.currentPrice;

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
      await addToFavorites(product);
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

        {/* Size Selection */}
        <div className="flex items-center mt-4 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
          <label htmlFor={`size-${product.id}`} className="text-sm text-gray-600 mr-2">
            Size
          </label>
          <select
            id={`size-${product.id}`}
            className="flex-grow p-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {product.sizes.map((size) => (
              <option key={size.label} value={size.label}>
                {size.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const Category: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  // State for pagination - reset to first page when category changes
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // Adjust as needed

  // Reset pagination when category changes (ensures "View All" starts from first item)
  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  // Map URL params to category names
  const categoryMap: { [key: string]: string } = {
    'insecticides': 'Insecticides',
    'nutrients': 'Nutrients',
    'fungicides': 'Fungicides',
    'herbicides': 'Herbicides',
    'growth-promoters': 'Growth Promoters',
    'organic-farming': 'Organic Farming',
    'new-arrivals': 'New Arrivals',
    'fertilizers': 'Fertilizers',
    'micronutrients': 'Micronutrients',
    'bio-stimulants': 'Bio-stimulants',
    'bio-insecticides': 'BIO INSECTICIDES',
    'bio-fungicides': 'BIO FUNGICIDES',
    'bio-organic-fertilizers': 'BIO/ORGANIC FERTILIZERS',
    'plant-growth-regulators': 'Plant Growth Regulators',
    'field-crops': 'Field Crops',
    'crop-protection': 'Crop Protection',
    'crop-nutrition': 'Crop Nutrition',
    'organic': 'Organic',
    'best-seller': 'Best Seller',
    'best-sellers': 'Best Sellers'
  };

  const displayCategory = category ? categoryMap[category] || category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Category';

  // Map categories to product keywords for filtering
  const categoryKeywords: { [key: string]: string[] } = {
    'Vegetable Seeds': ['Tomato', 'Drumstick', 'Carrot', 'Capsicum', 'Mushroom Spawn'],
    'Fruit Seeds': ['Strawberry', 'Watermelon', 'Pineapple', 'Blueberry', 'Pomegranate'],
    'Flower Seeds': ['Marigold', 'Lotus', 'Rose Kit', 'Hibiscus', 'Jasmine'],
    'Insecticides': ['Insecticides'],
    'Fungicides': ['Fungicides'],
    'Herbicides': ['Herbicides'],
    'Fertilizers': ['Fertilizers'],
    'Micronutrients': ['Micronutrients'],
    'Bio-stimulants': ['Bio-stimulants'],
    'Plant Growth Regulators': ['Plant Growth Regulators'],
    'BIO INSECTICIDES': ['BIO INSECTICIDES'],
    'BIO FUNGICIDES': ['BIO FUNGICIDES'],
    'BIO/ORGANIC FERTILIZERS': ['BIO/ORGANIC FERTILIZERS'],
    'WHEAT': ['WHEAT'],
    'RICE': ['RICE'],
    'MAIZE': ['MAIZE'],
    'COTTON': ['COTTON'],
    'Field Crops': ['WHEAT', 'RICE', 'MAIZE', 'COTTON'],
    'Crop Protection': ['Insecticides', 'Fungicides', 'Herbicides', 'Plant Growth Regulators'],
    'Crop Nutrition': ['Fertilizers', 'Micronutrients', 'Bio-stimulants'],
    'Organic': ['BIO INSECTICIDES', 'BIO FUNGICIDES', 'BIO/ORGANIC FERTILIZERS'],
    'Best Seller': [], // Best Seller products filtered by ID
    'Best Sellers': [], // Add logic if needed
    'New Arrivals': [], // Add logic if needed
    'Discounted': [], // Add logic if needed
    'Top Rated': [] // Add logic if needed
  };

  // Filter products based on category
  let filteredProducts: ProductDetail[] = [];
  if (displayCategory === 'Best Seller' || displayCategory === 'Best Sellers') {
    filteredProducts = productDetails.filter(p => p.id % 2 === 0);
  } else {
    const keywords = categoryKeywords[displayCategory] || [];
    filteredProducts = keywords.length > 0
      ? productDetails.filter(product =>
          keywords.some(keyword => product.name.toUpperCase().includes(keyword.toUpperCase()))
        )
      : productDetails.filter(product =>
          product.name.toLowerCase().includes(displayCategory.toLowerCase()) ||
          product.description.toLowerCase().includes(displayCategory.toLowerCase())
        );
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <div className="container mx-auto py-8 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          ← Back to Home
        </button>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">{displayCategory}</h1>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
