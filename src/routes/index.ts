import { Router } from 'express';
import authRoutes from './auth.routes.js';
import propertyRoutes from './property.routes.js';
import reviewRoutes from './review.routes.js';
import flagRoutes from './flag.routes.js';
import neighborhoodRoutes from './neighborhood.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/reviews', reviewRoutes);
router.use('/flags', flagRoutes);
router.use('/neighborhood', neighborhoodRoutes);

export default router;