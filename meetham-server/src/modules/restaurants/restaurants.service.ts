import { prisma } from '../../config/db';
import { RestaurantStatus, Role, Prisma } from '@prisma/client';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../utils/errors';

export async function createRestaurant(ownerId: string, data: {
  name: string;
  description?: string;
  cuisineTags?: string[];
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  gstNumber?: string;
  fssaiLicense?: string;
}) {
  // Check if owner already has a restaurant
  const existing = await prisma.restaurant.findUnique({
    where: { ownerId },
  });

  if (existing) {
    throw new BadRequestError('User already owns a restaurant profile.');
  }

  // Create restaurant in transaction, update user role to RESTAURANT
  return prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        ownerId,
        name: data.name,
        description: data.description,
        cuisineTags: data.cuisineTags || [],
        address: data.address,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        gstNumber: data.gstNumber,
        fssaiLicense: data.fssaiLicense,
        status: RestaurantStatus.PENDING,
      },
    });

    await tx.user.update({
      where: { id: ownerId },
      data: { role: Role.RESTAURANT },
    });

    return restaurant;
  });
}

export async function getRestaurantById(id: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant profile not found.');
  }

  return restaurant;
}

export async function updateRestaurant(
  id: string,
  ownerId: string,
  data: {
    name?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    cuisineTags?: string[];
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    gstNumber?: string;
    fssaiLicense?: string;
    isOpen?: boolean;
  }
) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant profile not found.');
  }

  if (restaurant.ownerId !== ownerId) {
    throw new ForbiddenError('You do not have permission to edit this restaurant profile.');
  }

  return prisma.restaurant.update({
    where: { id },
    data,
  });
}

export async function updateRestaurantStatus(id: string, status: RestaurantStatus) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id },
  });

  if (!restaurant) {
    throw new NotFoundError('Restaurant profile not found.');
  }

  return prisma.restaurant.update({
    where: { id },
    data: { status },
  });
}

export async function getRestaurants(filters: {
  city?: string;
  cuisine?: string;
  search?: string;
  lat?: number;
  lng?: number;
  radius?: number;
}) {
  const { city, cuisine, search, lat, lng, radius = 10 } = filters;

  const whereClauses: Prisma.Sql[] = [Prisma.sql`status = 'APPROVED'`];

  if (city) {
    whereClauses.push(Prisma.sql`city ILIKE ${city}`);
  }

  if (cuisine) {
    whereClauses.push(Prisma.sql`${cuisine} = ANY("cuisineTags")`);
  }

  if (search) {
    whereClauses.push(Prisma.sql`(name ILIKE ${`%${search}%`} OR description ILIKE ${`%${search}%`})`);
  }

  let query: Prisma.Sql;

  if (lat !== undefined && lng !== undefined) {
    const distanceSql = Prisma.sql`
      (6371 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(latitude))
        ))
      ))
    `;

    whereClauses.push(Prisma.sql`${distanceSql} <= ${radius}`);

    query = Prisma.sql`
      SELECT 
        *,
        ${distanceSql} as "distanceKm"
      FROM restaurants
      WHERE ${Prisma.join(whereClauses, ' AND ')}
      ORDER BY "distanceKm" ASC
    `;
  } else {
    query = Prisma.sql`
      SELECT 
        *,
        NULL as "distanceKm"
      FROM restaurants
      WHERE ${Prisma.join(whereClauses, ' AND ')}
      ORDER BY name ASC
    `;
  }

  const results = await prisma.$queryRaw<any[]>(query);
  return results;
}

export async function getRestaurantReviews(restaurantId: string) {
  const reviews = await prisma.review.findMany({
    where: { restaurantId },
    include: {
      customer: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return reviews;
}
