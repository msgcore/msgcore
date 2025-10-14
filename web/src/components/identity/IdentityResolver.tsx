import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, User, Mail, Link2, X } from 'lucide-react';
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
    <>
      {/* Username Button - Click to open modal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        {displayName}
      </button>

      {/* Modal - Shows on click */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
            {identity ? (
              // Linked user - show identity card
              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-4">
                  {/* Header with avatar */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {identity.displayName || t('list.identityWithoutName')}
                      </h3>
                      {identity.email && (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{identity.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  {aliasCount > 0 && (
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Link2 className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{aliasCount}</span>
                        <span>{t('badge.aliasesCount', { count: aliasCount }).toLowerCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Unlinked user - show linking options
              <div className="relative">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <UnlinkedUserCard
                  platformId={platformId}
                  providerUserId={providerUserId}
                  providerUserDisplay={providerUserDisplay}
                  onLinked={() => {
                    refetch();
                    setIsOpen(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
