import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.register(req.body);
    const { accessToken, refreshToken } = authService.generateTokens(user);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(211).json({ // We can use 201 Created or 200, let's use 201
      status: 'success',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const user = await authService.login(email, password);
    const { accessToken, refreshToken } = authService.generateTokens(user);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Refresh token is required.',
      });
      return;
    }

    const { accessToken, refreshToken } = await authService.refresh(token);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
}

export async function firebaseCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { idToken, role } = req.body;
    const user = await authService.handleFirebaseCallback(idToken, role);
    const { accessToken, refreshToken } = authService.generateTokens(user);

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          phone: user.phone,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
