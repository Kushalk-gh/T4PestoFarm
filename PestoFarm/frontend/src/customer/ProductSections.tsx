import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useFavorites } from './contexts/FavoritesContext';
import { productService } from '../services/productService';
import { ProductDetail } from './data/productData';

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

const groupProductsByCategory = (products: ProductDetail[]): SectionData[] => {
  const categoryMap: { [key: string]: ProductItem[] } = {};

  products.forEach(product => {
    const category = product.specifications.find(spec => spec.key === 'Category')?.value || 'General';
    let sectionTitle = 'General';

    if (category.toLowerCase().includes('flower') || category.toLowerCase().includes('seed')) {
      sectionTitle = 'Flower Seeds';
    } else if (category.toLowerCase().includes('vegetable')) {
      sectionTitle = 'Vegetable Seeds';
    } else if (category.toLowerCase().includes('fruit')) {
      sectionTitle = 'Fruit Seeds';
    }

    if (!categoryMap[sectionTitle]) {
      categoryMap[sectionTitle] = [];
    }

    const productItem: ProductItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.currentPrice,
      originalPrice: product.originalPrice,
      discount: Math.round(((product.originalPrice - product.currentPrice) / product.originalPrice) * 100),
      imageUrl: product.images[0] || '/images/default-product.png',
      sizeOptions: product.sizes.map(size => size.label)
    };

    categoryMap[sectionTitle].push(productItem);
  });

  return Object.keys(categoryMap).map(title => ({
    title,
    products: categoryMap[title]
  }));
};

interface SectionData {
  title: string;
  products: ProductItem[];
}




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

  const handleCardClick = () => navigate(`/product/${product.id}`);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !user.jwt) {
      navigate('/login');
      return;
    }
    // TODO: Implement add to cart functionality
    alert('Add to cart functionality to be implemented');
  };

  const handleHeartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !user.jwt) {
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
      className="flex-shrink-0 w-[calc(100vw/3.2)] lg:w-96 p-4 bg-white rounded-xl shadow-lg border border-gray-100 transform transition-transform duration-300 hover:scale-[1.01] cursor-pointer"
      style={{ minWidth: '320px', maxWidth: '380px' }} // Ensures responsiveness but locks min-width for scrolling
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


// Main Section Component to Handle Horizontal Scrolling
const ProductSection: React.FC<SectionData> = ({ title, products }) => {
  return (
    <section className="mt-12 mb-16 px-4 lg:px-8">
      <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-6 px-2">
        {title}
      </h2>
      
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


// Main App Component
const App = () => {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await productService.getProducts();
        const groupedSections = groupProductsByCategory(products);
        setSections(groupedSections);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans antialiased flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans antialiased flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <main className="container mx-auto py-8">
        {/* Render the product sections */}
        {sections.map((section) => (
          <ProductSection
            key={section.title}
            title={section.title}
            products={section.products}
          />
        ))}
      </main>
    </div>
  );
};

export default App;
