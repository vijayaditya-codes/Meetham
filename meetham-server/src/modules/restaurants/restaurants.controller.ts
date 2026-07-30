import { Request, Response, NextFunction } from 'express';
import * as restaurantsService from './restaurants.service';
import { AuthenticatedRequest } from '../../middleware/auth';
import { RestaurantStatus } from '@prisma/client';

export async function createRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ownerId = req.user!.userId;
    const restaurant = await restaurantsService.createRestaurant(ownerId, req.body);
    res.status(201).json({
      status: 'success',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const restaurant = await restaurantsService.getRestaurantById(req.params.id as string);
    res.status(200).json({
      status: 'success',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ownerId = req.user!.userId;
    const restaurant = await restaurantsService.updateRestaurant(req.params.id as string, ownerId, req.body);
    res.status(200).json({
      status: 'success',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateRestaurantStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body;
    const restaurant = await restaurantsService.updateRestaurantStatus(req.params.id as string, status as RestaurantStatus);
    res.status(200).json({
      status: 'success',
      data: { restaurant },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { city, cuisine, search, lat, lng, radius } = req.query;

    const restaurants = await restaurantsService.getRestaurants({
      city: city ? String(city) : undefined,
      cuisine: cuisine ? String(cuisine) : undefined,
      search: search ? String(search) : undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radius: radius ? Number(radius) : undefined,
    });

    res.status(200).json({
      status: 'success',
      results: restaurants.length,
      data: { restaurants },
    });
  } catch (error) {
    next(error);
  }
}

export async function getRestaurantReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reviews = await restaurantsService.getRestaurantReviews(req.params.id as string);
    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
}
