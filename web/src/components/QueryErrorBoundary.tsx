import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export function QueryErrorBoundary({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const errorHandler = (error: any) => {
      // Extract error message
      let message = 'An unexpected error occurred';

      if (error?.message) {
        message = error.message;
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      // Handle 401 errors (unauthorized) - redirect to login
      if (error?.response?.status === 401 || error?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      // Show error toast
      toast.error(message);
    };

    // Subscribe to global mutation errors
    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'error') {
        errorHandler(event.action.error);
      }
    });

    // Subscribe to global query errors
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.query.state.status === 'error') {
        errorHandler(event.query.state.error);
      }
    });

    return () => {
      unsubscribeMutation();
      unsubscribeQuery();
    };
  }, [queryClient, toast, navigate]);

  return <>{children}</>;
}
