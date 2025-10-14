import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle } from 'lucide-react';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useLookupIdentity } from '../../hooks/useIdentities';
import { IdentityBadge } from './IdentityBadge';
import { UnlinkedUserCard } from './UnlinkedUserCard';
import { IdentityToolbox } from './IdentityToolbox';

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

  const {
    data: identity,
    isLoading,
    error,
    refetch,
  } = useLookupIdentity(
    platformId,
    providerUserId,
    selectedProjectId || undefined
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{t('resolver.loading')}</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="inline-flex items-center gap-2 text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{t('resolver.error')}</span>
      </div>
    );
  }

  // No identity found - show unlinked user card
  if (!identity) {
    return (
      <UnlinkedUserCard
        platformId={platformId}
        providerUserId={providerUserId}
        providerUserDisplay={providerUserDisplay}
        onLinked={() => refetch()}
      />
    );
  }

  // Identity found - show badge and optional toolbox
  return (
    <div className="inline-flex items-center gap-2">
      <IdentityBadge
        identity={identity}
        showDetails={showDetails}
      />

      {showToolbox && (
        <IdentityToolbox
          identity={identity}
          onViewIdentity={onViewIdentity ? () => onViewIdentity(identity.id) : undefined}
          onEditIdentity={onEditIdentity ? () => onEditIdentity(identity.id) : undefined}
          onManageAliases={onManageAliases ? () => onManageAliases(identity.id) : undefined}
          onViewHistory={onViewHistory ? () => onViewHistory(identity.id) : undefined}
          onDeleteIdentity={onDeleteIdentity ? () => onDeleteIdentity(identity.id) : undefined}
        />
      )}
    </div>
  );
}
