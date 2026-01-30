import React, { useState } from 'react';
import { StarRating } from './StarRating';
import type { CreateReviewDto } from '../types/review';
import api from '../lib/axios';

interface AddReviewFormProps {
  propertyId: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
}

export const AddReviewForm: React.FC<AddReviewFormProps> = ({
  propertyId,
  onReviewSubmitted,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateReviewDto>({
    propertyId,
    depositStatus: 'yes',
    realityRating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.realityRating < 1 || formData.realityRating > 5) {
      setError('Please select a rating between 1 and 5 stars');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      await api.post('/api/reviews', formData);
      onReviewSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, realityRating: rating }));
  };

  const handleDepositStatusChange = (status: 'yes' | 'partial' | 'no') => {
    setFormData(prev => ({ ...prev, depositStatus: status }));
  };

  const handleCommentChange = (comment: string) => {
    setFormData(prev => ({ ...prev, comment }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reality Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reality Rating
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              rating={formData.realityRating}
              onRatingChange={handleRatingChange}
              size="lg"
            />
            <span className="text-sm text-gray-600">
              ({formData.realityRating}/5)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            How accurately did the listing match reality?
          </p>
        </div>

        {/* Deposit Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Did you get your deposit back?
          </label>
          <div className="space-y-2">
            {[
              { value: 'yes', label: 'Yes, full deposit returned', color: 'green' },
              { value: 'partial', label: 'Partial deposit returned', color: 'yellow' },
              { value: 'no', label: 'No deposit returned', color: 'red' }
            ].map(({ value, label, color }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="depositStatus"
                  value={value}
                  checked={formData.depositStatus === value}
                  onChange={(e) => handleDepositStatusChange(e.target.value as any)}
                  className={`w-4 h-4 text-${color}-600 focus:ring-${color}-500 border-gray-300`}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment (Optional)
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Share your experience with this property..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={500}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500">
              Help future tenants make informed decisions
            </p>
            <span className="text-xs text-gray-400">
              {formData.comment?.length || 0}/500
            </span>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 font-medium rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};