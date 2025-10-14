import { useTranslation } from 'react-i18next';
import { User, Mail, Link2 } from 'lucide-react';
import type { IdentityResponse } from '@msgcore/sdk/dist/types';

interface IdentityBadgeProps {
  identity: IdentityResponse;
  showDetails?: boolean;
  className?: string;
}

/**
 * IdentityBadge - Display identity information inline
 * Shows user's display name, email, and alias count in a compact format
 */
export function IdentityBadge({ identity, showDetails = false, className = '' }: IdentityBadgeProps) {
  const { t } = useTranslation('identities');

  const aliasCount = identity.aliases?.length || 0;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Avatar Circle */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <User className="w-4 h-4 text-blue-600" />
      </div>

      {/* Identity Info */}
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-medium text-gray-900 truncate">
          {identity.displayName || t('list.identityWithoutName')}
        </span>

        {showDetails && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {identity.email && (
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3 h-3" />
                {identity.email}
              </span>
            )}
            {identity.email && aliasCount > 0 && <span>•</span>}
            {aliasCount > 0 && (
              <span className="flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {t('badge.aliasesCount', { count: aliasCount })}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
