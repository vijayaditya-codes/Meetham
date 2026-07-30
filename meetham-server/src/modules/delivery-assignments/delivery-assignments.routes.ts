import { Router } from 'express';
import * as assignmentsController from './delivery-assignments.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { updateAssignmentStatusSchema } from './delivery-assignments.schema';
import { Role } from '@prisma/client';

const router = Router();

// All routes require delivery partner or admin role
router.use(authenticate, authorize(Role.DELIVERY_PARTNER, Role.ADMIN));

router.post('/:id/accept', assignmentsController.acceptAssignment);
router.patch('/:id/status', validateBody(updateAssignmentStatusSchema), assignmentsController.updateAssignmentStatus);

export default router;
