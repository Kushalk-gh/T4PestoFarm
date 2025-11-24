import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../../AuthContext';

export interface OrderItem {
  id: number;
  product: {
    id: number;
    name: string;
    images: string[];
  };
  productId?: number; // For backward compatibility
  size: string;
  quantity: number;
  mrpPrice: number;
  sellingPrice: number;
  price: number; // For backward compatibility - computed from sellingPrice
  userId: number;
}

export interface ShippingInfo {
  id?: number;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface PaymentInfo {
  method: 'razorpay' | 'cod';
  transactionId?: string;
  orderId?: string;
  details?: any; // For Razorpay response
  status?: string;
}

export interface Order {
  id: number;
  orderId: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingInfo;
  paymentDetails: PaymentInfo;
  totalMrpPrice: number;
  totalSellingPrice: number;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalItem: number;
  paymentStatus: string;
  orderDate: string;
  deliveryDate: string;
  // Frontend computed/mapped fields for compatibility
  items: OrderItem[];
  total: number;
  taxes: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  shipping: ShippingInfo;
  payment: PaymentInfo;
}

interface OrderContextType {
  orderItems: (OrderItem & { price: number; productId: number })[];
  shippingInfo: ShippingInfo | null;
  paymentInfo: PaymentInfo | null;
  setOrderItems: (items: OrderItem[]) => void;
  setShippingInfo: (info: ShippingInfo) => void;
  setPaymentInfo: (info: PaymentInfo) => void;
  placeOrder: () => Promise<Order>;
  orders: Order[];
  loadOrders: () => void;
  clearOrder: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Add computed price field to orderItems for backward compatibility
  const processedOrderItems = orderItems.map(item => ({
    ...item,
    productId: item.product?.id || item.productId || 0,
    price: item.sellingPrice || item.price || 0
  }));

  // Load orders from localStorage on mount
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (user) {
      try {
        const jwtToken = localStorage.getItem('jwt');
        if (!jwtToken) {
          console.warn('No JWT token found, cannot load orders from backend');
          return;
        }

        const response = await fetch('http://localhost:5454/api/orders/user', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const backendOrders = await response.json();

        // Transform backend orders to frontend format
        const transformedOrders: Order[] = backendOrders.map((order: any) => ({
          id: order.id,
          orderId: order.orderId,
          orderItems: order.orderItems || [],
          shippingAddress: order.shippingAddress,
          paymentDetails: order.paymentDetails,
          totalMrpPrice: order.totalMrpPrice,
          totalSellingPrice: order.totalSellingPrice,
          orderStatus: order.orderStatus,
          totalItem: order.totalItem,
          paymentStatus: order.paymentStatus,
          orderDate: order.orderDate,
          deliveryDate: order.deliveryDate,
          // Frontend compatibility fields
          items: order.orderItems || [],
          total: order.totalSellingPrice,
          taxes: 0, // Backend should calculate this
          status: order.orderStatus.toLowerCase(),
          date: order.orderDate,
          shipping: order.shippingAddress,
          payment: order.paymentDetails
        }));

        setOrders(transformedOrders);

        // Also save to localStorage as backup
        localStorage.setItem(`orders_${user.email}`, JSON.stringify(transformedOrders));

      } catch (error) {
        console.error('Error loading orders from backend:', error);
        // Fallback to localStorage if backend fails
        const storedOrders = localStorage.getItem(`orders_${user.email}`);
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      }
    }
  };

