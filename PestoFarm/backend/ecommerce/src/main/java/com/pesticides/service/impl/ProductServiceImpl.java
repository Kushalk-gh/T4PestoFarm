package com.pesticides.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;

import com.pesticides.exception.ProductException;
import com.pesticides.modal.Address;
import com.pesticides.modal.Category;
import com.pesticides.modal.Product;
import com.pesticides.modal.Seller;
import com.pesticides.repository.CategoryRepository;
import com.pesticides.repository.ProductRepository;
import com.pesticides.request.CreateProductRequest;
import com.pesticides.service.ProductService;
import com.pesticides.utils.LocationUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

private final ProductRepository productRepository;
private final CategoryRepository categoryRepository;

private static final Double SEARCH_RADIUS_KM = 50.0; 

@Override
public Product createProduct(CreateProductRequest req, Seller seller) {
    Category category1 = categoryRepository.findByCategoryId(req.getCategory());

    if(category1==null){
        Category category = new Category();
        category.setCategoryId(req.getCategory());
        category.setLevel(1);
        category1=categoryRepository.save(category);
    }

    Category productCategory = category1;

    if(req.getCategory2() != null && !req.getCategory2().trim().isEmpty()){
        Category category2 = categoryRepository.findByCategoryId(req.getCategory2());

        if(category2==null){
            Category category = new Category();
            category.setCategoryId(req.getCategory2());
            category.setLevel(2);
            category.setParentCategory(category1);
            category2=categoryRepository.save(category);
        }
        productCategory = category2;
    }

    int discountPercentage;
    try {
        discountPercentage = calculateDiscountPercentage(req.getMrpPrice(),req.getSellingPrice());
    } catch (IllegalArgumentException e) {
        throw new RuntimeException(e.getMessage());
    }
    Product product = new Product();
    product.setSeller(seller);
    product.setCategory(productCategory);
    product.setDescription(req.getDescription());
    product.setCreatedAt(LocalDateTime.now());
    product.setTitle(req.getTitle());
    product.setSellingPrice(req.getSellingPrice());
    product.setImages(req.getImages());
    product.setMrpPrice(req.getMrpPrice());
    product.setSizes(req.getSizes());
    product.setDiscountPercent(discountPercentage);

    return productRepository.save(product);
}
    
private int calculateDiscountPercentage(int mrpPrice, int sellingPrice) {
    if(mrpPrice <=0){
        throw new IllegalArgumentException("Actual price must be greater than 0");            
    }
    double discount = mrpPrice-sellingPrice;
    double discountPercentage = (discount/mrpPrice)*100;
    return (int)discountPercentage;
}

@Override
public void deleteProduct(Long productId) throws ProductException {
    Product product = findProductById(productId);
    if(product == null){
        throw new ProductException("Product not found with id " + productId);
    }
    productRepository.delete(product);
}

@Override
public Product updateProduct(Long productId, Product product) throws ProductException {
    Product existingProduct = findProductById(productId);
    if(existingProduct == null){
        throw new ProductException("Product not found with id " + productId);
    }
    product.setId(productId);
    return productRepository.save(product);
}

@Override
public Product findProductById(Long productId) throws ProductException {
    return productRepository.findById(productId).orElseThrow(()-> new ProductException("product not found with id" +productId));
}

@Override
public List<Product> searchProducts(String query) {
    return productRepository.searchProduct(query);
}

@Override
public Page<Product> getAllProducts(
    String category, 
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
    ) {

    Specification<Product> spec = (root,query,criteriaBuilder)->{
        List<Predicate> predicates = new ArrayList<>();

        if(category!=null){
            Join<Product,Category> categoryJoin = root.join("category");
            predicates.add(criteriaBuilder.equal(categoryJoin.get("categoryId"),category));
        }

        if(sizes != null && !sizes.isEmpty()){
            predicates.add(criteriaBuilder.equal(root.get("size"), sizes));
        }

        if(minPrice != null){
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("sellingPrice"), minPrice));
        }

        if(maxPrice != null){
            predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("sellingPrice"), maxPrice));
        }

        if(minDiscount != null){
            predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("discountPercent"), minDiscount));
        }

        if(stock != null){
            predicates.add(criteriaBuilder.equal(root.get("stock"),stock));
        }
        
        return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
    };
    
    // 1. Fetch all products matching standard criteria
    Pageable initialPageable = PageRequest.of(0, 1000, Sort.unsorted());
    List<Product> productsToFilter = productRepository.findAll(spec, initialPageable).getContent();

    // 2. Apply Location Filter ONLY if userLat and userLon are provided
    if (userLat != null && userLon != null) {
        final double uLat = userLat;
        final double uLon = userLon;
        productsToFilter = productsToFilter.stream()
            .filter(product -> {
                if (product == null || product.getSeller() == null || product.getSeller().getPickupAddress() == null) {
                    // If seller data is incomplete, decide: Show or Hide?
                    // Defaulting to SHOW if data is messy to avoid empty lists during dev
                    return true; 
                }
                Address sellerAddress = product.getSeller().getPickupAddress();
                Double sellerLat = sellerAddress.getLatitude();
                Double sellerLon = sellerAddress.getLongitude();

                if (sellerLat == null || sellerLon == null) {
                    return true; // Show if coordinates missing
                }

                double distance = LocationUtil.calculateDistanceInKilometers(uLat, uLon, sellerLat, sellerLon);
                return distance <= SEARCH_RADIUS_KM;
            })
            .collect(Collectors.toList());
    }
    
    // 3. Pagination logic
    Pageable pageable;
    Sort springSort = Sort.unsorted();
    int finalPageSize = 10; 
    
    if(sort!= null && !sort.isEmpty()){
        switch (sort){
            case "price_low": springSort = Sort.by("sellingPrice").ascending(); break;
            case "price_high": springSort = Sort.by("sellingPrice").descending(); break;
        }
    }
    
    pageable = PageRequest.of(pageNumber!=null?pageNumber:0, finalPageSize, springSort);

    int pageSize = pageable.getPageSize();
    int currentPage = pageable.getPageNumber();
    int startItem = currentPage * pageSize;

    List<Product> pageList;

    if (productsToFilter.size() < startItem) {
        pageList = List.of();
    } else {
        int endItem = Math.min(startItem + pageSize, productsToFilter.size());
        pageList = productsToFilter.subList(startItem, endItem);
    }
    
    return new PageImpl<>(pageList, pageable, productsToFilter.size());
}

@Override
public List<Product> getProductBySellerId(Long sellerId) {
    return productRepository.findBySellerId(sellerId);
}


}