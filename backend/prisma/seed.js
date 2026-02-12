const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * Database Seeding Script
 * Creates sample data for development and testing
 */

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create sample users
    console.log('Creating users...');
    const passwordHash = await bcrypt.hash('password123', 10);

    const alice = await prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        username: 'alice',
        email: 'alice@example.com',
        password: passwordHash,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        status: 'online',
      },
    });

    const bob = await prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        username: 'bob',
        email: 'bob@example.com',
        password: passwordHash,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        status: 'online',
      },
    });

    const charlie = await prisma.user.upsert({
      where: { email: 'charlie@example.com' },
      update: {},
      create: {
        username: 'charlie',
        email: 'charlie@example.com',
        password: passwordHash,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
        status: 'offline',
      },
    });

    console.log('✓ Created 3 users');

    // Create sample servers
    console.log('Creating servers...');

    const server1 = await prisma.server.create({
      data: {
        name: 'General Community',
        icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=general',
        ownerId: alice.id,
      },
    });

    const server2 = await prisma.server.create({
      data: {
        name: 'Gaming Hub',
        icon: 'https://api.dicebear.com/7.x/shapes/svg?seed=gaming',
        ownerId: bob.id,
      },
    });

    console.log('✓ Created 2 servers');

    // Create default roles
    console.log('Creating roles...');

    const adminRole1 = await prisma.role.create({
      data: {
        name: 'Admin',
        serverId: server1.id,
        permissions: ['MANAGE_SERVER', 'MANAGE_CHANNELS', 'MANAGE_ROLES', 'KICK_MEMBERS', 'BAN_MEMBERS'],
        color: '#FF0000',
      },
    });

    const memberRole1 = await prisma.role.create({
      data: {
        name: 'Member',
        serverId: server1.id,
        permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
        color: '#00FF00',
      },
    });

    const adminRole2 = await prisma.role.create({
      data: {
        name: 'Admin',
        serverId: server2.id,
        permissions: ['MANAGE_SERVER', 'MANAGE_CHANNELS', 'MANAGE_ROLES'],
        color: '#0000FF',
      },
    });

    console.log('✓ Created roles');

    // Add members to servers
    console.log('Adding server members...');

    await prisma.serverMember.create({
      data: {
        userId: alice.id,
        serverId: server1.id,
        roleId: adminRole1.id,
      },
    });

    await prisma.serverMember.create({
      data: {
        userId: bob.id,
        serverId: server1.id,
        roleId: memberRole1.id,
      },
    });

    await prisma.serverMember.create({
      data: {
        userId: charlie.id,
        serverId: server1.id,
        roleId: memberRole1.id,
      },
    });

    await prisma.serverMember.create({
      data: {
        userId: bob.id,
        serverId: server2.id,
        roleId: adminRole2.id,
      },
    });

    await prisma.serverMember.create({
      data: {
        userId: alice.id,
        serverId: server2.id,
      },
    });

    console.log('✓ Added server members');

    // Create channels
    console.log('Creating channels...');

    const generalChannel1 = await prisma.channel.create({
      data: {
        name: 'general',
        type: 'text',
        serverId: server1.id,
      },
    });

    const randomChannel1 = await prisma.channel.create({
      data: {
        name: 'random',
        type: 'text',
        serverId: server1.id,
      },
    });

    const voiceChannel1 = await prisma.channel.create({
      data: {
        name: 'Voice Chat',
        type: 'voice',
        serverId: server1.id,
      },
    });

    const generalChannel2 = await prisma.channel.create({
      data: {
        name: 'general',
        type: 'text',
        serverId: server2.id,
      },
    });

    const gamingChannel2 = await prisma.channel.create({
      data: {
        name: 'game-discussion',
        type: 'text',
        serverId: server2.id,
      },
    });

    console.log('✓ Created 5 channels');

    // Create sample messages
    console.log('Creating messages...');

    await prisma.message.create({
      data: {
        content: 'Welcome to the General Community! 👋',
        userId: alice.id,
        channelId: generalChannel1.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Hey everyone! Glad to be here.',
        userId: bob.id,
        channelId: generalChannel1.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'This is a great community!',
        userId: charlie.id,
        channelId: generalChannel1.id,
      },
    });

    await prisma.message.create({
      data: {
        content: 'Anyone want to play some games?',
        userId: bob.id,
        channelId: gamingChannel2.id,
      },
    });

    await prisma.message.create({
      data: {
        content: "I'm in! What game?",
        userId: alice.id,
        channelId: gamingChannel2.id,
      },
    });

    console.log('✓ Created 5 messages');

    // Create a sample direct message
    console.log('Creating direct messages...');

    await prisma.directMessage.create({
      data: {
        content: 'Hey, how are you?',
        senderId: alice.id,
        receiverId: bob.id,
      },
    });

    await prisma.directMessage.create({
      data: {
        content: "I'm doing great! Thanks for asking.",
        senderId: bob.id,
        receiverId: alice.id,
        read: true,
      },
    });

    console.log('✓ Created 2 direct messages');

    console.log('');
    console.log('✅ Database seeding completed successfully!');
    console.log('');
    console.log('📝 Sample credentials:');
    console.log('   Email: alice@example.com | Password: password123');
    console.log('   Email: bob@example.com   | Password: password123');
    console.log('   Email: charlie@example.com | Password: password123');
    console.log('');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
