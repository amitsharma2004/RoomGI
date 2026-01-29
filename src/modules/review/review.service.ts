import { Review, CreateReviewDto } from './review.types.js';
import { DatabaseService } from '../../database/database.service.js';

const db = new DatabaseService();

export class ReviewService {
  async createReview(userId: string, reviewData: CreateReviewDto): Promise<Review> {
    try {
      return await db.createReview(userId, reviewData);
    } catch (error: any) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        throw new Error('You have already reviewed this property');
      }
      throw error;
    }
  }

  async getReviewsByProperty(propertyId: string): Promise<Review[]> {
    return await db.getReviewsByProperty(propertyId);
  }

  async getReviewsByUser(userId: string): Promise<Review[]> {
    return await db.getReviewsByUser(userId);
  }

  async calculateDepositScore(propertyId: string): Promise<number> {
    return await db.calculateDepositScore(propertyId);
  }

  async calculateRealityScore(propertyId: string): Promise<number> {
    return await db.calculateRealityScore(propertyId);
  }
}