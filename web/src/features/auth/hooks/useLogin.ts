import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/shared/lib/sdk';
import type { LoginDto } from '@msgcore/sdk';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginDto) => sdk.auth.login(data),
    onSuccess: (response) => {
      // Save token to localStorage
      localStorage.setItem('msgcore_token', response.accessToken);
      // Redirect to dashboard
      navigate('/dashboard');
    },
  });
}
