import { Response, NextFunction } from 'express';
import * as cartService from './cart.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function getCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const cartItems = await cartService.getCart(userId);
    res.status(200).json({
      status: 'success',
      data: { cartItems },
    });
  } catch (error) {
    next(error);
  }
}

export async function addItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { listingId, quantity } = req.body;
    const cartItem = await cartService.addItem(userId, listingId, quantity);
    res.status(200).json({
      status: 'success',
      data: { cartItem },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { listingId } = req.params;
    const { quantity } = req.body;
    const cartItem = await cartService.updateItem(userId, listingId as string, quantity);
    res.status(200).json({
      status: 'success',
      data: { cartItem },
    });
  } catch (error) {
    next(error);
  }
}

export async function removeItem(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { listingId } = req.params;
    await cartService.removeItem(userId, listingId as string);
    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart.',
    });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    await cartService.clearCart(userId);
    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully.',
    });
  } catch (error) {
    next(error);
  }
}
