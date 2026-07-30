import { Router } from 'express';
import * as restaurantsController from './restaurants.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createRestaurantSchema, updateRestaurantSchema, updateRestaurantStatusSchema } from './restaurants.schema';
import { Role } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', restaurantsController.getRestaurants);
router.get('/:id', restaurantsController.getRestaurantById);
router.get('/:id/reviews', restaurantsController.getRestaurantReviews);

// Protected routes (owner applies or edits, admin manages status)
router.post('/', authenticate, validateBody(createRestaurantSchema), restaurantsController.createRestaurant);

router.patch(
  '/:id',
  authenticate,
  authorize(Role.RESTAURANT, Role.ADMIN),
  validateBody(updateRestaurantSchema),
  restaurantsController.updateRestaurant
);

router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.ADMIN),
  validateBody(updateRestaurantStatusSchema),
  restaurantsController.updateRestaurantStatus
);

export default router;
