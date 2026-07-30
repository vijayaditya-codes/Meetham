import { Router } from 'express';
import * as paymentsController from './payments.controller';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { createIntentSchema, webhookSchema } from './payments.schema';

const router = Router();

// Protected intent route
router.post('/create-intent', authenticate, validateBody(createIntentSchema), paymentsController.createPaymentIntent);

// Public webhook route (for gateway callbacks)
router.post('/webhook', validateBody(webhookSchema), paymentsController.verifyWebhook);

export default router;
