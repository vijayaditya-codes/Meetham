import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import * as usersService from './users.service';

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getProfile(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateProfile(req.user!.userId, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function getAddresses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const addresses = await usersService.getAddresses(req.user!.userId);
    res.json({ success: true, data: addresses });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const address = await usersService.createAddress(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
}

export async function updateAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const address = await usersService.updateAddress(req.user!.userId, req.params.id as string, req.body);
    res.json({ success: true, data: address });
  } catch (err) {
    next(err);
  }
}

export async function deleteAddress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await usersService.deleteAddress(req.user!.userId, req.params.id as string);
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
}
