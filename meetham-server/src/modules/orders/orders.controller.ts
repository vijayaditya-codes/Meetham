import { Response, NextFunction } from 'express';
import * as ordersService from './orders.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { OrderStatus } from '@prisma/client';

export async function checkout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const order = await ordersService.checkout(userId, req.body);
    res.status(201).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const orders = await ordersService.getOrders(userId, role);
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const order = await ordersService.getOrderById(req.params.id as string, userId, role);
    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { status } = req.body;
    const order = await ordersService.updateOrderStatus(req.params.id as string, userId, status as OrderStatus);
    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPickupCode(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { pickupCode } = req.body;
    const order = await ordersService.verifyPickupCode(req.params.id as string, userId, pickupCode);
    res.status(200).json({
      status: 'success',
      message: 'Pickup verified. Order completed successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function cancelOrder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const order = await ordersService.cancelOrder(req.params.id as string, userId, role);
    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}

export async function getOrderTracking(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const order = await ordersService.getOrderTracking(req.params.id as string, userId);
    res.status(200).json({
      status: 'success',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
}
