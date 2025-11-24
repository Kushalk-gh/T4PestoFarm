package com.pesticides.controller;

import com.pesticides.modal.Product;
import com.pesticides.dto.ProductDTO;
import com.pesticides.modal.User;
import com.pesticides.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = adminService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long userId, @RequestBody String role) {
        User updatedUser = adminService.updateUserRole(userId, role);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/products")
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        List<Product> products = adminService.getAllProducts();

        List<ProductDTO> dtos = products.stream().map(p -> {
            ProductDTO d = new ProductDTO();
            d.setId(p.getId());
            d.setTitle(p.getTitle());
            d.setDescription(p.getDescription());
            d.setMrpPrice(p.getMrpPrice());
            d.setSellingPrice(p.getSellingPrice());
            d.setDiscountPercent(p.getDiscountPercent());
            d.setQuantity(p.getQuantity());
            d.setImages(p.getImages());
            d.setNumRatings(p.getNumRatings());
            d.setSizes(p.getSizes());
            d.setCreatedAt(p.getCreatedAt());
            d.setLocation(p.getLocation());
            if (p.getCategory() != null) d.setCategory(p.getCategory().getName());
            if (p.getSeller() != null) {
                d.setSellerName(p.getSeller().getSellerName());
                if (p.getSeller().getPickupAddress() != null) {
                    d.setPickupLatitude(p.getSeller().getPickupAddress().getLatitude());
                    d.setPickupLongitude(p.getSeller().getPickupAddress().getLongitude());
                }
            }
            return d;
        }).collect(java.util.stream.Collectors.toList());

        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }
}
