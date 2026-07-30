import { Router } from 'express';
import * as cartController from './cart.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { addToCartSchema, updateCartItemSchema } from './cart.schema';
import { Role } from '@prisma/client';

const router = Router();

// All cart endpoints are customer-restricted
router.use(authenticate, authorize(Role.CUSTOMER));

router.get('/', cartController.getCart);
router.post('/items', validateBody(addToCartSchema), cartController.addItem);
router.patch('/items/:listingId', validateBody(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:listingId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
