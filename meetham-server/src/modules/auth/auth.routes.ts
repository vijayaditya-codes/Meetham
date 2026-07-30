import { Router } from 'express';
import * as authController from './auth.controller';
import { validateBody } from '../../middleware/validate';
import { registerSchema, loginSchema, firebaseCallbackSchema } from './auth.schema';
import { rateLimiter } from '../../middleware/rate-limiter';

const router = Router();

const authRateLimit = rateLimiter(15 * 60 * 1000, 20, 'Too many auth attempts, please try again after 15 minutes.');

router.post('/register', authRateLimit, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimit, validateBody(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/logout', authController.logout);
router.post('/firebase-callback', authRateLimit, validateBody(firebaseCallbackSchema), authController.firebaseCallback);

export default router;
