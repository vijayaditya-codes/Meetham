import { Request, Response, NextFunction } from 'express';
import * as adminService from './admin.service';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      status: 'success',
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPendingRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const pending = await adminService.getPendingRestaurants();
    res.status(200).json({
      status: 'success',
      results: pending.length,
      data: { restaurants: pending },
    });
  } catch (error) {
    next(error);
  }
}

export async function approveRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurant = await adminService.approveRestaurant(req.params.id as string);
    res.status(200).json({
      status: 'success',
      message: 'Restaurant approved successfully.',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
}

export async function suspendRestaurant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurant = await adminService.suspendRestaurant(req.params.id as string);
    res.status(200).json({
      status: 'success',
      message: 'Restaurant suspended successfully.',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
}

export async function getPayouts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const payouts = await adminService.getPayouts();
    res.status(200).json({
      status: 'success',
      results: payouts.length,
      data: { payouts },
    });
  } catch (error) {
    next(error);
  }
}

export async function processPayout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { restaurantId } = req.params;
    const { amount, periodStart, periodEnd } = req.body;
    const payout = await adminService.processPayout(restaurantId as string, amount, periodStart, periodEnd);
    res.status(201).json({
      status: 'success',
      message: 'Payout processed successfully.',
      data: { payout },
    });
  } catch (error) {
    next(error);
  }
}
