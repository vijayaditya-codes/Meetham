import { Router } from 'express';
import * as reviewsController from './reviews.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createReviewSchema } from './reviews.schema';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticate,
  authorize(Role.CUSTOMER),
  validateBody(createReviewSchema),
  reviewsController.createReview
);

export default router;
