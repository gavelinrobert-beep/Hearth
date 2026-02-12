# Hearth Backend

## Overview

Hearth is a modern, Discord-inspired real-time chat application backend built with Node.js, TypeScript, and Socket.IO. It features server-based channels, direct messaging, real-time presence tracking, typing indicators, and AI-powered content moderation using local LLM models (Ollama).

The backend provides a RESTful API for resource management and WebSocket connections for real-time communication, making it suitable for building collaborative chat applications with AI assistance.

## Tech Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.IO 4.6+
- **Database**: PostgreSQL 15+ (via Prisma ORM)
- **Cache**: Redis 7+
- **Authentication**: JWT (JSON Web Tokens)

### Key Dependencies
- **Prisma**: Type-safe database ORM and migrations
- **bcrypt**: Password hashing and verification
- **express-validator**: Request validation middleware
- **helmet**: Security headers middleware
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: API rate limiting
- **multer**: File upload handling
- **axios**: HTTP client for AI service integration

### AI Integration
- **Ollama**: Local LLM for AI features (content moderation & chatbot)
- **Claude (Optional)**: Cloud fallback for AI responses

### Storage
- **MinIO**: S3-compatible object storage for file uploads
- **Local filesystem**: Development file storage

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Prisma client initialization
│   │   ├── redis.ts         # Redis client setup
│   │   └── storage.ts       # MinIO/S3 storage configuration
│   │
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts       # Register, login, get current user
│   │   ├── userController.ts       # User management
│   │   ├── serverController.ts     # Server CRUD operations
│   │   ├── channelController.ts    # Channel management
│   │   ├── messageController.ts    # Message operations
│   │   └── dmController.ts         # Direct message handling
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts          # JWT authentication middleware
│   │   ├── rateLimit.ts     # Rate limiting configuration
│   │   └── upload.ts        # File upload middleware
│   │
│   ├── routes/              # API route definitions
│   │   ├── auth.ts          # /api/auth routes
│   │   ├── users.ts         # /api/users routes
│   │   ├── servers.ts       # /api/servers routes
│   │   ├── channels.ts      # /api/channels routes
│   │   ├── messages.ts      # /api/messages routes
│   │   └── directMessages.ts # /api/dm routes
│   │
│   ├── services/            # Business logic services
│   │   ├── aiService.ts     # AI chatbot responses (Ollama/Claude)
│   │   ├── aiModeration.ts  # Content moderation with AI
│   │   └── socket.ts        # Socket.IO service utilities
│   │
│   ├── sockets/             # WebSocket event handlers
│   │   ├── index.ts         # Socket.IO setup and authentication
│   │   ├── messageHandler.ts   # Message events (send, edit, delete)
│   │   ├── typingHandler.ts    # Typing indicators
│   │   └── presenceHandler.ts  # User presence/status updates
│   │
│   ├── utils/               # Utility functions
│   │   ├── jwt.ts           # JWT generation and verification
│   │   ├── password.ts      # Password hashing utilities
│   │   └── permissions.ts   # Permission checking utilities
│   │
│   └── index.ts             # Application entry point
│
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database schema definition
│   ├── migrations/          # Migration history
│   └── seed.js              # Database seeding script
│
├── uploads/                 # Local file uploads (development)
├── dist/                    # Compiled JavaScript output
├── .env.example             # Environment variables template
├── Dockerfile               # Docker container definition
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **PostgreSQL** 15+ database
- **Redis** 7+ server
- **Ollama** (optional, for AI features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Hearth/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://hearth:hearth_password@localhost:5432/hearth_db"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   JWT_EXPIRES_IN="7d"

   # Server
   PORT=3000
   NODE_ENV="development"

   # Ollama (for AI features)
   OLLAMA_URL="http://localhost:11434"

   # File Upload
   MAX_FILE_SIZE=10485760  # 10MB
   UPLOAD_DIR="./uploads"

   # CORS
   CORS_ORIGIN="http://localhost:5173"
   ```

4. **Run database migrations**:
   ```bash
   npm run prisma:migrate
   ```

5. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:3000`

### Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Compile TypeScript to JavaScript
npm start                # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
```

## Database Schema

### User
Represents authenticated users in the application.

```prisma
model User {
  id            String    @id @default(uuid())
  username      String    @unique
  email         String    @unique
  password      String    # Hashed with bcrypt
  avatar        String?
  status        String    @default("offline")  # online, offline, away, dnd
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

**Relationships**:
- One-to-many with `ServerMember` (user can be in multiple servers)
- One-to-many with `Message` (user can send multiple messages)
- One-to-many with `DirectMessage` (user can send/receive DMs)
- One-to-many with `ChannelMember` (user can be in multiple channels)
- One-to-many with `TypingStatus` (typing indicators)

### Server
Represents a chat server (similar to Discord servers/guilds).

```prisma
model Server {
  id          String    @id @default(uuid())
  name        String
  icon        String?
  ownerId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Relationships**:
- One-to-many with `ServerMember` (members in the server)
- One-to-many with `Channel` (channels within the server)
- One-to-many with `Role` (roles for permission management)

### ServerMember
Join table representing user membership in servers.

```prisma
model ServerMember {
  id        String    @id @default(uuid())
  userId    String
  serverId  String
  roleId    String?
  joinedAt  DateTime  @default(now())
  
  @@unique([userId, serverId])
}
```

### Channel
Represents text or voice channels within a server.

```prisma
model Channel {
  id          String    @id @default(uuid())
  name        String
  type        String    @default("text")  # text, voice
  serverId    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Relationships**:
- Many-to-one with `Server`
- One-to-many with `Message` (messages in the channel)
- One-to-many with `ChannelMember` (members with access)
- One-to-many with `TypingStatus` (typing indicators)

### Message
Represents messages sent in channels.

```prisma
model Message {
  id          String    @id @default(uuid())
  content     String
  userId      String
  channelId   String
  fileUrl     String?
  moderated   Boolean   @default(false)  # Flagged by AI moderation
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Relationships**:
- Many-to-one with `User` (message author)
- Many-to-one with `Channel` (channel the message belongs to)

### DirectMessage
Represents direct messages between two users.

```prisma
model DirectMessage {
  id          String    @id @default(uuid())
  content     String
  senderId    String
  receiverId  String
  fileUrl     String?
  read        Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Relationships**:
- Many-to-one with `User` (sender)

### Role
Represents roles for permission management within servers.

```prisma
model Role {
  id          String    @id @default(uuid())
  name        String
  serverId    String
  permissions String[]  # Array of permission strings
  color       String?
  createdAt   DateTime  @default(now())
  
  @@unique([name, serverId])
}
```

### TypingStatus
Tracks real-time typing indicators.

```prisma
model TypingStatus {
  id        String    @id @default(uuid())
  userId    String
  channelId String
  updatedAt DateTime  @updatedAt
  
  @@unique([userId, channelId])
}
```

## API Documentation

All API endpoints require authentication via JWT token (except registration and login).

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

---

## Authentication (/api/auth)

### POST /api/auth/register
Register a new user account.

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation**:
- `username`: minimum 3 characters
- `email`: valid email format
- `password`: minimum 6 characters

**Error Responses**:
- `400 Bad Request`: Validation errors or user already exists
- `500 Internal Server Error`: Registration failed

---

### POST /api/auth/login
Authenticate and receive JWT token.

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-string",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": null,
    "status": "offline"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
- `500 Internal Server Error`: Login failed

---

### GET /api/auth/me
Get current authenticated user information.

**Headers**: Requires `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "id": "uuid-string",
  "username": "john_doe",
  "email": "john@example.com",
  "avatar": null,
  "status": "online",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

## Users (/api/users)

All endpoints require authentication.

### GET /api/users
Get a list of users (for search/discovery).

**Query Parameters**:
- `search` (optional): Filter by username

**Response** (200 OK):
```json
[
  {
    "id": "uuid-1",
    "username": "john_doe",
    "avatar": null,
    "status": "online"
  },
  {
    "id": "uuid-2",
    "username": "jane_smith",
    "avatar": "https://example.com/avatar.jpg",
    "status": "offline"
  }
]
```

---

### GET /api/users/:userId
Get a specific user's information.

**Response** (200 OK):
```json
{
  "id": "uuid-string",
  "username": "john_doe",
  "avatar": null,
  "status": "online",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found

---

### PUT /api/users/:userId
Update user profile (own profile only).

**Request Body**:
```json
{
  "username": "new_username",
  "avatar": "https://example.com/new-avatar.jpg",
  "status": "away"
}
```

**Response** (200 OK):
```json
{
  "id": "uuid-string",
  "username": "new_username",
  "email": "john@example.com",
  "avatar": "https://example.com/new-avatar.jpg",
  "status": "away",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses**:
- `403 Forbidden`: Cannot update other users
- `400 Bad Request`: Invalid data

---

## Servers (/api/servers)

All endpoints require authentication.

### POST /api/servers
Create a new server.

**Request Body**:
```json
{
  "name": "My Gaming Server",
  "icon": "https://example.com/icon.jpg"
}
```

**Response** (201 Created):
```json
{
  "id": "uuid-string",
  "name": "My Gaming Server",
  "icon": "https://example.com/icon.jpg",
  "ownerId": "user-uuid",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "channels": [
    {
      "id": "channel-uuid",
      "name": "general",
      "type": "text",
      "serverId": "uuid-string"
    }
  ],
  "members": [
    {
      "id": "member-uuid",
      "userId": "user-uuid",
      "serverId": "uuid-string",
      "joinedAt": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": "user-uuid",
        "username": "john_doe",
        "avatar": null,
        "status": "online"
      }
    }
  ]
}
```

**Note**: A default "general" text channel is automatically created.

---

### GET /api/servers
Get all servers the authenticated user is a member of.

**Response** (200 OK):
```json
[
  {
    "id": "server-uuid-1",
    "name": "My Gaming Server",
    "icon": "https://example.com/icon.jpg",
    "ownerId": "user-uuid",
    "channels": [...],
    "members": [...]
  },
  {
    "id": "server-uuid-2",
    "name": "Study Group",
    "icon": null,
    "ownerId": "other-user-uuid",
    "channels": [...],
    "members": [...]
  }
]
```

---

### GET /api/servers/:serverId
Get details of a specific server.

**Response** (200 OK):
```json
{
  "id": "server-uuid",
  "name": "My Gaming Server",
  "icon": "https://example.com/icon.jpg",
  "ownerId": "user-uuid",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "channels": [
    {
      "id": "channel-uuid",
      "name": "general",
      "type": "text"
    }
  ],
  "members": [
    {
      "id": "member-uuid",
      "user": {
        "id": "user-uuid",
        "username": "john_doe",
        "avatar": null,
        "status": "online"
      },
      "joinedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `404 Not Found`: Server not found or no access
- `403 Forbidden`: Not a member of the server

---

### PUT /api/servers/:serverId
Update server details (owner only).

**Request Body**:
```json
{
  "name": "Updated Server Name",
  "icon": "https://example.com/new-icon.jpg"
}
```

**Response** (200 OK):
```json
{
  "id": "server-uuid",
  "name": "Updated Server Name",
  "icon": "https://example.com/new-icon.jpg",
  "ownerId": "user-uuid",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses**:
- `403 Forbidden`: Only server owner can update
- `404 Not Found`: Server not found

---

### DELETE /api/servers/:serverId
Delete a server (owner only).

**Response** (204 No Content)

**Error Responses**:
- `403 Forbidden`: Only server owner can delete
- `404 Not Found`: Server not found

---

### POST /api/servers/:serverId/join
Join a server.

**Response** (200 OK):
```json
{
  "id": "member-uuid",
  "userId": "user-uuid",
  "serverId": "server-uuid",
  "joinedAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Already a member
- `404 Not Found`: Server not found

---

### POST /api/servers/:serverId/leave
Leave a server.

**Response** (204 No Content)

**Error Responses**:
- `400 Bad Request`: Cannot leave if you're the owner (delete instead)
- `404 Not Found`: Not a member or server not found

---

## Channels (/api/channels)

All endpoints require authentication.

### POST /api/channels
Create a new channel in a server.

**Request Body**:
```json
{
  "name": "announcements",
  "type": "text",
  "serverId": "server-uuid"
}
```

**Response** (201 Created):
```json
{
  "id": "channel-uuid",
  "name": "announcements",
  "type": "text",
  "serverId": "server-uuid",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:
- `403 Forbidden`: Not authorized to create channels in this server
- `400 Bad Request`: Invalid channel data

---

### GET /api/channels/:channelId
Get channel details.

**Response** (200 OK):
```json
{
  "id": "channel-uuid",
  "name": "general",
  "type": "text",
  "serverId": "server-uuid",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "server": {
    "id": "server-uuid",
    "name": "My Gaming Server"
  }
}
```

**Error Responses**:
- `404 Not Found`: Channel not found or no access

---

### PUT /api/channels/:channelId
Update channel details.

**Request Body**:
```json
{
  "name": "new-channel-name",
  "type": "text"
}
```

**Response** (200 OK):
```json
{
  "id": "channel-uuid",
  "name": "new-channel-name",
  "type": "text",
  "serverId": "server-uuid",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Error Responses**:
- `403 Forbidden`: Not authorized
- `404 Not Found`: Channel not found

---

### DELETE /api/channels/:channelId
Delete a channel.

**Response** (204 No Content)

**Error Responses**:
- `403 Forbidden`: Not authorized
- `404 Not Found`: Channel not found

---

## Messages (/api/messages)

All endpoints require authentication.

### GET /api/messages/channel/:channelId
Get messages from a channel.

**Query Parameters**:
- `limit` (optional, default: 50): Number of messages to return
- `before` (optional): ISO timestamp for pagination

**Response** (200 OK):
```json
[
  {
    "id": "message-uuid-1",
    "content": "Hello everyone!",
    "userId": "user-uuid",
    "channelId": "channel-uuid",
    "fileUrl": null,
    "moderated": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "user": {
      "id": "user-uuid",
      "username": "john_doe",
      "avatar": null
    }
  },
  {
    "id": "message-uuid-2",
    "content": "Check out this image!",
    "userId": "user-uuid-2",
    "channelId": "channel-uuid",
    "fileUrl": "/uploads/1234567890-image.jpg",
    "moderated": false,
    "createdAt": "2024-01-15T10:31:00.000Z",
    "user": {
      "id": "user-uuid-2",
      "username": "jane_smith",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
]
```

**Error Responses**:
- `404 Not Found`: Channel not found or no access
- `401 Unauthorized`: Not authenticated

---

### POST /api/messages/channel/:channelId
Send a message to a channel.

**Request Body** (multipart/form-data):
```
content: "Hello world!"
file: [optional file upload]
```

**Response** (201 Created):
```json
{
  "id": "message-uuid",
  "content": "Hello world!",
  "userId": "user-uuid",
  "channelId": "channel-uuid",
  "fileUrl": "/uploads/1234567890-file.jpg",
  "moderated": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "user": {
    "id": "user-uuid",
    "username": "john_doe",
    "avatar": null
  }
}
```

**File Upload**:
- Maximum file size: 10MB (configurable via `MAX_FILE_SIZE`)
- Supported formats: Images, videos, PDFs, documents
- Files are stored in `/uploads` directory

**AI Moderation**:
- Messages are automatically scanned for inappropriate content
- If flagged, `moderated: true` is set
- Moderated messages may be hidden or flagged in the UI

**Error Responses**:
- `400 Bad Request`: Missing content or file, or file too large
- `404 Not Found`: Channel not found
- `413 Payload Too Large`: File exceeds size limit

---

### DELETE /api/messages/:messageId
Delete a message (author only).

**Response** (204 No Content)

**Error Responses**:
- `403 Forbidden`: Not the message author
- `404 Not Found`: Message not found

---

## Direct Messages (/api/dm)

All endpoints require authentication.

### GET /api/dm/:userId
Get direct message conversation with a specific user.

**Response** (200 OK):
```json
[
  {
    "id": "dm-uuid-1",
    "content": "Hey! How are you?",
    "senderId": "current-user-uuid",
    "receiverId": "other-user-uuid",
    "fileUrl": null,
    "read": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "sender": {
      "id": "current-user-uuid",
      "username": "john_doe",
      "avatar": null
    }
  },
  {
    "id": "dm-uuid-2",
    "content": "I'm good, thanks!",
    "senderId": "other-user-uuid",
    "receiverId": "current-user-uuid",
    "fileUrl": null,
    "read": false,
    "createdAt": "2024-01-15T10:31:00.000Z",
    "sender": {
      "id": "other-user-uuid",
      "username": "jane_smith",
      "avatar": "https://example.com/avatar.jpg"
    }
  }
]
```

---

### POST /api/dm/:userId
Send a direct message to a user.

**Request Body**:
```json
{
  "content": "Hello there!"
}
```

**Response** (201 Created):
```json
{
  "id": "dm-uuid",
  "content": "Hello there!",
  "senderId": "current-user-uuid",
  "receiverId": "other-user-uuid",
  "fileUrl": null,
  "read": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "sender": {
    "id": "current-user-uuid",
    "username": "john_doe",
    "avatar": null
  }
}
```

---

### PUT /api/dm/:messageId/read
Mark a direct message as read.

**Response** (200 OK):
```json
{
  "id": "dm-uuid",
  "read": true,
  "updatedAt": "2024-01-15T10:35:00.000Z"
}
```

---

## WebSocket Events

The backend uses Socket.IO for real-time communication. All socket connections require authentication via JWT token.

### Connection

**Client connects with authentication**:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

**On successful connection**:
- User status is automatically set to "online"
- User joins personal room: `user:{userId}`
- User joins all server rooms: `server:{serverId}`

---

## Client → Server Events

### join-channel
Join a channel to receive messages.

**Emit**:
```javascript
socket.emit('join-channel', 'channel-uuid');
```

**Description**: User joins the channel room and will receive all messages sent to that channel.

---

### leave-channel
Leave a channel.

**Emit**:
```javascript
socket.emit('leave-channel', 'channel-uuid');
```

---

### send-message
Send a message in a channel.

**Emit**:
```javascript
socket.emit('send-message', {
  channelId: 'channel-uuid',
  content: 'Hello everyone!'
});
```

**Response**: Message is broadcast to all users in the channel via `new-message` event.

**AI Moderation**: Content is automatically moderated. If flagged, sender receives `message-moderated` event.

---

### edit-message
Edit an existing message.

**Emit**:
```javascript
socket.emit('edit-message', {
  messageId: 'message-uuid',
  content: 'Updated message content'
});
```

**Response**: Updated message is broadcast via `message-updated` event.

---

### delete-message
Delete a message.

**Emit**:
```javascript
socket.emit('delete-message', 'message-uuid');
```

**Response**: Deletion is broadcast via `message-deleted` event.

---

### send-dm
Send a direct message to another user.

**Emit**:
```javascript
socket.emit('send-dm', {
  receiverId: 'user-uuid',
  content: 'Hey, how are you?'
});
```

**Response**: Message is sent to both sender and receiver via `new-dm` event.

---

### typing-start
Indicate that user is typing in a channel.

**Emit**:
```javascript
socket.emit('typing-start', 'channel-uuid');
```

**Response**: Other users in the channel receive `user-typing` event.

**Auto-expire**: Typing indicator automatically expires after 5 seconds.

---

### typing-stop
Stop typing indicator.

**Emit**:
```javascript
socket.emit('typing-stop', 'channel-uuid');
```

**Response**: Other users receive `user-stopped-typing` event.

---

### update-status
Update user presence status.

**Emit**:
```javascript
socket.emit('update-status', 'away');  // online, offline, away, dnd
```

**Response**: All servers the user is in receive `user-status-update` event.

---

## Server → Client Events

### new-message
A new message was sent in a channel.

**Received**:
```javascript
socket.on('new-message', (message) => {
  console.log('New message:', message);
  // {
  //   id: 'message-uuid',
  //   content: 'Hello!',
  //   userId: 'user-uuid',
  //   channelId: 'channel-uuid',
  //   fileUrl: null,
  //   moderated: false,
  //   createdAt: '2024-01-15T10:30:00.000Z',
  //   user: {
  //     id: 'user-uuid',
  //     username: 'john_doe',
  //     avatar: null
  //   }
  // }
});
```

---

### message-updated
A message was edited.

**Received**:
```javascript
socket.on('message-updated', (message) => {
  console.log('Message updated:', message);
});
```

---

### message-deleted
A message was deleted.

**Received**:
```javascript
socket.on('message-deleted', (data) => {
  console.log('Message deleted:', data);
  // {
  //   messageId: 'message-uuid',
  //   channelId: 'channel-uuid'
  // }
});
```

---

### message-moderated
Your message was flagged by AI moderation.

**Received**:
```javascript
socket.on('message-moderated', (data) => {
  console.log('Message moderated:', data);
  // {
  //   messageId: 'message-uuid',
  //   reason: 'Contains inappropriate content'
  // }
});
```

---

### new-dm
New direct message received.

**Received**:
```javascript
socket.on('new-dm', (message) => {
  console.log('New DM:', message);
  // {
  //   id: 'dm-uuid',
  //   content: 'Hey there!',
  //   senderId: 'sender-uuid',
  //   receiverId: 'receiver-uuid',
  //   read: false,
  //   createdAt: '2024-01-15T10:30:00.000Z',
  //   sender: {
  //     id: 'sender-uuid',
  //     username: 'jane_smith',
  //     avatar: null
  //   }
  // }
});
```

---

### user-typing
A user started typing in a channel.

**Received**:
```javascript
socket.on('user-typing', (data) => {
  console.log('User typing:', data);
  // {
  //   userId: 'user-uuid',
  //   username: 'john_doe',
  //   channelId: 'channel-uuid'
  // }
});
```

---

### user-stopped-typing
A user stopped typing in a channel.

**Received**:
```javascript
socket.on('user-stopped-typing', (data) => {
  console.log('User stopped typing:', data);
  // {
  //   userId: 'user-uuid',
  //   channelId: 'channel-uuid'
  // }
});
```

---

### user-status-update
A user's status changed.

**Received**:
```javascript
socket.on('user-status-update', (data) => {
  console.log('Status updated:', data);
  // {
  //   userId: 'user-uuid',
  //   status: 'away'  // online, offline, away, dnd
  // }
});
```

---

### error
An error occurred.

**Received**:
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  // {
  //   message: 'Error description'
  // }
});
```

---

## AI Integration

Hearth integrates AI capabilities using **Ollama** (local LLM) with optional **Claude** (cloud) fallback.

### Features

1. **Content Moderation**: Automatic AI-powered content filtering for messages
2. **AI Chatbot**: Generate intelligent responses to user queries

### Setting Up Ollama

1. **Install Ollama**:
   ```bash
   # macOS/Linux
   curl https://ollama.ai/install.sh | sh
   
   # Or download from: https://ollama.ai/download
   ```

2. **Pull the Llama 3 model**:
   ```bash
   ollama pull llama3
   ```

3. **Start Ollama service**:
   ```bash
   ollama serve
   ```
   
   Ollama runs on `http://localhost:11434` by default.

4. **Configure backend**:
   ```env
   OLLAMA_URL=http://localhost:11434
   ```

### AI Content Moderation

Messages are automatically moderated using AI to detect:
- Hate speech or discrimination
- Harassment or bullying
- Explicit sexual content
- Violence or threats
- Spam or scams
- Personal information (doxxing)

**Implementation**:
```typescript
// Automatically called when messages are sent
const moderationResult = await moderateContent(messageContent);

if (moderationResult.shouldBlock) {
  // Message is flagged
  message.moderated = true;
  // Sender is notified via 'message-moderated' event
}
```

**Configuration**:
- Moderation is disabled in development mode by default
- Set `NODE_ENV=production` to enable moderation
- Fails open (allows message) if AI service is unavailable

### AI Chatbot Responses

Generate AI responses using the `aiService`:

```typescript
import { generateAIResponse } from './services/aiService';

const response = await generateAIResponse(
  'What is the weather like?',
  [
    { role: 'user', content: 'Previous message...' },
    { role: 'assistant', content: 'Previous response...' }
  ]
);

console.log(response.response);
```

**Streaming responses** (real-time):
```typescript
import { streamAIResponse } from './services/aiService';

await streamAIResponse('Tell me a story', (chunk) => {
  // Emit each chunk via WebSocket
  socket.emit('ai-chunk', chunk);
});
```

### Claude Fallback (Optional)

If Ollama is unavailable, the system can fall back to Claude API:

```env
ANTHROPIC_API_KEY=your-claude-api-key
```

**Fallback behavior**:
1. Tries Ollama first (local, free)
2. Falls back to Claude if Ollama fails
3. Returns error message if both fail

### Customizing AI Behavior

Edit system prompts in `/src/services/aiService.ts`:

```typescript
const systemPrompt = 'You are a helpful AI assistant in a Discord-like chat application...';
```

---

## File Upload

File uploads are handled using **Multer** middleware with support for both local storage and MinIO (S3-compatible).

### Configuration

**Environment variables**:
```env
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads     # Local storage directory

# Optional: MinIO/S3 Configuration
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=hearth-files
MINIO_USE_SSL=false
```

### Uploading Files

**HTTP API**:
```bash
curl -X POST http://localhost:3000/api/messages/channel/{channelId} \
  -H "Authorization: Bearer {token}" \
  -F "content=Check out this image!" \
  -F "file=@/path/to/image.jpg"
```

**JavaScript (Fetch API)**:
```javascript
const formData = new FormData();
formData.append('content', 'Check out this image!');
formData.append('file', fileInput.files[0]);

const response = await fetch(`/api/messages/channel/${channelId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### File Storage

**Local Storage (Development)**:
- Files stored in `/uploads` directory
- Accessible via `/uploads/{filename}`
- File naming: `{timestamp}-{random}-{original-extension}`

**MinIO Storage (Production)**:
- S3-compatible object storage
- Automatic bucket creation
- Supports signed URLs for secure access

### Supported File Types

- **Images**: jpg, jpeg, png, gif, webp
- **Documents**: pdf, doc, docx, txt
- **Archives**: zip, rar
- **Videos**: mp4, webm (size permitting)

### File Size Limits

- Default: 10MB per file
- Configurable via `MAX_FILE_SIZE` environment variable
- Express rate limiter prevents abuse

### Security

- File uploads require authentication
- File type validation (MIME type checking)
- Virus scanning (recommended in production)
- User can only delete their own uploaded files

---

## Testing

### Running Tests

Currently, the test suite is a placeholder. To add tests:

1. **Install testing dependencies**:
   ```bash
   npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
   ```

2. **Create test files**:
   ```
   backend/src/__tests__/
   ├── auth.test.ts
   ├── messages.test.ts
   └── sockets.test.ts
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

### Recommended Test Coverage

- **Unit tests**: Controllers, services, utilities
- **Integration tests**: API endpoints, database operations
- **E2E tests**: WebSocket events, real-time features
- **Load tests**: Socket.IO performance under concurrent connections

---

## Deployment

### Docker Deployment

The backend includes a multi-stage Dockerfile for optimized production builds.

**Build image**:
```bash
cd backend
docker build -t hearth-backend .
```

**Run container**:
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e REDIS_URL="redis://redis:6379" \
  -e JWT_SECRET="your-secret-key" \
  --name hearth-backend \
  hearth-backend
```

### Docker Compose (Recommended)

The project includes a complete `docker-compose.yml` for all services:

```bash
# From project root
docker-compose up -d
```

**Services included**:
- **PostgreSQL**: Database (port 5432)
- **Redis**: Cache and session store (port 6379)
- **MinIO**: Object storage (ports 9000, 9001)
- **Backend**: API and WebSocket server (port 3000)
- **Frontend**: React application (port 5173)

**Run migrations**:
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Production Deployment

#### Prerequisites
- Node.js 18+ environment
- PostgreSQL database
- Redis instance
- (Optional) Ollama for AI features

#### Environment Setup

1. **Set production environment variables**:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@prod-db:5432/hearth
   REDIS_URL=redis://prod-redis:6379
   JWT_SECRET=strong-random-secret-key
   CORS_ORIGIN=https://your-domain.com
   ```

2. **Build the application**:
   ```bash
   npm ci --production
   npm run build
   npm run prisma:generate
   ```

3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

#### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

#### Process Manager (PM2)

```bash
npm install -g pm2

pm2 start dist/index.js --name hearth-backend
pm2 save
pm2 startup
```

#### Health Monitoring

Health check endpoint available at:
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Security Checklist

- ✅ Change default `JWT_SECRET`
- ✅ Use HTTPS in production (reverse proxy)
- ✅ Configure proper CORS origins
- ✅ Enable rate limiting
- ✅ Regular database backups
- ✅ Monitor logs and errors
- ✅ Keep dependencies updated
- ✅ Use environment variables for secrets
- ✅ Enable AI content moderation
- ✅ Implement file upload scanning

### Scaling Considerations

**Horizontal Scaling**:
- Backend is stateless (except WebSocket connections)
- Use Redis adapter for Socket.IO to support multiple instances:
  ```typescript
  import { createAdapter } from '@socket.io/redis-adapter';
  io.adapter(createAdapter(redisClient, redisClient.duplicate()));
  ```

**Database**:
- PostgreSQL read replicas for heavy read operations
- Connection pooling via Prisma
- Indexes on frequently queried fields

**File Storage**:
- Use MinIO or S3 for distributed file storage
- CDN for serving uploaded files
- Implement file compression

**Caching**:
- Redis for session data and typing indicators
- Cache frequently accessed data (user profiles, server lists)

---

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check the main project README
- Review the CONTRIBUTING.md guide

## License

MIT License - See LICENSE file for details
