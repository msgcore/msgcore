import { useMutation } from '@tanstack/react-query';
import { sdk } from '../shared/lib/sdk';
import { AcceptInviteDto, UpdatePasswordDto } from '@msgcore/sdk';

export function useAcceptInvite() {
  return useMutation({
    mutationFn: (data: AcceptInviteDto) => sdk.auth.acceptInvite(data),
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: UpdatePasswordDto) => sdk.auth.updatePassword(data),
  });
}
