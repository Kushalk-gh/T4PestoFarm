package com.pesticides.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.exception.ProductException;
import com.pesticides.modal.Product;
import com.pesticides.service.ProductService;
import com.pesticides.dto.ProductDTO;
import com.pesticides.dto.PageResponse;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    @GetMapping("/{productId}")
    public ResponseEntity<Product> getProductById(
        @PathVariable Long productId
    ) throws ProductException {

        Product product = productService.findProductById(productId);
        return new ResponseEntity<>(product,HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProduct(
        @RequestParam(required = false) String query) {
            List<Product> products = productService.searchProducts(query);
        return new ResponseEntity<>(products,HttpStatus.OK);
    }

    @GetMapping()
    public ResponseEntity<PageResponse<ProductDTO>> getAllProducts(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String brand,
        @RequestParam(required = false) String size,
        @RequestParam(required = false) Integer minPrice,
        @RequestParam(required = false) Integer maxPrice,
        @RequestParam(required = false) Integer minDiscount,
        @RequestParam(required = false) String sort,
        @RequestParam(required = false) String stock,
        @RequestParam(defaultValue = "0") Integer pageNumber,
        @RequestParam(required = false) Double userLat, // NEW: User's Latitude
        @RequestParam(required = false) Double userLon // NEW: User's Longitude
        ) {

        Page<Product> page = productService.getAllProducts(category,brand,
            size,minPrice,maxPrice,
            minDiscount,sort,stock,pageNumber,
            userLat,userLon);

        List<ProductDTO> dtos = page.getContent().stream().map(p -> {
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
        }).collect(Collectors.toList());

        PageResponse<ProductDTO> resp = new PageResponse<>();
        resp.setContent(dtos);
        resp.setPageNumber(page.getNumber());
        resp.setPageSize(page.getSize());
        resp.setTotalElements(page.getTotalElements());
        resp.setTotalPages(page.getTotalPages());
        resp.setFirst(page.isFirst());
        resp.setLast(page.isLast());
        resp.setNumberOfElements(page.getNumberOfElements());

        return new ResponseEntity<>(resp, HttpStatus.OK);
    }
    
    


}