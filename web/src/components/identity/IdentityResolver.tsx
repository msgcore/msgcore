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
    <div className="relative inline-block">
      {/* Username Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
      >
        {displayName}
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover Content */}
          <div className="absolute left-0 top-full mt-2 z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-100">
            {identity ? (
              // Linked user - clean card
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {identity.displayName || t('list.identityWithoutName')}
                    </div>
                    {identity.email && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {identity.email}
                      </div>
                    )}
                    {aliasCount > 0 && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-500">
                        <Link2 className="w-3 h-3" />
                        <span>{aliasCount} linked account{aliasCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Unlinked user - simple actions
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {providerUserDisplay || providerUserId}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Unlinked account
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => {
                      // TODO: Open link modal
                      setIsOpen(false);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                  >
                    Link to existing
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Open create modal
                      setIsOpen(false);
                    }}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded hover:bg-gray-800 transition-colors"
                  >
                    Create identity
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
