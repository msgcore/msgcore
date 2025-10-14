import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Search,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  MessageSquare,
  Send,
  Inbox
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { formatDateTime } from '../lib/utils';
import { useProjectContext } from '../contexts/ProjectContext';
import { useMessages, useMessageStats } from '../hooks/useMessages';

type DirectionFilter = 'all' | 'received' | 'sent';

export function Messages() {
  const { t } = useTranslation('messages');
  const { selectedProjectId } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Fetch unified messages list (both received and sent)
  const { data: messagesData, isLoading, error } = useMessages(
    selectedProjectId || undefined,
    { limit: 100, order: 'desc' }
  );
  const { data: stats, isLoading: loadingStats } = useMessageStats(selectedProjectId || undefined);

  const messages = messagesData?.messages || [];

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
  const filteredMessages = messages.filter((msg: any) => {
    const matchesSearch = searchQuery === '' ||
      msg.messageText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.userDisplay?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.platformId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.platform?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = platformFilter === 'all' || msg.platform === platformFilter;
    const matchesDirection = directionFilter === 'all' || msg.direction === directionFilter;

    return matchesSearch && matchesPlatform && matchesDirection;
  });

  // Get unique platforms from messages
  const platforms = Array.from(new Set(messages.map((m: any) => m.platform).filter(Boolean)));

  // Count messages by direction
  const receivedCount = messages.filter((m: any) => m.direction === 'received').length;
  const sentCount = messages.filter((m: any) => m.direction === 'sent').length;

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

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            {/* Filter Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setDirectionFilter('all')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  directionFilter === 'all'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>All Messages ({messages.length})</span>
                </div>
              </button>
              <button
                onClick={() => setDirectionFilter('received')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  directionFilter === 'received'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Inbox className="w-4 h-4" />
                  <span>Received ({receivedCount})</span>
                </div>
              </button>
              <button
                onClick={() => setDirectionFilter('sent')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  directionFilter === 'sent'
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  <span>Sent ({sentCount})</span>
                </div>
              </button>
            </div>

            {/* Search and Platform Filter */}
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
                {(platformFilter !== 'all' || directionFilter !== 'all' || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPlatformFilter('all');
                      setDirectionFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    {t('actions.clearFilters')}
                  </Button>
                )}
              </div>
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
              {/* Unified Messages List */}
              <div className="space-y-3">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">{t('messages.noMessages')}</p>
                  </div>
                ) : (
                  filteredMessages.map((message: any) => {
                    const isReceived = message.direction === 'received';
                    const isSent = message.direction === 'sent';

                    return (
                      <div
                        key={message.id}
                        className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md cursor-pointer ${
                          isReceived
                            ? 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                            : isSent
                            ? 'bg-green-50 border-green-500 hover:bg-green-100'
                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Header with Direction, Platform ID, and Platform Type */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {/* Direction Badge */}
                              {isReceived && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                  <ArrowDownLeft className="w-3 h-3" />
                                  <span>Received</span>
                                </div>
                              )}
                              {isSent && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                                  <ArrowUpRight className="w-3 h-3" />
                                  <span>Sent</span>
                                </div>
                              )}

                              {/* Platform ID (Primary) */}
                              {message.platformId && (
                                <span className="px-2 py-1 bg-gray-900 text-white rounded-md text-xs font-mono font-bold">
                                  {message.platformId}
                                </span>
                              )}

                              {/* Platform Type (Secondary) */}
                              <span className={`text-xs px-2 py-1 rounded-md font-medium ${getPlatformColor(message.platform)}`}>
                                {message.platform}
                              </span>

                              {/* User/Target Info */}
                              {isReceived && (
                                <span className="text-xs text-gray-600">
                                  from <span className="font-medium">{message.userDisplay || message.providerUserId}</span>
                                </span>
                              )}
                              {isSent && (
                                <span className="text-xs text-gray-600">
                                  to <span className="font-medium">{message.targetUserId || message.targetChatId}</span>
                                </span>
                              )}
                            </div>

                            {/* Message Text */}
                            <p className="text-sm text-gray-900 mb-2 line-clamp-2">
                              {message.messageText || <span className="text-gray-400 italic">{t('messages.noText')}</span>}
                            </p>

                            {/* Message Metadata */}
                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                              {isReceived && message.providerChatId && (
                                <>
                                  <span>Chat: {message.providerChatId}</span>
                                  <span>•</span>
                                </>
                              )}
                              {isSent && message.targetType && (
                                <>
                                  <span>Type: {message.targetType}</span>
                                  <span>•</span>
                                </>
                              )}
                              <span>
                                {isReceived && message.receivedAt
                                  ? formatDateTime(message.receivedAt)
                                  : isSent && message.sentAt
                                  ? formatDateTime(message.sentAt)
                                  : formatDateTime(message.createdAt)}
                              </span>
                              {message.errorMessage && (
                                <>
                                  <span>•</span>
                                  <span className="text-red-600 font-medium">Error: {message.errorMessage}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status Badge (for sent messages) */}
                          {isSent && message.status && (
                            <div className="flex-shrink-0">
                              {getStatusBadge(message.status)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Info */}
              {messagesData?.pagination && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-gray-600">
                    {t('pagination.showing')} {filteredMessages.length} {t('pagination.of')} {messagesData.pagination.total.toLocaleString()} {t('pagination.messages')}
                  </p>
                  {messagesData.pagination.hasMore && (
                    <Button variant="outline" size="sm">
                      {t('actions.loadMore')}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
