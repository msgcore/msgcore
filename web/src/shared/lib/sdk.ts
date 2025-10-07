import { MsgCore } from '@msgcore/sdk';

// Use MSGCORE_API_URL or fallback to same-origin
const API_URL = import.meta.env.MSGCORE_API_URL || window.location.origin;

/**
 * MsgCore SDK instance with dynamic token injection
 *
 * The SDK automatically reads the JWT token from localStorage on every request.
 * No need to recreate the instance when the user logs in/out.
 */
export const sdk = new MsgCore({
  apiUrl: API_URL,
  getToken: () => localStorage.getItem('msgcore_token'),
});
