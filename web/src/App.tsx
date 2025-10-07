import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ToastProvider } from './contexts/ToastContext';
import { QueryErrorBoundary } from './components/QueryErrorBoundary';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { Messages } from './pages/Messages';
import { Platforms } from './pages/Platforms';
import { ApiKeys } from './pages/ApiKeys';
import { Members } from './pages/Members';
import { Webhooks } from './pages/Webhooks';
import { Identities } from './pages/Identities';
import { Settings } from './pages/Settings';
import { AcceptInvite } from './pages/AcceptInvite';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SetupRoute } from './components/SetupRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      onError: (error: any) => {
        // Global error handling will be done via MutationCache below
      },
    },
  },
});

function RootRedirect() {
  const { setupRequired, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (setupRequired) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <QueryErrorBoundary>
            <AuthProvider>
              <ProjectProvider>
                <Routes>
            <Route
              path="/onboarding"
              element={
                <SetupRoute>
                  <Onboarding />
                </SetupRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/platforms"
              element={
                <ProtectedRoute>
                  <Platforms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/keys"
              element={
                <ProtectedRoute>
                  <ApiKeys />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/webhooks"
              element={
                <ProtectedRoute>
                  <Webhooks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/identities"
              element={
                <ProtectedRoute>
                  <Identities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
                <Route path="/" element={<RootRedirect />} />
              </Routes>
              </ProjectProvider>
            </AuthProvider>
          </QueryErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
