import { Router } from 'express';
import * as partnersController from './delivery-partners.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { applyPartnerSchema, updateAvailabilitySchema, updateLocationSchema } from './delivery-partners.schema';
import { Role } from '@prisma/client';

const router = Router();

// Apply is open to any authenticated user
router.post('/apply', authenticate, validateBody(applyPartnerSchema), partnersController.apply);

// Active partner management endpoints
router.patch(
  '/me/availability',
  authenticate,
  authorize(Role.DELIVERY_PARTNER, Role.ADMIN),
  validateBody(updateAvailabilitySchema),
  partnersController.updateAvailability
);

router.patch(
  '/me/location',
  authenticate,
  authorize(Role.DELIVERY_PARTNER, Role.ADMIN),
  validateBody(updateLocationSchema),
  partnersController.updateLocation
);

router.get(
  '/me/assignments',
  authenticate,
  authorize(Role.DELIVERY_PARTNER, Role.ADMIN),
  partnersController.getAssignments
);

export default router;
