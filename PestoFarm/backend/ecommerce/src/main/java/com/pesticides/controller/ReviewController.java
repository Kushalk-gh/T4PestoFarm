package com.pesticides.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pesticides.modal.Product;
import com.pesticides.modal.Review;
import com.pesticides.modal.User;
import com.pesticides.request.CreateReviewRequest;
import com.pesticides.response.Apiresponse;
import com.pesticides.service.UserService;
import com.pesticides.service.ProductService;
import com.pesticides.service.ReviewService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;



@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ReviewController {
    
    private final ReviewService reviewService;
    private final UserService userService;
    private final ProductService productService;

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<List<Review>> getReviewsByProduct(
        @PathVariable Long productId) {

            List<Review> reviews = reviewService.getReviewByProductId(productId);
            return ResponseEntity.ok(reviews);
    }

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<Review> writeReview(
        @RequestBody CreateReviewRequest req,
        @PathVariable Long productId,
        @RequestHeader("Authorization")String jwt)throws Exception {
            
            User user = userService.findUserByJwtToken(jwt);
            Product product = productService.findProductById(productId);

            Review review = reviewService.createReview(req, user, product);
            return ResponseEntity.ok(review);
    }
    
    @PatchMapping("/reviews/{reviewId}")
    public ResponseEntity<Review> updateReview(
        @RequestBody CreateReviewRequest req,
        @PathVariable Long reviewId,
        @RequestHeader("Authorization")String jwt)
        throws Exception{

            User user = userService.findUserByJwtToken(jwt);

            Review review = reviewService.updateReview(reviewId,
            req.getReviewText(),
            req.getReviewRating(),
            user.getId());

            return ResponseEntity.ok(review);
        }

        @DeleteMapping("/reviews/{reviewId}")
        public ResponseEntity<Apiresponse> deleteReview(
            @PathVariable Long reviewId,
            @RequestHeader("Authorization") String jwt)
            throws Exception{

                User user = userService.findUserByJwtToken(jwt);

                reviewService.deleteReview(reviewId, user.getId());

                Apiresponse res = new Apiresponse();
                res.setMessage("Review deleted successfully");

                return ResponseEntity.ok(res);
            }
    
}
