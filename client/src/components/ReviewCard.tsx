import React from 'react';
import { StarRating } from './StarRating';
import type { Review } from '../types/review';

interface ReviewCardProps {
  review: Review;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const getDepositBadge = (status: Review['depositStatus']) => {
    const badges = {
      yes: {
        text: 'Full Deposit Returned',
        className: 'bg-green-100 text-green-800 border-green-200'
      },
      partial: {
        text: 'Partial Deposit Returned',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      },
      no: {
        text: 'No Deposit Returned',
        className: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const badge = badges[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAnonymousName = (userId: string) => {
    // Generate a consistent anonymous name based on user ID
    const names = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn'];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % names.length;
    return names[index];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Anonymous Avatar */}
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {getAnonymousName(review.userId)[0]}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {getAnonymousName(review.userId)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        
        {/* Deposit Status Badge */}
        <div>
          {getDepositBadge(review.depositStatus)}
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mb-3">
        <StarRating rating={review.realityRating} readonly size="sm" />
        <span className="text-sm text-gray-600">
          ({review.realityRating}/5)
        </span>
      </div>

      {/* Comment */}
      {review.comment && (
        <div className="text-gray-700 text-sm leading-relaxed">
          <p>"{review.comment}"</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Verified tenant review</span>
          <span>Helpful for future renters</span>
        </div>
      </div>
    </div>
  );
};