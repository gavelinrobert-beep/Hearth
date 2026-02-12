# Hearth Frontend

A modern, real-time chat application frontend built with React, TypeScript, and Socket.IO. This is the client-side application for Hearth (formerly NoIDchat), a Discord-alternative with AI-powered features and real-time communication capabilities.

## 📋 Overview

Hearth Frontend provides a responsive, feature-rich user interface for real-time messaging, server/channel management, and direct messaging. Built with modern web technologies and best practices, it offers a seamless chat experience with instant message delivery, typing indicators, and persistent state management.

**Key Features:**
- 🔐 Secure authentication with JWT tokens
- 💬 Real-time messaging with Socket.IO
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-first design approach
- ⚡ Fast development with Vite and Hot Module Replacement (HMR)
- 🎯 Type-safe with TypeScript
- 🔄 Optimistic UI updates
- 💾 Persistent authentication state

## 🛠️ Tech Stack

### Core Technologies
- **[React 18](https://react.dev/)** - UI library for building component-based interfaces
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe JavaScript superset
- **[Vite 5](https://vitejs.dev/)** - Next-generation frontend build tool with lightning-fast HMR

### Styling & UI
- **[Tailwind CSS 3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful, customizable icon library
- **[PostCSS](https://postcss.org/)** - CSS transformation tool

### State Management & Data Fetching
- **[Zustand 4](https://zustand-demo.pmnd.rs/)** - Lightweight state management with persistence
- **[Axios](https://axios-http.com/)** - Promise-based HTTP client
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation

### Real-time Communication
- **[Socket.IO Client 4](https://socket.io/)** - WebSocket library for real-time, bidirectional communication

### Routing & Navigation
- **[React Router 6](https://reactrouter.com/)** - Declarative routing for React applications

### Utilities
- **[date-fns](https://date-fns.org/)** - Modern JavaScript date utility library

### Development Tools
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting
- **[@typescript-eslint](https://typescript-eslint.io/)** - TypeScript-specific linting rules
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - CSS vendor prefix automation

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChannelView.tsx      # Channel messages display
│   │   ├── DirectMessages.tsx   # DM list component
│   │   ├── ServerList.tsx       # Server/guild sidebar
│   │   └── Sidebar.tsx          # Main navigation sidebar
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── index.ts             # Hook exports
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── useMessages.ts       # Message management hook
│   │   └── useSocket.ts         # Socket.IO connection hook
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── Chat.tsx             # Main chat interface
│   │   ├── Login.tsx            # Login page
│   │   └── Register.tsx         # Registration page
│   │
│   ├── services/            # External service integrations
│   │   ├── api.ts               # Axios HTTP client configuration
│   │   └── socket.ts            # Socket.IO client setup
│   │
│   ├── store/               # Zustand state stores
│   │   ├── index.ts             # Store exports
│   │   ├── authStore.ts         # Authentication state
│   │   ├── messageStore.ts      # Message cache state
│   │   ├── serverStore.ts       # Server/channel state
│   │   └── uiStore.ts           # UI state (modals, sidebar)
│   │
│   ├── styles/              # Global styles
│   │   └── index.css            # Tailwind imports & custom CSS
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts             # Shared types & interfaces
│   │
│   ├── App.tsx              # Root application component
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type declarations
│
├── public/                  # Static assets
├── .env.example             # Environment variable template
├── .dockerignore            # Docker ignore rules
├── Dockerfile               # Container configuration
├── eslint.config.js         # ESLint configuration
├── index.html               # HTML entry point
├── nginx.conf               # Nginx configuration for production
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── tsconfig.node.json       # TypeScript config for Node
└── vite.config.ts           # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- A running instance of the Hearth backend server
- Environment variables configured (see below)

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd Hearth/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_WS_URL=ws://localhost:3000
   ```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Development Features:**
- ⚡ Lightning-fast HMR (Hot Module Replacement)
- 🔍 TypeScript type checking
- 🎨 Tailwind CSS JIT (Just-In-Time) compilation
- 🔧 React Fast Refresh for instant updates

### Building for Production

Build optimized production bundle:

```bash
npm run build
```

This command:
1. Runs TypeScript compiler (`tsc`) for type checking
2. Creates an optimized production build in `dist/`
3. Minifies and tree-shakes JavaScript
4. Optimizes CSS and assets

**Build output:** `dist/` directory

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

Serves the production build at `http://localhost:5173`

### Linting

Run ESLint to check code quality:

```bash
npm run lint
```

**Linting rules:**
- TypeScript-specific rules via `@typescript-eslint`
- React Hooks rules for proper hook usage
- React Refresh rules for HMR compatibility
- Maximum 0 warnings allowed in CI/CD

## 🏗️ Component Architecture

### Component Organization

Components are organized by responsibility and reusability:

#### **Layout Components** (`components/`)
Handle major UI sections and layout structure.

```tsx
// Example: ServerList.tsx
import { useServerStore } from '../store/serverStore';

export default function ServerList() {
  const { servers, activeServerId, setActiveServer } = useServerStore();
  
  return (
    <div className="flex flex-col w-16 bg-dark-900">
      {servers.map((server) => (
        <ServerIcon 
          key={server.id}
          server={server}
          isActive={server.id === activeServerId}
          onClick={() => setActiveServer(server.id)}
        />
      ))}
    </div>
  );
}
```

#### **Page Components** (`pages/`)
Route-level components that compose layouts and handle page-specific logic.

```tsx
// Example: Chat.tsx
import { Navigate, Route, Routes } from 'react-router-dom';
import ServerList from '../components/ServerList';
import Sidebar from '../components/Sidebar';
import ChannelView from '../components/ChannelView';

export default function Chat() {
  return (
    <div className="flex h-screen">
      <ServerList />
      <Sidebar />
      <Routes>
        <Route path="/channels/:serverId/:channelId" element={<ChannelView />} />
        <Route path="/dm/:userId" element={<DirectMessages />} />
        <Route path="/" element={<Navigate to="/channels/@me" />} />
      </Routes>
    </div>
  );
}
```

### Component Patterns

#### **Container/Presenter Pattern**
Separate data fetching logic from presentation:

```tsx
// Container (handles logic)
function MessageListContainer({ channelId }: { channelId: string }) {
  const { messages, isLoading } = useMessages({ channelId });
  
  if (isLoading) return <LoadingSpinner />;
  
  return <MessageList messages={messages} />;
}

// Presenter (handles UI)
function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex flex-col space-y-2">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
```

#### **Composition Pattern**
Build complex UIs from simple, reusable components:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Server Settings</CardTitle>
  </CardHeader>
  <CardBody>
    <SettingsForm />
  </CardBody>
  <CardFooter>
    <Button onClick={handleSave}>Save</Button>
  </CardFooter>
</Card>
```

## 🗄️ State Management

### Zustand Stores

Hearth uses Zustand for lightweight, performant state management without boilerplate.

#### **Auth Store** (`authStore.ts`)
Manages authentication state with persistence:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);
```

**Usage:**
```tsx
function UserProfile() {
  const { user, logout } = useAuthStore();
  
  return (
    <div>
      <p>Welcome, {user?.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### **Message Store** (`messageStore.ts`)
Caches messages by channel for optimal performance:

```typescript
interface MessageState {
  messages: Record<string, Message[]>; // channelId -> messages
  addMessage: (channelId: string, message: Message) => void;
  editMessage: (channelId: string, messageId: string, content: string) => void;
  deleteMessage: (channelId: string, messageId: string) => void;
  setMessages: (channelId: string, messages: Message[]) => void;
  clearMessages: (channelId: string) => void;
}
```

**Key Features:**
- Channel-based message grouping
- Optimistic updates for instant UI feedback
- CRUD operations for messages
- Memory-efficient message caching

#### **Server Store** (`serverStore.ts`)
Manages servers, channels, and navigation state:

```typescript
interface ServerState {
  servers: Server[];
  activeServerId: string | null;
  activeChannelId: string | null;
  setServers: (servers: Server[]) => void;
  setActiveServer: (serverId: string) => void;
  setActiveChannel: (channelId: string) => void;
  addServer: (server: Server) => void;
  // ... more actions
}
```

#### **UI Store** (`uiStore.ts`)
Controls UI state like modals, sidebars, and overlays:

```typescript
interface UIState {
  isSidebarOpen: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}
```

### Store Best Practices

1. **Selective subscriptions** - Only subscribe to needed state:
   ```tsx
   // ❌ Subscribes to entire store
   const store = useAuthStore();
   
   // ✅ Subscribes only to user
   const user = useAuthStore((state) => state.user);
   ```

2. **Derived state** - Compute values in selectors:
   ```tsx
   const isAdmin = useAuthStore((state) => 
     state.user?.role === 'admin'
   );
   ```

3. **Batch updates** - Update multiple values together:
   ```tsx
   setState((state) => ({
     ...state,
     field1: value1,
     field2: value2,
   }));
   ```

## 🪝 Custom Hooks

### `useAuth`

Manages authentication operations with automatic state updates.

```typescript
interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Usage
function LoginForm() {
  const { login, isAuthenticated } = useAuth();
  
  const handleSubmit = async (data) => {
    try {
      await login({ email: data.email, password: data.password });
      // Automatically navigates on success
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Features:**
- Automatic token management
- Socket initialization on login
- Persistent session storage
- Type-safe credentials

### `useSocket`

Manages Socket.IO connection and real-time events.

```typescript
interface UseSocketReturn {
  isConnected: boolean;
  message: Message | null;
  messageUpdate: Message | null;
  messageDelete: { id: string; channelId: string } | null;
  userTyping: TypingData | null;
  userStoppedTyping: TypingData | null;
  error: string | null;
  sendMessage: (channelId: string, content: string, fileUrl?: string) => void;
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  startTyping: (channelId: string) => void;
  stopTyping: (channelId: string) => void;
}

// Usage
function ChatInput({ channelId }: { channelId: string }) {
  const { sendMessage, startTyping, stopTyping, isConnected } = useSocket();
  const [content, setContent] = useState('');
  
  const handleChange = (e) => {
    setContent(e.target.value);
    startTyping(channelId);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim() && isConnected) {
      sendMessage(channelId, content);
      setContent('');
      stopTyping(channelId);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={content}
        onChange={handleChange}
        disabled={!isConnected}
        placeholder={isConnected ? "Type a message..." : "Connecting..."}
      />
    </form>
  );
}
```

**Features:**
- Automatic connection management
- Event-based message updates
- Typing indicators
- Connection status tracking
- Error handling

### `useMessages`

Handles message fetching, caching, and CRUD operations.

```typescript
interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchMessages: () => Promise<void>;
  fetchMoreMessages: () => Promise<void>;
  addMessage: (message: Message) => void;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  clearMessages: () => void;
}

// Usage
function MessageList({ channelId }: { channelId: string }) {
  const { 
    messages, 
    isLoading, 
    hasMore, 
    fetchMoreMessages 
  } = useMessages({ channelId, limit: 50 });
  
  const handleScroll = (e) => {
    if (e.target.scrollTop === 0 && hasMore && !isLoading) {
      fetchMoreMessages();
    }
  };
  
  return (
    <div onScroll={handleScroll}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
}
```

**Features:**
- Automatic initial fetch
- Infinite scroll pagination with cursor
- Optimistic updates
- Duplicate message prevention
- Error handling and retry

## 🎨 Styling

### Tailwind CSS

Hearth uses Tailwind CSS for utility-first styling with custom theme extensions.

#### **Custom Theme** (`tailwind.config.js`)

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        500: '#3b82f6',
        700: '#1d4ed8',
        900: '#1e3a8a',
      },
      dark: {
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
    },
  },
}
```

#### **Common Patterns**

**Layout:**
```tsx
<div className="flex h-screen">
  {/* Sidebar */}
  <aside className="w-60 bg-dark-800 border-r border-dark-700">
    <nav className="p-4 space-y-2">
      <button className="w-full px-4 py-2 rounded hover:bg-dark-700 transition">
        Channel
      </button>
    </nav>
  </aside>
  
  {/* Main content */}
  <main className="flex-1 flex flex-col">
    <header className="h-12 border-b border-dark-700 px-4 flex items-center">
      <h1 className="text-lg font-semibold">Channel Name</h1>
    </header>
    <div className="flex-1 overflow-y-auto p-4">
      {/* Content */}
    </div>
  </main>
</div>
```

**Buttons:**
```tsx
{/* Primary button */}
<button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition">
  Send Message
</button>

{/* Secondary button */}
<button className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-md transition">
  Cancel
</button>
```

**Cards:**
```tsx
<div className="bg-dark-800 rounded-lg shadow-lg p-6 border border-dark-700">
  <h2 className="text-xl font-bold mb-4">Server Settings</h2>
  <div className="space-y-4">
    {/* Content */}
  </div>
</div>
```

**Responsive Design:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>

<aside className="hidden md:block w-60">
  {/* Hidden on mobile, visible on md+ */}
</aside>
```

### Global Styles

Located in `src/styles/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom scrollbar */
@layer utilities {
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
  }
  
  .scrollbar-thin::-webkit-scrollbar-track {
    background: #1f2937;
  }
  
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #4b5563;
    border-radius: 4px;
  }
}
```

## 🔄 Real-time Features

### Socket.IO Integration

Hearth uses Socket.IO for bidirectional, event-based real-time communication.

#### **Socket Service** (`services/socket.ts`)

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initSocket(token: string): Socket {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
  
  socket = io(wsUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });
  
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

#### **Real-time Events**

**Incoming Events (Server → Client):**
- `message` - New message received
- `messageUpdate` - Message edited
- `messageDelete` - Message deleted
- `userTyping` - User started typing
- `userStoppedTyping` - User stopped typing
- `userJoined` - User joined channel
- `userLeft` - User left channel
- `channelUpdate` - Channel modified
- `serverUpdate` - Server modified

**Outgoing Events (Client → Server):**
- `sendMessage` - Send new message
- `joinChannel` - Join a channel room
- `leaveChannel` - Leave a channel room
- `typing` - Start typing indicator
- `stopTyping` - Stop typing indicator
- `updatePresence` - Update online status

#### **Message Flow Example**

```typescript
// 1. User types message
function ChatInput() {
  const { sendMessage, startTyping, stopTyping } = useSocket();
  
  const handleSubmit = (content: string) => {
    // Emit to server
    sendMessage(channelId, content);
  };
  
  return <input onChange={() => startTyping(channelId)} />;
}

// 2. Server broadcasts to all clients
// 3. All clients receive via useSocket hook
function MessageList() {
  const { message } = useSocket(); // Auto-updates on new message
  const { addMessage } = useMessages({ channelId });
  
  useEffect(() => {
    if (message && message.channelId === channelId) {
      addMessage(message); // Add to local state
    }
  }, [message]);
}
```

### Typing Indicators

```typescript
function TypingIndicator({ channelId }: { channelId: string }) {
  const { userTyping, userStoppedTyping } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (userTyping?.channelId === channelId) {
      setTypingUsers((prev) => new Set(prev).add(userTyping.username));
    }
  }, [userTyping]);
  
  useEffect(() => {
    if (userStoppedTyping?.channelId === channelId) {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        next.delete(userStoppedTyping.username);
        return next;
      });
    }
  }, [userStoppedTyping]);
  
  if (typingUsers.size === 0) return null;
  
  return (
    <div className="text-sm text-gray-400 px-4 py-2">
      {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
    </div>
  );
}
```

## 🛣️ Routing

### React Router Setup

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const { token } = useAuthStore();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={token ? <Navigate to="/" /> : <Register />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/*" 
          element={token ? <Chat /> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

// Chat.tsx - Nested routes
function Chat() {
  return (
    <div className="flex h-screen">
      <ServerList />
      <Sidebar />
      <Routes>
        <Route path="/channels/:serverId/:channelId" element={<ChannelView />} />
        <Route path="/channels/@me" element={<DirectMessages />} />
        <Route path="/dm/:userId" element={<DirectMessageView />} />
        <Route path="/" element={<Navigate to="/channels/@me" />} />
      </Routes>
    </div>
  );
}
```

### Route Parameters

```typescript
// Access route parameters
import { useParams, useNavigate } from 'react-router-dom';

function ChannelView() {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>();
  const navigate = useNavigate();
  
  const handleChannelChange = (newChannelId: string) => {
    navigate(`/channels/${serverId}/${newChannelId}`);
  };
  
  return <div>Channel: {channelId}</div>;
}
```

## 📜 Available Scripts

### `npm run dev`
Starts the development server with HMR.
- **Port:** 5173
- **Host:** All interfaces (0.0.0.0)
- **Hot Reload:** Enabled

### `npm run build`
Creates production-optimized build.
1. Runs TypeScript compiler for type checking
2. Builds with Vite (minification, tree-shaking, code splitting)
3. Outputs to `dist/` directory

**Output:**
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other-chunks]-[hash].js
└── index.html
```

### `npm run preview`
Serves the production build locally for testing.
- Useful for testing production behavior
- Same port as dev server (5173)

### `npm run lint`
Runs ESLint on TypeScript/TSX files.
- Checks for code quality issues
- Enforces React Hooks rules
- Reports unused disable directives
- **Max warnings:** 0 (fails on any warnings)

**Fix automatically:**
```bash
npm run lint -- --fix
```

## 🏗️ Building for Production

### Local Build

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview locally
npm run preview
```

### Docker Build

```bash
# Build Docker image
docker build -t hearth-frontend .

# Run container
docker run -p 80:80 hearth-frontend
```

**Dockerfile highlights:**
- Multi-stage build for optimal size
- Node.js build stage
- Nginx serving stage
- Environment variable support at runtime

### Production Checklist

- [ ] Set correct `VITE_API_URL` and `VITE_WS_URL`
- [ ] Run `npm run lint` and fix issues
- [ ] Run `npm run build` successfully
- [ ] Test with `npm run preview`
- [ ] Verify environment variables are loaded
- [ ] Check bundle size (`dist/` folder)
- [ ] Test in target browsers
- [ ] Enable HTTPS for WebSocket connections
- [ ] Configure CORS on backend

### Optimization Tips

**Code Splitting:**
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const Chat = lazy(() => import('./pages/Chat'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

**Tree Shaking:**
```typescript
// ✅ Import only what you need
import { format } from 'date-fns';

// ❌ Imports entire library
import * as dateFns from 'date-fns';
```

## 🔐 Environment Variables

Environment variables are prefixed with `VITE_` to be exposed to the client.

### Configuration

Create `.env` file in the frontend root:

```env
# API URL - Backend REST API endpoint
VITE_API_URL=http://localhost:3000

# WebSocket URL - Socket.IO connection endpoint
VITE_WS_URL=ws://localhost:3000
```

### Production Configuration

```env
# Production API (HTTPS recommended)
VITE_API_URL=https://api.hearth.example.com

# Production WebSocket (WSS recommended)
VITE_WS_URL=wss://api.hearth.example.com
```

### Accessing Variables

```typescript
// In TypeScript/JavaScript
const apiUrl = import.meta.env.VITE_API_URL;
const wsUrl = import.meta.env.VITE_WS_URL;

// Default values
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Type definitions (src/vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_WS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Docker Environment Variables

When using Docker, pass environment variables at runtime:

```bash
docker run -p 80:80 \
  -e VITE_API_URL=https://api.example.com \
  -e VITE_WS_URL=wss://api.example.com \
  hearth-frontend
```

Or use docker-compose:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      VITE_API_URL: https://api.example.com
      VITE_WS_URL: wss://api.example.com
```

### Security Notes

- ⚠️ **Never commit `.env` files** (use `.env.example` instead)
- ⚠️ **Don't store secrets** in environment variables (they're exposed to client)
- ✅ **Use HTTPS/WSS** in production for secure connections
- ✅ **Validate URLs** before using them in API calls

## 🧪 Testing Checklist

Before deploying:

1. **Authentication Flow**
   - [ ] Login works with valid credentials
   - [ ] Login fails with invalid credentials
   - [ ] Registration creates new accounts
   - [ ] Logout clears session
   - [ ] Token persists on page reload

2. **Real-time Features**
   - [ ] Messages appear instantly
   - [ ] Typing indicators show/hide correctly
   - [ ] Socket reconnects on disconnect
   - [ ] Messages don't duplicate
   - [ ] Offline messages sync on reconnect

3. **UI/UX**
   - [ ] Responsive on mobile devices
   - [ ] Sidebar toggles work
   - [ ] Modals open and close
   - [ ] Forms validate correctly
   - [ ] Loading states display properly

4. **Performance**
   - [ ] Initial load is fast (<3s)
   - [ ] No memory leaks
   - [ ] Images load efficiently
   - [ ] Smooth scrolling with many messages
   - [ ] Bundle size is reasonable (<500KB gzipped)

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [React Router Docs](https://reactrouter.com/)

## 🤝 Contributing

Please refer to the main repository's [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## 📄 License

See [LICENSE](../LICENSE) file in the root repository.

---

**Built with ❤️ by the Hearth Team**
