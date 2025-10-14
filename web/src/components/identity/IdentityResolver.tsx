import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, User, Mail, Link2 } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useLookupIdentity } from '../../hooks/useIdentities';
import { UnlinkedUserCard } from './UnlinkedUserCard';

interface IdentityResolverProps {
  platformId: string;
  providerUserId: string;
  providerUserDisplay?: string;
  showDetails?: boolean;
  showToolbox?: boolean;
  onViewIdentity?: (identityId: string) => void;
  onEditIdentity?: (identityId: string) => void;
  onManageAliases?: (identityId: string) => void;
  onViewHistory?: (identityId: string) => void;
  onDeleteIdentity?: (identityId: string) => void;
  fallback?: React.ReactNode;
}

/**
 * IdentityResolver - Smart wrapper component that automatically resolves identities
 *
 * This component:
 * 1. Looks up identity by platformId + providerUserId
 * 2. Shows IdentityBadge + IdentityToolbox if identity exists
 * 3. Shows UnlinkedUserCard if no identity found
 * 4. Handles loading and error states
 *
 * Usage:
 * ```tsx
 * <IdentityResolver
 *   platformId={message.platformId}
 *   providerUserId={message.providerUserId}
 *   providerUserDisplay={message.userDisplay}
 *   showDetails
 *   showToolbox
 *   onViewIdentity={(id) => navigate(`/identities/${id}`)}
 * />
 * ```
 */
export function IdentityResolver({
  platformId,
  providerUserId,
  providerUserDisplay,
  showDetails = false,
  showToolbox = false,
  onViewIdentity,
  onEditIdentity,
  onManageAliases,
  onViewHistory,
  onDeleteIdentity,
  fallback,
}: IdentityResolverProps) {
  const { t } = useTranslation('identities');
  const { selectedProjectId } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);

  // Guard: Don't render if required parameters are missing
  if (!platformId || !providerUserId || !selectedProjectId) {
    if (fallback) {
      return <>{fallback}</>;
    }
    if (providerUserDisplay) {
      return <span className="text-sm font-medium text-gray-700">{providerUserDisplay}</span>;
    }
    return null;
  }

  const {
    data: identity,
    isLoading,
    error,
    refetch,
  } = useLookupIdentity(
    platformId,
    providerUserId,
    selectedProjectId
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-1 text-gray-500">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-xs">{t('resolver.loading')}</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="inline-flex items-center gap-1 text-red-600">
        <AlertCircle className="w-3 h-3" />
        <span className="text-xs">{t('resolver.error')}</span>
      </div>
    );
  }

  const displayName = identity?.displayName || providerUserDisplay || providerUserId;
  const aliasCount = identity?.aliases?.length || 0;

  return (
    <div className="relative inline-block">
      {/* Username Button - Click to open popover */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        {displayName}
      </button>

      {/* Popover - Shows on click */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover Content */}
          <div className="absolute left-0 top-full mt-1 z-20 min-w-[280px]">
            {identity ? (
              // Linked user - show identity details
              <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {identity.displayName || t('list.identityWithoutName')}
                      </h3>
                      {identity.email && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{identity.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Aliases Count */}
                  {aliasCount > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t">
                      <Link2 className="w-3 h-3" />
                      <span>{t('badge.aliasesCount', { count: aliasCount })}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Unlinked user - show linking options
              <UnlinkedUserCard
                platformId={platformId}
                providerUserId={providerUserId}
                providerUserDisplay={providerUserDisplay}
                onLinked={() => {
                  refetch();
                  setIsOpen(false);
                }}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
