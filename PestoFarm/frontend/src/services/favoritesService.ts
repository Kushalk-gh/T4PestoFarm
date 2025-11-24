import axios from 'axios';
import { ProductDetail } from '../customer/data/productData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5454';

// ===========================
// INTERFACES
// ===========================

export interface WishlistItem {
  product: ProductDetail;
}

export interface WishlistResponse {
  id?: number;
  user?: { id: number; email: string };
  wishlistItems?: WishlistItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface FavoritesApiError {
  response?: {
    status: number;
    data: {
      message: string;
      error?: string;
    };
  };
  message: string;
}

// ===========================
// API FUNCTIONS
// ===========================

/**
 * Add a product to user's wishlist
 * @param productId - Product ID to add
 * @param token - JWT authentication token
 * @returns Promise with API response
 */
export const addToFavoritesAPI = async (
  productId: number,
  token: string
): Promise<ApiResponse> => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }

    const response = await axios.post<ApiResponse>(
      `${API_BASE_URL}/api/wishlist/add-product/${productId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    return {
      success: true,
      message: response.data?.message || 'Product added to favorites',
      data: response.data?.data,
    };
  } catch (error) {
    const axiosError = error as FavoritesApiError;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Failed to add product to favorites';

    console.error('[Favorites API Error - Add]', {
      status: axiosError.response?.status,
      message: errorMessage,
      productId,
    });

    throw {
      success: false,
      message: errorMessage,
      status: axiosError.response?.status || 500,
    };
  }
};

/**
 * Remove a product from user's wishlist
 * @param productId - Product ID to remove
 * @param token - JWT authentication token
 * @returns Promise with API response
 */
export const removeFromFavoritesAPI = async (
  productId: number,
  token: string
): Promise<ApiResponse> => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }

    const response = await axios.delete<ApiResponse>(
      `${API_BASE_URL}/api/wishlist/remove-product/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      message: response.data?.message || 'Product removed from favorites',
      data: response.data?.data,
    };
  } catch (error) {
    const axiosError = error as FavoritesApiError;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Failed to remove product from favorites';

    console.error('[Favorites API Error - Remove]', {
      status: axiosError.response?.status,
      message: errorMessage,
      productId,
    });

    throw {
      success: false,
      message: errorMessage,
      status: axiosError.response?.status || 500,
    };
  }
};

/**
 * Get user's complete wishlist with full product details
 * @param token - JWT authentication token
 * @returns Promise with array of ProductDetail objects
 */
export const getUserFavoritesAPI = async (
  token: string
): Promise<ProductDetail[]> => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }

    const response = await axios.get<WishlistResponse>(
      `${API_BASE_URL}/api/wishlist`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    // Extract full product details from wishlist items
    if (response.data?.wishlistItems && Array.isArray(response.data.wishlistItems)) {
      return response.data.wishlistItems
        .map((item: WishlistItem) => item.product)
        .filter((product): product is ProductDetail => product !== null && product !== undefined);
    }

    return [];
  } catch (error) {
    const axiosError = error as FavoritesApiError;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Failed to fetch favorites from server';

    console.error('[Favorites API Error - Get]', {
      status: axiosError.response?.status,
      message: errorMessage,
    });

    // Return empty array on error instead of throwing
    // This prevents app crash if API fails
    return [];
  }
};

/**
 * Clear entire user's wishlist (optional feature)
 * @param token - JWT authentication token
 * @returns Promise with API response
 */
export const clearAllFavoritesAPI = async (token: string): Promise<ApiResponse> => {
  try {
    if (!token) {
      throw new Error('Authentication token is required');
    }

    const response = await axios.delete<ApiResponse>(
      `${API_BASE_URL}/api/wishlist/clear`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return {
      success: true,
      message: response.data?.message || 'Wishlist cleared successfully',
      data: response.data?.data,
    };
  } catch (error) {
    const axiosError = error as FavoritesApiError;
    const errorMessage =
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Failed to clear favorites';

    console.error('[Favorites API Error - Clear]', {
      status: axiosError.response?.status,
      message: errorMessage,
    });

    throw {
      success: false,
      message: errorMessage,
      status: axiosError.response?.status || 500,
    };
  }
};

/**
 * Check if a specific product is in user's favorites
 * @param productId - Product ID to check
 * @param token - JWT authentication token
 * @returns Promise with boolean indicating if product is favorited
 */
export const checkIfFavoritedAPI = async (
  productId: number,
  token: string
): Promise<boolean> => {
  try {
    if (!token) {
      return false;
    }

    const response = await axios.get<{ isFavorited: boolean }>(
      `${API_BASE_URL}/api/wishlist/check/${productId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    return response.data.isFavorited;
  } catch (error) {
    console.error('Error checking if product is favorited:', error);
    return false;
  }
};
