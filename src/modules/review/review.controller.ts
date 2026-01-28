import { Request, Response } from 'express';
import { ReviewService } from './review.service.js';

export class ReviewController {
  private reviewService = new ReviewService();

  async createReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      if (user.role !== 'tenant') {
        return res.status(403).json({ error: 'Only tenants can submit reviews' });
      }

      const { propertyId, depositStatus, realityRating, comment } = req.body;
      
      if (!propertyId || !depositStatus || !realityRating) {
        return res.status(400).json({ 
          error: 'Property ID, deposit status, and reality rating are required' 
        });
      }

      if (realityRating < 1 || realityRating > 5) {
        return res.status(400).json({ 
          error: 'Reality rating must be between 1 and 5' 
        });
      }

      const review = await this.reviewService.createReview(user.id, {
        propertyId,
        depositStatus,
        realityRating: Number(realityRating),
        comment
      });

      res.status(201).json(review);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already reviewed')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: 'Failed to create review' });
    }
  }

  async getPropertyReviews(req: Request, res: Response) {
    try {
      const propertyId = Array.isArray(req.params.propertyId) 
        ? req.params.propertyId[0] 
        : req.params.propertyId;
      
      const reviews = await this.reviewService.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getMyReviews(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const reviews = await this.reviewService.getReviewsByUser(user.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPropertyScores(req: Request, res: Response) {
    try {
      const propertyId = Array.isArray(req.params.propertyId) 
        ? req.params.propertyId[0] 
        : req.params.propertyId;
      
      const [depositScore, realityScore] = await Promise.all([
        this.reviewService.calculateDepositScore(propertyId),
        this.reviewService.calculateRealityScore(propertyId)
      ]);

      res.json({ depositScore, realityScore });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}