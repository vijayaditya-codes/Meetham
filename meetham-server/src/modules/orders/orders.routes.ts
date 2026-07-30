import { Router } from 'express';
import * as ordersController from './orders.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { checkoutSchema, updateStatusSchema, verifyPickupSchema } from './orders.schema';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', ordersController.getOrders);
router.get('/:id', ordersController.getOrderById);
router.get('/:id/track', ordersController.getOrderTracking);
router.post('/cancel/:id', ordersController.cancelOrder); // POST /orders/cancel/:id or POST /orders/:id/cancel. Let's support both or match roadmap: POST /orders/:id/cancel. Let's make it router.post('/:id/cancel')
router.post('/:id/cancel', ordersController.cancelOrder);

// Customer checkout
router.post('/checkout', authorize(Role.CUSTOMER), validateBody(checkoutSchema), ordersController.checkout);

// Restaurant management
router.patch('/:id/status', authorize(Role.RESTAURANT), validateBody(updateStatusSchema), ordersController.updateOrderStatus);
router.post('/:id/verify-pickup', authorize(Role.RESTAURANT), validateBody(verifyPickupSchema), ordersController.verifyPickupCode);

export default router;
