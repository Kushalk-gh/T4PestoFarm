import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../../AuthContext';
import { Truck, Check } from 'lucide-react';
import { productService, BackendProduct } from '../../services/productService';
import { productDetails, ProductDetail } from '../../data/productData';

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
  bestSeller?: boolean;
}

interface SectionData {
  title: string;
  products: ProductItem[];
}

// Map BackendProduct to ProductItem format
const mapToProductItem = (product: BackendProduct): ProductItem => ({
  id: product.id,
  name: product.title,
  brand: product.seller?.fullName || 'Pesto Seeds',
  price: product.sellingPrice,
  originalPrice: product.mrpPrice,
  discount: product.discountPercent,
  imageUrl: product.images[0] || '/placeholder-image.png',
  sizeOptions: product.sizes ? product.sizes.split(',').map(s => s.trim()) : [],
  bestSeller: product.id % 2 === 0, // Example marking for Best Sellers
});

// Convert ProductDetail to BackendProduct for static data
const convertToBackendProduct = (product: any): BackendProduct => ({
  id: product.id,
  title: product.name,
  description: product.description,
  mrpPrice: product.originalPrice,
  sellingPrice: product.currentPrice,
  discountPercent: product.sizes[0]?.discount || 0,
  quantity: 1,
  images: product.images,
  numRatings: product.reviewCount,
  sizes: product.sizes.map((s: any) => s.label).join(','),
  category: product.specifications.find((s: any) => s.key === 'Category') ? {
    id: 1,
    name: product.specifications.find((s: any) => s.key === 'Category')!.value
  } : undefined,
  seller: {
    id: 1,
    fullName: product.brand
  },
  createdAt: new Date().toISOString(),
  reviews: []
});

// Group products by category dynamically
const bestSellerProducts: ProductItem[] = productDetails.filter((p: any) => p.id % 2 === 0).map(convertToBackendProduct).map(mapToProductItem);
const fieldCropProducts: ProductItem[] = productDetails.filter((p: any) => p.id >= 16 && p.id <= 19).map(convertToBackendProduct).map(mapToProductItem);
const cropProtectionProducts: ProductItem[] = productDetails.filter((p: any) => p.id >= 20 && p.id <= 23).map(convertToBackendProduct).map(mapToProductItem);
const cropNutritionProducts: ProductItem[] = productDetails.filter((p: any) => p.id >= 24 && p.id <= 26).map(convertToBackendProduct).map(mapToProductItem);
const organicProducts: ProductItem[] = productDetails.filter((p: any) => p.id >= 27 && p.id <= 29).map(convertToBackendProduct).map(mapToProductItem);
const flowerProducts: ProductItem[] = productDetails.filter((p: any) => p.id >= 1 && p.id <= 5).map(convertToBackendProduct).map(mapToProductItem);
const vegetableProducts: ProductItem[] = productDetails.filter((p: any) => p.id >= 6 && p.id <= 10).map(convertToBackendProduct).map(mapToProductItem);
const fruitProducts: ProductItem[] = productDetails.filter((p: any) => p.id >= 11 && p.id <= 15).map(convertToBackendProduct).map(mapToProductItem);
const groupProductsByCategory = (products: BackendProduct[]): SectionData[] => {
  const categoryMap: { [key: string]: ProductItem[] } = {};

  products.forEach(product => {
    const categoryName = product.category?.name || 'Uncategorized';
    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = [];
    }
    categoryMap[categoryName].push(mapToProductItem(product));
  });

  return Object.entries(categoryMap).map(([title, products]) => ({
    title,
    products,
  }));
};

const sections: SectionData[] = [
  { title: "Best Sellers", products: bestSellerProducts },
  { title: "Field Crops", products: fieldCropProducts },
  { title: "Crop Protection", products: cropProtectionProducts },
  { title: "Crop Nutrition", products: cropNutritionProducts },
  { title: "Organic", products: organicProducts },
  { title: "Flower Seeds", products: flowerProducts },
  { title: "Vegetable Seeds", products: vegetableProducts },
  { title: "Fruit Seeds", products: fruitProducts },
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
  const { addToCart } = useCart();
  const saveAmount = product.originalPrice - product.price;
  const [selectedSize, setSelectedSize] = useState(product.sizeOptions[0]);

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
      // Convert ProductItem to ProductDetail for FavoritesContext
      const productDetail = {
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
          { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
          { icon: Check, text: 'Expected delivery in 4-7 days' }
        ],
        specifications: [
          { key: 'Brand', value: product.brand },
          { key: 'Discount', value: `${product.discount}%` }
        ],
        customerReviews: []
      };
      addToFavorites(productDetail);
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
      price: product.price
    };
    navigate('/direct-checkout', { state: { items: [orderItem] } });
  };

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Add product to cart
    // Convert ProductItem to ProductDetail for CartContext
    const productDetail = {
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
        { icon: Truck, text: 'Free Shipping available on orders above ₹499' },
        { icon: Check, text: 'Expected delivery in 4-7 days' }
      ],
      specifications: [
        { key: 'Brand', value: product.brand },
        { key: 'Discount', value: `${product.discount}%` }
      ],
      customerReviews: []
    };
    addToCart(productDetail, selectedSize);
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
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            className="flex-grow p-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer appearance-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {product.sizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
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


// Main Section Component to Handle Horizontal Scrolling
const ProductSection: React.FC<SectionData> = ({ title, products }) => {
  const navigate = useNavigate();

  const getRoute = (title: string) => {
    switch (title) {
      case 'Best Sellers':
        return '/category/best-sellers';
      case 'Flower Seeds':
        return '/category/flower-seeds';
      case 'Vegetable Seeds':
        return '/category/vegetable-seeds';
      case 'Fruit Seeds':
        return '/category/fruit-seeds';
      case 'Field Crops':
        return '/category/field-crops';
      case 'Crop Protection':
        return '/category/crop-protection';
      case 'Crop Nutrition':
        return '/category/crop-nutrition';
      case 'Organic':
        return '/category/organic';
      default:
        return '/';
    }
  };

  return (
    <section className="mt-12 mb-16 px-4 lg:px-8">
      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800">
          {title}
        </h2>
        <button
          onClick={() => navigate(getRoute(title))}
          className="text-lg font-semibold text-green-600 hover:text-green-800 underline"
        >
          View All
        </button>
      </div>

      {/* Horizontal Scroll Container */}
      {/* Tailwind Classes for 3-Item View and Scrolling:
        - overflow-x-scroll: Enables horizontal scrolling.
        - flex: Allows items to line up horizontally.
        - space-x-6: Creates the required gap between the cards.
        - snap-x snap-mandatory: Optional but highly recommended for smooth, card-by-card scrolling.
      */}
      <div className="flex overflow-x-scroll pb-4 space-x-6 lg:space-x-8 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Custom Scrollbar Styling (Not fully possible in vanilla Tailwind, but use a helper class for basic aesthetics) */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </section>
  );
};

// Component to render all product sections
const ProductSections: React.FC = () => {
  return (
    <div>
      {sections.map((section) => (
        <ProductSection
          key={section.title}
          title={section.title}
          products={section.products}
        />
      ))}
    </div>
  );
};

// Export the component that renders all sections
export default ProductSections;
