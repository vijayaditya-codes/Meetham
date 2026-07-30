import { Router } from 'express';
import * as adminController from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { processPayoutSchema } from './admin.schema';
import { Role } from '@prisma/client';

const router = Router();

// Protect all admin endpoints
router.use(authenticate, authorize(Role.ADMIN));

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/restaurants/pending', adminController.getPendingRestaurants);
router.patch('/restaurants/:id/approve', adminController.approveRestaurant);
router.patch('/restaurants/:id/suspend', adminController.suspendRestaurant);
router.get('/payouts', adminController.getPayouts);
router.post('/payouts/:restaurantId/process', validateBody(processPayoutSchema), adminController.processPayout);

export default router;
