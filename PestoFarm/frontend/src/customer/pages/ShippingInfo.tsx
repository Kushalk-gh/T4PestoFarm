import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../contexts/OrderContext';
import { useAuth } from '../../AuthContext';

interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const ShippingInfo: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { shippingInfo, setShippingInfo, orderItems } = useOrder();
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (orderItems.length === 0) {
      navigate('/cart');
      return;
    }

    // Load saved address from profile
    const savedProfile = localStorage.getItem(`customerProfile_${user.email}`);
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setAddress({
        name: profile.fullName || '',
        phone: profile.phone || '',
        street: profile.address || '',
        city: '',
        state: '',
        zip: '',
      });
    }

    // Check geolocation permission
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state === 'granted');
      });
    }
  }, [user, orderItems.length, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAutoFillLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use OpenCage geocoding API (free tier available)
          // Note: Replace with your API key in production
          const apiKey = process.env.REACT_APP_OPENCAGE_API_KEY || 'demo_key';
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&limit=1`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const components = data.results[0].components;
              const formatted = data.results[0].formatted;

              setAddress(prev => ({
                ...prev,
                street: formatted.split(',')[0] || `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
                city: components.city || components.town || components.village || 'City',
                state: components.state || 'State',
                zip: components.postcode || '123456',
              }));
            } else {
              throw new Error('No results found');
            }
          } else {
            throw new Error('Geocoding API error');
          }
        } catch (error) {
          console.error('Error getting location:', error);
          // Fallback to coordinates if geocoding fails
          setAddress(prev => ({
            ...prev,
            street: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
            city: 'Auto-detected City',
            state: 'Auto-detected State',
            zip: '123456',
          }));
          alert('Geocoding service unavailable. Using coordinates instead.');
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Location access denied. Please enter address manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please allow location access and try again.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information unavailable. Please enter address manually.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out. Please try again.';
        }
        alert(errorMessage);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const validatePhoneNumber = (phone: string) => {
    // Indian phone number validation: 10 digits, starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateZipCode = (zip: string) => {
    // Indian PIN code validation: 6 digits
    const zipRegex = /^\d{6}$/;
    return zipRegex.test(zip.replace(/\s+/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!address.name || !address.phone || !address.street || !address.city || !address.state || !address.zip) {
      alert('Please fill in all required fields.');
      return;
    }

    // Phone number validation
    if (!validatePhoneNumber(address.phone)) {
      alert('Please enter a valid 10-digit phone number starting with 6-9.');
      return;
    }

    // ZIP code validation
    if (!validateZipCode(address.zip)) {
      alert('Please enter a valid 6-digit ZIP code.');
      return;
    }

    // Save shipping info to context
    setShippingInfo(address);
    navigate('/payment-method');
  };

  const handleBack = () => {
    navigate('/direct-checkout');
  };

  if (!user || orderItems.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Information</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Enter Shipping Address</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={address.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
              <input
                type="text"
                name="street"
                value={address.street}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={address.city}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  name="state"
                  value={address.state}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                <input
                  type="text"
                  name="zip"
                  value={address.zip}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            {/* Auto-fill location button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {locationPermission ? 'Location access granted' : 'Location access not granted'}
              </div>
              <button
                type="button"
                onClick={handleAutoFillLocation}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                <span>{isLoading ? 'Getting Location...' : 'Auto-fill Address'}</span>
              </button>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
