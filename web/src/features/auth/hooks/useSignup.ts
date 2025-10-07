import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { sdk } from '@/shared/lib/sdk';
import type { SignupDto } from '@msgcore/sdk';

export function useSignup() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: SignupDto) => sdk.auth.signup(data),
    onSuccess: (response) => {
      // Save token to localStorage
      localStorage.setItem('msgcore_token', response.accessToken);
      // Redirect to app
      navigate('/app');
    },
  });
}
