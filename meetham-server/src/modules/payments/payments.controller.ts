import { Request, Response, NextFunction } from 'express';
import * as paymentsService from './payments.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function createPaymentIntent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { orderId } = req.body;
    const paymentDetails = await paymentsService.createPaymentIntent(userId, orderId);
    res.status(200).json({
      status: 'success',
      data: paymentDetails,
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updatedOrder = await paymentsService.verifyWebhook(req.body);
    res.status(200).json({
      status: 'success',
      message: 'Payment verified and status updated.',
      data: { order: updatedOrder },
    });
  } catch (error) {
    next(error);
  }
}
