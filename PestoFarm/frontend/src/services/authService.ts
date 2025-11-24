import axios from 'axios';

const API_BASE_URL = 'http://localhost:5454';

export interface SignupRequest {
  email: string;
  fullName: string;
  password: string;
  otp: string;
}

export interface LoginOtpRequest {
  email: string;
  otp?: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_SELLER' | 'ROLE_SCIENTIST';
}

export interface LoginRequest {
  email: string;
  otp?: string;
  password?: string;
}

export interface AuthResponse {
  jwt: string;
  message: string;
  role: 'ROLE_CUSTOMER' | 'ROLE_SELLER' | 'ROLE_SCIENTIST' | 'ROLE_ADMIN';
}

export interface ApiResponse {
  message: string;
}

// Customer Auth (User endpoints)
export const customerAuthService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/users/auth/signup`, data);
    return response.data;
  },

  sendOtp: async (data: LoginOtpRequest): Promise<ApiResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/users/auth/send-otp`, data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/users/auth/login`, data);
    return response.data;
  },

  verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/users/auth/verify-email`, null, {
      params: { email, otp }
    });
    return response.data;
  },
};

// Seller Auth
export const sellerAuthService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/sellers/auth/signup`, data);
    return response.data;
  },

  sendOtp: async (data: LoginOtpRequest): Promise<ApiResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/sellers/auth/send-otp`, data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/sellers/auth/login`, data);
    return response.data;
  },

  verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/sellers/auth/verify-email`, null, {
      params: { email, otp }
    });
    return response.data;
  },
};

// Scientist Auth
export const scientistAuthService = {
  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/scientists/auth/signup`, data);
    return response.data;
  },

  sendOtp: async (data: LoginOtpRequest): Promise<ApiResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/scientists/auth/send-otp`, data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/scientists/auth/login`, data);
    return response.data;
  },

  verifyEmail: async (email: string, otp: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/api/scientists/auth/verify-email`, null, {
      params: { email, otp }
    });
    return response.data;
  },
};
