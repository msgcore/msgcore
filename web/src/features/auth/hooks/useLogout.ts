import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    // Clear token
    localStorage.removeItem('msgcore_token');

    // Clear all queries
    queryClient.clear();

    // Redirect to home
    navigate('/');
  };
}
