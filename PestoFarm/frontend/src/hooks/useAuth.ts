import { useState } from 'react';
import { useAuth as useAuthContext } from '../AuthContext';
import { customerAuthService, sellerAuthService, scientistAuthService, SignupRequest, LoginRequest, LoginOtpRequest } from '../services/authService';

export const useAuth = () => {
  const { login: contextLogin } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (
    data: SignupRequest,
    role: 'customer' | 'seller' | 'scientist'
  ) => {
    setIsLoading(true);
    setError('');
    try {
      let response;
      if (role === 'customer') {
        response = await customerAuthService.signup(data);
      } else if (role === 'seller') {
        response = await sellerAuthService.signup(data);
      } else {
        response = await scientistAuthService.signup(data);
      }

      // For signup, we might need additional verification, but for now, assume success
      const user = {
        email: data.email,
        fullName: data.fullName,
        role: response.role,
        password: data.password,
        jwt: response.jwt,
      };
      // Provide jwt to AuthContext so API-enabled features work immediately
      contextLogin(user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (
    data: LoginOtpRequest,
    role: 'customer' | 'seller' | 'scientist'
  ) => {
    setIsLoading(true);
    setError('');
    try {
      let result: any;
      if (role === 'seller') {
        result = await sellerAuthService.sendOtp(data);
      } else if (role === 'scientist') {
        result = await scientistAuthService.sendOtp(data);
      } else {
        // For customers, send OTP by calling login with just email
        result = await customerAuthService.sendOtp(data);
      }

      // Backend may return messages indicating whether the account exists
      const msg = (result && result.message) || (result && result.data && result.data.message) || '';
      const lower = msg.toLowerCase();
      if (lower.includes('not') || lower.includes('does not') || lower.includes('no user')) {
        const entity = role === 'customer' ? 'Customer' : role === 'seller' ? 'Seller' : 'Scientist';
        setError(`${entity} does not exist, try creating account`);
        return result;
      }

      // If OTP sent successfully, no error
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (
    data: LoginRequest,
    role: 'customer' | 'seller' | 'scientist'
  ) => {
    setIsLoading(true);
    setError('');
    try {
      let response;
      if (role === 'customer') {
        response = await customerAuthService.login(data);
      } else if (role === 'seller') {
        response = await sellerAuthService.login(data);
      } else {
        response = await scientistAuthService.login(data);
      }

      const user = {
        email: data.email,
        role: response.role,
        password: data.password,
        jwt: response.jwt,
        fullName: (response as any).fullName || (response as any).fullname || undefined,
      };
      // Save JWT and basic user info into AuthContext so downstream APIs work
      contextLogin(user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (
    email: string,
    otp: string,
    role: 'seller' | 'scientist'
  ) => {
    setIsLoading(true);
    setError('');
    try {
      let response;
      if (role === 'seller') {
        response = await sellerAuthService.verifyEmail(email, otp);
      } else {
        response = await scientistAuthService.verifyEmail(email, otp);
      }

      const user = {
        email,
        fullName: email, // fallback
        role: response.role,
      };
      contextLogin(user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const { user } = useAuthContext();

  return {
    handleSignup,
    handleSendOtp,
    handleLogin,
    handleVerifyEmail,
    isLoading,
    error,
    user,
  };
};
