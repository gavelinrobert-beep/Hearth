import jwt from 'jsonwebtoken';

export const generateToken = (userId: string, username: string): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ userId, username }, secret, { expiresIn });
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return jwt.verify(token, secret);
};
