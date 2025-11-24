package com.pesticides.service;

import java.util.List;

import com.pesticides.modal.Product;
import com.pesticides.modal.Review;
import com.pesticides.modal.User;
import com.pesticides.request.CreateReviewRequest;

public interface ReviewService {
    
    Review createReview(CreateReviewRequest req,
    User user, Product product) throws Exception;
    List<Review> getReviewByProductId(Long productId);
    boolean checkReviewEligibility(Long userId, Long productId);
    Review updateReview(Long reviewId,String reviewText,double rating,Long userId) throws Exception;
    void deleteReview(Long reviewId,Long userId) throws Exception;
    Review getReviewById(Long reviewId) throws Exception;
}


