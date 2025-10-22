import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserX, Search, Plus, Loader2, Link } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProjectContext } from '../../contexts/ProjectContext';
import { useSearchIdentities, useQuickLinkIdentity, useAddAlias } from '../../hooks/useIdentities';
import type { IdentityResponse } from '@msgcore/sdk/dist/types';

interface UnlinkedUserCardProps {
  platformId: string;
  providerUserId: string;
  providerUserDisplay?: string;
  onLinked?: () => void;
}

/**
 * UnlinkedUserCard - Display when a user doesn't have an identity
 * Provides options to link to existing identity or create new one
 */
export function UnlinkedUserCard({
  platformId,
  providerUserId,
  providerUserDisplay,
  onLinked,
}: UnlinkedUserCardProps) {
  const { t } = useTranslation('identities');
  const { selectedProjectId } = useProjectContext();
  const [mode, setMode] = useState<'options' | 'search' | 'quickLink'>('options');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickLinkForm, setQuickLinkForm] = useState({
    displayName: providerUserDisplay || '',
    email: '',
  });

  const { data: searchResults, isLoading: searching } = useSearchIdentities(
    searchQuery,
    selectedProjectId || undefined
  );

  const addAlias = useAddAlias(selectedProjectId || undefined);
  const quickLink = useQuickLinkIdentity(selectedProjectId || undefined);

  const handleLinkToExisting = async (identityId: string) => {
    try {
      await addAlias.mutateAsync({
        identityId,
        platformId,
        providerUserId,
        providerUserDisplay,
      });
      onLinked?.();
    } catch (error) {
      console.error('Failed to link to existing identity:', error);
    }
  };

  const handleQuickLink = async () => {
    try {
      await quickLink.mutateAsync({
        platformId,
        providerUserId,
        providerUserDisplay,
        displayName: quickLinkForm.displayName,
        email: quickLinkForm.email || undefined,
      });
      onLinked?.();
    } catch (error) {
      console.error('Failed to quick-link user:', error);
    }
  };

  if (mode === 'options') {
    return (
      <div className="inline-flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
        <UserX className="w-4 h-4 text-yellow-600" />
        <span className="text-sm text-yellow-800">{t('unlinked.title')}</span>
        <div className="flex gap-1 ml-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMode('search')}
            className="text-xs"
          >
            <Link className="w-3 h-3" />
            {t('unlinked.linkToExisting')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMode('quickLink')}
            className="text-xs"
          >
            <Plus className="w-3 h-3" />
            {t('unlinked.createNew')}
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'search') {
    return (
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              {t('unlinked.linkToExisting')}
            </h3>
            <button
              onClick={() => setMode('options')}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('unlinked.searchPlaceholder')}
              className="pl-10"
            />
          </div>

          {searching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              <span className="ml-2 text-sm text-gray-500">{t('unlinked.searching')}</span>
            </div>
          )}

          {!searching && searchQuery && searchResults?.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">{t('unlinked.noResults')}</p>
          )}

          {searchResults && searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((identity: IdentityResponse) => (
                <button
                  key={identity.id}
                  onClick={() => handleLinkToExisting(identity.id)}
                  disabled={addAlias.isPending}
                  className="w-full text-left p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {identity.displayName || t('list.identityWithoutName')}
                  </div>
                  {identity.email && (
                    <div className="text-xs text-gray-500">{identity.email}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Quick Link mode
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{t('quickLink.title')}</h3>
            <p className="text-xs text-gray-500">{t('quickLink.description')}</p>
          </div>
          <button
            onClick={() => setMode('options')}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('quickLink.displayNameLabel')}
            </label>
            <Input
              value={quickLinkForm.displayName}
              onChange={(e) => setQuickLinkForm({ ...quickLinkForm, displayName: e.target.value })}
              placeholder={t('quickLink.displayNamePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('quickLink.emailLabel')} <span className="text-gray-400 font-normal">({t('common.optional')})</span>
            </label>
            <Input
              type="email"
              value={quickLinkForm.email}
              onChange={(e) => setQuickLinkForm({ ...quickLinkForm, email: e.target.value })}
              placeholder={t('quickLink.emailPlaceholder')}
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMode('options')}
            disabled={quickLink.isPending}
          >
            {t('quickLink.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={handleQuickLink}
            disabled={!quickLinkForm.displayName || quickLink.isPending}
          >
            {quickLink.isPending ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                {t('quickLink.creating')}
              </>
            ) : (
              t('quickLink.create')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
