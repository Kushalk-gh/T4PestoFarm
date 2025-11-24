import axios from 'axios';

const API_BASE_URL = 'http://localhost:5454';

// Backend Product interface (matches Java entity)
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
  reviews?: any[];
  location?: string;
}

// Types for Admin APIs
export interface AdminProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  imageUrl: string;
  sizeOptions: string[];
  description: string;
  category: string;
  status: 'In Stock' | 'Out of Stock';
  sellerId: string;
  sellerName: string;
  addedAt: string;
  updatedAt: string;
}

// Utility function to transform backend product to AdminProduct
export const transformBackendProductToAdmin = (backendProduct: BackendProduct): AdminProduct => {
  // Parse sizes string into array
  const sizeOptions = backendProduct.sizes ? backendProduct.sizes.split(',').map(s => s.trim()) : [];

  // Determine status based on quantity
  const status: 'In Stock' | 'Out of Stock' = backendProduct.quantity > 0 ? 'In Stock' : 'Out of Stock';

  return {
    id: backendProduct.id,
    name: backendProduct.title,
    brand: backendProduct.seller?.fullName || 'Pesto Seeds',
    price: backendProduct.sellingPrice,
    originalPrice: backendProduct.mrpPrice,
    discount: backendProduct.discountPercent,
    imageUrl: backendProduct.images.length > 0 ? backendProduct.images[0] : '/images/default-product.png',
    sizeOptions: sizeOptions,
    description: backendProduct.description,
    category: backendProduct.category?.name || 'General',
    status: status,
    sellerId: backendProduct.seller?.id.toString() || '',
    sellerName: backendProduct.seller?.fullName || 'Unknown Seller',
    addedAt: backendProduct.createdAt,
    updatedAt: backendProduct.createdAt, // Backend doesn't have updatedAt, using createdAt
  };
};

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  contactNumber?: string;
  brandName?: string;
  shopAddress?: string;
  gstNumber?: string;
  bankAccount?: string;
  specialization?: string;
  experience?: number;
  hourlyRate?: number;
  bio?: string;
  qualifications?: string;
  location?: string;
  phone?: string;
  availability?: string;
  rating?: number;
  reviews?: number;
  createdAt?: string;
}

export interface UpdateProductRequest {
  name?: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  category?: string;
  status?: 'In Stock' | 'Out of Stock';
  description?: string;
  sizeOptions?: string[];
}

export interface UpdateUserRequest {
  fullName?: string;
  email?: string;
  contactNumber?: string;
  brandName?: string;
  shopAddress?: string;
  gstNumber?: string;
  bankAccount?: string;
  specialization?: string;
  experience?: number;
  hourlyRate?: number;
  bio?: string;
  qualifications?: string;
  location?: string;
  phone?: string;
  availability?: string;
}

export const adminService = {
  // Product Management APIs
  getAllProducts: async (): Promise<AdminProduct[]> => {
    try {
      const response = await axios.get<BackendProduct[]>(`${API_BASE_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      // Transform backend products to AdminProduct format
      return response.data.map(transformBackendProductToAdmin);
    } catch (error) {
      console.error('Error fetching all products:', error);
      throw error;
    }
  },

  updateProduct: async (productId: number, updateData: UpdateProductRequest): Promise<AdminProduct> => {
    try {
      // Transform admin update data to backend format
      const backendUpdateData = {
        title: updateData.name,
        description: updateData.description,
        mrpPrice: updateData.originalPrice,
        sellingPrice: updateData.price,
        discountPercent: updateData.discount,
        sizes: updateData.sizeOptions?.join(','),
        // Note: Category mapping might need adjustment based on backend expectations
      };

      const response = await axios.put<BackendProduct>(
        `${API_BASE_URL}/api/admin/products/${productId}`,
        backendUpdateData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Transform response back to AdminProduct format
      return transformBackendProductToAdmin(response.data);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (productId: number): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // User Management APIs
  getAllUsers: async (): Promise<AdminUser[]> => {
    try {
      const response = await axios.get<AdminUser[]>(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  getAllSellers: async (): Promise<AdminUser[]> => {
    try {
      const response = await axios.get<AdminUser[]>(`${API_BASE_URL}/api/admin/sellers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all sellers:', error);
      throw error;
    }
  },

  getAllScientists: async (): Promise<AdminUser[]> => {
    try {
      const response = await axios.get<AdminUser[]>(`${API_BASE_URL}/api/admin/scientists`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all scientists:', error);
      throw error;
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  deleteSeller: async (sellerId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/sellers/${sellerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting seller:', error);
      throw error;
    }
  },

  deleteScientist: async (scientistId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/scientists/${scientistId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
        },
      });
    } catch (error) {
      console.error('Error deleting scientist:', error);
      throw error;
    }
  },

  // Seller Status Management
  updateSellerStatus: async (sellerId: string, status: string): Promise<void> => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/seller/${sellerId}/status/${status}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          },
        }
      );
    } catch (error) {
      console.error('Error updating seller status:', error);
      throw error;
    }
  },
};