  const placeOrder = async (): Promise<Order> => {
    if (!user || !shippingInfo || !paymentInfo) {
      throw new Error('Incomplete order information');
    }

    try {
      // Try to call backend API first
      const jwtToken = localStorage.getItem('jwt');

      if (jwtToken) {
        try {
          const requestBody = {
            name: shippingInfo.name,
            phone: shippingInfo.phone,
            street: shippingInfo.street,
            city: shippingInfo.city,
            state: shippingInfo.state,
            zip: shippingInfo.zip,
            paymentMethod: paymentInfo.method === 'razorpay' ? 'RAZORPAY' : 'COD',
            orderItems: processedOrderItems.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              size: item.size,
              mrpPrice: item.mrpPrice,
              sellingPrice: item.sellingPrice
            }))
          };

          const response = await fetch('http://localhost:5454/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `${jwtToken}`
            },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const data = await response.json();
            // If backend succeeds, create order from backend response
            const backendOrder: Order = {
              id: data.id || Date.now(),
              orderId: data.orderId || `ORD${Date.now()}`,
              orderItems: data.orderItems || orderItems,
              shippingAddress: data.shippingAddress || shippingInfo,
              paymentDetails: data.paymentDetails || paymentInfo,
              totalMrpPrice: data.totalMrpPrice || orderItems.reduce((sum, item) => sum + item.mrpPrice * item.quantity, 0),
              totalSellingPrice: data.totalSellingPrice || orderItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0),
              orderStatus: data.orderStatus || 'PENDING',
              totalItem: data.totalItem || orderItems.reduce((sum, item) => sum + item.quantity, 0),
              paymentStatus: data.paymentStatus || 'PENDING',
              orderDate: data.orderDate || new Date().toISOString(),
              deliveryDate: data.deliveryDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              // Frontend compatibility fields
              items: data.orderItems || orderItems,
              total: data.totalSellingPrice || orderItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0),
              taxes: 0,
              status: (data.orderStatus || 'PENDING').toLowerCase(),
              date: data.orderDate || new Date().toISOString(),
              shipping: data.shippingAddress || shippingInfo,
              payment: data.paymentDetails || paymentInfo
            };

            setOrders(prevOrders => [backendOrder, ...prevOrders]);
            clearOrder();
            return backendOrder;
          }
        } catch (backendError) {
          console.warn('Backend not available, falling back to demo mode:', backendError);
        }
      }

      // Fallback to demo mode when backend is not available
      console.log('Using demo mode for order placement');

      const subtotal = processedOrderItems.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return sum + (price * quantity);
      }, 0);
      const taxes = subtotal * 0.18; // 18% GST
      const deliveryCharges = 50; // Fixed delivery charge
      const totalAmount = subtotal + taxes + deliveryCharges;

      const demoOrder: Order = {
        id: Date.now(),
        orderId: `DEMO${Date.now()}`,
        orderItems: processedOrderItems,
        shippingAddress: shippingInfo,
        paymentDetails: paymentInfo,
        totalMrpPrice: processedOrderItems.reduce((sum, item) => sum + item.mrpPrice * item.quantity, 0),
        totalSellingPrice: subtotal,
        orderStatus: 'PENDING',
        totalItem: processedOrderItems.reduce((sum, item) => sum + item.quantity, 0),
        paymentStatus: paymentInfo.method === 'razorpay' ? 'PENDING' : 'COMPLETED',
        orderDate: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days delivery
        // Frontend compatibility fields
        items: processedOrderItems,
        total: totalAmount, // Net amount including taxes and delivery
        taxes: taxes,
        status: 'pending',
        date: new Date().toISOString(),
        shipping: shippingInfo,
        payment: paymentInfo
      };

      // Add the demo order to the orders list
      setOrders(prevOrders => [demoOrder, ...prevOrders]);

      // Clear current order
      clearOrder();

      return demoOrder;

    } catch (error) {
      console.error('Error placing order:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
    }
  };

  const clearOrder = () => {
    setOrderItems([]);
    setShippingInfo(null);
    setPaymentInfo(null);
  };

  return (
    <OrderContext.Provider value={{
      orderItems: processedOrderItems,
      shippingInfo,
      paymentInfo,
      setOrderItems,
      setShippingInfo,
      setPaymentInfo,
      placeOrder,
      orders,
      loadOrders,
      clearOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
};
