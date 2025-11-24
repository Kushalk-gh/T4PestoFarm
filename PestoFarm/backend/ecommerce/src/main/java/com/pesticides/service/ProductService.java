package com.pesticides.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.pesticides.exception.ProductException;
import com.pesticides.modal.Product;
import com.pesticides.modal.Seller;
import com.pesticides.request.CreateProductRequest;

public interface ProductService {
    
    public Product createProduct(CreateProductRequest req, Seller seller);
    public void deleteProduct(Long productId) throws ProductException;
    public Product updateProduct(Long productId,Product product) throws ProductException;
    Product findProductById(Long productId) throws ProductException;
    List<Product> searchProducts(String query);
    public Page<Product> getAllProducts(
        String categry,
        String brand,
        String sizes,
        Integer minPrice,
        Integer maxPrice,
        Integer minDiscount,
        String sort,
        String stock,
        Integer pageNumber,
        Double userLat,
        Double userLon 
    );

    List<Product> getProductBySellerId(Long sellerId);

    }