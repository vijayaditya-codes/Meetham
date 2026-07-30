import { Response, NextFunction } from 'express';
import * as partnersService from './delivery-partners.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { PartnerAvailability } from '@prisma/client';

export async function apply(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const partner = await partnersService.apply(userId, req.body);
    res.status(201).json({
      status: 'success',
      data: { partner },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { availability } = req.body;
    const partner = await partnersService.updateAvailability(userId, availability as PartnerAvailability);
    res.status(200).json({
      status: 'success',
      data: { partner },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateLocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { lat, lng } = req.body;
    const partner = await partnersService.updateLocation(userId, lat, lng);
    res.status(200).json({
      status: 'success',
      data: { partner },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const assignments = await partnersService.getAssignments(userId);
    res.status(200).json({
      status: 'success',
      results: assignments.length,
      data: { assignments },
    });
  } catch (error) {
    next(error);
  }
}
