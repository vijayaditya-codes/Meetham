import { Request, Response, NextFunction } from 'express';
import * as listingsService from './listings.service';
import { AuthenticatedRequest } from '../../middleware/auth';

export async function createListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ownerId = req.user!.userId;
    const listing = await listingsService.createListing(ownerId, req.body);
    res.status(201).json({
      status: 'success',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
}

export async function getListingById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const listing = await listingsService.getListingById(req.params.id as string);
    res.status(200).json({
      status: 'success',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ownerId = req.user!.userId;
    const listing = await listingsService.updateListing(req.params.id as string, ownerId, req.body);
    res.status(200).json({
      status: 'success',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteListing(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const ownerId = req.user!.userId;
    await listingsService.deleteListing(req.params.id as string, ownerId);
    res.status(200).json({
      status: 'success',
      message: 'Listing delisted successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function searchListings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { lat, lng, radius, category, search } = req.query;

    const listings = await listingsService.searchListings({
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      radius: radius ? Number(radius) : undefined,
      category: category ? String(category) : undefined,
      search: search ? String(search) : undefined,
    });

    res.status(200).json({
      status: 'success',
      results: listings.length,
      data: { listings },
    });
  } catch (error) {
    next(error);
  }
}

export async function getListingsByRestaurant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { restaurantId } = req.params;
    const includeInactive = req.query.includeInactive === 'true';

    // Inactive listings can only be viewed by the owner/admin. Let's do a basic check
    const listings = await listingsService.getListingsByRestaurant(restaurantId as string, includeInactive);
    res.status(200).json({
      status: 'success',
      results: listings.length,
      data: { listings },
    });
  } catch (error) {
    next(error);
  }
}
