import React, { useState, useEffect } from 'react';
import { StarRating } from './StarRating';
import { CircularProgress } from './CircularProgress';
import { ReviewCard } from './ReviewCard';
import { AddReviewForm } from './AddReviewForm';
import { useAuth } from '../context/AuthContext';
import type { Review, ReviewStats } from '../types/review';
import api from '../lib/axios';

interface ReviewsSectionProps {
  propertyId: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ propertyId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      const [reviewsResponse, scoresResponse] = await Promise.all([
        api.get(`/api/reviews/property/${propertyId}`),
        api.get(`/api/reviews/property/${propertyId}/scores`)
      ]);

      const reviewsData = reviewsResponse.data;
      setReviews(reviewsData);

      // Calculate stats
      const totalReviews = reviewsData.length;
      const depositBreakdown = reviewsData.reduce(
        (acc: any, review: Review) => {
          acc[review.depositStatus]++;
          return acc;
        },
        { yes: 0, partial: 0, no: 0 }
      );

      setStats({
        depositScore: scoresResponse.data.depositScore,
        realityScore: scoresResponse.data.realityScore,
        totalReviews,
        depositBreakdown
      });

      // Check if current user has already reviewed
      if (user) {
        const hasReviewed = reviewsData.some((review: Review) => review.userId === user.id);
        setUserHasReviewed(hasReviewed);
      }
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowAddReview(false);
    fetchReviews(); // Refresh the reviews list
  };

  const getDepositPercentage = () => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((stats.depositBreakdown.yes / stats.totalReviews) * 100);
  };

  const canAddReview = user?.role === 'tenant' && !userHasReviewed;

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Reviews Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg font-medium mb-2">{error}</div>
        <button
          onClick={fetchReviews}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reality Score Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reality Score</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-blue-600">
                {stats.realityScore.toFixed(1)}
              </div>
              <div className="flex-1">
                <StarRating rating={stats.realityScore} readonly size="md" />
                <p className="text-sm text-gray-600 mt-1">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Deposit Score Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Return Rate</h3>
            <div className="flex items-center gap-4">
              <CircularProgress 
                percentage={getDepositPercentage()} 
                size={80}
                color="#10B981"
              />
              <div className="flex-1">
                <div className="text-lg font-medium text-gray-900">
                  {getDepositPercentage()}% got full deposit back
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {stats.depositBreakdown.yes} of {stats.totalReviews} tenants
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Partial: {stats.depositBreakdown.partial} • None: {stats.depositBreakdown.no}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Section */}
      {canAddReview && (
        <div>
          {!showAddReview ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">Share Your Experience</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Help future tenants by reviewing this property
                  </p>
                </div>
                <button
                  onClick={() => setShowAddReview(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                >
                  Write Review
                </button>
              </div>
            </div>
          ) : (
            <AddReviewForm
              propertyId={propertyId}
              onReviewSubmitted={handleReviewSubmitted}
              onCancel={() => setShowAddReview(false)}
            />
          )}
        </div>
      )}

      {/* Reviews List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Reviews ({reviews.length})
          </h3>
          {reviews.length > 0 && (
            <div className="text-sm text-gray-600">
              Most recent first
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-gray-400 text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with this property
            </p>
            {canAddReview && !showAddReview && (
              <button
                onClick={() => setShowAddReview(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
              >
                Write First Review
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};