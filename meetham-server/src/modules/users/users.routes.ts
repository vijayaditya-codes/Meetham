import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { updateProfileSchema, createAddressSchema, updateAddressSchema } from './users.schema';
import * as usersController from './users.controller';

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.patch('/me', validateBody(updateProfileSchema), usersController.updateMe);
router.get('/me/addresses', usersController.getAddresses);
router.post('/me/addresses', validateBody(createAddressSchema), usersController.createAddress);
router.patch('/me/addresses/:id', validateBody(updateAddressSchema), usersController.updateAddress);
router.delete('/me/addresses/:id', usersController.deleteAddress);

export default router;
