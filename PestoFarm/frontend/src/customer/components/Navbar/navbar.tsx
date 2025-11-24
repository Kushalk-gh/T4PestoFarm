import React, { useState, useRef, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { productDetails, ProductDetail } from '../../data/productData';

interface CategoryItem {
  name: string;
  imageUrl: string;
}

const categoriesData: CategoryItem[] = [
  { name: 'Insecticides', imageUrl: '/images/Insecticides.png' },
  { name: 'Nutrients', imageUrl: '/images/Nutrients.png' },
  { name: 'Fungicides', imageUrl: '/images/Fungicides.png' },
  { name: 'Vegetable Seeds', imageUrl: '/images/Vegetable Seeds.png' },
  { name: 'Fruit Seeds', imageUrl: '/images/Fruit Seeds.png' },
  { name: 'Flower Seeds', imageUrl: '/images/Flower Seeds.png' },
  { name: 'Herbicides', imageUrl: '/images/Herbicides.png' },
  { name: 'Growth Promoters', imageUrl: '/images/Growth Promoters.png' },
  { name: 'Organic Farming', imageUrl: '/images/Organic Farming.png' },
  { name: 'New Arrivals', imageUrl: '/images/New Arrivals.png' },
];

// Ensure the structure handles both simple string arrays (for non-Seed items)
// and structured objects (for Seed items).
interface NavItem {
  label: string;
  dropdown?: string[] | { title: string; items: string[] }[];
  href?: string;
}

const navItems: NavItem[] = [
  {
    label: 'Seed',
    dropdown: [
      {
        title: 'HORTICULTURE CROPS',
        items: ['VEGETABLE SEEDS',
          'FRUIT SEEDS',
          'FLOWER SEEDS']
      },
      {
        title: 'FIELD CROPS',
        items: ['WHEAT', 'RICE', 'MAIZE', 'COTTON']
      },
      {
        title: 'POPULAR PRODUCTS',
        items: ['BEST SELLERS', 'NEW ARRIVALS', 'DISCOUNTED', 'TOP RATED']
      }
    ]
  },
  {
    label: 'Crop Protection',
    dropdown: ['Insecticides', 'Fungicides', 'Herbicides', 'Plant Growth Regulators']
  },
  {
    label: 'Crop Nutrition',
    dropdown: ['Fertilizers', 'Micronutrients', 'Bio-stimulants']
  },
  {
    label: 'Organic',
    dropdown: [
      'BIO INSECTICIDES', 'BIO FUNGICIDES','BIO/ORGANIC FERTILIZERS'
    ]
  },
  { label: 'About', href: '/#footer' }
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<ProductDetail[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryItem[]>([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'seller' | 'scientist' | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('Bengaluru');

  const { user, logout } = useAuth();
  const { numberOfProducts } = useCart();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts([]);
      setFilteredCategories([]);
      setIsSearchDropdownOpen(false);
    } else {
      const query = searchQuery.toLowerCase();
      const products = productDetails.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      ).slice(0, 5); // Limit to 5 results
      const categories = categoriesData.filter(category =>
        category.name.toLowerCase().includes(query)
      ).slice(0, 3); // Limit to 3 results
      setFilteredProducts(products);
      setFilteredCategories(categories);
      setIsSearchDropdownOpen(products.length > 0 || categories.length > 0);
    }
  }, [searchQuery]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setIsSearchDropdownOpen(false);
  };

  const handleCategoryClick = (categoryName: string) => {
    const routeMap: { [key: string]: string } = {
      'Vegetable Seeds': '/vegetable-seeds',
      'Fruit Seeds': '/fruit-seeds',
      'Flower Seeds': '/flower-seeds',
    };
    const route = routeMap[categoryName] || '/';
    navigate(route);
    setSearchQuery('');
    setIsSearchDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen || isRoleDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen, isRoleDropdownOpen]);

  return (
    <nav className="bg-white shadow-md font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Hamburger */}
          <div className="flex items-center">
            {/* Mobile Hamburger Icon (visible on small screens) */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Always visible Menu Icon (to toggle the dropdown on click) and Logo */}
            <div className="ml-2 md:ml-0 flex items-center">
              
              <Link to="/">
                <div className="flex items-center ml-2">
                  <img src="/PestoFarm-logo.png" alt="PestoFarm Logo" className="w-10 h-10 rounded-full border-2 border-green-600 mr-2" />
                  <h1 className="text-3xl font-bold text-green-600 cursor-pointer">PestoFarm</h1>
                </div>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation Links and Search Bar */}
          {!isLoginPage && (
            <div className="hidden md:flex items-center flex-1 justify-center space-x-4">
              {navItems.map((item) => (
                <div key={item.label} className="relative group">
                  {item.href ? (
                    <a href={item.href} className="text-gray-700 hover:text-green-600 hover:underline px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out">
                      {item.label}
                    </a>
                  ) : (
                    <button className="text-gray-700 hover:text-green-600 hover:underline px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out">
                      {item.label}
                    </button>
                  )}
                  {item.dropdown && (
                    <div className={
                        // Dynamically set width: w-[800px] for 'Seed' Mega Menu, w-56 for simpler lists
                        `absolute top-full left-0 mt-2
                        ${item.label === 'Seed' ? 'w-[800px]' : 'w-56'}
                        bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden border border-gray-100`
                    }>

                      {/* Mega Menu Content (Structured Dropdown) */}
                      {/* Check if it's a grouped dropdown (like 'Seed') */}
                      {item.label === 'Seed' && Array.isArray(item.dropdown) && typeof item.dropdown[0] !== 'string' ? (
                        <div className="py-4 px-2 flex flex-row space-x-6">
                            {/* This flex-row makes HORTICULTURE CROPS, FIELD CROPS, POPULAR PRODUCTS side-by-side */}
                            {item.dropdown.map((group) => {
                                // Group must be structured (title and items)
                                if (typeof group !== 'string') {
                                    return (
                                        <div key={group.title} className="px-4 py-2 flex-1 min-w-[180px]">
                                            {/* Group Title */}
                                            <div className="text-lg font-bold text-green-700 uppercase mb-3 border-b pb-1 border-green-100">
                                                {group.title}
                                            </div>
                                            {/* Sub-items: This flex-col makes the seed names stack vertically */}
                                            <div className="flex flex-col space-y-1">
                                                {group.items.map((subItem) => {
                                                    const href = subItem === 'VEGETABLE SEEDS' ? '/vegetable-seeds' :
                                                                 subItem === 'FRUIT SEEDS' ? '/fruit-seeds' :
                                                                 subItem === 'FLOWER SEEDS' ? '/flower-seeds' : `/category/${subItem.toLowerCase().replace(/ /g, '-')}`;
                                                    return (
                                                        <Link
                                                            key={subItem}
                                                            to={href}
                                                            className="flex py-1 px-2 text-sm text-gray-700 rounded-md hover:bg-green-50 hover:text-green-600 transition duration-100 items-center"
                                                        >
                                                            {['VEGETABLE SEEDS', 'FRUIT SEEDS', 'FLOWER SEEDS'].includes(subItem) && (
                                                                <img
                                                                    src={`/images/${subItem.split(' ')[0]} Seeds.png`}
                                                                    alt={subItem}
                                                                    className="w-6 h-6 mr-2"
                                                                />
                                                            )}
                                                            {subItem}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                      ) : (
                        /* Simple Dropdown (Like 'Crop Protection') */
                        <div className="py-2">
                          {item.dropdown.map((subItem) => (
                            <button
                                key={String(subItem)}
                                onClick={() => navigate(`/category/${String(subItem).toLowerCase().replace(/ /g, '-').replace(/\//g, '-')}`)}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600 transition duration-100"
                            >
                                {String(subItem)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {/* Search Bar */}
              <div className="max-w-sm w-full ml-4">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-inner"
                    placeholder="Search..."
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {/* Search Dropdown */}
                  {isSearchDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {/* Products Section */}
                      {filteredProducts.length > 0 && (
                        <div className="p-2">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Products</h4>
                          {filteredProducts.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product.id)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition duration-150 flex items-center space-x-3"
                            >
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.description.slice(0, 50)}...</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {/* Categories Section */}
                      {filteredCategories.length > 0 && (
                        <div className="p-2 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Categories</h4>
                          {filteredCategories.map((category) => (
                            <button
                              key={category.name}
                              onClick={() => handleCategoryClick(category.name)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md transition duration-150 flex items-center space-x-3"
                            >
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{category.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location Dropdown */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">{selectedLocation}</span>
                <KeyboardArrowDownIcon className="w-4 h-4" />
              </button>
              {activeDropdown === 'location' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    {['Bengaluru', 'Mysore', 'Mangalore', 'Hassan', 'Tumkur'].map((location) => (
                      <button
                        key={location}
                        onClick={() => {
                          setSelectedLocation(location);
                          if (location === 'Bengaluru') {
                            navigate('/');
                          } else {
                            navigate(`/location/${location.toLowerCase()}`);
                          }
                          setActiveDropdown(null);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600 transition duration-100"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Utility Buttons (Login, Wishlist, Cart, Seller, Profile) */}
          <div className="flex items-center space-x-4">
            {!user ? (
              <Link to="/login">
                <button className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-lg text-sm font-medium shadow-md transition duration-150 ease-in-out hidden sm:block">
                  LOGIN
                </button>
              </Link>
            ) : (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <div>
                            <p className="text-base font-semibold text-gray-900">{user.fullName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <Link to="/customer-profile">
                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>View Profile</span>
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 px-3 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out mx-auto flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Wishlist Icon */}
            {!isLoginPage && (
              <button
                onClick={() => user ? navigate('/favorites') : navigate('/login')}
                className="text-gray-700 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {user && favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            )}
            {/* Cart Icon */}
            {!isLoginPage && (
              <button
                onClick={() => user ? navigate('/cart') : navigate('/login')}
                className="text-gray-700 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out relative"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13H5.4m1.6 0h10M9 21a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                {user && numberOfProducts > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {numberOfProducts}
                  </span>
                )}
              </button>
            )}
            {/* My Orders Link */}
            {user && !isLoginPage && (
              <Link
                to="/my-orders"
                className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
              >
                My Orders
              </Link>
            )}
            {/* Role Dropdown - Only show if user is not logged in */}
            {!user && (
              <div className="relative" ref={roleDropdownRef}>
                <div className="hidden lg:flex items-center bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition duration-150 ease-in-out shadow-md">
                  <button
                    onClick={() => navigate(selectedRole === 'scientist' ? '/scientist-auth' : '/seller-auth')}
                    className="flex-1 text-left hover:bg-green-700 rounded transition duration-150 ease-in-out"
                  >
                    {selectedRole ? (selectedRole === 'seller' ? 'BECOME SELLER' : 'BECOME SCIENTIST') : 'BECOME SELLER'}
                  </button>
                  <button
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                    className="p-1 hover:bg-green-700 rounded transition duration-150 ease-in-out"
                  >
                    <KeyboardArrowDownIcon className="w-4 h-4" />
                  </button>
                </div>
                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setSelectedRole('seller');
                          setIsRoleDropdownOpen(false);
                          navigate('/seller-auth');
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition duration-100 ${
                          selectedRole === 'seller' ? 'bg-green-50 text-green-600' : 'text-gray-700'
                        }`}
                      >
                        Become Seller
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRole('scientist');
                          setIsRoleDropdownOpen(false);
                          navigate('/scientist-auth');
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition duration-100 ${
                          selectedRole === 'scientist' ? 'bg-green-50 text-green-600' : 'text-gray-700'
                        }`}
                      >
                        Become Scientist
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu (Responsive) */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <a href={item.href} className="text-gray-700 hover:text-green-600 block px-3 py-3 rounded-md text-base font-medium w-full text-left transition duration-100">
                    {item.label}
                  </a>
                ) : (
                  <button className="text-gray-700 hover:text-green-600 block px-3 py-3 rounded-md text-base font-medium w-full text-left transition duration-100">
                    {item.label}
                  </button>
                )}
                {item.dropdown && (
                  <div className="ml-4 space-y-2 pb-2">
                    {item.dropdown.map((subItem) => {
                      if (typeof subItem === 'string') {
                        return (
                          <button
                            key={subItem}
                            onClick={() => navigate(`/category/${String(subItem).toLowerCase().replace(/ /g, '-').replace(/\//g, '-')}`)}
                            className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600 rounded-md transition duration-100"
                          >
                            {subItem}
                          </button>
                        );
                      } else {
                        return (
                          <div key={subItem.title}>
                            <div className="text-base font-bold text-green-700 uppercase mt-2 mb-1 pl-3">
                              {subItem.title}
                            </div>
                            {subItem.items.map((item) => {
                              const href = item === 'VEGETABLE SEEDS' ? '/vegetable-seeds' :
                                           item === 'FRUIT SEEDS' ? '/fruit-seeds' :
                                           item === 'FLOWER SEEDS' ? '/flower-seeds' : `/category/${item.toLowerCase().replace(/ /g, '-')}`;
                              return (
                                <button
                                  key={item}
                                  onClick={() => {
                                    navigate(href);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className="block w-full text-left pl-6 py-1 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600 rounded-md transition duration-100"
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>
                        );
                      }
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
