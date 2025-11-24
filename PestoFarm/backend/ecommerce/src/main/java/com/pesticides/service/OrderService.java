package com.pesticides.service;

import java.util.List;
import java.util.Set;

import com.pesticides.domain.OrderStatus;
import com.pesticides.modal.Address;
import com.pesticides.modal.Cart;
import com.pesticides.modal.Order;
import com.pesticides.modal.OrderItem;
import com.pesticides.modal.User;

public interface OrderService {
    Set<Order> createOrder(User user, Address shippingAddress, Cart cart);
    Order findOrderById(long id) throws Exception;
    List<Order> usersOrderHistory(Long userId);
    List<Order> sellersOrder(Long sellerId);
    Order updateOrderStatus(Long orderId, OrderStatus orderStatus) throws Exception;
    Order cancelOrder(Long orderId,User user) throws Exception;
    OrderItem getOrderItemById(Long id) throws Exception;
}
