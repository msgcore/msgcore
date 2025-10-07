import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  setupRequired: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = window.location.origin;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);

  // Check health status and load token on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check if setup is required
        const healthResponse = await fetch(`${API_URL}/api/v1/health`);
        const healthData = await healthResponse.json();

        setSetupRequired(healthData.setupRequired || false);

        // If setup is not required, check for existing token
        if (!healthData.setupRequired) {
          const storedToken = localStorage.getItem('msgcore_token');
          if (storedToken) {
            setToken(storedToken);
            const isValid = await fetchUser(storedToken);
            // If token is invalid, it will be cleared in fetchUser
          }
        }
      } catch (error) {
        console.error('Failed to check health status:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchUser = async (accessToken: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/whoami`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Check if the response has the expected structure
        if (result.user) {
          // Map backend userId to frontend id
          const userData = {
            id: result.user.userId || result.user.id,
            email: result.user.email,
            name: result.user.name,
            isAdmin: result.user.isAdmin,
          };
          setUser(userData);
        } else if (result.success && result.data) {
          const user = result.data.user || result.data;
          const userData = {
            id: user.userId || user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.isAdmin,
          };
          setUser(userData);
        } else {
          console.warn('Unexpected API response structure:', result);
          // Clear invalid token
          localStorage.removeItem('msgcore_token');
          setToken(null);
          setUser(null);
        }
      } else {
        // Token is invalid, clear it
        console.log('Token is invalid, clearing...');
        localStorage.removeItem('msgcore_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Clear token on error
      localStorage.removeItem('msgcore_token');
      setToken(null);
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log('Login response:', result); // Debug log

      if (response.ok) {
        // Backend returns accessToken and user directly when successful
        const accessToken = result.accessToken || result.data?.accessToken;
        const user = result.user || result.data?.user;

        if (accessToken && user) {
          localStorage.setItem('msgcore_token', accessToken);
          setToken(accessToken);
          setUser(user);
          return { error: null };
        } else {
          console.error('Missing token or user in response:', result);
          return { error: 'Invalid response from server' };
        }
      } else {
        return { error: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const result = await response.json();
      console.log('Signup response:', result); // Debug log

      if (response.ok) {
        // Backend returns accessToken and user directly when successful
        const accessToken = result.accessToken || result.data?.accessToken;
        const user = result.user || result.data?.user;

        if (accessToken && user) {
          localStorage.setItem('msgcore_token', accessToken);
          setToken(accessToken);
          setUser(user);
          return { error: null };
        } else {
          console.error('Missing token or user in response:', result);
          return { error: 'Invalid response from server' };
        }
      } else {
        return { error: result.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { error: 'Network error. Please try again.' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('msgcore_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    setupRequired,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}