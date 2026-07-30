import { Response, NextFunction } from 'express';
import * as reviewsService from './reviews.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function createReview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const review = await reviewsService.createReview(userId, req.body);
    res.status(201).json({
      status: 'success',
      data: { review },
    });
  } catch (error) {
    next(error);
  }
}
