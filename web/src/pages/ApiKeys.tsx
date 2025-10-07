import { useState } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  Check,
  Key,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { formatDateTime, maskApiKey, copyToClipboard } from '../lib/utils';
import { useApiKeys, useCreateApiKey, useRevokeApiKey, useRollApiKey } from '../hooks/useApiKeys';
import { useProjectContext } from '../contexts/ProjectContext';
import { useConfirm } from '../hooks/useConfirm';

export function ApiKeys() {
  const { t } = useTranslation('apiKeys');
  const { selectedProjectId } = useProjectContext();
  const { data: apiKeys = [], isLoading, error } = useApiKeys(selectedProjectId || undefined);
  const createApiKey = useCreateApiKey(selectedProjectId || undefined);
  const revokeApiKey = useRevokeApiKey(selectedProjectId || undefined);
  const rollApiKey = useRollApiKey(selectedProjectId || undefined);
  const { confirm, ConfirmDialog } = useConfirm();

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyCreated, setNewKeyCreated] = useState<{ key: string; name: string } | null>(null);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);
  const [rollingKeyId, setRollingKeyId] = useState<string | null>(null);

  const [newKeyData, setNewKeyData] = useState({
    name: '',
    expiresInDays: 30,
    scopes: [] as string[],
  });

  const allScopes = [
    // Identities
    { id: 'identities:read', label: t('scopes.identitiesRead.label'), description: t('scopes.identitiesRead.description') },
    { id: 'identities:write', label: t('scopes.identitiesWrite.label'), description: t('scopes.identitiesWrite.description') },

    // Projects
    { id: 'projects:read', label: t('scopes.projectsRead.label'), description: t('scopes.projectsRead.description') },
    { id: 'projects:write', label: t('scopes.projectsWrite.label'), description: t('scopes.projectsWrite.description') },

    // Platforms
    { id: 'platforms:read', label: t('scopes.platformsRead.label'), description: t('scopes.platformsRead.description') },
    { id: 'platforms:write', label: t('scopes.platformsWrite.label'), description: t('scopes.platformsWrite.description') },

    // Messages
    { id: 'messages:send', label: t('scopes.messagesSend.label'), description: t('scopes.messagesSend.description') },
    { id: 'messages:read', label: t('scopes.messagesRead.label'), description: t('scopes.messagesRead.description') },
    { id: 'messages:write', label: t('scopes.messagesWrite.label'), description: t('scopes.messagesWrite.description') },

    // Webhooks
    { id: 'webhooks:read', label: t('scopes.webhooksRead.label'), description: t('scopes.webhooksRead.description') },
    { id: 'webhooks:write', label: t('scopes.webhooksWrite.label'), description: t('scopes.webhooksWrite.description') },

    // API Keys
    { id: 'keys:read', label: t('scopes.keysRead.label'), description: t('scopes.keysRead.description') },
    { id: 'keys:manage', label: t('scopes.keysManage.label'), description: t('scopes.keysManage.description') },

    // Members
    { id: 'members:read', label: t('scopes.membersRead.label'), description: t('scopes.membersRead.description') },
    { id: 'members:write', label: t('scopes.membersWrite.label'), description: t('scopes.membersWrite.description') },
  ];

  const handleCopy = async (key: string, keyId: string) => {
    await copyToClipboard(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateApiKey = async () => {
    if (!newKeyData.name.trim()) return;

    try {
      const result = await createApiKey.mutateAsync({
        name: newKeyData.name,
        expiresInDays: newKeyData.expiresInDays,
        scopes: newKeyData.scopes.length > 0 ? newKeyData.scopes : ['messages:send', 'messages:read'],
      });

      if (result?.key) {
        setNewKeyCreated({ key: result.key, name: result.name });
        setNewKeyData({ name: '', expiresInDays: 30, scopes: [] });
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const handleRevokeKey = async (keyId: string, keyName: string) => {
    const confirmed = await confirm({
      title: t('confirmDialogs.revokeTitle'),
      message: t('confirmDialogs.revokeMessage', { name: keyName }),
      confirmText: t('actions.revokeKey'),
      cancelText: t('actions.cancel'),
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    setRevokingKeyId(keyId);
    try {
      await revokeApiKey.mutateAsync(keyId);
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    } finally {
      setRevokingKeyId(null);
    }
  };

  const handleRollKey = async (keyId: string, keyName: string) => {
    const confirmed = await confirm({
      title: t('confirmDialogs.renewTitle'),
      message: t('confirmDialogs.renewMessage', { name: keyName }),
      confirmText: t('actions.renewKey'),
      cancelText: t('actions.cancel'),
      variant: 'warning',
      confirmButtonVariant: 'primary',
    });

    if (!confirmed) return;

    setRollingKeyId(keyId);
    try {
      const result = await rollApiKey.mutateAsync(keyId);
      if (result?.key) {
        setNewKeyCreated({ key: result.key, name: result.name || t('confirmDialogs.renewedKey') });
      }
    } catch (error) {
      console.error('Failed to roll API key:', error);
    } finally {
      setRollingKeyId(null);
    }
  };

  const toggleScope = (scopeId: string) => {
    setNewKeyData((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scopeId)
        ? prev.scopes.filter((s) => s !== scopeId)
        : [...prev.scopes, scopeId],
    }));
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Alert variant="danger">{t('alerts.errorLoading')}</Alert>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        {!showCreateForm && !newKeyCreated && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4" />
            {t('actions.newKey')}
          </Button>
        )}
      </div>

      {!selectedProjectId ? (
        <Alert variant="warning">{t('alerts.selectProject')}</Alert>
      ) : (
        <>
          {newKeyCreated && (
            <Alert variant="success" className="bg-green-50 border-green-200">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">
                    {t('keyCreated.title')}
                  </h3>
                  <p className="text-sm text-green-800">
                    {t('keyCreated.message')}
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white border border-green-300 rounded-lg">
                  <code className="flex-1 text-sm font-mono text-gray-800">
                    {newKeyCreated.key}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(newKeyCreated.key, 'new')}
                  >
                    {copiedKey === 'new' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewKeyCreated(null)}
                >
                  {t('actions.understood')}
                </Button>
              </div>
            </Alert>
          )}

          {showCreateForm && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">{t('createForm.title')}</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label={t('createForm.nameLabel')}
                    value={newKeyData.name}
                    onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                    placeholder={t('createForm.namePlaceholder')}
                    autoFocus
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {t('createForm.expirationLabel')}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={newKeyData.expiresInDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 30;
                          setNewKeyData({ ...newKeyData, expiresInDays: Math.min(365, Math.max(1, value)) });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {t('createForm.expirationHint', { days: newKeyData.expiresInDays })}
                      </p>
                    </div>
                    <div className="flex flex-col justify-end">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setNewKeyData({ ...newKeyData, expiresInDays: 7 })}
                          className="w-full px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                        >
                          {t('createForm.expirationPresets.7days')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewKeyData({ ...newKeyData, expiresInDays: 30 })}
                          className="w-full px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                        >
                          {t('createForm.expirationPresets.30days')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewKeyData({ ...newKeyData, expiresInDays: 90 })}
                          className="w-full px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                        >
                          {t('createForm.expirationPresets.90days')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('createForm.permissionsLabel')}
                    </label>
                    <div className="grid gap-2">
                      {allScopes.map((scope) => (
                        <label
                          key={scope.id}
                          className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={newKeyData.scopes.includes(scope.id)}
                            onChange={() => toggleScope(scope.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {scope.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {scope.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleCreateApiKey}
                      disabled={!newKeyData.name.trim() || createApiKey.isPending}
                    >
                      {createApiKey.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {t('actions.creating')}
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          {t('actions.createKey')}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewKeyData({ name: '', expiresInDays: 30, scopes: [] });
                      }}
                    >
                      {t('actions.cancel')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">
                {isLoading ? t('list.loading') : t('list.title', { count: apiKeys.length })}
              </h3>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('list.noKeys')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('list.noKeysMessage')}
                  </p>
                  {!showCreateForm && !newKeyCreated && (
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4" />
                      {t('list.createFirstKey')}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((apiKey: any) => (
                    <div
                      key={apiKey.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {apiKey.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRollKey(apiKey.id, apiKey.name)}
                            disabled={rollingKeyId === apiKey.id}
                            title={t('list.renewKeyTooltip')}
                          >
                            {rollingKeyId === apiKey.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                            disabled={revokingKeyId === apiKey.id}
                          >
                            {revokingKeyId === apiKey.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono text-gray-600">
                          {apiKey.maskedKey || '••••••••••••••••'}
                        </code>
                      </div>

                      {apiKey.scopes && apiKey.scopes.length > 0 && (
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Shield className="w-4 h-4 text-gray-500" />
                          {apiKey.scopes.map((scope: string) => (
                            <Badge key={scope} variant="secondary">
                              {allScopes.find((s) => s.id === scope)?.label || scope}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {t('list.createdAt', { date: formatDateTime(apiKey.createdAt) })}
                        </span>
                        {apiKey.lastUsedAt && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {t('list.lastUsed', { date: formatDateTime(apiKey.lastUsedAt) })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {t('security.title')}
            </h3>
            <ul className="space-y-2 text-sm text-amber-800">
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                {t('security.tips.noShare')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                {t('security.tips.useEnv')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                {t('security.tips.rotate')}
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                {t('security.tips.minPermissions')}
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
    </>
  );
}
