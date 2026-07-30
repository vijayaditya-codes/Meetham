import { Request, Response, NextFunction } from 'express';
import * as couponsService from './coupons.service';

export async function validateCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const code = String(req.query.code);
    const orderTotal = Number(req.query.orderTotal);
    const result = await couponsService.validateCoupon(code, orderTotal);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function createCoupon(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coupon = await couponsService.createCoupon(req.body);
    res.status(201).json({
      status: 'success',
      data: { coupon },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCoupons(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const coupons = await couponsService.getCoupons();
    res.status(200).json({
      status: 'success',
      results: coupons.length,
      data: { coupons },
    });
  } catch (error) {
    next(error);
  }
}
