import { useQuery } from '@tanstack/react-query';
import { sdk } from '@/shared/lib/sdk';

export function useAuth() {
  const token = localStorage.getItem('msgcore_token');

  const { data: user, isLoading, error } = useQuery({
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
    error,
  };
}
