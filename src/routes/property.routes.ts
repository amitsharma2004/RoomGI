import { Router } from 'express';
import { PropertyController } from '../modules/property/index.js';
import { NeighborhoodController } from '../modules/neighborhood/neighborhood.controller.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadPropertyImages, handleUploadError } from '../middleware/upload.js';

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
router.post('/', authMiddleware, (req, res, next) => {
  uploadPropertyImages(req, res, (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    propertyController.createProperty(req, res);
  });
});
router.patch('/:id/availability', authMiddleware, (req, res) => propertyController.updateAvailability(req, res));
router.post('/:id/book', authMiddleware, (req, res) => propertyController.bookProperty(req, res));
router.post('/:id/activity', authMiddleware, (req, res) => propertyController.logPropertyActivity(req, res));
router.get('/my/properties', authMiddleware, (req, res) => propertyController.getMyProperties(req, res));
router.get('/test/cloudinary', authMiddleware, (req, res) => propertyController.testCloudinary(req, res));

export default router;