import { Review, CreateReviewDto } from './review.types.js';

export class ReviewService {
  private reviews: Review[] = []; // In-memory storage for demo

  async createReview(userId: string, reviewData: CreateReviewDto): Promise<Review> {
    // Check if user already reviewed this property
    const existingReview = this.reviews.find(
      r => r.userId === userId && r.propertyId === reviewData.propertyId
    );

    if (existingReview) {
      throw new Error('You have already reviewed this property');
    }

    const review: Review = {
      id: `review_${Date.now()}`,
      userId,
      propertyId: reviewData.propertyId,
      depositStatus: reviewData.depositStatus,
      realityRating: reviewData.realityRating,
      comment: reviewData.comment,
      createdAt: new Date()
    };

    this.reviews.push(review);
    return review;
  }

  async getReviewsByProperty(propertyId: string): Promise<Review[]> {
    return this.reviews.filter(r => r.propertyId === propertyId);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return this.reviews.filter(r => r.userId === userId);
  }

  async calculateDepositScore(propertyId: string): Promise<number> {
    const reviews = await this.getReviewsByProperty(propertyId);
    
    if (reviews.length === 0) return 0;

    const scores = reviews.map(r => {
      switch (r.depositStatus) {
        case 'yes': return 100;
        case 'partial': return 50;
        case 'no': return 0;
        default: return 0;
      }
    });

    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  }

  async calculateRealityScore(propertyId: string): Promise<number> {
    const reviews = await this.getReviewsByProperty(propertyId);
    
    if (reviews.length === 0) return 0;

    const total = reviews.reduce((sum, r) => sum + r.realityRating, 0);
    return Math.round((total / reviews.length) * 10) / 10; // Round to 1 decimal
  }
}