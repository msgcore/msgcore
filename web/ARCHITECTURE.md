# MsgCore Frontend Architecture

## Overview

This document defines the frontend architecture for MsgCore - a modern, scalable, and maintainable React application following industry best practices.

## Core Principles

1. **Feature-based organization** - Code organized by business features, not technical layers
2. **Separation of concerns** - Clear boundaries between UI, business logic, and data fetching
3. **Type safety first** - Leverage TypeScript and SDK types throughout
4. **Composition over inheritance** - React hooks and composition patterns
5. **Single source of truth** - Use `@msgcore/sdk` for all types and API calls

## Directory Structure

```
src/
├── app/                          # Application-level configuration
│   ├── providers/                # Global providers (Query, Router, Theme)
│   │   ├── AppProviders.tsx      # Combines all providers
│   │   └── QueryProvider.tsx     # React Query setup
│   └── router/                   # Routing configuration
│       ├── Router.tsx             # Main router component
│       ├── routes.tsx             # Route definitions
│       └── ProtectedRoute.tsx    # Auth guard component
│
├── features/                     # Feature-based modules (vertical slices)
│   ├── auth/                     # Authentication feature
│   │   ├── hooks/                # Auth-specific hooks
│   │   │   ├── useAuth.ts        # Main auth hook
│   │   │   ├── useLogin.ts       # Login mutation
│   │   │   ├── useSignup.ts      # Signup mutation
│   │   │   └── useSession.ts     # Session management
│   │   ├── components/           # Auth UI components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   └── context/              # Auth context (optional, minimal)
│   │       └── AuthContext.tsx
│   │
│   ├── projects/                 # Projects feature
│   │   ├── hooks/
│   │   │   ├── useProjects.ts
│   │   │   ├── useProject.ts
│   │   │   └── useCreateProject.ts
│   │   └── components/
│   │       ├── ProjectCard.tsx
│   │       ├── ProjectList.tsx
│   │       └── CreateProjectForm.tsx
│   │
│   ├── messages/                 # Messages feature
│   │   ├── hooks/
│   │   └── components/
│   │
│   ├── platforms/                # Platforms feature
│   │   ├── hooks/
│   │   └── components/
│   │
│   ├── api-keys/                 # API Keys feature
│   │   ├── hooks/
│   │   └── components/
│   │
│   └── dashboard/                # Dashboard feature
│       ├── hooks/
│       └── components/
│
├── shared/                       # Shared code across features
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── Spinner.tsx
│   │   └── layout/               # Layout components
│   │       ├── AppShell.tsx
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── hooks/                    # Shared custom hooks
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useToggle.ts
│   │
│   └── lib/                      # Core libraries and utilities
│       ├── sdk.ts                # MsgCore SDK + axios interceptors
│       ├── queryClient.ts        # React Query configuration
│       └── utils.ts              # Utility functions
│
├── pages/                        # Page components (thin, composition only)
│   ├── public/                   # Public pages
│   │   ├── HomePage.tsx
│   │   ├── DocsPage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── PrivacyPage.tsx
│   │   └── TermsPage.tsx
│   │
│   └── app/                      # Authenticated pages
│       ├── DashboardPage.tsx
│       ├── MessagesPage.tsx
│       ├── PlatformsPage.tsx
│       ├── ApiKeysPage.tsx
│       ├── MembersPage.tsx
│       ├── BillingPage.tsx
│       └── SettingsPage.tsx
│
├── App.tsx                       # Root application component
├── main.tsx                      # Application entry point
└── vite-env.d.ts                 # Vite type definitions
```

## Architecture Patterns

### 1. Feature Module Pattern

Each feature is self-contained with its own:

- **Hooks** - Business logic using SDK directly
- **Components** - UI components specific to the feature

**No API layer needed** - `@msgcore/sdk` is already our API layer!

**Example: Auth Feature**

```typescript
// features/auth/hooks/useLogin.ts
import { useMutation } from '@tanstack/react-query';
import { sdk } from '@/shared/lib/sdk';
import { useNavigate } from 'react-router-dom';
import type { LoginDto } from '@msgcore/sdk';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginDto) => sdk.auth.login(data),
    onSuccess: (data) => {
      localStorage.setItem('msgcore_token', data.accessToken);
      navigate('/app');
    },
  });
}

// features/auth/components/LoginForm.tsx
import { useLogin } from '../hooks/useLogin';

export function LoginForm() {
  const login = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    login.mutate({ email, password });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// pages/app/LoginPage.tsx
import { LoginForm } from '@/features/auth/components/LoginForm';

export function LoginPage() {
  return (
    <div className="container">
      <LoginForm />
    </div>
  );
}
```

### 2. Data Fetching Strategy

**React Query for all server state:**

```typescript
// features/projects/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/shared/lib/sdk';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => sdk.projects.list(),
  });
}

// features/projects/hooks/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/shared/lib/sdk';
import type { CreateProjectDto } from '@msgcore/sdk';

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => sdk.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

**Query Key Conventions:**

```typescript
// Single resource
['projects', projectId][('messages', messageId)][('platforms', platformId)][
  // List with filters
  ('messages', { projectId, status: 'sent' })
][('platforms', { projectId })][
  // Stats/Aggregations
  ('messages', 'stats', { projectId })
][('platforms', 'health')];
```

### 3. Authentication Flow

**Clean JWT authentication with SDK getToken function:**

```typescript
// shared/lib/sdk.ts
import { MsgCore } from '@msgcore/sdk';

const API_URL = import.meta.env.MSGCORE_API_URL || 'http://localhost:3000';

