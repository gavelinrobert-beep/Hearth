# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-02-12

### Added
- Initial release of NoIDchat
- Real-time messaging with Socket.io
- User authentication with JWT
- Server and channel management
- Direct messaging functionality
- File upload support
- Typing indicators
- User status tracking (online/offline)
- Role-based permissions system
- AI-powered content moderation using Llama 3
- AI assistant bot foundation
- PostgreSQL database with Prisma ORM
- Redis for caching and session management
- Docker Compose for easy deployment
- Frontend built with React, TypeScript, and Tailwind CSS
- Backend built with Node.js, Express, and TypeScript
- Comprehensive API documentation
- Security features (Helmet, CORS, rate limiting)
- Responsive UI design

### Features

#### Core Functionality
- Create and manage servers
- Create and manage text channels
- Send and receive messages in real-time
- File attachments in messages
- Private direct messages between users
- User registration and login
- Secure password hashing with bcrypt
- JWT-based authentication
- Online/offline user status

#### Real-time Features
- WebSocket connections via Socket.io
- Live message delivery
- Typing indicators showing when users are typing
- User status updates in real-time
- Automatic reconnection handling

#### AI Features
- Content moderation using Llama 3
- Automatic detection of inappropriate content
- Toxicity scoring for messages
- AI assistant for answering questions

#### Security
- JWT token authentication
- Password hashing with bcrypt
- Helmet.js security headers
- CORS configuration
- Rate limiting
- SQL injection prevention via Prisma ORM
- XSS protection

#### Infrastructure
- Docker Compose setup with PostgreSQL and Redis
- Production-ready Dockerfiles
- Nginx reverse proxy configuration
- Database migrations with Prisma
- Environment variable configuration

### Documentation
- Comprehensive README with setup instructions
- API documentation
- Docker deployment guide
- Contributing guidelines
- Security policy
- License (MIT)

## [Unreleased]

### Planned Features
- Voice chat implementation
- Video calling
- Screen sharing
- Message reactions
- Message threads
- Server invites
- Custom emojis
- User profiles
- End-to-end encryption
- Mobile applications

---

For more details on changes, see the [commit history](https://github.com/gavelinrobert-beep/NoIDchat/commits/main).
