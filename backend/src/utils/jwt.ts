import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';

export const generateToken = (userId: string, username: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn: StringValue | number = (process.env.JWT_EXPIRES_IN || '7d') as StringValue;

  return jwt.sign({ userId, username }, secret, { expiresIn });
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.verify(token, secret);
};
