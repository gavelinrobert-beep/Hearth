import { Request, Response } from 'express';
import prisma from '../config/database';

export const createServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const server = await prisma.server.create({
      data: {
        name,
        icon,
        ownerId: userId,
        members: {
          create: {
            userId,
          },
        },
        channels: {
          create: {
            name: 'general',
            type: 'text',
          },
        },
      },
      include: {
        channels: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(server);
  } catch (error) {
    console.error('Create server error:', error);
    res.status(500).json({ error: 'Failed to create server' });
  }
};

export const getServers = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const servers = await prisma.server.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        channels: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json(servers);
  } catch (error) {
    console.error('Get servers error:', error);
    res.status(500).json({ error: 'Failed to get servers' });
  }
};

export const getServerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const server = await prisma.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        channels: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
            role: true,
          },
        },
        roles: true,
      },
    });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    res.json(server);
  } catch (error) {
    console.error('Get server error:', error);
    res.status(500).json({ error: 'Failed to get server' });
  }
};

export const updateServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const { name, icon } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    if (server.ownerId !== userId) {
      res.status(403).json({ error: 'Only server owner can update' });
      return;
    }

    const updatedServer = await prisma.server.update({
      where: { id: serverId },
      data: { name, icon },
      include: {
        channels: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedServer);
  } catch (error) {
    console.error('Update server error:', error);
    res.status(500).json({ error: 'Failed to update server' });
  }
};

export const deleteServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    if (server.ownerId !== userId) {
      res.status(403).json({ error: 'Only server owner can delete' });
      return;
    }

    await prisma.server.delete({
      where: { id: serverId },
    });

    res.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Delete server error:', error);
    res.status(500).json({ error: 'Failed to delete server' });
  }
};

export const joinServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    const existingMember = await prisma.serverMember.findUnique({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
    });

    if (existingMember) {
      res.status(400).json({ error: 'Already a member' });
      return;
    }

    await prisma.serverMember.create({
      data: {
        userId,
        serverId,
      },
    });

    const updatedServer = await prisma.server.findUnique({
      where: { id: serverId },
      include: {
        channels: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedServer);
  } catch (error) {
    console.error('Join server error:', error);
    res.status(500).json({ error: 'Failed to join server' });
  }
};

export const leaveServer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serverId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      res.status(404).json({ error: 'Server not found' });
      return;
    }

    if (server.ownerId === userId) {
      res.status(400).json({ error: 'Owner cannot leave server' });
      return;
    }

    await prisma.serverMember.delete({
      where: {
        userId_serverId: {
          userId,
          serverId,
        },
      },
    });

    res.json({ message: 'Left server successfully' });
  } catch (error) {
    console.error('Leave server error:', error);
    res.status(500).json({ error: 'Failed to leave server' });
  }
};
