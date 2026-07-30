import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '../middleware/auth';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-for-meetham-12345';

export function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (!token || typeof token !== 'string') {
    next(new Error('Authentication error: Token is required.'));
    return;
  }

  try {
    const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const decoded = jwt.verify(cleanToken, JWT_ACCESS_SECRET) as TokenPayload;
    
    // Attach decoded user data to the socket object
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token.'));
  }
}
