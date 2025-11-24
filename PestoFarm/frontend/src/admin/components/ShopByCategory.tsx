import React, { useState, useEffect } from 'react';

// Types
interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  sizeOptions: string[];
  description: string;
  category: string;
  status: 'In Stock' | 'Out of Stock';
  sellerId: string;
  sellerName: string;
  addedAt: string;
  updatedAt: string;
}

interface CategoryStats {
  name: string;
  count: number;
  totalValue: number;
  inStock: number;
  outOfStock: number;
}

const ShopByCategory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    calculateCategoryStats();
    filterProducts();
  }, [products, selectedCategory]);

  const loadProducts = () => {
    // Mock data - in real app, this would be API call
    const mockProducts: Product[] = [
      {
        id: 1,
        name: 'Tomato Seeds - Hybrid F1',
        brand: 'Pesto Seeds',
        price: 120,
        originalPrice: 185,
        discount: 35,
        imageUrl: '/images/Tomato Seeds - Hybrid F1.png',
        sizeOptions: ['10g', '25g', '50g'],
        description: 'High-yielding hybrid tomato seeds suitable for all climates.',
        category: 'Vegetable Seeds',
        status: 'In Stock',
        sellerId: 'seller-1',
        sellerName: 'Green Farms Ltd.',
        addedAt: '2025-01-10T10:30:00Z',
        updatedAt: '2025-01-10T10:30:00Z',
      },
      {
        id: 2,
        name: 'Organic Insecticide - Neem Oil',
        brand: 'AgriSafe',
        price: 450,
        originalPrice: 500,
        discount: 10,
        imageUrl: '/images/Insecticides.png',
        sizeOptions: ['100ml', '250ml', '500ml'],
        description: 'Natural neem-based insecticide for pest control.',
        category: 'Insecticides',
        status: 'In Stock',
        sellerId: 'seller-2',
        sellerName: 'Organic Solutions',
        addedAt: '2025-01-08T14:20:00Z',
        updatedAt: '2025-01-08T14:20:00Z',
      },
      {
        id: 3,
        name: 'Marigold Seed Packet',
        brand: 'Flower Power',
        price: 85,
        originalPrice: 100,
        discount: 15,
        imageUrl: '/images/Marigold Seed Packet - Orange Burst.png',
        sizeOptions: ['5g', '10g'],
        description: 'Beautiful orange marigold seeds for garden decoration.',
        category: 'Flower Seeds',
        status: 'Out of Stock',
        sellerId: 'seller-3',
        sellerName: 'Bloom Gardens',
        addedAt: '2025-01-05T09:15:00Z',
        updatedAt: '2025-01-12T16:45:00Z',
      },
      {
        id: 4,
        name: 'Wheat Seeds - High Yield',
        brand: 'AgriGold',
        price: 280,
        originalPrice: 320,
        discount: 12,
        imageUrl: '/images/Wheat Seeds.png',
        sizeOptions: ['1kg', '5kg', '10kg'],
        description: 'Premium quality wheat seeds for maximum yield.',
        category: 'Field Crops',
        status: 'In Stock',
        sellerId: 'seller-4',
        sellerName: 'FarmTech Solutions',
        addedAt: '2025-01-07T11:00:00Z',
        updatedAt: '2025-01-07T11:00:00Z',
      },
      {
        id: 5,
        name: 'NPK Fertilizer 20-20-20',
        brand: 'NutriGrow',
        price: 650,
        originalPrice: 750,
        discount: 13,
        imageUrl: '/images/Fertilizers.png',
        sizeOptions: ['5kg', '10kg', '25kg'],
        description: 'Balanced NPK fertilizer for all crops.',
        category: 'Fertilizers',
        status: 'In Stock',
        sellerId: 'seller-5',
        sellerName: 'NutriCorp',
        addedAt: '2025-01-09T13:30:00Z',
        updatedAt: '2025-01-09T13:30:00Z',
      },
      {
        id: 6,
        name: 'Rose Seeds - Red Beauty',
        brand: 'BloomMaster',
        price: 95,
        originalPrice: 120,
        discount: 21,
        imageUrl: '/images/Rose Seeds.png',
        sizeOptions: ['5g', '10g'],
        description: 'Beautiful red rose seeds for garden landscaping.',
        category: 'Flower Seeds',
        status: 'In Stock',
        sellerId: 'seller-6',
        sellerName: 'Garden Paradise',
        addedAt: '2025-01-11T09:45:00Z',
        updatedAt: '2025-01-11T09:45:00Z',
      },
    ];

    setProducts(mockProducts);
  };

  const calculateCategoryStats = () => {
    const categories = ['Vegetable Seeds', 'Fruit Seeds', 'Flower Seeds', 'Field Crops', 'Insecticides', 'Fungicides', 'Fertilizers', 'Other'];
    const stats: CategoryStats[] = categories.map(categoryName => {
      const categoryProducts = products.filter(p => p.category === categoryName);
      const inStock = categoryProducts.filter(p => p.status === 'In Stock').length;
      const outOfStock = categoryProducts.filter(p => p.status === 'Out of Stock').length;
      const totalValue = categoryProducts.reduce((sum, p) => sum + (p.price * (p.status === 'In Stock' ? 1 : 0)), 0);

      return {
        name: categoryName,
        count: categoryProducts.length,
        totalValue,
        inStock,
        outOfStock,
      };
    }).filter(stat => stat.count > 0); // Only show categories with products

    setCategoryStats(stats);
  };

  const filterProducts = () => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === selectedCategory));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Vegetable Seeds':
        return '🥕';
      case 'Fruit Seeds':
        return '🍎';
      case 'Flower Seeds':
        return '🌸';
      case 'Field Crops':
        return '🌾';
      case 'Insecticides':
        return '🐛';
      case 'Fungicides':
        return '🍄';
      case 'Fertilizers':
        return '🌱';
      default:
        return '📦';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'In Stock'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Shop by Category</h1>
        <p className="text-gray-600">Browse products organized by categories across all sellers</p>
      </div>

      {/* Category Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* All Categories Card */}
        <div
          onClick={() => setSelectedCategory('all')}
          className={`bg-white p-6 rounded-xl shadow-lg cursor-pointer transition duration-150 hover:shadow-xl border-2 ${
            selectedCategory === 'all' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
            <span className="text-sm font-medium text-gray-500">All</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">All Categories</h3>
          <p className="text-3xl font-extrabold text-green-600">{products.length}</p>
          <p className="text-sm text-gray-600">Total Products</p>
        </div>

        {/* Individual Category Cards */}
        {categoryStats.map((stat) => (
          <div
            key={stat.name}
            onClick={() => setSelectedCategory(stat.name)}
            className={`bg-white p-6 rounded-xl shadow-lg cursor-pointer transition duration-150 hover:shadow-xl border-2 ${
              selectedCategory === stat.name ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <span className="text-2xl">{getCategoryIcon(stat.name)}</span>
              </div>
              <span className="text-sm font-medium text-gray-500">{stat.count}</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{stat.name}</h3>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Stock:</span>
                <span className="text-sm font-semibold text-green-600">{stat.inStock}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Out of Stock:</span>
                <span className="text-sm font-semibold text-red-600">{stat.outOfStock}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Total Value:</span>
                <span className="text-sm font-bold text-blue-600">₹{stat.totalValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory} ({filteredProducts.length})
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition duration-150"
            >
              Show All Categories
            </button>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition duration-150">
                <div className="relative mb-4">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://placehold.co/200x200/2a5a2a/ffffff?text=IMG";
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(product.status)}`}>
                      {product.status}
                    </span>
                  </div>
                  {product.discount > 0 && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {product.discount}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-green-600">₹{product.price}</span>
                      {product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Seller: {product.sellerName}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.sizeOptions.slice(0, 3).map((size, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                        {size}
                      </span>
                    ))}
                    {product.sizeOptions.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                        +{product.sizeOptions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
              <span className="text-4xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all'
                ? 'No products have been added to the platform yet.'
                : `No products found in the "${selectedCategory}" category.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopByCategory;
