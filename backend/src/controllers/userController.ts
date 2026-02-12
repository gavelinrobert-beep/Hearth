import { Request, Response } from 'express';
import prisma from '../config/database';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    const users = await prisma.user.findMany({
      where: search
        ? {
            username: {
              contains: search as string,
              mode: 'insensitive',
            },
          }
        : undefined,
      select: {
        id: true,
        username: true,
        avatar: true,
        status: true,
      },
      take: 20,
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;
    const { username, avatar, status } = req.body;

    if (!currentUserId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (userId !== currentUserId) {
      res.status(403).json({ error: 'Can only update own profile' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(username && { username }),
        ...(avatar !== undefined && { avatar }),
        ...(status && { status }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        status: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
