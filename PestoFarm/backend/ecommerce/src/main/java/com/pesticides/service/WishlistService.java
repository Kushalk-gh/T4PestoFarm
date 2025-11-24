package com.pesticides.service;

import com.pesticides.modal.Product;
import com.pesticides.modal.User;
import com.pesticides.modal.Wishlist;

public interface WishlistService {

    Wishlist createWishlist(User user);
    Wishlist getWishlistByUserId(User user);
    Wishlist addProductToWishlist(User user,Product product);
    Wishlist removeProductFromWishlist(User user, Product product);
}