// Create SDK instance with dynamic token getter
export const sdk = new MsgCore({
  apiUrl: API_URL,
  getToken: () => localStorage.getItem('msgcore_token'), // Called on every request!
});
```

**That's it!** SDK automatically:

- ✅ Reads fresh token on every request
- ✅ Handles token changes (login/logout)
- ✅ No manual interceptors needed
- ✅ Single SDK instance, export as constant

**How it works:**

```typescript
// On first load (no token)
sdk.auth.login(data); // → No Authorization header

// After login
localStorage.setItem('msgcore_token', response.accessToken);
sdk.projects.list(); // → Authorization: Bearer <token>  ✅

// After logout
localStorage.removeItem('msgcore_token');
sdk.projects.list(); // → No Authorization header  ✅
```

**Priority order:** `getToken()` > `apiKey` > `jwtToken`

**Backwards compatible:** Old `jwtToken` config still works for CLI/server-side usage.

**Auth state management:**

```typescript
// features/auth/hooks/useAuth.ts
import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/shared/lib/sdk';

export function useAuth() {
  const token = localStorage.getItem('msgcore_token');

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: () => sdk.auth.whoami(),
    enabled: !!token,
    retry: false,
    staleTime: Infinity, // Session doesn't change often
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
  };
}
```

### 4. Routing Strategy

**Route-based code splitting:**

```typescript
// app/router/routes.tsx
import { lazy } from 'react';

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'));
const MessagesPage = lazy(() => import('@/pages/app/MessagesPage'));

export const routes = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'platforms', element: <PlatformsPage /> },
    ],
  },
];
```

**Protected routes:**

```typescript
// app/router/ProtectedRoute.tsx
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';
import { AppShell } from '@/shared/components/layout/AppShell';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/" />;

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
```

### 5. Type Safety

**Use SDK types everywhere:**

```typescript
import type {
  ProjectResponse,
  MessageResponse,
  CreateProjectDto,
} from '@msgcore/sdk';

// Components
interface ProjectCardProps {
  project: ProjectResponse;
}

// Hooks
function useCreateProject() {
  return useMutation({
    mutationFn: (data: CreateProjectDto) => sdk.projects.create(data),
  });
}
```

**Avoid `any` - use proper types:**

```typescript
// ❌ Bad
const handleSubmit = (data: any) => { ... }

// ✅ Good
const handleSubmit = (data: CreateProjectDto) => { ... }
```

### 6. Error Handling

**Global error boundary:**

```typescript
// app/providers/AppProviders.tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

export function AppProviders({ children }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <ErrorFallback error={error} reset={resetErrorBoundary} />
          )}
        >
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
```

**React Query error handling:**

```typescript
// shared/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      onError: (error) => {
        // Global error toast
        toast.error(error.message);
      },
    },
  },
});
```

### 7. Component Patterns

**Composition over props drilling:**

```typescript
// ✅ Good - Composition
<Card>
  <CardHeader>
    <CardTitle>Projects</CardTitle>
  </CardHeader>
  <CardContent>
    <ProjectList />
  </CardContent>
</Card>

// ❌ Bad - Props drilling
<Card
  title="Projects"
  content={<ProjectList />}
  headerActions={...}
/>
```

**Custom hooks for logic:**

```typescript
// features/messages/hooks/useMessageFilters.ts
export function useMessageFilters() {
  const [filters, setFilters] = useState({
    status: 'all',
    platform: 'all',
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return { filters, updateFilter };
}
```

## State Management Strategy

### Server State (React Query)

- API data
- Cache management
- Background refetching
- Optimistic updates

### UI State (React hooks)

- Form state
- Modal open/close
- Filters
- Local toggles

### Global State (Context - minimal use)

- Theme
- Locale
- User session (auth)

**Avoid Redux** - React Query + hooks handle 99% of cases

## Testing Strategy

```
features/
  auth/
    __tests__/
      useLogin.test.ts
      useAuth.test.ts
      LoginForm.test.tsx
```

- **Unit tests** - Hooks and utilities
- **Integration tests** - Feature flows
- **E2E tests** - Critical user paths

## Performance Optimizations

1. **Code splitting** - Lazy load routes
2. **React Query caching** - Reduce API calls
3. **Memoization** - `useMemo`, `useCallback` when needed
4. **Virtual scrolling** - Large lists (messages, logs)
5. **Debouncing** - Search inputs

## Security Best Practices

1. **No secrets in frontend** - Only public API URLs
2. **JWT in localStorage** - Auto-attached by SDK
3. **HTTPS only** - All API calls
4. **XSS protection** - Sanitize user inputs
5. **CSRF tokens** - Handled by backend

## Migration from Herick's Code

### Phase 1: Foundation

1. Set up architecture folders
2. Move SDK to shared/lib
3. Set up React Query
4. Create base UI components

### Phase 2: Auth Feature

1. Setup SDK with axios interceptors
2. Build auth hooks (useAuth, useLogin, useSignup)
3. Migrate LoginForm and SignupForm components
4. Set up protected routes

### Phase 3: Features Migration

1. Projects feature
2. Messages feature
3. Platforms feature
4. API Keys feature

### Phase 4: Pages

1. Dashboard
2. Public pages (Home, Docs)

## References

- **React Query**: https://tanstack.com/query/latest
- **React Router**: https://reactrouter.com
- **TypeScript**: https://www.typescriptlang.org
- **MsgCore SDK**: `@msgcore/sdk`

---

**This architecture ensures:**
✅ Scalability - Easy to add new features
✅ Maintainability - Clear code organization
✅ Type Safety - Full TypeScript coverage
✅ Performance - Optimized data fetching
✅ Developer Experience - Intuitive patterns
