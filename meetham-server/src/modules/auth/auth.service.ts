import { prisma } from '../../config/db';
import { verifyFirebaseToken } from '../../config/firebase';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { ConflictError, BadRequestError, UnauthorizedError } from '../../utils/errors';
import { TokenPayload } from '../../middleware/auth';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-for-meetham-12345';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-for-meetham-12345';
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const JWT_REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '7d';

export async function register(data: {
  email: string;
  password?: string;
  name: string;
  role: Role;
  phone?: string;
  firebaseUid?: string;
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('A user with this email address already exists.');
  }

  let passwordHash: string | undefined;
  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 12);
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      phone: data.phone,
      passwordHash,
      firebaseUid: data.firebaseUid,
      isVerified: !!data.firebaseUid, // Automatically verify if using third-party Firebase auth
    },
  });

  return user;
}

export async function login(email: string, passwordHashAttempt: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const isValidPassword = await bcrypt.compare(passwordHashAttempt, user.passwordHash);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  return user;
}

export function generateTokens(user: { id: string; email: string; role: Role; name: string }) {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };

  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
}

export async function refresh(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
    
    // Check if user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new UnauthorizedError('User no longer exists.');
    }

    return generateTokens(user);
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired refresh token.');
  }
}

export async function handleFirebaseCallback(idToken: string, requestedRole: Role) {
  // Verify Firebase token
  const firebaseUser = await verifyFirebaseToken(idToken);

  // Find user by Firebase UID or email
  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { firebaseUid: firebaseUser.uid },
        { email: firebaseUser.email },
      ],
    },
  });

  if (!user) {
    // Create a new user with verified email
    user = await prisma.user.create({
      data: {
        email: firebaseUser.email,
        name: firebaseUser.name,
        role: requestedRole,
        firebaseUid: firebaseUser.uid,
        isVerified: true,
      },
    });
  } else if (!user.firebaseUid) {
    // Link existing email account to firebase
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firebaseUid: firebaseUser.uid,
        isVerified: true,
      },
    });
  }

  return user;
}
