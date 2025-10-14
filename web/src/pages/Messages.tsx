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

  // Fetch unified messages list (both received and sent)
  const { data: messagesData, isLoading, error } = useMessages(
    selectedProjectId || undefined,
    { limit: 100, order: 'desc' }
  );
  const { data: stats, isLoading: loadingStats } = useMessageStats(selectedProjectId || undefined);

  const messages = messagesData?.messages || [];

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
      msg.platformName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDirection = directionFilter === 'all' || msg.direction === directionFilter;

    return matchesSearch && matchesDirection;
  });

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
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  directionFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>All ({messages.length})</span>
                </div>
              </button>
              <button
                onClick={() => setDirectionFilter('received')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  directionFilter === 'received'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  <span>Received ({receivedCount})</span>
                </div>
              </button>
              <button
                onClick={() => setDirectionFilter('sent')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  directionFilter === 'sent'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span>Sent ({sentCount})</span>
                </div>
              </button>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search messages, users, or platform IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                {(directionFilter !== 'all' || searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDirectionFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
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
              <div className="space-y-2">
                {filteredMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages found</p>
                  </div>
                ) : (
                  filteredMessages.map((message: any) => {
                    const isReceived = message.direction === 'received';
                    const isSent = message.direction === 'sent';

                    return (
                      <div
                        key={message.id}
                        className="group relative bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all overflow-hidden"
                      >
                        {/* Left colored stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          isReceived ? 'bg-blue-500' : isSent ? 'bg-green-500' : 'bg-gray-300'
                        }`} />

                        <div className="pl-4 pr-4 py-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0 space-y-2">
                              {/* Header: Direction + Platform Info */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* Direction indicator */}
                                {isReceived && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                    <ArrowDownLeft className="w-3 h-3" />
                                    Received
                                  </div>
                                )}
                                {isSent && (
                                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium">
                                    <ArrowUpRight className="w-3 h-3" />
                                    Sent
                                  </div>
                                )}

                                {/* Platform Info: Name (ID) */}
                                {message.platformName && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-gray-700">
                                      {message.platformName}
                                    </span>
                                    {message.platformId && (
                                      <span className="text-xs font-mono text-gray-500">
                                        ({message.platformId})
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* User/Target Info */}
                                {isReceived && (
                                  <span className="text-xs text-gray-500">
                                    from <span className="font-medium text-gray-700">{message.userDisplay || message.providerUserId}</span>
                                  </span>
                                )}
                                {isSent && (
                                  <span className="text-xs text-gray-500">
                                    to <span className="font-medium text-gray-700">{message.targetUserId || message.targetChatId}</span>
                                  </span>
                                )}
                              </div>

                              {/* Message Text */}
                              <p className="text-sm text-gray-900 leading-relaxed">
                                {message.messageText || <span className="text-gray-400 italic">No text content</span>}
                              </p>

                              {/* Message Metadata */}
                              <div className="flex items-center gap-3 text-xs text-gray-500">
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
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination Info */}
              {messagesData?.pagination && (
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredMessages.length} of {messagesData.pagination.total.toLocaleString()} messages
                  </p>
                  {messagesData.pagination.hasMore && (
                    <Button variant="outline" size="sm">
                      Load More
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
