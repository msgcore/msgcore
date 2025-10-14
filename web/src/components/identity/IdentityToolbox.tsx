import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Edit, Link2, MessageSquare, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '../ui/Button';
import type { IdentityResponse } from '@msgcore/sdk/dist/types';

interface IdentityToolboxProps {
  identity: IdentityResponse;
  onViewIdentity?: () => void;
  onEditIdentity?: () => void;
  onManageAliases?: () => void;
  onViewHistory?: () => void;
  onDeleteIdentity?: () => void;
}

/**
 * IdentityToolbox - Management popover for identity operations
 * Provides quick access to common identity management actions
 */
export function IdentityToolbox({
  identity,
  onViewIdentity,
  onEditIdentity,
  onManageAliases,
  onViewHistory,
  onDeleteIdentity,
}: IdentityToolboxProps) {
  const { t } = useTranslation('identities');
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action?: () => void) => {
    setIsOpen(false);
    action?.();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
        aria-label="Identity actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Popover */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-2">
              {onViewIdentity && (
                <button
                  onClick={() => handleAction(onViewIdentity)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <User className="w-4 h-4" />
                  {t('toolbox.viewIdentity')}
                </button>
              )}

              {onEditIdentity && (
                <button
                  onClick={() => handleAction(onEditIdentity)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Edit className="w-4 h-4" />
                  {t('toolbox.editIdentity')}
                </button>
              )}

              {onManageAliases && (
                <button
                  onClick={() => handleAction(onManageAliases)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Link2 className="w-4 h-4" />
                  {t('toolbox.manageAliases')}
                </button>
              )}

              {onViewHistory && (
                <button
                  onClick={() => handleAction(onViewHistory)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('toolbox.viewHistory')}
                </button>
              )}

              {onDeleteIdentity && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    onClick={() => handleAction(onDeleteIdentity)}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('toolbox.deleteIdentity')}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
