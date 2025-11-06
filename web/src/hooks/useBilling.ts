import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { CreateCheckoutDto } from '@msgcore/sdk';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => sdk.billing.subscription(),
  });
}

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: () => sdk.billing.usage(),
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (data: CreateCheckoutDto) => sdk.billing.checkout(data),
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: () => sdk.billing.portal(),
  });
}

export function useSyncSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sdk.billing.sync(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
  });
}
