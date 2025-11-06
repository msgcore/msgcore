import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to allow suspended users to access specific endpoints
 *
 * Use this on billing-related endpoints that suspended users need access to
 * (e.g., updating payment method, viewing billing info, etc.)
 */
export const AllowSuspended = () => SetMetadata('allowSuspended', true);
