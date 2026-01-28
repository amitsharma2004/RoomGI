import { Router } from 'express';
import { ReviewController } from '../modules/review/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const reviewController = new ReviewController();

// Public routes
router.get('/property/:propertyId', (req, res) => reviewController.getPropertyReviews(req, res));
router.get('/property/:propertyId/scores', (req, res) => reviewController.getPropertyScores(req, res));

// Protected routes
router.post('/', authMiddleware, (req, res) => reviewController.createReview(req, res));
router.get('/my', authMiddleware, (req, res) => reviewController.getMyReviews(req, res));

export default router;