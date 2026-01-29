import { Router } from 'express';
import { FlagController } from '../modules/flag/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const flagController = new FlagController();

// Public routes
router.get('/property/:propertyId', (req, res) => flagController.getPropertyFlags(req, res));
router.get('/reasons', (req, res) => flagController.getFlagReasons(req, res));

// Protected routes
router.post('/', authMiddleware, (req, res) => flagController.createFlag(req, res));

export default router;