import { Router } from 'express';
import { NeighborhoodController } from '../modules/neighborhood/neighborhood.controller.js';

const router = Router();
const neighborhoodController = new NeighborhoodController();

// Public route for neighborhood data
router.get('/:propertyId', (req, res) => neighborhoodController.getNeighborhoodData(req, res));

export default router;