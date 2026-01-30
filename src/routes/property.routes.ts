import { Router } from 'express';
import { PropertyController } from '../modules/property/index.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const propertyController = new PropertyController();

// Public routes
router.get('/', (req, res) => propertyController.getProperties(req, res));
router.get('/search/by-lifestyle', (req, res) => propertyController.searchPropertiesByLifestyle(req, res));
router.get('/:id', (req, res) => propertyController.getProperty(req, res));
router.get('/:id/activity', (req, res) => propertyController.getPropertyActivity(req, res));
router.get('/:id/neighborhood', (req, res) => propertyController.getPropertyNeighborhood(req, res));

// Protected routes
router.post('/', authMiddleware, (req, res) => propertyController.createProperty(req, res));
router.get('/my/properties', authMiddleware, (req, res) => propertyController.getMyProperties(req, res));
router.patch('/:id/availability', authMiddleware, (req, res) => propertyController.updateAvailability(req, res));
router.patch('/:id/coordinates', authMiddleware, (req, res) => propertyController.updatePropertyCoordinates(req, res));

// Demo routes
router.post('/:id/mock-booking', (req, res) => propertyController.mockBooking(req, res));
router.post('/:id/generate-activity', (req, res) => propertyController.generateMockActivity(req, res));

export default router;