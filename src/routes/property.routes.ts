import { Router } from 'express';
import { PropertyController } from '../modules/property/index.js';
import { NeighborhoodController } from '../modules/neighborhood/neighborhood.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const propertyController = new PropertyController();
const neighborhoodController = new NeighborhoodController();

// Public routes
router.get('/', (req, res) => propertyController.getProperties(req, res));
router.get('/search/by-lifestyle', (req, res) => propertyController.searchByLifestyle(req, res));
router.get('/:id', (req, res) => propertyController.getProperty(req, res));
router.get('/:id/viewing-count', (req, res) => propertyController.getViewingCount(req, res));
router.get('/:id/activity', (req, res) => propertyController.getActivity(req, res));
router.get('/:id/neighborhood', (req, res) => {
  // Map the route to use propertyId parameter
  (req.params as any).propertyId = req.params.id;
  neighborhoodController.getNeighborhoodData(req, res);
});

// Protected routes
router.post('/', authMiddleware, (req, res) => propertyController.createProperty(req, res));
router.patch('/:id/availability', authMiddleware, (req, res) => propertyController.updateAvailability(req, res));
router.post('/:id/generate-activity', authMiddleware, (req, res) => propertyController.generateMockActivity(req, res));
router.post('/:id/mock-booking', authMiddleware, (req, res) => propertyController.simulateBooking(req, res));
router.post('/simulate/high-traffic', authMiddleware, (req, res) => propertyController.simulateHighTraffic(req, res));
router.post('/simulate/booking-spike', authMiddleware, (req, res) => propertyController.simulateBookingSpike(req, res));
router.get('/my/properties', authMiddleware, (req, res) => propertyController.getMyProperties(req, res));

export default router;