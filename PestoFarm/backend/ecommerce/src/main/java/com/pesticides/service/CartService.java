package com.pesticides.service;

import com.pesticides.modal.Cart;
import com.pesticides.modal.CartItem;
import com.pesticides.modal.User;
import com.pesticides.modal.Product;

public interface CartService {

    public CartItem addCartItem(
        User user,
        Product product,
        String size,
        int quantity
    );

    public Cart findUserCart(User user);
}
