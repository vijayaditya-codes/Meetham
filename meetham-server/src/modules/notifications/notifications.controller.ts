import { Response, NextFunction } from 'express';
import * as notificationsService from './notifications.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const notifications = await notificationsService.getNotifications(userId);
    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    await notificationsService.markAsRead(id as string, userId);
    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.',
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    await notificationsService.markAllAsRead(userId);
    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
}
