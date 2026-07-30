import { prisma } from '../../config/db';
import { ListingStatus, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';
import { toDecimal } from '../../utils/decimal-helpers';

export async function createListing(ownerId: string, data: {
  restaurantId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  quantityTotal: number;
  expiresAt: string;
}) {
  // Verify restaurant ownership
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: data.restaurantId },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant not found.');
  }

  if (restaurant.ownerId !== ownerId) {
    throw new ForbiddenError('You can only create listings for your own restaurant.');
  }

  const listing = await prisma.listing.create({
    data: {
      restaurantId: data.restaurantId,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      category: data.category,
      originalPrice: toDecimal(data.originalPrice),
      discountedPrice: toDecimal(data.discountedPrice),
      quantityTotal: data.quantityTotal,
      quantityLeft: data.quantityTotal,
      expiresAt: new Date(data.expiresAt),
      status: ListingStatus.ACTIVE,
    },
  });

  return listing;
}

export async function getListingById(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  return listing;
}

export async function updateListing(
  id: string,
  ownerId: string,
  data: {
    title?: string;
    description?: string;
    imageUrl?: string;
    category?: string;
    originalPrice?: number;
    discountedPrice?: number;
    quantityTotal?: number;
    quantityLeft?: number;
    expiresAt?: string;
    status?: ListingStatus;
  }
) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  if (listing.restaurant.ownerId !== ownerId) {
    throw new ForbiddenError('You do not have permission to edit this listing.');
  }

  const updateData: any = { ...data };
  if (data.originalPrice !== undefined) updateData.originalPrice = toDecimal(data.originalPrice);
  if (data.discountedPrice !== undefined) updateData.discountedPrice = toDecimal(data.discountedPrice);
  if (data.expiresAt !== undefined) updateData.expiresAt = new Date(data.expiresAt);

  const updatedListing = await prisma.listing.update({
    where: { id },
    data: updateData,
  });

  return updatedListing;
}

export async function deleteListing(id: string, ownerId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found.');
  }

  if (listing.restaurant.ownerId !== ownerId) {
    throw new ForbiddenError('You do not have permission to delete this listing.');
  }

  // Soft delete by setting status to DELISTED or hard delete. Let's do soft delete.
  const delistedListing = await prisma.listing.update({
    where: { id },
    data: { status: ListingStatus.DELISTED },
  });

  return delistedListing;
}

export async function searchListings(filters: {
  lat?: number;
  lng?: number;
  radius?: number;
  category?: string;
  search?: string;
}) {
  const { lat, lng, radius = 10, category, search } = filters;

  const whereClauses: Prisma.Sql[] = [
    Prisma.sql`l.status = 'ACTIVE'`,
    Prisma.sql`l."expiresAt" > NOW()`,
    Prisma.sql`l."quantityLeft" > 0`,
  ];

  if (category) {
    whereClauses.push(Prisma.sql`l.category = ${category}`);
  }

  if (search) {
    whereClauses.push(
      Prisma.sql`(l.title ILIKE ${`%${search}%`} OR l.description ILIKE ${`%${search}%`})`
    );
  }

  let query: Prisma.Sql;

  if (lat !== undefined && lng !== undefined) {
    // Haversine formula calculation
    const distanceSql = Prisma.sql`
      (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(${lat})) * cos(radians(r.latitude)) * cos(radians(r.longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(r.latitude))
        ))
      ))
    `;

    whereClauses.push(Prisma.sql`${distanceSql} <= ${radius}`);

    query = Prisma.sql`
      SELECT 
        l.*,
        r.name as "restaurantName",
        r.address as "restaurantAddress",
        ${distanceSql} as "distanceKm"
      FROM listings l
      JOIN restaurants r ON l."restaurantId" = r.id
      WHERE ${Prisma.join(whereClauses, ' AND ')}
      ORDER BY l."expiresAt" ASC
    `;
  } else {
    query = Prisma.sql`
      SELECT 
        l.*,
        r.name as "restaurantName",
        r.address as "restaurantAddress",
        NULL as "distanceKm"
      FROM listings l
      JOIN restaurants r ON l."restaurantId" = r.id
      WHERE ${Prisma.join(whereClauses, ' AND ')}
      ORDER BY l."expiresAt" ASC
    `;
  }

  const results = await prisma.$queryRaw<any[]>(query);
  return results;
}

export async function getListingsByRestaurant(restaurantId: string, includeInactive: boolean) {
  return prisma.listing.findMany({
    where: {
      restaurantId,
      ...(includeInactive ? {} : { status: ListingStatus.ACTIVE, expiresAt: { gt: new Date() } }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Decrement listing stock transactionally
 * Used in checkout schema to ensure concurrency protection
 */
export async function decrementStockTransaction(
  tx: Prisma.TransactionClient,
  listingId: string,
  quantity: number
) {
  const listing = await tx.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new NotFoundError(`Listing ${listingId} not found.`);
  }

  if (listing.status !== ListingStatus.ACTIVE || listing.expiresAt <= new Date()) {
    throw new BadRequestError(`Listing "${listing.title}" is no longer active.`);
  }

  if (listing.quantityLeft < quantity) {
    throw new BadRequestError(`Only ${listing.quantityLeft} left of "${listing.title}".`);
  }

  const updatedListing = await tx.listing.update({
    where: { id: listingId },
    data: {
      quantityLeft: {
        decrement: quantity,
      },
      status: listing.quantityLeft - quantity === 0 ? ListingStatus.SOLD_OUT : ListingStatus.ACTIVE,
    },
  });

  return updatedListing;
}
