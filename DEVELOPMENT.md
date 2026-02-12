# Development Guide

This guide will help you set up your development environment and understand the codebase structure.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Database Management](#database-management)
- [Running in Development](#running-in-development)
- [Testing](#testing)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **PostgreSQL** 15 or higher
- **Redis** 7 or higher
- **Docker & Docker Compose** (optional, for containerized development)
- **Git**

### Optional
- **Ollama** with Llama 3 model (for AI features)

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/gavelinrobert-beep/NoIDchat.git
cd NoIDchat
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and configure your environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/noidchat"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV="development"
```

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file (optional for frontend):

```env
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="ws://localhost:3000"
```

## Project Structure

```
NoIDchat/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files (DB, Redis)
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Express middleware (auth, etc.)
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (Socket.io, AI)
│   │   ├── utils/           # Helper functions (JWT, password)
│   │   └── index.ts         # Application entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── uploads/             # File uploads directory
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API & Socket services
│   │   ├── styles/          # CSS files
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── public/              # Static assets
│
└── docker-compose.yml       # Docker composition
```

## Database Management

### Prisma Commands

```bash
cd backend

# Generate Prisma client
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# View database in Prisma Studio
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Database Schema

The main models are:
- **User** - User accounts and authentication
- **Server** - Chat servers (like Discord guilds)
- **Channel** - Text/voice channels within servers
- **Message** - Messages in channels
- **DirectMessage** - Private messages between users
- **ServerMember** - User-server relationships
- **Role** - Permission roles
- **TypingStatus** - Real-time typing indicators

## Running in Development

### Option 1: Run Locally

Start PostgreSQL and Redis, then:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Prisma Studio: Run `npm run prisma:studio` in backend

### Option 2: Docker Compose

```bash
docker-compose up
```

Or use the quick start script:

```bash
./start.sh
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Linting

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## Common Tasks

### Add a New API Endpoint

1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Register route in `backend/src/index.ts`
4. Add corresponding API call in `frontend/src/services/api.ts`

### Add a New Socket Event

1. Add event handler in `backend/src/services/socket.ts`
2. Add event listener in relevant frontend component
3. Emit events using `socket.emit()` and `socket.on()`

### Update Database Schema

1. Modify `backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create migration
3. Run `npm run prisma:generate` to update client

### Add a New Component

1. Create component in `frontend/src/components/`
2. Import and use in parent component or page
3. Add types if needed in `frontend/src/types/`

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # or :5173

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Verify database exists: `psql -l`

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping`
- Check REDIS_URL in `.env`

### Prisma Issues

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Reinstall and regenerate
npm install
npm run prisma:generate
```

### Socket.io Connection Issues

- Check CORS settings in `backend/src/index.ts`
- Verify WebSocket URL in frontend
- Check browser console for connection errors

### Build Errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear TypeScript build cache
rm -rf dist/
```

## Debugging

### Backend Debugging

Add breakpoints in VS Code:

1. Install VS Code extension: "Debugger for Chrome"
2. Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Frontend Debugging

Use React Developer Tools browser extension and browser DevTools.

### Database Debugging

Use Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

## Development Workflow

1. Create a new branch for your feature
2. Make changes and test locally
3. Run linters and fix issues
4. Commit with descriptive messages
5. Push and create a pull request
6. Ensure CI passes

## Useful Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)

## Need Help?

- Check existing issues on GitHub
- Join our community discussions
- Read the contributing guidelines
- Contact the maintainers

Happy coding! 🚀
