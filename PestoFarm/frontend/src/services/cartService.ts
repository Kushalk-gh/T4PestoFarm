import axios from 'axios';

const API_BASE_URL = 'http://localhost:5454';

export interface AddCartItemRequest {
  productId: number;
  size: string;
  quantity: number;
}

export const getCartAPI = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/api/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const addItemToCartAPI = async (req: AddCartItemRequest, token: string) => {
  const response = await axios.put(`${API_BASE_URL}/api/cart/add`, req, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const removeCartItemAPI = async (cartItemId: number, token: string) => {
  const response = await axios.delete(`${API_BASE_URL}/api/cart/item/${cartItemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateCartItemAPI = async (cartItemId: number, cartItem: any, token: string) => {
  const response = await axios.put(`${API_BASE_URL}/api/cart/item/${cartItemId}`, cartItem, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
