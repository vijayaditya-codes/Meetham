import { Response, NextFunction } from 'express';
import * as assignmentsService from './delivery-assignments.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { DeliveryStatus } from '@prisma/client';

export async function acceptAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const assignment = await assignmentsService.acceptAssignment(id as string, userId);
    res.status(200).json({
      status: 'success',
      message: 'Delivery assignment accepted.',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAssignmentStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status, otpForDropoff } = req.body;
    const assignment = await assignmentsService.updateAssignmentStatus(
      id as string,
      userId,
      status as DeliveryStatus,
      otpForDropoff
    );
    res.status(200).json({
      status: 'success',
      message: `Delivery status updated to ${status}.`,
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
}
