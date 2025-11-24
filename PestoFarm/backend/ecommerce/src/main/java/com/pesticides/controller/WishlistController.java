package com.pesticides.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.modal.Product;
import com.pesticides.modal.User;
import com.pesticides.modal.Wishlist;
import com.pesticides.service.UserService;
import com.pesticides.service.WishlistService;
import com.pesticides.service.ProductService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {
    
    private final WishlistService wishlistService;
    private final UserService userService;
    private final ProductService productService;

    @GetMapping()
    public ResponseEntity<Wishlist> getWishlistByUserId(
        @RequestHeader("Authorization") String jwt)
        throws Exception {
            User user = userService.findUserByJwtToken(jwt);
            Wishlist wishlist  = wishlistService.getWishlistByUserId(user);
            return ResponseEntity.ok(wishlist);
    }

    @PostMapping("/add-product/{productId}")
    public ResponseEntity<Wishlist> addProductToWishlist(
        @PathVariable Long productId,
        @RequestHeader("Authorization") String jwt)
        throws Exception {
        //TODO: process POST request

        Product product = productService.findProductById(productId);
        User user = userService.findUserByJwtToken(jwt);
        Wishlist updateWishlist = wishlistService.addProductToWishlist(user, product);


        return ResponseEntity.ok(updateWishlist);
    }

    @DeleteMapping("/remove-product/{productId}")
    public ResponseEntity<Wishlist> removeProductFromWishlist(
        @PathVariable Long productId,
        @RequestHeader("Authorization") String jwt)
        throws Exception {

        Product product = productService.findProductById(productId);
        User user = userService.findUserByJwtToken(jwt);
        Wishlist updateWishlist = wishlistService.removeProductFromWishlist(user, product);

        return ResponseEntity.ok(updateWishlist);
    }
    
    
}
