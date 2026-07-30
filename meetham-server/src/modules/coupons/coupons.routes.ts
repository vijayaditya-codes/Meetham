import { Router } from 'express';
import * as couponsController from './coupons.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import { createCouponSchema, validateCouponQuerySchema } from './coupons.schema';
import { Role } from '@prisma/client';

const router = Router();

// Validation is accessible to customers
router.get('/validate', validateQuery(validateCouponQuerySchema), couponsController.validateCoupon);

// Admin coupon management
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  validateBody(createCouponSchema),
  couponsController.createCoupon
);

router.get(
  '/',
  authenticate,
  authorize(Role.ADMIN),
  couponsController.getCoupons
);

export default router;
