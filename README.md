# Hearth

A modern, full-stack Discord alternative with AI-powered moderation and assistant features. Built with cutting-edge technologies for real-time communication, scalability, and community safety.

![Hearth](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Security](https://img.shields.io/badge/security-patched-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)

> **Security Update**: Version 1.0.1 includes critical security fixes for multer vulnerabilities. Please update immediately.

## 📖 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#️-installation)
- [Configuration](#-configuration)
- [AI Features Setup](#-ai-features-setup)
- [Development](#-development)
- [Project Structure](#️-project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [Roadmap](#️-roadmap)
- [License](#-license)

## ✨ Features

### 💬 Core Communication
- **Real-time Messaging** - Instant message delivery with Socket.IO WebSocket connections and automatic reconnection
- **Server & Channel Management** - Create unlimited servers with organized text channels and categories
- **Direct Messaging** - Private one-on-one conversations with message history and read receipts
- **Typing Indicators** - Real-time visual feedback when users are composing messages
- **User Presence** - Online/offline/away status tracking across all servers
- **Message Editing & Deletion** - Full CRUD operations on messages with real-time sync
- **File Uploads** - Share images, documents, and media with MinIO/S3-compatible storage
- **Message History** - Infinite scroll pagination with cursor-based loading

### 🛡️ Security & Moderation
- **Secure Authentication** - JWT-based auth with bcrypt password hashing (10 rounds)
- **Role-Based Permissions** - Granular access control with customizable roles per server
- **Rate Limiting** - API and WebSocket rate limiting to prevent abuse
- **AI Content Moderation** - Automatic detection and filtering of toxic/inappropriate content
- **XSS & SQL Injection Protection** - Secured with Helmet.js and Prisma ORM
- **CORS Configuration** - Environment-based cross-origin resource sharing

### 🤖 AI Features (Ollama/Claude)
- **Content Moderation** - Real-time toxicity detection and content analysis using local LLM
- **AI Assistant Bot** - Intelligent chatbot for answering questions and providing help
- **Toxicity Scoring** - Advanced sentiment analysis for community safety
- **Context-Aware Responses** - AI understands conversation context and user intent
- **Fallback Support** - Optional Claude API integration for enhanced AI capabilities

## 🏗️ Architecture

Hearth is built on a modern, scalable microservices architecture designed for real-time communication:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Frontend (React 18 + Vite + TypeScript)                     │   │
│  │  • Zustand State Management                                  │   │
│  │  • Tailwind CSS Styling                                      │   │
│  │  • Socket.IO Client (WebSocket)                              │   │
│  │  • Axios HTTP Client                                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Backend (Node.js + Express + Socket.IO)                     │   │
│  │  • REST API Endpoints                                        │   │
│  │  • WebSocket Event Handlers                                  │   │
│  │  • JWT Authentication Middleware                             │   │
│  │  • Rate Limiting & Security                                  │   │
│  │  • File Upload Processing (Multer)                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
            ↕                    ↕                    ↕
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Data Layer     │  │   Cache Layer    │  │  Storage Layer   │
│                  │  │                  │  │                  │
│  PostgreSQL 15   │  │    Redis 7       │  │   MinIO S3       │
│  • User Data     │  │  • Sessions      │  │  • File Uploads  │
│  • Messages      │  │  • Rate Limits   │  │  • Images        │
│  • Servers       │  │  • Presence      │  │  • Documents     │
│  • Channels      │  │  • Cache         │  │  • Media         │
│  • Roles         │  │                  │  │                  │
│  (Prisma ORM)    │  │                  │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘
                                  
                      ┌──────────────────┐
                      │    AI Layer      │
                      │                  │
                      │  Ollama/Claude   │
                      │  • Content Mod   │
                      │  • AI Assistant  │
                      │  • Toxicity      │
                      │    Analysis      │
                      └──────────────────┘
```

**Key Architectural Patterns:**
- **REST + WebSocket Hybrid** - RESTful APIs for CRUD, WebSockets for real-time events
- **Layered Architecture** - Separation of concerns (routes → controllers → services → data)
- **Caching Strategy** - Redis for sessions, rate limits, and frequently accessed data
- **Object Storage** - MinIO for scalable, S3-compatible file storage
- **Event-Driven** - Socket.IO for pub/sub messaging patterns
- **Database ORM** - Prisma for type-safe database queries and migrations

## 🚀 Quick Start

Get Hearth running in under 5 minutes with Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/Hearth.git
cd Hearth

# Start all services (PostgreSQL, Redis, MinIO, Backend, Frontend)
docker-compose up -d

# Wait for services to initialize (~30 seconds)
# Check status
docker-compose ps
```

**Access the application:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **MinIO Console**: http://localhost:9001 (login: minioadmin/minioadmin)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

**Create your first account:**
1. Navigate to http://localhost:5173
2. Click "Register" and create an account
3. Start chatting!

**Optional - Enable AI Features:**
```bash
# Install Ollama (https://ollama.ai)
curl https://ollama.ai/install.sh | sh

# Pull Llama 3 model
ollama pull llama3

# Ollama will run on http://localhost:11434
# Backend will automatically connect if OLLAMA_URL is configured
```

📚 **For detailed setup, see [Backend README](backend/README.md) and [Frontend README](frontend/README.md)**

## 📋 Prerequisites

### For Docker Deployment (Recommended)
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for cloning the repository
- **4GB RAM** minimum (8GB recommended)
- **2GB disk space** for images and volumes
- *Optional*: **Ollama** with Llama 3 model for AI features

### For Local Development
- **Node.js** 18+ and **npm** 8+
- **PostgreSQL** 15+ 
- **Redis** 7+
- **TypeScript** 5+ (installed via npm)
- *Optional*: **Ollama** with Llama 3 model for AI features
- *Optional*: **MinIO** for S3-compatible storage (or use local filesystem)

### System Requirements
- **OS**: Linux, macOS, or Windows (with WSL2 for Docker)
- **CPU**: 2+ cores recommended
- **Memory**: 4GB minimum, 8GB recommended
- **Disk**: 10GB free space for development

## 🛠️ Installation

### Option 1: Docker Compose (Recommended for Production)

Docker Compose will automatically set up PostgreSQL, Redis, MinIO, Backend, and Frontend:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Hearth.git
   cd Hearth
   ```

2. **Configure environment (optional):**
   ```bash
   # Review and customize if needed
   cat .env.example
   # Docker Compose uses default values from docker-compose.yml
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

5. **View logs (if needed):**
   ```bash
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - **MinIO Console**: http://localhost:9001 (minioadmin/minioadmin)
   - PostgreSQL: localhost:5432 (hearth/hearth_password)
   - Redis: localhost:6379

**MinIO Setup:**
After starting services, MinIO will automatically:
- Create the `hearth-files` bucket
- Be accessible at http://localhost:9000 (API) and http://localhost:9001 (Console)
- Store files in a persistent Docker volume

To manually manage MinIO:
1. Open http://localhost:9001
2. Login with `minioadmin`/`minioadmin`
3. Browse uploaded files in the `hearth-files` bucket
4. Configure additional buckets or access policies as needed

### Option 2: Local Development Setup

For active development with hot-reload:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Hearth.git
   cd Hearth
   ```

2. **Start infrastructure services (PostgreSQL, Redis, MinIO):**
   ```bash
   # Option A: Use Docker for services only
   docker-compose up -d postgres redis minio
   
   # Option B: Install and run services locally
   # PostgreSQL: https://www.postgresql.org/download/
   # Redis: https://redis.io/download/
   # MinIO: https://min.io/download
   ```

3. **Set up the backend:**
   ```bash
   cd backend
   
   # Install dependencies
   npm install
   
   # Create environment file from example
   cp .env.example .env
   
   # Edit .env with your local settings
   nano .env  # or use your preferred editor
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Start backend in development mode
   npm run dev
   ```
   
   Backend will run on http://localhost:3000

4. **Set up the frontend (in a new terminal):**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Edit .env if needed (defaults usually work)
   nano .env
   
   # Start frontend in development mode
   npm run dev
   ```
   
   Frontend will run on http://localhost:5173

5. **Verify everything is running:**
   ```bash
   # Check backend
   curl http://localhost:3000/api/health
   
   # Check Redis
   redis-cli ping
   
   # Check PostgreSQL
   psql -U hearth -d hearth_db -c "SELECT 1;"
   ```

📖 **For detailed backend setup, see [Backend README](backend/README.md)**  
📖 **For detailed frontend setup, see [Frontend README](frontend/README.md)**

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory (copy from `.env.example`):

```env
# Database - PostgreSQL connection string
DATABASE_URL=postgresql://hearth:password@localhost:5432/hearth_db

# Redis - Connection URL
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# MinIO / S3 Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=hearth-files
MINIO_USE_SSL=false

# AI Services
OLLAMA_URL=http://localhost:11434
# Optional: ANTHROPIC_API_KEY=your-anthropic-api-key-for-cloud-ai

# Server Configuration
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Important Configuration Notes:**
- Change `JWT_SECRET` to a strong random string in production
- Use strong passwords for `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` in production
- Set `MINIO_USE_SSL=true` in production with proper SSL certificates
- Adjust `MAX_FILE_SIZE` based on your needs (default: 10MB)
- For production, use environment-specific `CORS_ORIGIN` values

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000

# WebSocket URL (usually same as API URL)
VITE_WS_URL=ws://localhost:3000
```

**Production Configuration:**
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Docker Compose Environment

The `docker-compose.yml` file contains production-ready defaults. To customize:

```bash
# Override environment variables
cp .env.example .env
# Edit .env with your values
nano .env

# Docker Compose will automatically load .env
docker-compose up -d
```

### MinIO Console Access

The MinIO console is available at http://localhost:9001:

1. **Default Credentials**:
   - Username: `minioadmin`
   - Password: `minioadmin`

2. **Features**:
   - Browse uploaded files
   - Create/manage buckets
   - Configure access policies
   - Monitor storage usage
   - Generate access keys

3. **Production Setup**:
   - Change default credentials immediately
   - Enable HTTPS/TLS
   - Configure bucket policies
   - Set up lifecycle rules for old files
   - Enable versioning for important data

## 🤖 AI Features Setup (Optional)

Hearth includes powerful AI features powered by local LLM models via Ollama:

### Installing Ollama

**Linux/macOS:**
```bash
curl https://ollama.ai/install.sh | sh
```

**Windows:**
Download from https://ollama.ai/download/windows

### Pulling Llama 3 Model

```bash
# Pull the Llama 3 model (8B parameters, ~4.7GB)
ollama pull llama3

# Alternative: Use smaller/larger models
ollama pull llama3:7b      # Smaller, faster
ollama pull llama3:70b     # Larger, more accurate

# Verify installation
ollama list
```

### Starting Ollama

```bash
# Ollama runs as a service by default on port 11434
# Check if it's running
curl http://localhost:11434/api/tags

# Manually start if needed
ollama serve
```

### Testing AI Integration

```bash
# Test from command line
curl http://localhost:11434/api/generate -d '{
  "model": "llama3",
  "prompt": "Hello! Say hi.",
  "stream": false
}'
```

### Optional: Claude API (Cloud Fallback)

For enhanced AI capabilities, add Claude API:

```bash
# Add to backend/.env
ANTHROPIC_API_KEY=your-anthropic-api-key

# Get an API key from https://console.anthropic.com/
```

### AI Features Overview

Once configured, Hearth will provide:

1. **Content Moderation**
   - Automatic toxicity detection
   - Inappropriate content filtering
   - Spam prevention
   - Configurable sensitivity levels

2. **AI Assistant Bot**
   - Answer user questions
   - Provide server information
   - Help with commands
   - Context-aware responses

3. **Message Analysis**
   - Sentiment analysis
   - Language detection
   - Topic classification
   - Trend identification

**Performance Tips:**
- Use Llama 3 8B for best balance of speed/quality
- Ensure 8GB+ RAM for smooth operation
- GPU acceleration significantly improves response time
- Consider cloud AI (Claude) for production at scale

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Login and receive JWT token | ❌ |
| `GET` | `/api/auth/me` | Get current user information | ✅ |
| `PUT` | `/api/auth/me` | Update current user profile | ✅ |

**Example: Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### Server Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/servers` | Create a new server | ✅ |
| `GET` | `/api/servers` | Get all user's servers | ✅ |
| `GET` | `/api/servers/:serverId` | Get server details | ✅ |
| `PUT` | `/api/servers/:serverId` | Update server settings | ✅ |
| `DELETE` | `/api/servers/:serverId` | Delete a server | ✅ |
| `POST` | `/api/servers/:serverId/join` | Join a server via invite | ✅ |
| `POST` | `/api/servers/:serverId/leave` | Leave a server | ✅ |
| `GET` | `/api/servers/:serverId/members` | Get server members | ✅ |

### Channel Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/channels` | Create a channel in a server | ✅ |
| `GET` | `/api/channels/:channelId` | Get channel details | ✅ |
| `PUT` | `/api/channels/:channelId` | Update channel settings | ✅ |
| `DELETE` | `/api/channels/:channelId` | Delete a channel | ✅ |
| `GET` | `/api/servers/:serverId/channels` | Get all channels in server | ✅ |

### Messages

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/messages/channel/:channelId` | Get channel messages (paginated) | ✅ |
| `POST` | `/api/messages/channel/:channelId` | Send a message to channel | ✅ |
| `PUT` | `/api/messages/:messageId` | Edit a message | ✅ |
| `DELETE` | `/api/messages/:messageId` | Delete a message | ✅ |
| `POST` | `/api/messages/:messageId/react` | Add reaction to message | ✅ |

**Example: Get Messages**
```bash
curl http://localhost:3000/api/messages/channel/abc123?limit=50&cursor=xyz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Direct Messages (DMs)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/dm` | Get all DM conversations | ✅ |
| `GET` | `/api/dm/:userId` | Get DMs with specific user | ✅ |
| `POST` | `/api/dm/:userId` | Send a direct message | ✅ |
| `PUT` | `/api/dm/:messageId/read` | Mark DM as read | ✅ |

### File Uploads

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/upload` | Upload a file (multipart/form-data) | ✅ |

**Example: Upload File**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.png"
```

### WebSocket Events

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});
```

**Client → Server Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `join-channel` | `{ channelId: string }` | Join a channel room |
| `leave-channel` | `{ channelId: string }` | Leave a channel room |
| `send-message` | `{ channelId: string, content: string }` | Send a message |
| `typing-start` | `{ channelId: string }` | Start typing indicator |
| `typing-stop` | `{ channelId: string }` | Stop typing indicator |
| `send-dm` | `{ userId: string, content: string }` | Send direct message |
| `update-status` | `{ status: 'online' \| 'away' \| 'offline' }` | Update presence |

**Server → Client Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `new-message` | `Message` | New message received |
| `message-updated` | `Message` | Message was edited |
| `message-deleted` | `{ id: string, channelId: string }` | Message was deleted |
| `user-typing` | `{ userId: string, channelId: string }` | User started typing |
| `user-stopped-typing` | `{ userId: string, channelId: string }` | User stopped typing |
| `new-dm` | `DirectMessage` | New DM received |
| `user-status-update` | `{ userId: string, status: string }` | User status changed |
| `message-moderated` | `{ messageId: string, reason: string }` | AI flagged message |

**Example: Sending a Message**
```javascript
// Join a channel
socket.emit('join-channel', { channelId: 'channel-123' });

// Send a message
socket.emit('send-message', {
  channelId: 'channel-123',
  content: 'Hello, world!'
});

// Listen for new messages
socket.on('new-message', (message) => {
  console.log('Received:', message);
});
```

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| API Endpoints | 100 requests | 15 minutes |
| WebSocket Messages | 50 messages | 1 minute |
| File Uploads | 10 uploads | 1 hour |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

### Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-15T12:00:00.000Z",
  "path": "/api/messages/channel/123"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

📖 **For complete API documentation, see [Backend README](backend/README.md)**

## 🧪 Development

### Database Management

**Prisma Commands:**
```bash
cd backend

# Generate Prisma Client after schema changes
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI for database)
npm run prisma:studio  # Opens at http://localhost:5555
```

**Direct Database Access:**
```bash
# Connect to PostgreSQL
docker exec -it hearth-postgres psql -U hearth -d hearth_db

# Or if running locally
psql -U hearth -d hearth_db

# Common queries
SELECT * FROM "User";
SELECT * FROM "Server";
SELECT * FROM "Message" ORDER BY "createdAt" DESC LIMIT 10;
```

### Redis Management

```bash
# Connect to Redis
docker exec -it hearth-redis redis-cli

# Or if running locally
redis-cli

# Common commands
PING                    # Test connection
KEYS *                  # List all keys
GET key_name           # Get a value
DEL key_name           # Delete a key
FLUSHALL               # Clear all data (use with caution)
```

### Running Tests

```bash
# Backend tests
cd backend
npm test
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report

# Frontend tests
cd frontend
npm test
npm run test:watch
npm run test:coverage
```

### Code Quality

```bash
# Linting
cd backend && npm run lint
cd frontend && npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Type checking
cd backend && npm run type-check
cd frontend && npm run type-check

# Format code (if Prettier is configured)
npm run format
```

### Hot Reload Development

Both backend and frontend support hot module replacement:

```bash
# Terminal 1: Backend (auto-restarts on file changes)
cd backend
npm run dev

# Terminal 2: Frontend (instant HMR)
cd frontend
npm run dev

# Terminal 3: Watch database schema
cd backend
npx prisma studio
```

### Debugging

**VS Code Launch Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "npm: dev",
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"]
    }
  ]
}
```

**Chrome DevTools for Frontend:**
1. Open http://localhost:5173 in Chrome
2. Press F12 to open DevTools
3. Navigate to Sources tab
4. Set breakpoints in TypeScript files

### Docker Development

```bash
# Rebuild specific service
docker-compose up -d --build backend

# View real-time logs
docker-compose logs -f backend frontend

# Execute commands in container
docker-compose exec backend npm run prisma:studio
docker-compose exec backend sh  # Shell access

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## 🏗️ Project Structure

```
Hearth/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── config/            # Configuration (DB, Redis, Storage)
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware (auth, validation)
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (AI, messages, etc.)
│   │   ├── socket/            # Socket.IO event handlers
│   │   ├── utils/             # Helper functions
│   │   └── index.ts           # Application entry point
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Database migrations
│   ├── uploads/               # Local file storage (dev)
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Container definition
│   ├── package.json           # Dependencies and scripts
│   ├── tsconfig.json          # TypeScript configuration
│   └── README.md              # Backend documentation
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components (routes)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API and WebSocket clients
│   │   ├── store/             # Zustand state stores
│   │   ├── styles/            # Global CSS styles
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Application entry point
│   ├── public/                # Static assets
│   ├── .env.example           # Environment variables template
│   ├── Dockerfile             # Container definition
│   ├── nginx.conf             # Production web server config
│   ├── package.json           # Dependencies and scripts
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── vite.config.ts         # Vite build configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── README.md              # Frontend documentation
│
├── .env.example               # Root environment variables
├── docker-compose.yml         # Multi-container orchestration
├── start.sh                   # Quick start script
├── README.md                  # This file
├── CONTRIBUTING.md            # Contribution guidelines
├── DEPLOYMENT.md              # Deployment documentation
├── DEVELOPMENT.md             # Development guide
├── SECURITY.md                # Security policies
├── CHANGELOG.md               # Version history
└── LICENSE                    # MIT license
```

**Key Directories:**
- `backend/src/controllers/` - HTTP request handlers for REST API
- `backend/src/services/` - Business logic and external integrations
- `backend/src/socket/` - WebSocket event handlers
- `frontend/src/components/` - Reusable React components
- `frontend/src/pages/` - Top-level page components
- `frontend/src/store/` - Global state management

## 🚢 Deployment

### Production Deployment with Docker Compose

1. **Prepare environment:**
   ```bash
   # Clone on production server
   git clone https://github.com/yourusername/Hearth.git
   cd Hearth
   
   # Create production .env
   cp .env.example .env
   nano .env  # Update with production values
   ```

2. **Update configuration for production:**
   ```env
   # Use strong passwords
   JWT_SECRET=<generate-random-64-char-string>
   MINIO_ACCESS_KEY=<strong-access-key>
   MINIO_SECRET_KEY=<strong-secret-key>
   
   # Use production URLs
   CLIENT_URL=https://yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
   
   # Enable SSL for MinIO
   MINIO_USE_SSL=true
   ```

3. **Build and deploy:**
   ```bash
   # Build images
   docker-compose build
   
   # Start in production mode
   docker-compose up -d
   
   # Check logs
   docker-compose logs -f
   ```

4. **Set up reverse proxy (Nginx/Caddy):**
   ```nginx
   # /etc/nginx/sites-available/hearth
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:5173;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
       
       location /socket.io {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
       }
   }
   ```

5. **Enable HTTPS with Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Manual Deployment (Without Docker)

1. **Build backend:**
   ```bash
   cd backend
   npm install --production
   npm run build
   
   # Start with PM2 for process management
   npm install -g pm2
   pm2 start dist/index.js --name hearth-backend
   pm2 save
   pm2 startup
   ```

2. **Build frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   
   # Serve with Nginx
   sudo cp -r dist/* /var/www/hearth/
   ```

3. **Configure services:**
   ```bash
   # PostgreSQL
   sudo apt install postgresql
   sudo -u postgres createdb hearth_db
   
   # Redis
   sudo apt install redis-server
   sudo systemctl enable redis-server
   
   # MinIO
   wget https://dl.min.io/server/minio/release/linux-amd64/minio
   chmod +x minio
   ./minio server /data --console-address ":9001"
   ```

### Cloud Platform Deployment

**AWS:**
- Use **ECS** or **EKS** for containers
- **RDS PostgreSQL** for database
- **ElastiCache Redis** for caching
- **S3** instead of MinIO for storage
- **ALB** for load balancing

**Google Cloud:**
- **Cloud Run** or **GKE** for containers
- **Cloud SQL** for PostgreSQL
- **Memorystore** for Redis
- **Cloud Storage** for files
- **Cloud Load Balancing**

**Azure:**
- **Container Instances** or **AKS**
- **Azure Database for PostgreSQL**
- **Azure Cache for Redis**
- **Blob Storage** for files
- **Application Gateway**

### Environment-Specific Configuration

**Development:**
```env
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Staging:**
```env
NODE_ENV=staging
CORS_ORIGIN=https://staging.yourdomain.com
```

**Production:**
```env
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Health Checks

```bash
# Backend health
curl http://localhost:3000/api/health

# Database connection
curl http://localhost:3000/api/health/db

# Redis connection
curl http://localhost:3000/api/health/redis

# MinIO connection
curl http://localhost:9000/minio/health/live
```

### Monitoring & Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs --tail=100 frontend

# System monitoring
docker stats

# PM2 monitoring (if not using Docker)
pm2 monit
pm2 logs hearth-backend
```

### Backup Strategy

```bash
# PostgreSQL backup
docker exec hearth-postgres pg_dump -U hearth hearth_db > backup.sql

# Restore
docker exec -i hearth-postgres psql -U hearth hearth_db < backup.sql

# MinIO backup (entire bucket)
mc alias set myminio http://localhost:9000 minioadmin minioadmin
mc mirror myminio/hearth-files ./minio-backup

# Redis backup (automatic via RDB)
docker exec hearth-redis redis-cli SAVE
```

📖 **For detailed deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens** - Secure, stateless authentication with configurable expiration
- **Bcrypt Hashing** - Password hashing with 10 salt rounds
- **Role-Based Access Control (RBAC)** - Granular permissions per server
- **Token Refresh** - Automatic token renewal for active users
- **Session Management** - Redis-backed session storage

### API Security
- **Rate Limiting** - Prevent abuse with configurable limits
- **CORS Configuration** - Strict cross-origin policies
- **Helmet.js** - Security headers (CSP, HSTS, X-Frame-Options)
- **Input Validation** - Express-validator for all endpoints
- **SQL Injection Protection** - Prisma ORM parameterized queries
- **XSS Prevention** - Content sanitization and CSP headers

### Infrastructure Security
- **Docker Isolation** - Containerized services with network segmentation
- **Environment Variables** - Secrets stored outside codebase
- **HTTPS/WSS** - TLS encryption for all production traffic
- **Database Encryption** - PostgreSQL encryption at rest
- **MinIO Bucket Policies** - Fine-grained access control

### AI Content Moderation
- **Toxicity Detection** - Real-time content analysis
- **Automatic Filtering** - Remove/flag inappropriate content
- **Configurable Thresholds** - Adjust sensitivity levels
- **Human Review** - Moderator dashboard for flagged content

### Security Best Practices

**Production Checklist:**
- [ ] Change all default passwords
- [ ] Use strong, unique JWT secret (64+ characters)
- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Configure firewall rules (only expose necessary ports)
- [ ] Set up automated backups
- [ ] Enable database encryption at rest
- [ ] Configure MinIO bucket policies
- [ ] Set up monitoring and alerting
- [ ] Implement log aggregation
- [ ] Regular security updates (npm audit, docker image updates)
- [ ] Enable rate limiting on all endpoints
- [ ] Configure CSP headers
- [ ] Use environment-specific CORS origins

**Vulnerability Scanning:**
```bash
# Check for npm vulnerabilities
cd backend && npm audit
cd frontend && npm audit

# Fix automatically where possible
npm audit fix

# Docker image scanning
docker scan hearth-backend
docker scan hearth-frontend
```

📖 **For security policies, see [SECURITY.md](SECURITY.md)**

## 🤝 Contributing

We welcome contributions from the community! Whether it's bug fixes, new features, documentation improvements, or translations, your help makes Hearth better.

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/Hearth.git
   cd Hearth
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run tests
   cd backend && npm test
   cd frontend && npm test
   
   # Lint code
   npm run lint
   
   # Type check
   npm run type-check
   ```

4. **Commit with clear messages**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   
   # Use conventional commits
   # feat: New feature
   # fix: Bug fix
   # docs: Documentation changes
   # style: Code style changes (formatting)
   # refactor: Code refactoring
   # test: Adding or updating tests
   # chore: Maintenance tasks
   ```

5. **Push and create Pull Request**
   ```bash
   git push origin feature/amazing-feature
   # Then open a PR on GitHub
   ```

### Contribution Guidelines

- **Code Quality**: Maintain high code quality with tests and documentation
- **Commit Messages**: Use conventional commits format
- **Pull Requests**: Keep PRs focused on a single feature/fix
- **Testing**: Add tests for new functionality
- **Documentation**: Update README and docs for API changes
- **Respectful**: Be respectful and constructive in discussions

### Development Setup

```bash
# Install dependencies
npm install

# Set up pre-commit hooks (if using Husky)
npm run prepare

# Run development environment
docker-compose up -d
cd backend && npm run dev
cd frontend && npm run dev
```

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🌍 Translations and i18n
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- ⚡ Performance optimizations
- 🔒 Security improvements

📖 **For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)**

## 🗺️ Roadmap

### ✅ Completed (v1.0)
- [x] Real-time messaging with Socket.IO
- [x] User authentication and authorization
- [x] Server and channel management
- [x] Direct messaging
- [x] File uploads with MinIO
- [x] AI-powered content moderation
- [x] Typing indicators and presence
- [x] Docker containerization
- [x] PostgreSQL and Redis integration
- [x] Security hardening (v1.0.1)

### 🚀 In Progress (v1.1)
- [ ] Voice chat implementation
- [ ] User profiles and customization
- [ ] Server roles and advanced permissions
- [ ] Message reactions and emoji support
- [ ] Rich message embeds
- [ ] Thread/reply functionality

### 📅 Planned (v1.2)
- [ ] Video calling
- [ ] Screen sharing
- [ ] Server discovery and public servers
- [ ] Custom emoji and sticker uploads
- [ ] Enhanced AI assistant features
- [ ] Mobile applications (React Native)
- [ ] Desktop applications (Electron)

### 🔮 Future (v2.0+)
- [ ] End-to-end encryption (E2EE)
- [ ] Federation protocol support
- [ ] Plugin/extension system
- [ ] Advanced analytics dashboard
- [ ] Webhooks and bot API
- [ ] Server templates
- [ ] Automated moderation rules
- [ ] Voice channel recording
- [ ] Livestreaming capabilities
- [ ] Integration marketplace

### Community Requests
Vote on features and suggest new ones in [GitHub Discussions](https://github.com/yourusername/Hearth/discussions).

**Want to help?** Check our [GitHub Issues](https://github.com/yourusername/Hearth/issues) for tasks labeled `good first issue` or `help wanted`.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Hearth Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

We're grateful to the open-source community and these amazing projects:

- **[Socket.IO](https://socket.io/)** - Real-time, bidirectional event-based communication
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM for Node.js and TypeScript
- **[React](https://react.dev/)** - Library for building user interfaces
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Ollama](https://ollama.ai/)** - Local LLM runtime for AI features
- **[MinIO](https://min.io/)** - High-performance object storage
- **[Redis](https://redis.io/)** - In-memory data structure store
- **[PostgreSQL](https://www.postgresql.org/)** - Advanced open-source relational database
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated web framework
- **[TypeScript](https://www.typescriptlang.org/)** - Typed JavaScript at Any Scale
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Small, fast state management

Special thanks to all [contributors](https://github.com/yourusername/Hearth/graphs/contributors) who have helped improve Hearth!

## 📧 Support

### Getting Help

- **Documentation**: Check this README and linked docs (Backend/Frontend READMEs)
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/Hearth/issues) or request features
- **GitHub Discussions**: [Ask questions](https://github.com/yourusername/Hearth/discussions) and share ideas
- **Email**: support@hearth.chat (for security issues, use security@hearth.chat)

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please DO NOT open a public issue. Instead:

1. Email security@hearth.chat with details
2. Include steps to reproduce
3. We'll respond within 48 hours
4. We'll work with you to fix the issue

See [SECURITY.md](SECURITY.md) for our security policy.

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/Hearth?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/Hearth?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/Hearth)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/Hearth)
![GitHub contributors](https://img.shields.io/github/contributors/yourusername/Hearth)
![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/Hearth)

## 🔗 Related Resources

- **Backend Documentation**: [backend/README.md](backend/README.md) - Complete backend API docs
- **Frontend Documentation**: [frontend/README.md](frontend/README.md) - React app architecture
- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md) - Developer workflows
- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- **Contributing Guide**: [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- **Security Policy**: [SECURITY.md](SECURITY.md) - Security practices
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) - Version history

## 🌟 Star History

If you find Hearth useful, please consider giving it a ⭐ on GitHub! It helps others discover the project.

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/Hearth&type=Date)](https://star-history.com/#yourusername/Hearth&Date)

---

<div align="center">

**Built with ❤️ by the Hearth Team**

[Website](https://hearth.chat) • [Documentation](https://docs.hearth.chat) • [Discord](https://discord.gg/hearth) • [Twitter](https://twitter.com/hearthchat)

</div>