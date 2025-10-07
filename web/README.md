# MsgCore Frontend

Modern React frontend for MsgCore - Universal Messaging Gateway.

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone and install:**

```bash
git clone https://github.com/msgcore/msgcore.git
cd msgcore/web
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env
```

Edit `.env` and set your backend API URL:

```env
MSGCORE_API_URL=http://localhost:3000
```

3. **Start development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Architecture

### Core Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **TanStack Query** - Server state management
- **MsgCore SDK** - Official TypeScript SDK

### Authentication

Uses MsgCore's native authentication (`/api/v1/auth`):
- Email/Password signup and login
- JWT token-based sessions
- Auto token refresh

**No external auth providers required.**

### Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── lib/            # SDK and utilities
├── types/          # TypeScript types
└── main.tsx        # Application entry
```

## Development

### Available Scripts

```bash
npm run dev         # Start dev server
npm run build       # Production build
npm run preview     # Preview production build
npm run lint        # Run ESLint
npm run type-check  # TypeScript validation
```

### Using the MsgCore SDK

The frontend uses `@msgcore/sdk` for all API interactions:

```typescript
import { MsgCore } from '@msgcore/sdk';

const sdk = new MsgCore({
  apiUrl: 'http://localhost:3000',
  getToken: () => localStorage.getItem('msgcore_token')
});

// Send message
await sdk.messages.send({
  project: 'project-id',
  target: 'platform-id:user:123',
  content: { text: 'Hello!' }
});

// List projects
const projects = await sdk.projects.list();
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MSGCORE_API_URL` | Backend API base URL | `http://localhost:3000` |
| `MSGCORE_API_VERSION` | API version | `v1` |
| `MSGCORE_ENV` | Environment | `development` |

## Deployment

### Docker

```bash
docker build -t msgcore-frontend .
docker run -p 3001:80 msgcore-frontend
```

### Static Hosting

Build and deploy to any static host:

```bash
npm run build
# Deploy 'dist/' folder to Vercel, Netlify, etc.
```

## Contributing

1. Follow existing code patterns
2. Use TypeScript strictly
3. All API calls through `@msgcore/sdk`
4. Test authentication flows locally

## License

Copyright 2025 MsgCore

Licensed under the Apache License, Version 2.0. See [LICENSE](./LICENSE) file for details.

---

**Apache 2.0 Licensed - Build the agentic future freely! 🌟**
