import axios from 'axios';

const API_BASE_URL = 'http://localhost:5454';

// Interface matching the backend CreateProductRequest
export interface CreateProductRequest {
  title: string;
  description: string;
  mrpPrice: number;
  sellingPrice: number;
  images: string[];
  sizes: string;
  category: string;
  category2?: string;
  location: string;
  quantity: number;
}

// Interface for backend Product response
export interface BackendProduct {
  id: number;
  title: string;
  description: string;
  mrpPrice: number;
  sellingPrice: number;
  discountPercent: number;
  quantity: number;
  images: string[];
  numRatings: number;
  sizes: string;
  category?: {
    id: number;
    name: string;
  };
  seller?: {
    id: number;
    fullName: string;
  };
  createdAt: string;
}

export const sellerProductService = {
  // Create a new product
  createProduct: async (productData: CreateProductRequest, jwt: string): Promise<BackendProduct> => {
    try {
      const response = await axios.post<BackendProduct>(
        `${API_BASE_URL}/sellers/products`,
        productData,
        {
          headers: {
            'Authorization': jwt,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Get products by seller
  getProductsBySeller: async (jwt: string): Promise<BackendProduct[]> => {
    try {
      const response = await axios.get<BackendProduct[]>(
        `${API_BASE_URL}/sellers/products`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching seller products:', error);
      alert('Failed to fetch your products. Please try again later.');
      throw error;
    }
  },

  // Update product
  updateProduct: async (productId: number, productData: Partial<BackendProduct>, jwt: string): Promise<BackendProduct> => {
    try {
      const response = await axios.put<BackendProduct>(
        `${API_BASE_URL}/sellers/products/${productId}`,
        productData,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update the product. Please try again later.');
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (productId: number, jwt: string): Promise<void> => {
    try {
      await axios.delete(
        `${API_BASE_URL}/sellers/products/${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        }
      );
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete the product. Please try again later.');
      throw error;
    }
  }
};
