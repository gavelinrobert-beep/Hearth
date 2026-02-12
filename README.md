# NoIDchat

A full-stack Discord alternative with AI-powered moderation and assistant features. Built with modern technologies for real-time communication and scalability.

![NoIDchat](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Security](https://img.shields.io/badge/security-patched-green)

> **Security Update**: Version 1.0.1 includes critical security fixes for multer vulnerabilities. Please update immediately.

## 🚀 Features

### Core Features
- **Real-time Messaging** - Instant message delivery using Socket.io WebSocket connections
- **Server & Channel Management** - Create and manage multiple servers with text and voice channels
- **Direct Messaging** - Private one-on-one conversations between users
- **User Authentication** - Secure JWT-based authentication system
- **File Uploads** - Share files and images in conversations
- **Typing Indicators** - See when other users are typing in real-time
- **User Status** - Online/offline status tracking
- **Role Permissions** - Flexible role-based access control system

### AI Features (Powered by Llama 3)
- **Content Moderation** - Automatic detection and filtering of inappropriate content
- **AI Assistant Bot** - Intelligent bot for answering questions and providing help
- **Toxicity Scoring** - Advanced content analysis for community safety

### Technical Stack

**Backend:**
- Node.js & Express - Server framework
- TypeScript - Type-safe development
- PostgreSQL - Relational database
- Prisma ORM - Database toolkit
- Socket.io - Real-time bidirectional communication
- Redis - Caching and session management
- JWT - Secure authentication
- Bcrypt - Password hashing
- Multer - File upload handling

**Frontend:**
- React 18 - UI library
- TypeScript - Type safety
- Vite - Fast build tool
- Tailwind CSS - Utility-first CSS framework
- Socket.io Client - WebSocket client
- Zustand - State management
- React Router - Client-side routing
- Axios - HTTP client
- Lucide React - Icon library
- Date-fns - Date utilities

**Infrastructure:**
- Docker & Docker Compose - Containerization
- Nginx - Reverse proxy and static file serving
- PostgreSQL 15 - Database
- Redis 7 - In-memory data store

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL (if running without Docker)
- Redis (if running without Docker)
- Ollama with Llama 3 model (optional, for AI features)

## 🛠️ Installation

### Option 1: Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/gavelinrobert-beep/NoIDchat.git
cd NoIDchat
```

2. Start the services:
```bash
docker-compose up -d
```

3. The application will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Option 2: Local Development

1. Clone the repository:
```bash
git clone https://github.com/gavelinrobert-beep/NoIDchat.git
cd NoIDchat
```

2. Set up the backend:
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm run dev
```

4. Make sure PostgreSQL and Redis are running locally.

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/noidchat"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
LLAMA_API_URL="http://localhost:11434"
MAX_FILE_SIZE=10485760
CORS_ORIGIN="http://localhost:5173"
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:3000"
```

## 🤖 Setting Up AI Features (Optional)

To enable AI moderation and assistant features:

1. Install Ollama: https://ollama.ai/
2. Pull the Llama 3 model:
```bash
ollama pull llama3
```
3. Start Ollama server (usually runs on port 11434)
4. Update `LLAMA_API_URL` in your backend `.env` file

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Servers
- `POST /api/servers` - Create a server
- `GET /api/servers` - Get user's servers
- `GET /api/servers/:serverId` - Get server details
- `PUT /api/servers/:serverId` - Update server
- `DELETE /api/servers/:serverId` - Delete server
- `POST /api/servers/:serverId/join` - Join a server
- `POST /api/servers/:serverId/leave` - Leave a server

### Channels
- `POST /api/channels` - Create a channel
- `GET /api/channels/:channelId` - Get channel details
- `PUT /api/channels/:channelId` - Update channel
- `DELETE /api/channels/:channelId` - Delete channel

### Messages
- `GET /api/messages/channel/:channelId` - Get channel messages
- `POST /api/messages/channel/:channelId` - Send a message
- `DELETE /api/messages/:messageId` - Delete a message

### Direct Messages
- `GET /api/dm/:userId` - Get DMs with a user
- `POST /api/dm/:userId` - Send a direct message
- `PUT /api/dm/:messageId/read` - Mark message as read

### WebSocket Events

**Client to Server:**
- `join-channel` - Join a channel room
- `leave-channel` - Leave a channel room
- `send-message` - Send a message
- `typing-start` - Start typing
- `typing-stop` - Stop typing
- `send-dm` - Send a direct message
- `update-status` - Update user status

**Server to Client:**
- `new-message` - New message received
- `user-typing` - User is typing
- `user-stopped-typing` - User stopped typing
- `new-dm` - New direct message
- `user-status-update` - User status changed
- `message-moderated` - Message was moderated

## 🏗️ Project Structure

```
NoIDchat/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── index.ts        # Application entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── uploads/            # File uploads directory
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API and WebSocket services
│   │   ├── styles/         # CSS styles
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🧪 Development

### Database Migrations

```bash
cd backend
npm run prisma:migrate      # Create and run migrations
npm run prisma:studio       # Open Prisma Studio
npm run prisma:generate     # Generate Prisma Client
```

### Running Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🚢 Deployment

### Docker Compose Production

1. Update environment variables for production
2. Build and start containers:
```bash
docker-compose up -d --build
```

### Manual Deployment

1. Build the backend:
```bash
cd backend
npm run build
npm start
```

2. Build the frontend:
```bash
cd frontend
npm run build
# Serve the dist folder with a web server
```

## 🔒 Security Features

- JWT-based authentication with secure token storage
- Bcrypt password hashing with salt rounds
- Helmet.js for security headers
- Rate limiting to prevent abuse
- CORS configuration
- SQL injection prevention via Prisma ORM
- XSS protection
- AI-powered content moderation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Socket.io for real-time communication
- Prisma for excellent ORM
- Ollama and Llama 3 for AI capabilities
- The React and Node.js communities

## 📧 Support

For support, email support@noidchat.com or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Voice chat implementation
- [ ] Video calling
- [ ] Screen sharing
- [ ] Enhanced AI assistant features
- [ ] Mobile applications (React Native)
- [ ] End-to-end encryption
- [ ] Message reactions and threads
- [ ] Server discovery and invites
- [ ] Custom emojis and stickers
- [ ] User profiles and bios

---

Made with ❤️ by the NoIDchat Team