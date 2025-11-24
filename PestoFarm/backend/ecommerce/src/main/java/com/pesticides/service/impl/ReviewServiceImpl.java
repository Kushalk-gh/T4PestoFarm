package com.pesticides.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pesticides.domain.OrderStatus;
import com.pesticides.modal.Order;
import com.pesticides.modal.OrderItem;
import com.pesticides.modal.Product;
import com.pesticides.modal.Review;
import com.pesticides.modal.User;
import com.pesticides.repository.OrderRepository;
import com.pesticides.repository.ReviewRepository;
import com.pesticides.request.CreateReviewRequest;
import com.pesticides.service.ReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService{

    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;

    @Override
    public Review createReview(CreateReviewRequest req, User user, Product product) throws Exception {
        // Validate business rule: customer must have ordered the product and it must be delivered
        if (!isEligibleToReview(user.getId(), product.getId())) {
            throw new Exception("You can only review products you have purchased and received.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setReviewText(req.getReviewText());
        review.setRating(req.getReviewRating());
        review.setProductImages(req.getProductImages());

        product.getReviews().add(review);
        return reviewRepository.save(review);
    }

    private boolean isEligibleToReview(Long userId, Long productId) {
        List<Order> userOrders = orderRepository.findByUserId(userId);
        for (Order order : userOrders) {
            if (order.getOrderStatus() == OrderStatus.DELIVERED) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct() != null && item.getProduct().getId() == productId.longValue()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    @Override
    public boolean checkReviewEligibility(Long userId, Long productId) {
        return isEligibleToReview(userId, productId);
    }

    @Override
    public List<Review> getReviewByProductId(Long productId) {
        return reviewRepository.findByProductId(productId);

    }

    @Override
    public Review updateReview(Long reviewId, String reviewText, double rating, Long userId) throws Exception {
        Review review = getReviewById(reviewId);

        if(review.getUser().getId().equals(userId)){
            review.setReviewText(reviewText);
            review.setRating(rating);
            return reviewRepository.save(review);
        }
        throw new Exception("you cannot update this review");
    }

    @Override
    public void deleteReview(Long reviewId, Long userId) throws Exception {
        Review review = getReviewById(reviewId);

        if(!review.getUser().getId().equals(userId)){
            throw new Exception("you cannot delete this review");
        }
        reviewRepository.delete(review);
    }

    @Override
    public Review getReviewById(Long reviewId) throws Exception {
        return reviewRepository.findById(reviewId).orElseThrow(()->
        new Exception("review not found"));
    }
    
}
