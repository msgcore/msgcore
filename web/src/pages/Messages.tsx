import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Filter,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { formatDateTime } from '../lib/utils';
import { useProjectContext } from '../contexts/ProjectContext';
import { useMessages, useMessageStats, useSentMessages } from '../hooks/useMessages';

type MessageView = 'received' | 'sent';

export function Messages() {
  const { t } = useTranslation('messages');
  const { selectedProjectId } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [messageView, setMessageView] = useState<MessageView>('received');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Fetch data
  const { data: receivedData, isLoading: loadingReceived, error: receivedError } = useMessages(
    selectedProjectId || undefined,
    { limit: 50, order: 'desc' }
  );
  const { data: sentMessagesData = [], isLoading: loadingSent, error: sentError } = useSentMessages(
    selectedProjectId || undefined
  );
  const { data: stats, isLoading: loadingStats } = useMessageStats(selectedProjectId || undefined);

  const receivedMessages = receivedData?.messages || [];
  const sentMessages = Array.isArray(sentMessagesData) ? sentMessagesData : [];
  const isLoading = messageView === 'received' ? loadingReceived : loadingSent;
  const error = messageView === 'received' ? receivedError : sentError;

  // Get platform badge color
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      discord: 'bg-indigo-100 text-indigo-700',
      telegram: 'bg-blue-100 text-blue-700',
      'whatsapp-evo': 'bg-green-100 text-green-700',
      email: 'bg-purple-100 text-purple-700',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'info' | 'danger' | 'warning'> = {
      completed: 'success',
      delivered: 'success',
      sent: 'info',
      failed: 'danger',
      pending: 'warning',
      active: 'info',
    };

    return (
      <Badge variant={variants[status] || 'info'}>
        {t(`status.${status}`, { defaultValue: status })}
      </Badge>
    );
  };

  // Filter messages
  const filteredReceivedMessages = receivedMessages.filter((msg) => {
    const matchesSearch = searchQuery === '' ||
      msg.messageText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.userDisplay?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.platform.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = platformFilter === 'all' || msg.platform === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  const filteredSentMessages = sentMessages.filter((msg) => {
    const matchesSearch = searchQuery === '' ||
      msg.messageText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.platform.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = platformFilter === 'all' || msg.platform === platformFilter;

    return matchesSearch && matchesPlatform;
  });

  // Get unique platforms from messages
  const platforms = Array.from(new Set([
    ...receivedMessages.map(m => m.platform),
    ...sentMessages.map(m => m.platform)
  ]));

  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Alert variant="warning">
          {t('alerts.selectProject')}
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Alert variant="danger">
          {t('alerts.loadError')}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4" />
          {t('actions.sendMessage')}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownLeft className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-gray-600">{t('stats.received')}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.received.totalMessages.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.received.uniqueUsers.toLocaleString()} {t('stats.uniqueUsers')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-600">{t('stats.sent')}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.sent.totalMessages.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-600 mb-1">{t('stats.uniqueChats')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.received.uniqueChats.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <p className="text-sm text-gray-600 mb-1">{t('stats.recent24h')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.received.recentMessages.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setMessageView('received')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            messageView === 'received'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4" />
            {t('tabs.received')} ({receivedMessages.length})
          </div>
        </button>
        <button
          onClick={() => setMessageView('sent')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            messageView === 'sent'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4" />
            {t('tabs.sent')} ({sentMessages.length})
          </div>
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex-1 flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {platforms.length > 0 && (
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">{t('search.allPlatforms')}</option>
                  {platforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                {t('actions.export')}
              </Button>
              {(platformFilter !== 'all' || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPlatformFilter('all');
                    setSearchQuery('');
                  }}
                >
                  {t('actions.clearFilters')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* Received Messages */}
              {messageView === 'received' && (
                <div className="space-y-3">
                  {filteredReceivedMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <ArrowDownLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">{t('messages.noReceived')}</p>
                    </div>
                  ) : (
                    filteredReceivedMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-md font-medium ${getPlatformColor(message.platform)}`}>
                                {message.platform}
                              </span>
                              <span className="text-xs text-gray-500">
                                {t('messages.from')} {message.userDisplay || message.providerUserId}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">
                              {message.messageText || <span className="text-gray-400 italic">{t('messages.noText')}</span>}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{t('messages.chat')}: {message.providerChatId}</span>
                              <span>•</span>
                              <span>{formatDateTime(message.receivedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Sent Messages */}
              {messageView === 'sent' && (
                <div className="space-y-3">
                  {filteredSentMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <ArrowUpRight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">{t('messages.noSent')}</p>
                    </div>
                  ) : (
                    filteredSentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-md font-medium ${getPlatformColor(message.platform)}`}>
                                {message.platform}
                              </span>
                              <span className="text-xs text-gray-500">
                                {t('messages.to')} {message.targetUserId || message.targetChatId}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">
                              {message.messageText || <span className="text-gray-400 italic">{t('messages.noText')}</span>}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>{t('messages.type')}: {message.targetType}</span>
                              <span>•</span>
                              <span>{message.sentAt ? formatDateTime(message.sentAt) : formatDateTime(message.createdAt)}</span>
                              {message.errorMessage && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600">{t('messages.error')}: {message.errorMessage}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">{getStatusBadge(message.status)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pagination Info */}
              {messageView === 'received' && receivedData?.pagination && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-gray-600">
                    {t('pagination.showing')} {filteredReceivedMessages.length} {t('pagination.of')} {receivedData.pagination.total.toLocaleString()} {t('pagination.messages')}
                  </p>
                  {receivedData.pagination.hasMore && (
                    <Button variant="outline" size="sm">
                      {t('actions.loadMore')}
                    </Button>
                  )}
                </div>
              )}

              {messageView === 'sent' && filteredSentMessages.length > 0 && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-gray-600">
                    {t('pagination.showing')} {filteredSentMessages.length} {t('pagination.sentMessages')}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
