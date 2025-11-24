import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5454';

// ===========================
// INTERFACES
// ===========================

export interface Order {
  id: number;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  payment: {
    method: string;
  };
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface OrderApiError {
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
// ORDER SERVICE OBJECT
// ===========================

export const orderService = {
  /**
   * Cancel an order
   * @param orderId - Order ID to cancel
   * @param token - JWT token
   * @returns Promise with API response
   */
  cancelOrder: async (
    orderId: number,
    token: string
  ): Promise<ApiResponse> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.put<ApiResponse>(
        `${API_BASE_URL}/api/orders/${orderId}/cancel`,
        {},
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
        message: response.data?.message || 'Order cancelled successfully',
        data: response.data?.data,
      };
    } catch (error) {
      const axiosError = error as OrderApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to cancel order';

      console.error('[Order API Error - Cancel]', {
        status: axiosError.response?.status,
        message: errorMessage,
        orderId,
      });

      throw {
        success: false,
        message: errorMessage,
        status: axiosError.response?.status || 500,
      };
    }
  },

  /**
   * Get user's orders
   * @param token - JWT token
   * @returns Promise with array of Order objects
   */
  getUserOrders: async (token: string): Promise<Order[]> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.get<Order[]>(
        `${API_BASE_URL}/api/orders/user`,
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
      const axiosError = error as OrderApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch user orders';

      console.error('[Order API Error - Get User Orders]', {
        status: axiosError.response?.status,
        message: errorMessage,
      });

      // Return empty array on error instead of throwing
      return [];
    }
  },

  /**
   * Get order by ID
   * @param orderId - Order ID
   * @param token - JWT token
   * @returns Promise with Order object
   */
  getOrderById: async (
    orderId: number,
    token: string
  ): Promise<Order | null> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const response = await axios.get<Order>(
        `${API_BASE_URL}/api/orders/${orderId}`,
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
      const axiosError = error as OrderApiError;
      const errorMessage =
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Failed to fetch order';

      console.error('[Order API Error - Get Order By ID]', {
        status: axiosError.response?.status,
        message: errorMessage,
        orderId,
      });

      return null;
    }
  },
};

// ===========================
// INDIVIDUAL FUNCTION EXPORTS (for backward compatibility)
// ===========================

export const cancelOrderAPI = orderService.cancelOrder;
export const getUserOrdersAPI = orderService.getUserOrders;
export const getOrderByIdAPI = orderService.getOrderById;
