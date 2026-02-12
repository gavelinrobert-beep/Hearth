import { Request, Response } from 'express';
import prisma from '../config/database';
import { moderateContent } from '../services/aiModeration';

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const { limit = '50', before } = req.query;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user has access to channel
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        server: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: {
        channelId,
        ...(before && {
          createdAt: {
            lt: new Date(before as string),
          },
        }),
      },
      include: {
        user: {
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
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
};

export const createMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;
    const userId = req.user?.userId;
    const file = req.file;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!content && !file) {
      res.status(400).json({ error: 'Message content or file required' });
      return;
    }

    // Check if user has access to channel
    const channel = await prisma.channel.findFirst({
      where: {
        id: channelId,
        server: {
          members: {
            some: {
              userId,
            },
          },
        },
      },
    });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    // Moderate content with AI
    const moderationResult = content ? await moderateContent(content) : { shouldBlock: false };

    const message = await prisma.message.create({
      data: {
        content: content || '',
        userId,
        channelId,
        fileUrl: file ? `/uploads/${file.filename}` : null,
        moderated: moderationResult.shouldBlock,
      },
      include: {
        user: {
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
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        channel: {
          include: {
            server: true,
          },
        },
      },
    });

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    // Only message author or server owner can delete
    if (message.userId !== userId && message.channel.server.ownerId !== userId) {
      res.status(403).json({ error: 'Not authorized to delete this message' });
      return;
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
};
