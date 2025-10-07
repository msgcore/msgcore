import { useState } from 'react';
import {
  Plus,
  Webhook,
  Loader2,
  Trash2,
  Edit,
  Check,
  X,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Input } from '../components/ui/Input';
import { formatDateTime } from '../lib/utils';
import { useProjectContext } from '../contexts/ProjectContext';
import {
  useWebhooks,
  useWebhook,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useWebhookDeliveries,
} from '../hooks/useWebhooks';
import { useConfirm } from '../hooks/useConfirm';

type WebhookEventType =
  | 'message.received'
  | 'message.sent'
  | 'message.failed'
  | 'button.clicked'
  | 'reaction.added'
  | 'reaction.removed';

export function Webhooks() {
  const { t } = useTranslation('webhooks');
  const { selectedProjectId } = useProjectContext();
  const { data: webhooks = [], isLoading, error } = useWebhooks(selectedProjectId || undefined);
  const createWebhook = useCreateWebhook(selectedProjectId || undefined);
  const updateWebhook = useUpdateWebhook(selectedProjectId || undefined);
  const deleteWebhook = useDeleteWebhook(selectedProjectId || undefined);
  const { confirm, ConfirmDialog } = useConfirm();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null);
  const [deletingWebhookId, setDeletingWebhookId] = useState<string | null>(null);
  const [viewingStatsId, setViewingStatsId] = useState<string | null>(null);

  // Fetch stats for the webhook being viewed
  const { data: webhookStats } = useWebhook(
    viewingStatsId || '',
    selectedProjectId || undefined
  );

  // Fetch deliveries for the webhook being viewed
  const { data: deliveriesData } = useWebhookDeliveries(
    viewingStatsId || '',
    selectedProjectId || undefined
  );

  const [newWebhookData, setNewWebhookData] = useState({
    name: '',
    url: '',
    events: [] as WebhookEventType[],
    secret: '',
  });

  const [editWebhookData, setEditWebhookData] = useState({
    name: '',
    url: '',
    events: [] as WebhookEventType[],
    isActive: true,
  });

  const availableEvents: { value: WebhookEventType; label: string; description: string }[] = [
    {
      value: 'message.received',
      label: t('events.messageReceived.label'),
      description: t('events.messageReceived.description'),
    },
    {
      value: 'message.sent',
      label: t('events.messageSent.label'),
      description: t('events.messageSent.description'),
    },
    {
      value: 'message.failed',
      label: t('events.messageFailed.label'),
      description: t('events.messageFailed.description'),
    },
    {
      value: 'button.clicked',
      label: t('events.buttonClicked.label'),
      description: t('events.buttonClicked.description'),
    },
    {
      value: 'reaction.added',
      label: t('events.reactionAdded.label'),
      description: t('events.reactionAdded.description'),
    },
    {
      value: 'reaction.removed',
      label: t('events.reactionRemoved.label'),
      description: t('events.reactionRemoved.description'),
    },
  ];

  const handleCreateWebhook = async () => {
    if (!newWebhookData.name.trim() || !newWebhookData.url.trim() || newWebhookData.events.length === 0) {
      return;
    }

    try {
      await createWebhook.mutateAsync({
        name: newWebhookData.name,
        url: newWebhookData.url,
        events: newWebhookData.events,
        secret: newWebhookData.secret || undefined,
      });

      setNewWebhookData({ name: '', url: '', events: [], secret: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create webhook:', error);
    }
  };

  const handleUpdateWebhook = async (webhookId: string) => {
    if (!editWebhookData.name.trim() || editWebhookData.events.length === 0) {
      return;
    }

    try {
      await updateWebhook.mutateAsync({
        webhookId,
        name: editWebhookData.name,
        url: editWebhookData.url || undefined,
        events: editWebhookData.events,
        isActive: editWebhookData.isActive,
      });

      setEditingWebhookId(null);
      setEditWebhookData({ name: '', url: '', events: [], isActive: true });
    } catch (error) {
      console.error('Failed to update webhook:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string, webhookName: string) => {
    const confirmed = await confirm({
      title: t('confirmDialogs.deleteTitle'),
      message: t('confirmDialogs.deleteMessage', { name: webhookName }),
      confirmText: t('actions.delete'),
      cancelText: t('actions.cancel'),
      variant: 'danger',
      confirmButtonVariant: 'danger',
    });

    if (!confirmed) return;

    setDeletingWebhookId(webhookId);
    try {
      await deleteWebhook.mutateAsync(webhookId);
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    } finally {
      setDeletingWebhookId(null);
    }
  };

  const startEditWebhook = (webhook: any) => {
    setEditingWebhookId(webhook.id);
    setEditWebhookData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      isActive: webhook.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingWebhookId(null);
    setEditWebhookData({ name: '', url: '', events: [], isActive: true });
  };

  const toggleEvent = (event: WebhookEventType, isEditing: boolean = false) => {
    if (isEditing) {
      setEditWebhookData((prev) => ({
        ...prev,
        events: prev.events.includes(event)
          ? prev.events.filter((e) => e !== event)
          : [...prev.events, event],
      }));
    } else {
      setNewWebhookData((prev) => ({
        ...prev,
        events: prev.events.includes(event)
          ? prev.events.filter((e) => e !== event)
          : [...prev.events, event],
      }));
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
              {t('actions.newWebhook')}
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
                  label={t('createForm.nameLabel')}
                  value={newWebhookData.name}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, name: e.target.value })}
                  placeholder={t('createForm.namePlaceholder')}
                  autoFocus
                />
                <Input
                  label={t('createForm.urlLabel')}
                  type="url"
                  value={newWebhookData.url}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, url: e.target.value })}
                  placeholder={t('createForm.urlPlaceholder')}
                />
                <Input
                  label={t('createForm.secretLabel')}
                  type="password"
                  value={newWebhookData.secret}
                  onChange={(e) => setNewWebhookData({ ...newWebhookData, secret: e.target.value })}
                  placeholder={t('createForm.secretPlaceholder')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('createForm.eventsLabel', { count: newWebhookData.events.length })}
                  </label>
                  <div className="space-y-2">
                    {availableEvents.map((event) => (
                      <label
                        key={event.value}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={newWebhookData.events.includes(event.value)}
                          onChange={() => toggleEvent(event.value)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{event.label}</p>
                          <p className="text-xs text-gray-500">{event.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateWebhook}
                    disabled={
                      !newWebhookData.name.trim() ||
                      !newWebhookData.url.trim() ||
                      newWebhookData.events.length === 0 ||
                      createWebhook.isPending
                    }
                  >
                    {createWebhook.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('actions.creating')}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {t('actions.createWebhook')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewWebhookData({ name: '', url: '', events: [], secret: '' });
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
        ) : webhooks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('list.noWebhooks')}</h3>
              <p className="text-gray-600 mb-6">{t('list.noWebhooksMessage')}</p>
              {!showCreateForm && (
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4" />
                  {t('list.createFirstWebhook')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook: any) => (
              <Card
                key={webhook.id}
                className={webhook.isActive ? '' : 'opacity-60'}
              >
                <CardContent className="pt-6">
                  {editingWebhookId === webhook.id ? (
                    <div className="space-y-4">
                      <Input
                        value={editWebhookData.name}
                        onChange={(e) => setEditWebhookData({ ...editWebhookData, name: e.target.value })}
                        placeholder={t('createForm.nameLabel')}
                        autoFocus
                      />
                      <Input
                        type="url"
                        value={editWebhookData.url}
                        onChange={(e) => setEditWebhookData({ ...editWebhookData, url: e.target.value })}
                        placeholder={t('createForm.urlLabel')}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('createForm.eventsLabel', { count: editWebhookData.events.length })}
                        </label>
                        <div className="space-y-2">
                          {availableEvents.map((event) => (
                            <label
                              key={event.value}
                              className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                            >
                              <input
                                type="checkbox"
                                checked={editWebhookData.events.includes(event.value)}
                                onChange={() => toggleEvent(event.value, true)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{event.label}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editWebhookData.isActive}
                          onChange={(e) =>
                            setEditWebhookData({ ...editWebhookData, isActive: e.target.checked })
                          }
                        />
                        <span className="text-sm text-gray-700">{t('createForm.activeLabel')}</span>
                      </label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateWebhook(webhook.id)}
                          disabled={
                            !editWebhookData.name.trim() ||
                            editWebhookData.events.length === 0 ||
                            updateWebhook.isPending
                          }
                        >
                          {updateWebhook.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          {t('actions.save')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="w-3 h-3" />
                          {t('actions.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{webhook.name}</h3>
                            <Badge variant={webhook.isActive ? 'success' : 'secondary'}>
                              {webhook.isActive ? t('status.active') : t('status.inactive')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <ExternalLink className="w-4 h-4" />
                            <a
                              href={webhook.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {webhook.url}
                            </a>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {webhook.events.map((event: string) => {
                              const eventInfo = availableEvents.find((e) => e.value === event);
                              return (
                                <Badge key={event} variant="info">
                                  {eventInfo?.label || event}
                                </Badge>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500">
                            {t('list.createdAt', { date: formatDateTime(webhook.createdAt) })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                        <Button size="sm" variant="ghost" onClick={() => startEditWebhook(webhook)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWebhook(webhook.id, webhook.name)}
                          disabled={deletingWebhookId === webhook.id}
                        >
                          {deletingWebhookId === webhook.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingStatsId(webhook.id)}
                          className="ml-auto"
                        >
                          <Activity className="w-4 h-4" />
                          {t('actions.viewStats')}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {webhooks.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              {t('info.title')}
            </h3>
            <p className="text-sm text-blue-800 mb-2">
              {t('info.description')}
            </p>
            <p className="text-sm text-blue-800">
              {t('info.limits')}
            </p>
          </div>
        )}

        {/* Stats Modal */}
        {viewingStatsId && (
          <>
            <div
              className="fixed inset-0 bg-gray-900/50 z-50"
              onClick={() => setViewingStatsId(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t('stats.title')}
                    </h3>
                    <button
                      onClick={() => setViewingStatsId(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Stats Summary */}
                  {webhookStats?.stats && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <p className="text-sm text-gray-600 mb-1">{t('stats.total')}</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {webhookStats.stats.total.toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <p className="text-sm text-gray-600">{t('stats.successful')}</p>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                              {webhookStats.stats.successful.toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <p className="text-sm text-gray-600">{t('stats.failed')}</p>
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                              {webhookStats.stats.failed.toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 pb-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-4 h-4 text-yellow-600" />
                              <p className="text-sm text-gray-600">{t('stats.pending')}</p>
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">
                              {webhookStats.stats.pending.toLocaleString()}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardContent className="pt-4 pb-4">
                          <p className="text-sm text-gray-600 mb-2">{t('stats.successRate')}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-green-500 h-3 rounded-full"
                                style={{ width: webhookStats.stats.successRate }}
                              />
                            </div>
                            <p className="text-xl font-bold text-gray-900">
                              {webhookStats.stats.successRate}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Recent Deliveries */}
                  {deliveriesData?.deliveries && deliveriesData.deliveries.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">{t('stats.recentDeliveries')}</h4>
                      <div className="space-y-2">
                        {deliveriesData.deliveries.slice(0, 10).map((delivery: any) => (
                          <div
                            key={delivery.id}
                            className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="info">{delivery.event}</Badge>
                                  <Badge
                                    variant={
                                      delivery.status === 'success'
                                        ? 'success'
                                        : delivery.status === 'failed'
                                        ? 'danger'
                                        : 'warning'
                                    }
                                  >
                                    {delivery.status}
                                  </Badge>
                                  {delivery.responseCode && (
                                    <span className="text-xs text-gray-500">
                                      HTTP {delivery.responseCode}
                                    </span>
                                  )}
                                </div>
                                {delivery.error && (
                                  <p className="text-sm text-red-600 mb-1">{delivery.error}</p>
                                )}
                                <p className="text-xs text-gray-500">
                                  {t('stats.attempts', { count: delivery.attempts })} •{' '}
                                  {formatDateTime(delivery.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {deliveriesData.pagination?.hasMore && (
                        <p className="text-sm text-gray-500 text-center mt-3">
                          {t('stats.showingCount', { total: deliveriesData.pagination.total.toLocaleString() })}
                        </p>
                      )}
                    </div>
                  )}

                  {deliveriesData?.deliveries?.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">{t('stats.noDeliveries')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
