import { Request, Response } from 'express';
import prisma from '../config/database';

export const createChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, type, serverId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if user is server owner
    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    if (server.ownerId !== userId) {
      res.status(403).json({ error: 'Only server owner can create channels' });
      return;
    }

    const channel = await prisma.channel.create({
      data: {
        name,
        type: type || 'text',
        serverId,
      },
    });

    res.status(201).json(channel);
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ error: 'Failed to create channel' });
  }
};

export const getChannelById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

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
      include: {
        server: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    res.json(channel);
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ error: 'Failed to get channel' });
  }
};

export const updateChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const { name } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        server: true,
      },
    });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    if (channel.server.ownerId !== userId) {
      res.status(403).json({ error: 'Only server owner can update channels' });
      return;
    }

    const updatedChannel = await prisma.channel.update({
      where: { id: channelId },
      data: { name },
    });

    res.json(updatedChannel);
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({ error: 'Failed to update channel' });
  }
};

export const deleteChannel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channelId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        server: true,
      },
    });

    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }

    if (channel.server.ownerId !== userId) {
      res.status(403).json({ error: 'Only server owner can delete channels' });
      return;
    }

    await prisma.channel.delete({
      where: { id: channelId },
    });

    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ error: 'Failed to delete channel' });
  }
};
