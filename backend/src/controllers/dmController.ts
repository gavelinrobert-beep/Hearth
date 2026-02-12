import { Request, Response } from 'express';
import prisma from '../config/database';

export const getDirectMessages = async (req: Request, res: Response) => {
  try {
    const { userId: otherUserId } = req.params;
    const userId = req.user?.userId;
    const { limit = '50', before } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        ...(before && {
          createdAt: {
            lt: new Date(before as string),
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get direct messages error:', error);
    res.status(500).json({ error: 'Failed to get direct messages' });
  }
};

export const sendDirectMessage = async (req: Request, res: Response) => {
  try {
    const { userId: receiverId } = req.params;
    const { content } = req.body;
    const senderId = req.user?.userId;

    if (!senderId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Message content required' });
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send direct message error:', error);
    res.status(500).json({ error: 'Failed to send direct message' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.receiverId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedMessage = await prisma.directMessage.update({
      where: { id: messageId },
      data: { read: true },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
};
