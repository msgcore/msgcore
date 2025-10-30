import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MessageSquare,
  Users,
  Radio,
  Search,
  RefreshCw,
  Calendar,
  Filter,
  Loader2,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { formatDateTime } from '../lib/utils';
import { useProjectContext } from '../contexts/ProjectContext';
import { useChats, useSyncChatHistory, useSyncAllChats } from '../hooks/useChats';
import { usePlatforms } from '../hooks/usePlatforms';
import { useToast } from '../contexts/ToastContext';
import { SyncHistoryModal } from '../components/chats/SyncHistoryModal';
import { ChatMessagesModal } from '../components/chats/ChatMessagesModal';

type ChatTypeFilter = 'all' | 'individual' | 'group' | 'channel';

export function Chats() {
  const { t } = useTranslation('chats');
  const { selectedProjectId } = useProjectContext();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatTypeFilter>('all');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncAllMode, setSyncAllMode] = useState(false);
  const [messagesModalOpen, setMessagesModalOpen] = useState(false);
  const [currentSyncChat, setCurrentSyncChat] = useState<{ id: string; name: string } | null>(null);

  // Fetch chats with filters
  const { data: chatsData, isLoading, error, refetch } = useChats(
    selectedProjectId || undefined,
    {
      platformId: selectedPlatformId || undefined,
      chatType: chatTypeFilter !== 'all' ? chatTypeFilter : undefined,
      search: searchQuery || undefined,
      limit: 100,
    }
  );

  // Fetch platforms for filter dropdown
  const { data: platformsData } = usePlatforms(selectedProjectId || undefined);
  const platforms = platformsData?.platforms || [];

  const syncHistoryMutation = useSyncChatHistory(selectedProjectId || undefined);
  const syncAllChatsMutation = useSyncAllChats(selectedProjectId || undefined);

  const chats = chatsData?.chats || [];
  const pagination = chatsData?.pagination || { total: 0, limit: 100, offset: 0 };

  // Get chat type icon
  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'channel':
        return <Radio className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Get chat type badge
  const getChatTypeBadge = (type: string) => {
    const variants: Record<string, 'info' | 'success' | 'warning'> = {
      individual: 'info',
      group: 'success',
      channel: 'warning',
    };

    return (
      <Badge variant={variants[type] || 'info'}>
        <span className="flex items-center gap-1">
          {getChatTypeIcon(type)}
          {type}
        </span>
      </Badge>
    );
  };

  // Handle sync history for specific chat
  const handleOpenSyncModal = (chat: any) => {
    setCurrentSyncChat({ id: chat.id, name: chat.name || chat.providerChatId });
    setSyncAllMode(false);
    setSyncModalOpen(true);
  };

  // Handle sync all chats
  const handleOpenSyncAllModal = () => {
    setCurrentSyncChat({ id: '', name: 'All Chats' });
    setSyncAllMode(true);
    setSyncModalOpen(true);
  };

  const handleSync = async (params: { startDate?: string; endDate?: string; limit?: number }) => {
    try {
      if (syncAllMode) {
        // Sync all chats
        const response = await syncAllChatsMutation.mutateAsync({
          platformId: selectedPlatformId || undefined,
          ...params,
        });
        const successCount = response.results?.filter((r: any) => r.status === 'success').length || 0;
        const totalCount = response.results?.length || 0;
        toast.success(`Successfully initiated sync for ${successCount}/${totalCount} platforms`);
      } else {
        // Sync specific chat
        if (!currentSyncChat) return;
        await syncHistoryMutation.mutateAsync({
          chatId: currentSyncChat.id,
          ...params,
        });
        toast.success(`Successfully synced history for ${currentSyncChat.name}`);
      }
      refetch(); // Refresh chat list
    } catch (error) {
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error; // Re-throw to let modal handle it
    }
  };

  const handleOpenMessagesModal = (chat: any) => {
    setSelectedChatId(chat.id);
    setCurrentSyncChat({ id: chat.id, name: chat.name || chat.providerChatId });
    setMessagesModalOpen(true);
  };

  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
          <p className="text-gray-600 mt-1">
            View and manage conversations across all platforms
          </p>
        </div>
        <Alert variant="warning">
          Please select a project to view chats
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
          <p className="text-gray-600 mt-1">
            View and manage conversations across all platforms
          </p>
        </div>
        <Alert variant="danger">
          Failed to load chats: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chats</h1>
          <p className="text-gray-600 mt-1">
            View and manage conversations across all platforms
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenSyncAllModal}
          disabled={syncAllChatsMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${syncAllChatsMutation.isPending ? 'animate-spin' : ''}`} />
          {syncAllChatsMutation.isPending ? 'Syncing...' : 'Sync All Chats'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or chat ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={selectedPlatformId}
                onChange={(e) => setSelectedPlatformId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Platforms</option>
                {platforms.map((platform: any) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name} ({platform.platform})
                  </option>
                ))}
              </select>
            </div>

            {/* Chat Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chat Type
              </label>
              <select
                value={chatTypeFilter}
                onChange={(e) => setChatTypeFilter(e.target.value as ChatTypeFilter)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
                <option value="channel">Channel</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Chats</p>
                <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Groups</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chats.filter((c: any) => c.chatType === 'group').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Channels</p>
                <p className="text-2xl font-bold text-gray-900">
                  {chats.filter((c: any) => c.chatType === 'channel').length}
                </p>
              </div>
              <Radio className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chats List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Chats ({chats.length})
          </h3>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600">Loading chats...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No chats found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedPlatformId || chatTypeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Chats will appear here once you receive messages'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat: any) => (
                <div
                  key={chat.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-lg shadow-sm">
                      {chat.name?.charAt(0)?.toUpperCase() || chat.providerChatId?.charAt(0)?.toUpperCase() || '?'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-base truncate">
                              {chat.name || chat.providerChatId}
                            </h4>
                            {getChatTypeBadge(chat.chatType)}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="info" className="text-xs">{chat.platform.name}</Badge>
                            <span className="text-sm text-gray-600">
                              {chat.messageCount} {chat.messageCount === 1 ? 'message' : 'messages'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        {chat.lastMessageAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(chat.lastMessageAt)}
                          </span>
                        )}
                        {chat.lastSyncedAt && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="h-3 w-3" />
                            Synced {formatDateTime(chat.lastSyncedAt)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenMessagesModal(chat);
                          }}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Messages
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSyncModal(chat);
                          }}
                          className="flex-1"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {currentSyncChat && (
        <>
          <SyncHistoryModal
            isOpen={syncModalOpen}
            onClose={() => setSyncModalOpen(false)}
            onSync={handleSync}
            chatName={currentSyncChat.name}
          />

          <ChatMessagesModal
            isOpen={messagesModalOpen}
            onClose={() => setMessagesModalOpen(false)}
            projectId={selectedProjectId!}
            chatId={currentSyncChat.id}
            chatName={currentSyncChat.name}
          />
        </>
      )}
    </div>
  );
}
