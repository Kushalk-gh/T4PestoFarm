import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Import sub-components
import AdminDashboard from './components/AdminDashboard';
import ProductManagement from './components/ProductManagement';
import AccountManagement from './components/AccountManagement';
import ShopByCategory from './components/ShopByCategory';

// Use actual React Router components
const LinkComponent = Link;
const useNavigateHook = useNavigate;

// Types

type AdminView = 'dashboard' | 'product-deals' | 'shop-by-category' | 'account' | 'logout';

const AdminHome: React.FC = () => {
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigateHook();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Sidebar menu items
  const sidebarItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: '📊' },
    { id: 'product-deals' as AdminView, label: 'Product Deals', icon: '🛒' },
    { id: 'shop-by-category' as AdminView, label: 'Shop by Category', icon: '📂' },
    { id: 'account' as AdminView, label: 'Account', icon: '👤' },
    { id: 'logout' as AdminView, label: 'Logout', icon: '🚪' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleMenuClick = (view: AdminView) => {
    if (view === 'logout') {
      handleLogout();
    } else {
      setActiveView(view);
    }
  };

  const handleViewProfile = () => {
    // Navigate to admin profile if exists, otherwise stay on account
    setActiveView('account');
    setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Render content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'product-deals':
        return <ProductManagement />;
      case 'shop-by-category':
        return <ShopByCategory />;
      case 'account':
        return <AccountManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <LinkComponent to="/" className="flex items-center">
            <img
              src="/PestoFarm-logo.png"
              alt="PestoFarm Logo"
              className="w-10 h-10 rounded-full border-2 border-green-600 mr-3 object-cover shadow-sm"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://placehold.co/40x40/2a5a2a/ffffff?text=PF";
              }}
            />
            <h1 className="text-2xl font-bold text-green-600">PestoFarm</h1>
          </LinkComponent>
          <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
        </div>

        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition duration-150 ease-in-out ${
                    activeView === item.id
                      ? 'bg-green-100 text-green-700 border-r-4 border-green-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-green-600'
                  }`}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {sidebarItems.find(item => item.id === activeView)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-600">Manage your PestoFarm platform</p>
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition duration-150 ease-in-out"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{user?.fullName || 'Admin'}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleViewProfile}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-green-600 transition duration-100"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition duration-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminHome;
