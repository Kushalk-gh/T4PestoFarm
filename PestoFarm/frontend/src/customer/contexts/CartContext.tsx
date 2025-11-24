import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../AuthContext';
import { ProductDetail } from '../data/productData';
import { getCartAPI, addItemToCartAPI, removeCartItemAPI, updateCartItemAPI } from '../../services/cartService';

interface CartItem {
  product: ProductDetail;
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductDetail, size: string, quantity?: number) => Promise<void>;
  removeFromCart: (productIdOrCartItemId: number) => Promise<void>;
  updateQuantity: (productIdOrCartItemId: number, quantity: number) => Promise<void>;
  clearCart: () => void;
  totalCost: number;
  discountApplied: number;
  deliveryCharges: number;
  numberOfProducts: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on user change
  useEffect(() => {
    if (user) {
      // Try loading from backend first
      const load = async () => {
        try {
          if (user && (user as any).jwt) {
            const cart = await getCartAPI((user as any).jwt);
            if (cart && cart.cartItems) {
              const mapped = cart.cartItems.map((ci: any) => ({
                product: (ci.product as unknown) as ProductDetail,
                quantity: ci.quantity,
                selectedSize: ci.size || (ci.product?.sizes?.[0]?.label || '')
              }));
              setCartItems(mapped);
              // save backup
              if (user?.email) {
                localStorage.setItem(`cart_${user.email}`, JSON.stringify(mapped));
              }
              return;
            }
          }
        } catch (error) {
          console.warn('Failed to load cart from backend, falling back to localStorage', error);
        }

        const storedCart = localStorage.getItem(`cart_${user.email}`);
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        } else {
          setCartItems([]);
        }
      };

      load();
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Save cart to localStorage whenever cartItems change (also useful as backup)
  useEffect(() => {
    if (user?.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product: ProductDetail, size: string, quantity: number = 1) => {
    if (!user) return;
    // If user has JWT, try calling backend API
    try {
      const jwt = (user as any).jwt;
      if (jwt) {
        const req = { productId: product.id, size, quantity };
        await addItemToCartAPI(req, jwt);
        // reload cart from backend to keep state consistent
        const cart = await getCartAPI(jwt);
        if (cart && cart.cartItems) {
          const mapped = cart.cartItems.map((ci: any) => ({
            product: (ci.product as unknown) as ProductDetail,
            quantity: ci.quantity,
            selectedSize: ci.size || (ci.product?.sizes?.[0]?.label || '')
          }));
          setCartItems(mapped);
          if (user?.email) {
            localStorage.setItem(`cart_${user.email}`, JSON.stringify(mapped));
          }
          return;
        }
      }
    } catch (error) {
      console.warn('Error adding item to cart via backend, falling back to local add', error);
    }

    // Fallback to local update
    const existingItem = cartItems.find(item => item.product.id === product.id && item.selectedSize === size);
    if (existingItem) {
      setCartItems(prev => prev.map(item =>
        item.product.id === product.id && item.selectedSize === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems(prev => [...prev, { product, quantity, selectedSize: size }]);
    }
  };

  const removeFromCart = async (productIdOrCartItemId: number) => {
    // Attempt backend deletion first if user has JWT
    try {
      const jwt = (user as any)?.jwt;
      if (jwt) {
        // Backend uses cartItem id for deletion; we try to match local item to cartItem id if available
        // If productIdOrCartItemId is actually a backend cartItem id, the delete will succeed.
        await removeCartItemAPI(productIdOrCartItemId, jwt);
        const cart = await getCartAPI(jwt);
        if (cart && cart.cartItems) {
          const mapped = cart.cartItems.map((ci: any) => ({
            product: (ci.product as unknown) as ProductDetail,
            quantity: ci.quantity,
            selectedSize: ci.size || (ci.product?.sizes?.[0]?.label || '')
          }));
          setCartItems(mapped);
          if (user?.email) {
            localStorage.setItem(`cart_${user.email}`, JSON.stringify(mapped));
          }
          return;
        }
      }
    } catch (error) {
      console.warn('Error removing cart item via backend, falling back to local removal', error);
    }

    // Fallback local removal
    setCartItems(prev => prev.filter(item => item.product.id !== productIdOrCartItemId));
  };

  const updateQuantity = async (productIdOrCartItemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productIdOrCartItemId);
      return;
    }

    try {
      const jwt = (user as any)?.jwt;
      if (jwt) {
        // We don't always have backend cartItem id; try to update via API using provided id
        const cartItemPayload = { quantity };
        await updateCartItemAPI(productIdOrCartItemId, cartItemPayload, jwt);
        const cart = await getCartAPI(jwt);
        if (cart && cart.cartItems) {
          const mapped = cart.cartItems.map((ci: any) => ({
            product: (ci.product as unknown) as ProductDetail,
            quantity: ci.quantity,
            selectedSize: ci.size || (ci.product?.sizes?.[0]?.label || '')
          }));
          setCartItems(mapped);
          if (user?.email) {
            localStorage.setItem(`cart_${user.email}`, JSON.stringify(mapped));
          }
          return;
        }
      }
    } catch (error) {
      console.warn('Error updating cart item via backend, falling back to local update', error);
    }

    // Fallback local update
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(item => item.product.id !== productIdOrCartItemId));
    } else {
      setCartItems(prev => prev.map(item =>
        item.product.id === productIdOrCartItemId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const numberOfProducts = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cartItems.reduce((sum, item) => {
    const sizeOption = item.product.sizes.find(s => s.label === item.selectedSize);
    const price = sizeOption ? sizeOption.price : item.product.currentPrice;
    return sum + (price * item.quantity);
  }, 0);
  const discountApplied = cartItems.reduce((sum, item) => {
    const sizeOption = item.product.sizes.find(s => s.label === item.selectedSize);
    const discount = sizeOption ? sizeOption.discount : 0;
    return sum + (discount * item.quantity);
  }, 0);
  const deliveryCharges = (totalCost - discountApplied) > 499 ? 0 : 50; // Free delivery above ₹499

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalCost,
      discountApplied,
      deliveryCharges,
      numberOfProducts
    }}>
      {children}
    </CartContext.Provider>
  );
};
