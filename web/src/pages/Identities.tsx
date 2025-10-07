import { useState } from 'react';
import {
  Plus,
  User,
  Link as LinkIcon,
  Trash2,
  Edit,
  Loader2,
  MessageSquare,
  X,
  Check,
  Mail,
  Calendar,
  Copy,
  CheckCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FaWhatsapp, FaDiscord, FaTelegram } from 'react-icons/fa';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { formatDateTime } from '../lib/utils';
import { useProjectContext } from '../contexts/ProjectContext';
import { useConfirm } from '../hooks/useConfirm';
import {
  useIdentities,
  useCreateIdentity,
  useUpdateIdentity,
  useDeleteIdentity,
  useAddAlias,
  useRemoveAlias,
  useIdentityMessages,
} from '../hooks/useIdentities';
import { usePlatforms } from '../hooks/usePlatforms';

export function Identities() {
  const { t } = useTranslation('identities');
  const { selectedProjectId } = useProjectContext();
  const { data: identities = [], isLoading, error } = useIdentities(selectedProjectId || undefined);
  const { data: platforms = [] } = usePlatforms(selectedProjectId || undefined);
  const createIdentity = useCreateIdentity(selectedProjectId || undefined);
  const updateIdentity = useUpdateIdentity(selectedProjectId || undefined);
  const deleteIdentity = useDeleteIdentity(selectedProjectId || undefined);
  const addAlias = useAddAlias(selectedProjectId || undefined);
  const removeAlias = useRemoveAlias(selectedProjectId || undefined);
  const { confirm, ConfirmDialog } = useConfirm();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null);
  const [viewingMessagesId, setViewingMessagesId] = useState<string | null>(null);
  const [addingAliasToId, setAddingAliasToId] = useState<string | null>(null);
  const [copiedIdentityId, setCopiedIdentityId] = useState<string | null>(null);

  const [createFormData, setCreateFormData] = useState({
    displayName: '',
    email: '',
    metadata: '',
    aliases: [{ platformId: '', providerUserId: '', providerUserDisplay: '' }],
  });

  const [editFormData, setEditFormData] = useState({
    displayName: '',
    email: '',
    metadata: '',
  });

  const [aliasFormData, setAliasFormData] = useState({
    platformId: '',
    providerUserId: '',
    providerUserDisplay: '',
  });

  const { data: messagesData } = useIdentityMessages(
    viewingMessagesId || '',
    selectedProjectId || undefined
  );

  const handleCopyIdentityId = async (identityId: string) => {
    try {
      await navigator.clipboard.writeText(identityId);
      setCopiedIdentityId(identityId);
      setTimeout(() => setCopiedIdentityId(null), 2000);
    } catch (error) {
      console.error('Failed to copy identity ID:', error);
    }
  };

  const handleCreateIdentity = async () => {
    if (!createFormData.displayName && !createFormData.email) return;
    if (createFormData.aliases.length === 0 || !createFormData.aliases[0].platformId) return;

    try {
      await createIdentity.mutateAsync({
        displayName: createFormData.displayName || undefined,
        email: createFormData.email || undefined,
        metadata: createFormData.metadata
          ? JSON.parse(createFormData.metadata)
          : undefined,
        aliases: createFormData.aliases.filter(a => a.platformId && a.providerUserId),
      });

      setCreateFormData({
        displayName: '',
        email: '',
        metadata: '',
        aliases: [{ platformId: '', providerUserId: '', providerUserDisplay: '' }],
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create identity:', error);
    }
  };

  const handleUpdateIdentity = async (identityId: string) => {
    try {
      await updateIdentity.mutateAsync({
        id: identityId,
        displayName: editFormData.displayName || undefined,
        email: editFormData.email || undefined,
        metadata: editFormData.metadata
          ? JSON.parse(editFormData.metadata)
          : undefined,
      });

      setEditingIdentityId(null);
      setEditFormData({ displayName: '', email: '', metadata: '' });
    } catch (error) {
      console.error('Failed to update identity:', error);
    }
  };

  const handleDeleteIdentity = async (identityId: string, displayName: string) => {
    const confirmed = await confirm({
      title: t('confirmDialogs.deleteTitle'),
      message: t('confirmDialogs.deleteMessage', { name: displayName || identityId }),
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel'),
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    try {
      await deleteIdentity.mutateAsync(identityId);
    } catch (error) {
      console.error('Failed to delete identity:', error);
    }
  };

  const handleAddAlias = async (identityId: string) => {
    if (!aliasFormData.platformId || !aliasFormData.providerUserId) return;

    try {
      await addAlias.mutateAsync({
        identityId,
        ...aliasFormData,
      });

      setAliasFormData({ platformId: '', providerUserId: '', providerUserDisplay: '' });
      setAddingAliasToId(null);
    } catch (error) {
      console.error('Failed to add alias:', error);
    }
  };

  const handleRemoveAlias = async (identityId: string, aliasId: string, platformName: string) => {
    const confirmed = await confirm({
      title: t('confirmDialogs.removeAliasTitle'),
      message: t('confirmDialogs.removeAliasMessage', { platform: platformName }),
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel'),
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    try {
      await removeAlias.mutateAsync({ identityId, aliasId });
    } catch (error) {
      console.error('Failed to remove alias:', error);
    }
  };

  const startEditIdentity = (identity: any) => {
    setEditingIdentityId(identity.id);
    setEditFormData({
      displayName: identity.displayName || '',
      email: identity.email || '',
      metadata: identity.metadata ? JSON.stringify(identity.metadata, null, 2) : '',
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'whatsapp':
      case 'whatsapp-evo':
        return <FaWhatsapp className="w-4 h-4 text-green-500" />;
      case 'discord':
        return <FaDiscord className="w-4 h-4 text-indigo-500" />;
      case 'telegram':
        return <FaTelegram className="w-4 h-4 text-blue-400" />;
      default:
        return <LinkIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">{t('subtitle')}</p>
        </div>
        <Alert variant="warning">{t('alerts.selectProject')}</Alert>
      </div>
    );
  }

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
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4" />
              {t('actions.newIdentity')}
            </Button>
          )}
        </div>

        {showCreateForm && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">{t('createForm.title')}</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label={t('createForm.displayNameLabel')}
                  value={createFormData.displayName}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, displayName: e.target.value })
                  }
                  placeholder={t('createForm.displayNamePlaceholder')}
                />
                <Input
                  label={t('createForm.emailLabel')}
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    setCreateFormData({ ...createFormData, email: e.target.value })
                  }
                  placeholder={t('createForm.emailPlaceholder')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('createForm.aliasesLabel')}
                  </label>
                  {createFormData.aliases.map((alias, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 mb-3">
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        value={alias.platformId}
                        onChange={(e) => {
                          const newAliases = [...createFormData.aliases];
                          newAliases[index].platformId = e.target.value;
                          setCreateFormData({ ...createFormData, aliases: newAliases });
                        }}
                      >
                        <option value="">{t('createForm.selectPlatform')}</option>
                        {platforms.map((p: any) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.platform})
                          </option>
                        ))}
                      </select>
                      <Input
                        placeholder={t('createForm.userIdPlaceholder')}
                        value={alias.providerUserId}
                        onChange={(e) => {
                          const newAliases = [...createFormData.aliases];
                          newAliases[index].providerUserId = e.target.value;
                          setCreateFormData({ ...createFormData, aliases: newAliases });
                        }}
                      />
                      <Input
                        placeholder={t('createForm.userDisplayPlaceholder')}
                        value={alias.providerUserDisplay}
                        onChange={(e) => {
                          const newAliases = [...createFormData.aliases];
                          newAliases[index].providerUserDisplay = e.target.value;
                          setCreateFormData({ ...createFormData, aliases: newAliases });
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateIdentity}
                    disabled={
                      (!createFormData.displayName && !createFormData.email) ||
                      !createFormData.aliases[0]?.platformId ||
                      createIdentity.isPending
                    }
                  >
                    {createIdentity.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('actions.creating')}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {t('actions.createIdentity')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setCreateFormData({
                        displayName: '',
                        email: '',
                        metadata: '',
                        aliases: [{ platformId: '', providerUserId: '', providerUserDisplay: '' }],
                      });
                    }}
                  >
                    <X className="w-4 h-4" />
                    {t('actions.cancel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            </CardContent>
          </Card>
        ) : identities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('list.noIdentities')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('list.noIdentitiesMessage')}
              </p>
              {!showCreateForm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4" />
                  {t('list.createFirstIdentity')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {identities.map((identity: any) => (
              <Card key={identity.id}>
                <CardContent className="pt-6">
                  {editingIdentityId === identity.id ? (
                    <div className="space-y-4">
                      <Input
                        label={t('createForm.displayNameLabel')}
                        value={editFormData.displayName}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, displayName: e.target.value })
                        }
                      />
                      <Input
                        label={t('createForm.emailLabel')}
                        type="email"
                        value={editFormData.email}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, email: e.target.value })
                        }
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateIdentity(identity.id)}
                          disabled={updateIdentity.isPending}
                        >
                          {updateIdentity.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          {t('actions.save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingIdentityId(null);
                            setEditFormData({ displayName: '', email: '', metadata: '' });
                          }}
                        >
                          <X className="w-3 h-3" />
                          {t('actions.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {identity.displayName || identity.email || t('list.identityWithoutName')}
                            </h3>
                            <button
                              onClick={() => handleCopyIdentityId(identity.id)}
                              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors group"
                            >
                              <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">
                                {identity.id}
                              </code>
                              {copiedIdentityId === identity.id ? (
                                <CheckCheck className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">{t('list.aliasesCount', { count: identity.aliases?.length || 0 })}</Badge>
                        </div>
                      </div>

                      {identity.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Mail className="w-4 h-4" />
                          <span>{identity.email}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{t('list.createdAt', { date: formatDateTime(identity.createdAt) })}</span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <h4 className="text-sm font-semibold text-gray-900">{t('aliases.title')}</h4>
                        {identity.aliases && identity.aliases.length > 0 ? (
                          <div className="space-y-2">
                            {identity.aliases.map((alias: any) => (
                              <div
                                key={alias.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  {getPlatformIcon(alias.platform)}
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {alias.providerUserDisplay || alias.providerUserId}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {alias.platformConfig?.name || alias.platform} •{' '}
                                      {alias.providerUserId}
                                    </p>
                                  </div>
                                </div>
                                {identity.aliases.length > 1 && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      handleRemoveAlias(
                                        identity.id,
                                        alias.id,
                                        alias.platformConfig?.name || alias.platform
                                      )
                                    }
                                  >
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">{t('list.noAliases')}</p>
                        )}

                        {addingAliasToId === identity.id && (
                          <div className="p-3 bg-blue-50 rounded-lg space-y-3">
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                              value={aliasFormData.platformId}
                              onChange={(e) =>
                                setAliasFormData({ ...aliasFormData, platformId: e.target.value })
                              }
                            >
                              <option value="">{t('aliases.selectPlatform')}</option>
                              {platforms.map((p: any) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.platform})
                                </option>
                              ))}
                            </select>
                            <Input
                              placeholder={t('aliases.userIdPlaceholder')}
                              value={aliasFormData.providerUserId}
                              onChange={(e) =>
                                setAliasFormData({
                                  ...aliasFormData,
                                  providerUserId: e.target.value,
                                })
                              }
                            />
                            <Input
                              placeholder={t('aliases.displayNamePlaceholder')}
                              value={aliasFormData.providerUserDisplay}
                              onChange={(e) =>
                                setAliasFormData({
                                  ...aliasFormData,
                                  providerUserDisplay: e.target.value,
                                })
                              }
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleAddAlias(identity.id)}
                                disabled={
                                  !aliasFormData.platformId ||
                                  !aliasFormData.providerUserId ||
                                  addAlias.isPending
                                }
                              >
                                {addAlias.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                {t('actions.add')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setAddingAliasToId(null);
                                  setAliasFormData({
                                    platformId: '',
                                    providerUserId: '',
                                    providerUserDisplay: '',
                                  });
                                }}
                              >
                                <X className="w-3 h-3" />
                                {t('actions.cancel')}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAddingAliasToId(identity.id)}
                          disabled={addingAliasToId === identity.id}
                        >
                          <LinkIcon className="w-4 h-4" />
                          {t('actions.addAlias')}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingMessagesId(identity.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                          {t('actions.viewMessages')}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => startEditIdentity(identity)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteIdentity(
                              identity.id,
                              identity.displayName || identity.email
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewingMessagesId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
            <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('messages.title')}
                  </h3>
                  <Button variant="ghost" onClick={() => setViewingMessagesId(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {messagesData && messagesData.length > 0 ? (
                  <div className="space-y-3">
                    {messagesData.map((msg: any) => (
                      <div key={msg.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="info">{msg.platform}</Badge>
                            <span className="text-xs text-gray-500">
                              {t('messages.from', { user: msg.userDisplay || msg.providerUserId })}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(msg.receivedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">
                          {msg.messageText || <span className="text-gray-400 italic">{t('messages.noText')}</span>}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{t('messages.chat', { chatId: msg.providerChatId })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {t('messages.noMessages')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <User className="w-5 h-5" />
            {t('info.title')}
          </h3>
          <p className="text-sm text-blue-800">
            {t('info.description')}
          </p>
        </div>
      </div>
    </>
  );
}
