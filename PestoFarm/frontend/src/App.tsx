import React from 'react';
import './App.css';
import { ThemeProvider } from '@mui/material';
import Navbar from './customer/components/Navbar/navbar';
import { customeTheme } from './Theme/customeTheme';
import Home from './customer/pages/Home/Home';
import LoginNew from './customer/pages/LoginNew';

import FlowerSeeds from './customer/pages/Category/FlowerSeeds';
import VegetableSeeds from './customer/pages/Category/VegetableSeeds';
import FruitSeeds from './customer/pages/Category/FruitSeeds';
import Category from './customer/pages/Category/Category';
import ProductDetail from './customer/pages/ProductDetail';
import CustomerProfile from './customer/pages/CustomerProfile';
import CustomerChat from './customer/pages/CustomerChat';
import Chatbot from './customer/pages/Chatbot';
import Favorites from './customer/pages/Favorites';
import Cart from './customer/pages/Cart';
import DirectCheckout from './customer/pages/DirectCheckout';
import ShippingInfo from './customer/pages/ShippingInfo';
import PaymentMethod from './customer/pages/PaymentMethod';
import OrderReview from './customer/pages/OrderReview';
import OrderConfirmation from './customer/pages/OrderConfirmation';
import MyOrders from './customer/pages/MyOrders';
import Footer from './Footer';
import SellerAuth from './seller/SellerAuth';
import SellerHome from './seller/SellerHome';
import SellerProfile from './seller/SellerProfile';
import ScientistAuth from './scientist/ScientistAuth';
import ScientistHome from './scientist/ScientistHome';
import ScientistProfile from './scientist/ScientistProfile';
import ScientistList from './customer/pages/ScientistList';
import LocationPage from './customer/pages/LocationPage';
import AdminHome from './admin/AdminHome';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './customer/contexts/CartContext';
import { FavoritesProvider } from './customer/contexts/FavoritesContext';
import { OrderProvider } from './customer/contexts/OrderContext';

const AppContent = () => {
  const location = useLocation();
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isScientistRoute = location.pathname.startsWith('/scientist');
  const isAdminRoute = location.pathname.startsWith('/admin');



  return (
    <ThemeProvider theme={customeTheme}>
      <div>
        {!isSellerRoute && !isScientistRoute && !isAdminRoute && <Navbar />}
        <Routes>
          <Route path="/" element={
            <>
              <img src="/front-page-image.png" alt="PestoFarm Front Page" style={{ width: '100%', height: '1000px' }} />
              <Home/>
              <Footer />
            </>
          } />
          <Route path="/login" element={<LoginNew />} />

          <Route path="/customer-profile" element={<CustomerProfile />} />
          <Route path="/customer-chat" element={<CustomerChat />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/direct-checkout" element={<DirectCheckout />} />
          <Route path="/shipping-info" element={<ShippingInfo />} />
          <Route path="/payment-method" element={<PaymentMethod />} />
          <Route path="/order-review" element={<OrderReview />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/flower-seeds" element={<FlowerSeeds />} />
          <Route path="/vegetable-seeds" element={<VegetableSeeds />} />
          <Route path="/fruit-seeds" element={<FruitSeeds />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/seller-auth" element={<SellerAuth />} />
          <Route path="/seller-home" element={<SellerHome />} />
          <Route path="/seller-profile" element={<SellerProfile />} />
          <Route path="/scientist-auth" element={<ScientistAuth />} />
          <Route path="/scientist-home" element={<ScientistHome />} />
          <Route path="/scientist-profile" element={<ScientistProfile />} />
          <Route path="/scientist-list" element={<ScientistList />} />
          <Route path="/location/:location" element={<LocationPage />} />
          <Route path="/admin-home" element={<AdminHome />} />

        </Routes>
      </div>
    </ThemeProvider>
  );
};


function App() {
  return (
    <AuthProvider>
      {/* ADD THE FLAGS HERE */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CartProvider>
          <FavoritesProvider>
            <OrderProvider>
              <AppContent />
            </OrderProvider>
          </FavoritesProvider>
        </CartProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
