import React, { useEffect, useState } from 'react';
import { Star, UserCircle, Edit, Trash2 } from 'lucide-react';
import { reviewService, Review } from '../../services/reviewService';
import { useAuth } from '../../AuthContext';

interface ReviewListProps {
  productId: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.jwt) return;

      try {
        const reviews = await reviewService.getProductReviews(productId, user.jwt);
        setReviews(reviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId, user?.jwt]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!user?.jwt || !confirm('Are you sure you want to delete this review?')) return;

    try {
      await reviewService.deleteReview(reviewId, user.jwt);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet. Be the first to review this product!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
          {/* Review Header */}
          <div className="flex items-center space-x-3 mb-2">
            <UserCircle size={24} className="text-gray-400" />
            <div>
              <span className="font-semibold text-gray-800">{review.user?.fullName}</span>
              <div className="text-sm text-gray-500">{formatDate(review.createdAt!)}</div>
            </div>
          </div>

          {/* Edit/Delete buttons for own reviews */}
          {user && user.email === review.user?.email && (
            <div className="flex space-x-2">
              <button
                onClick={() => {/* TODO: Implement edit functionality */}}
                className="text-blue-600 hover:text-blue-800 p-1"
                title="Edit review"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteReview(review.id!)}
                className="text-red-600 hover:text-red-800 p-1"
                title="Delete review"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          {/* Rating */}
          <div className="flex items-center space-x-2 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={`${
                  star <= (review.rating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Review Text */}
          <p className="text-gray-700 mb-4 leading-relaxed">{review.reviewText}</p>

          {/* Product Images */}
          {review.productImages && review.productImages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.productImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-md border border-gray-300"
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
