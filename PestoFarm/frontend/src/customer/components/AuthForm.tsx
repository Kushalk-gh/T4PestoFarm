import React, { useState, useEffect, useRef } from 'react';
import { LogIn, UserPlus, Loader2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SignupRequest, LoginRequest, LoginOtpRequest } from '../../services/authService';
import LocationPermissionModal from './LocationPermissionModal';
import { locationService } from '../../services/locationService';

interface AuthFormProps {
  view: 'login' | 'createAccount';
  onViewChange: (view: 'login' | 'createAccount') => void;
  onSuccess: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ view, onViewChange, onSuccess }) => {
  const { handleSignup, handleSendOtp, handleLogin, isLoading, error } = useAuth();

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);

  // Location Permission Modal
  const [showLocationModal, setShowLocationModal] = useState(false);

  // OTP Resend Logic
  const [otpResendCount, setOtpResendCount] = useState(0);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Validation
  const isLoginValid = email && (showOtpField ? otp : password);
  const isCreateAccountValid = fullName && email && password && otp;
  const isFormValid = view === 'login' ? isLoginValid : isCreateAccountValid;

  // Timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) {
              if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [resendTimer]);

  const startResendTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setResendTimer(30);
  };

  const handleSendOtpClick = async () => {
    if (!email) {
      return;
    }

    try {
      const otpRequest: LoginOtpRequest = {
        email,
        role: 'ROLE_CUSTOMER',
      };
      await handleSendOtp(otpRequest, 'customer');
      setShowOtpField(true);
      setOtpResendCount(c => c + 1);
      startResendTimer();
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      if (view === 'login') {
        const loginData: LoginRequest = {
          email,
          password: showOtpField ? undefined : password,
          otp: showOtpField ? otp : undefined,
        };
        await handleLogin(loginData, 'customer');
      } else {
        const signupData: SignupRequest = {
          email,
          fullName,
          password,
          otp,
        };
        await handleSignup(signupData, 'customer');
      }
      // Show location permission modal after successful auth
      setShowLocationModal(true);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleLocationChoice = async (choice: 'allowWhileVisiting' | 'onlyThisTime' | 'dontAllow') => {
    try {
      // Save location preference to backend
      await locationService.saveLocationPreference({ choice });

      // If location was granted, request and save location
      if (choice === 'allowWhileVisiting' || choice === 'onlyThisTime') {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              await locationService.saveLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: position.timestamp
              });
            } catch (error) {
              console.error('Error saving location:', error);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }

      setShowLocationModal(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving location preference:', error);
      // Still proceed to close modal and call onSuccess
      setShowLocationModal(false);
      onSuccess();
    }
  };

  const handleViewChange = (newView: 'login' | 'createAccount') => {
    onViewChange(newView);
    // Note: error is managed by the hook, so we don't set it here
    setShowOtpField(false);
    setOtp('');
    setOtpResendCount(0);
    setResendTimer(0);
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const primaryButtonDisabled = isLoading || !email || otpResendCount > 0;
  const primaryButtonText = isLoading && otpResendCount === 0
    ? <Loader2 size={16} className="animate-spin" />
    : otpResendCount > 0 ? 'OTP Sent' : 'Send OTP';

  return (
    <>
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 sm:p-10 border border-gray-200">
        <div className="flex flex-col items-center mb-8">
          {view === 'login' ? (
            <LogIn size={40} className="text-green-600 mb-3" />
          ) : (
            <UserPlus size={40} className="text-green-600 mb-3" />
          )}
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            {view === 'login' ? 'Customer Sign In' : 'Customer Account Registration'}
          </h2>
          <p className="text-gray-500 mt-1">
            Access the PestoFarm Marketplace.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex space-x-3 mb-6 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => handleViewChange('login')}
            className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              view === 'login' ? 'bg-green-700 text-white shadow-md' : 'text-gray-700 hover:bg-white'
            }`}
          >
            <LogIn size={18} className="mr-2" />
            Customer Login
          </button>
          <button
            onClick={() => handleViewChange('createAccount')}
            className={`flex-1 flex items-center justify-center p-3 text-sm font-semibold rounded-lg transition-colors duration-200 ${
              view === 'createAccount' ? 'bg-green-700 text-white shadow-md' : 'text-gray-700 hover:bg-white'
            }`}
          >
            <UserPlus size={18} className="mr-2" />
            Customer Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 text-sm rounded-lg bg-red-100 text-red-700">
              <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name Input (Only for Create Account) */}
          {view === 'createAccount' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Your full legal name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                disabled={isLoading}
                required
                autoComplete="name"
              />
            </div>
          )}

          {/* Email Input with Send OTP Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="e.g., yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 pr-28 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                disabled={isLoading || otpResendCount > 0}
                required
                autoComplete="username email"
              />
              <button
                type="button"
                onClick={handleSendOtpClick}
                disabled={primaryButtonDisabled}
                className={`absolute right-1 top-1 h-10 px-3 text-white text-xs font-semibold rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center ${
                  otpResendCount > 0 ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {primaryButtonText}
              </button>
            </div>
          </div>

          {/* Password Input */}
          {(view === 'createAccount' || !showOtpField) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your secret password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                disabled={isLoading}
                required
                autoComplete={view === 'login' ? "current-password" : "new-password"}
              />
            </div>
          )}

          {/* OTP Input */}
          {showOtpField && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otp">
                  OTP (6 Digits) <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="Enter your verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-green-500 transition"
                  disabled={isLoading}
                  required
                  autoComplete="one-time-code"
                />
              </div>

              {/* Resend OTP Button */}
              {otpResendCount >= 1 && (
                <div className="text-sm text-right pt-1">
                  <button
                    type="button"
                    onClick={handleSendOtpClick}
                    disabled={isLoading || resendTimer > 0}
                    className={`font-semibold transition-colors flex items-center justify-end w-full ${
                      resendTimer > 0
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-green-600 hover:text-green-800'
                    }`}
                  >
                    {isLoading && resendTimer === 0 ? (
                      <span className="flex items-center justify-end">
                        <Loader2 size={16} className="animate-spin mr-1" />
                        Resending...
                      </span>
                    ) : resendTimer > 0 ? (
                      `Resend OTP in ${resendTimer}s`
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    {`You have requested OTP ${otpResendCount} time${otpResendCount > 1 ? 's' : ''}.`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center p-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
            disabled={isLoading || (view === 'login' ? !isLoginValid : !showOtpField || !isCreateAccountValid)}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                {view === 'login' ? <LogIn size={20} className="mr-2" /> : <UserPlus size={20} className="mr-2" />}
                {view === 'login' ? 'Login to Marketplace' : 'Create Customer Account'}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Location Permission Modal */}
      {showLocationModal && (
        <LocationPermissionModal
          onClose={() => setShowLocationModal(false)}
          onChoice={handleLocationChoice}
        />
      )}
    </>
  );
};

export default AuthForm;