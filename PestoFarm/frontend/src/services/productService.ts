import axios from 'axios';
import { ProductDetail } from '../customer/data/productData';

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
}

// API Response interfaces
export interface ProductPage {
  content: BackendProduct[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: any;
  empty: boolean;
}

// API Request parameters
export interface ProductFilters {
  category?: string;
  brand?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
  sort?: string;
  stock?: string;
  pageNumber?: number;
  userLat?: number;
  userLon?: number;
}

// Utility function to transform backend product to frontend ProductDetail
export const transformBackendProduct = (backendProduct: BackendProduct): ProductDetail => {
  // Parse sizes string into array format expected by frontend
  const sizes = backendProduct.sizes ? backendProduct.sizes.split(',').map(size => ({
    label: size.trim(),
    price: backendProduct.sellingPrice,
    discount: backendProduct.discountPercent
  })) : [];

  // Calculate reviews and reviewCount from numRatings
  const reviews = backendProduct.numRatings > 0 ? 4.5 : 0; // Default rating
  const reviewCount = backendProduct.numRatings;

  return {
    id: backendProduct.id,
    name: backendProduct.title,
    brand: backendProduct.seller?.fullName || 'Pesto Seeds',
    currentPrice: backendProduct.sellingPrice,
    originalPrice: backendProduct.mrpPrice,
    sizes: sizes,
    reviews: reviews,
    reviewCount: reviewCount,
    images: backendProduct.images.length > 0 ? backendProduct.images : ['/images/default-product.png'],
    shippingInfo: [
      { icon: 'Truck' as any, text: 'Free Shipping available on orders above ₹499' },
      { icon: 'Check' as any, text: 'Expected delivery in 4-7 days' },
    ],
    description: backendProduct.description,
    specifications: [
      { key: 'Category', value: backendProduct.category?.name || 'General' },
      { key: 'Brand', value: backendProduct.seller?.fullName || 'Pesto Seeds' },
      { key: 'Discount', value: `${backendProduct.discountPercent}%` },
      { key: 'Stock', value: backendProduct.quantity.toString() },
    ],
    customerReviews: [] // Reviews would need separate API call
  };
};

export const productService = {
  // Fetch products with filters
  getProducts: async (filters: ProductFilters = {}): Promise<ProductDetail[]> => {
    try {
      const params = new URLSearchParams();

      // Add filters to params
      if (filters.category) params.append('category', filters.category);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.size) params.append('size', filters.size);
      if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.minDiscount !== undefined) params.append('minDiscount', filters.minDiscount.toString());
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.stock) params.append('stock', filters.stock);
      if (filters.pageNumber !== undefined) params.append('pageNumber', filters.pageNumber.toString());
      if (filters.userLat !== undefined) params.append('userLat', filters.userLat.toString());
      if (filters.userLon !== undefined) params.append('userLon', filters.userLon.toString());

      const response = await axios.get<ProductPage>(`${API_BASE_URL}/api/products`, { params });
      // Transform backend products to frontend format
      return response.data.content.map(transformBackendProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Failed to fetch products. Please try again later.');
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (productId: number): Promise<ProductDetail> => {
    try {
      const response = await axios.get<BackendProduct>(`${API_BASE_URL}/api/products/${productId}`);
      return transformBackendProduct(response.data);
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      alert('Failed to fetch product details. Please try again later.');
      throw error;
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<ProductDetail[]> => {
    try {
      const response = await axios.get<BackendProduct[]>(`${API_BASE_URL}/api/products/search?query=${encodeURIComponent(query)}`);
      return response.data.map(transformBackendProduct);
    } catch (error) {
      console.error('Error searching products:', error);
      alert('Failed to search products. Please try again later.');
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string, pageNumber: number = 0): Promise<ProductDetail[]> => {
    return productService.getProducts({ category, pageNumber });
  },

  // Get products by location (using coordinates)
  getProductsByLocation: async (userLat: number, userLon: number, pageNumber: number = 0): Promise<ProductDetail[]> => {
    return productService.getProducts({ userLat, userLon, pageNumber });
  }
};
