import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5454';

// ===========================
// INTERFACES
// ===========================

export interface Review {
  id?: number;
  productId: number;
  userId: number;
  rating: number;
  reviewText: string;
  createdAt?: string;
  updatedAt?: string;
  productImages?: string[];
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface CreateReviewRequest {
  reviewText: string;
  reviewRating: number;
  productImages?: string[];
}

export interface ReviewEligibility {
  eligible: boolean;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ReviewApiError {
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
// REVIEW SERVICE OBJECT
// ===========================

export const reviewService = {
  /**
   * Create a new review for a product
   * @param productId - Product ID
   * @param reviewData - Review data
   * @param token - JWT token
   * @returns Promise with API response
   */
  createReview: async (
    productId: number,
    reviewData: CreateReviewRequest,
    token: string
  ): Promise<ApiResponse> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/reviews`,
        {
          productId,
          rating: reviewData.reviewRating,
          reviewText: reviewData.reviewText,
          productImages: reviewData.productImages || [],
        },
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
        message: response.data?.message || 'Review submitted successfully',
        data: response.data?.data,
      };
    } catch (error) {
      const axiosError = error as ReviewApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to submit review';

      console.error('[Review API Error - Create]', {
        status: axiosError.response?.status,
        message: errorMessage,
        productId,
        reviewData,
      });

      throw {
        success: false,
        message: errorMessage,
        status: axiosError.response?.status || 500,
      };
    }
  },

  /**
   * Get all reviews for a specific product
   * @param productId - Product ID
   * @param token - JWT token
   * @returns Promise with array of Review objects
   */
  getProductReviews: async (
    productId: number,
    token: string
  ): Promise<Review[]> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.get<Review[]>(
        `${API_BASE_URL}/api/reviews/product/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data || [];
    } catch (error) {
      const axiosError = error as ReviewApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch product reviews';

      console.error('[Review API Error - Get Product Reviews]', {
        status: axiosError.response?.status,
        message: errorMessage,
        productId,
      });

      // Return empty array on error instead of throwing
      return [];
    }
  },

  /**
   * Update an existing review
   * @param reviewId - Review ID
   * @param reviewData - Updated review data
   * @param token - JWT token
   * @returns Promise with API response
   */
  updateReview: async (
    reviewId: number,
    reviewData: Partial<CreateReviewRequest>,
    token: string
  ): Promise<ApiResponse> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.put<ApiResponse>(
        `${API_BASE_URL}/api/reviews/${reviewId}`,
        {
          rating: reviewData.reviewRating,
          reviewText: reviewData.reviewText,
          productImages: reviewData.productImages || [],
        },
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
        message: response.data?.message || 'Review updated successfully',
        data: response.data?.data,
      };
    } catch (error) {
      const axiosError = error as ReviewApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to update review';

      console.error('[Review API Error - Update]', {
        status: axiosError.response?.status,
        message: errorMessage,
        reviewId,
        reviewData,
      });

      throw {
        success: false,
        message: errorMessage,
        status: axiosError.response?.status || 500,
      };
    }
  },

  /**
   * Delete a review
   * @param reviewId - Review ID
   * @param token - JWT token
   * @returns Promise with API response
   */
  deleteReview: async (
    reviewId: number,
    token: string
  ): Promise<ApiResponse> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.delete<ApiResponse>(
        `${API_BASE_URL}/api/reviews/${reviewId}`,
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
        message: response.data?.message || 'Review deleted successfully',
        data: response.data?.data,
      };
    } catch (error) {
      const axiosError = error as ReviewApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to delete review';

      console.error('[Review API Error - Delete]', {
        status: axiosError.response?.status,
        message: errorMessage,
        reviewId,
      });

      throw {
        success: false,
        message: errorMessage,
        status: axiosError.response?.status || 500,
      };
    }
  },

  /**
   * Check if user can review a product
   * @param productId - Product ID
   * @param token - JWT token
   * @returns Promise with ReviewEligibility
   */
  checkReviewEligibility: async (
    productId: number,
    token: string
  ): Promise<ReviewEligibility> => {
    try {
      if (!token) {
        return { eligible: false, message: 'Authentication required' };
      }

      const response = await axios.get<{ eligible: boolean; message?: string }>(
        `${API_BASE_URL}/api/reviews/check-eligibility/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as ReviewApiError;
      console.error('Error checking review eligibility:', error);
      return {
        eligible: false,
        message: axiosError.response?.data?.message || 'Unable to check eligibility'
      };
    }
  },

  /**
   * Get user's own reviews
   * @param token - JWT token
   * @returns Promise with array of Review objects
   */
  getUserReviews: async (token: string): Promise<Review[]> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.get<Review[]>(
        `${API_BASE_URL}/api/reviews/user`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data || [];
    } catch (error) {
      const axiosError = error as ReviewApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch user reviews';

      console.error('[Review API Error - Get User Reviews]', {
        status: axiosError.response?.status,
        message: errorMessage,
      });

      // Return empty array on error instead of throwing
      return [];
    }
  },
};

// ===========================
// INDIVIDUAL FUNCTION EXPORTS (for backward compatibility)
// ===========================

export const submitReviewAPI = reviewService.createReview;
export const getProductReviewsAPI = reviewService.getProductReviews;
export const updateReviewAPI = reviewService.updateReview;
export const deleteReviewAPI = reviewService.deleteReview;
export const checkUserReviewExistsAPI = reviewService.checkReviewEligibility;
export const getUserReviewsAPI = reviewService.getUserReviews;
