package com.pesticides.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.exception.ProductException;
import com.pesticides.modal.Cart;
import com.pesticides.modal.CartItem;
import com.pesticides.modal.Product;
import com.pesticides.modal.User;
import com.pesticides.request.AddItemRequest;
import com.pesticides.response.Apiresponse;
import com.pesticides.service.CartItemService;
import com.pesticides.service.CartService;
import com.pesticides.service.ProductService;
import com.pesticides.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {
    
    private final CartService cartService;
    private final CartItemService cartItemService;
    private final UserService userService;
    private final ProductService productService;

    @GetMapping()
    public ResponseEntity<Cart> findUserCartHandler(
        @RequestHeader("Authorization") String jwt) throws Exception {

            User user = userService.findUserByJwtToken(jwt);
            Cart cart = cartService.findUserCart(user);
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }
 
    @PutMapping("/add")
    public ResponseEntity<CartItem> addItemToCart(
        @RequestBody AddItemRequest req, @RequestHeader("Authorization") String jwt) throws ProductException,Exception {
        //TODO: process PUT request
        
        User user = userService.findUserByJwtToken(jwt);
        Product product=productService.findProductById(req.getProductId());

        CartItem item = cartService.addCartItem(user,
         product, 
         req.getSize(), 
         req.getQuantity());
         Apiresponse res = new Apiresponse();
         res.setMessage("Item Added to Cart Successfully");

        return new ResponseEntity<>(item,HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<Apiresponse>deleteCartItemHadler(
        @PathVariable Long cartItemId,
        @RequestHeader("Authorization") String jwt) throws Exception{

            User user = userService.findUserByJwtToken(jwt);
            cartItemService.removeCartItem(user.getId(),cartItemId);

            Apiresponse res = new Apiresponse();
            res.setMessage("Item Removed from cart");

            return new ResponseEntity<>(res,HttpStatus.ACCEPTED);
        }

        @PutMapping("/item/{cartItemId}")
        public ResponseEntity<CartItem> updateCartItemHandler(
            @PathVariable Long cartItemId,
            @RequestBody CartItem cartItem,
            @RequestHeader("Authorization")String jwt)
            throws Exception{

                User user= userService.findUserByJwtToken(jwt);

                CartItem updateCartItem = null;
                if(cartItem.getQuantity()>0){
                    updateCartItem=cartItemService.updateCartItem(user.getId(), cartItemId, cartItem);
                }
            
            return new ResponseEntity<>(updateCartItem,HttpStatus.ACCEPTED);
        }
}


