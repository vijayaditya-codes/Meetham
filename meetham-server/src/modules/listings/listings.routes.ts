import { Router } from 'express';
import * as listingsController from './listings.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import { createListingSchema, updateListingSchema, queryListingsSchema } from './listings.schema';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', validateQuery(queryListingsSchema), listingsController.searchListings);
router.get('/:id', listingsController.getListingById);
router.get('/restaurant/:restaurantId', listingsController.getListingsByRestaurant);

// Protected routes (vendor and admin)
router.post(
  '/',
  authenticate,
  authorize(Role.RESTAURANT, Role.ADMIN),
  validateBody(createListingSchema),
  listingsController.createListing
);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.RESTAURANT, Role.ADMIN),
  validateBody(updateListingSchema),
  listingsController.updateListing
);

router.delete(
  '/:id',
  authenticate,
  authorize(Role.RESTAURANT, Role.ADMIN),
  listingsController.deleteListing
);

export default router;
