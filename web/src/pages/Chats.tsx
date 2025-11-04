import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  MessageSquare,
  Users,
  Radio,
  Search,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { useProjectContext } from '../contexts/ProjectContext';
import { useChats, useSyncChatHistory, useSyncAllChats, useChatMessages } from '../hooks/useChats';
import { usePlatforms } from '../hooks/usePlatforms';
import { useIdentities } from '../hooks/useIdentities';
import { useToast } from '../contexts/ToastContext';
import { SyncHistoryModal } from '../components/chats/SyncHistoryModal';

type ChatTypeFilter = 'all' | 'individual' | 'group' | 'channel';

export function Chats() {
  const { selectedProjectId } = useProjectContext();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatTypeFilter, setChatTypeFilter] = useState<ChatTypeFilter>('all');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [syncAllMode, setSyncAllMode] = useState(false);
  const [currentSyncChat, setCurrentSyncChat] = useState<{ id: string; name: string } | null>(null);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Fetch identities for display name resolution
  const { data: identitiesData } = useIdentities(selectedProjectId || undefined);
  const identities = identitiesData || [];

  const syncHistoryMutation = useSyncChatHistory(selectedProjectId || undefined);
  const syncAllChatsMutation = useSyncAllChats(selectedProjectId || undefined);

  const chats = chatsData?.chats || [];

  // Create identity lookup map: platformId:providerUserId -> Identity
  const identityMap = useMemo(() => {
    const map = new Map<string, any>();
    identities.forEach((identity: any) => {
      identity.aliases?.forEach((alias: any) => {
        const key = `${alias.platformId}:${alias.providerUserId}`;
        map.set(key, identity);
      });
    });
    return map;
  }, [identities]);

  // Helper function to get display name for a message
  const getDisplayName = useCallback((message: any) => {
    if (!message.platformId || !message.providerUserId) {
      return message.userDisplay || message.providerUserId || 'Unknown';
    }

    const key = `${message.platformId}:${message.providerUserId}`;
    const identity = identityMap.get(key);

    if (identity?.displayName) {
      return identity.displayName;
    }

    return message.userDisplay || message.providerUserId || 'Unknown';
  }, [identityMap]);

  // Fetch messages for selected chat with infinite scroll
  const messageLimit = 50;
  const { data: messagesData, isLoading: messagesLoading, refetch: refetchMessages } = useChatMessages(
    selectedProjectId || undefined,
    selectedChatId || undefined,
    messageLimit,
    allMessages.length
  );

  // Update messages when new data arrives
  useEffect(() => {
    if (messagesData?.messages) {
      const newMessages = messagesData.messages;
      if (allMessages.length === 0) {
        // Initial load - reverse to show oldest first, newest at bottom
        setAllMessages([...newMessages].reverse());
        setHasMore(newMessages.length === messageLimit);
        setIsInitialLoad(true);
      } else {
        // Load older messages (prepend to beginning, avoiding duplicates)
        const existingIds = new Set(allMessages.map((m: any) => m.id));
        const uniqueNew = newMessages.filter((m: any) => !existingIds.has(m.id));
        if (uniqueNew.length > 0) {
          // Save current scroll position
          const container = messagesContainerRef.current;
          const previousScrollHeight = container?.scrollHeight || 0;

          // Prepend older messages (reversed) to beginning
          setAllMessages([...uniqueNew.reverse(), ...allMessages]);
          setHasMore(newMessages.length === messageLimit);

          // Restore scroll position after prepending
          setTimeout(() => {
            if (container) {
              const newScrollHeight = container.scrollHeight;
              container.scrollTop = newScrollHeight - previousScrollHeight;
            }
          }, 0);
        } else {
          setHasMore(false);
        }
      }
    }
  }, [messagesData]);

  // Scroll to bottom AFTER initial messages have loaded and rendered
  useEffect(() => {
    if (isInitialLoad && allMessages.length > 0) {
      // Wait for DOM to render the messages
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Scroll to bottom
          messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
          // Wait before enabling scroll detection
          setTimeout(() => {
            setIsInitialLoad(false);
          }, 500);
        });
      });
    }
  }, [allMessages, isInitialLoad]);

  const messagesTotal = messagesData?.pagination?.total || 0;

  // Filter messages by search query
  const filteredMessages = allMessages.filter((msg: any) => {
    if (!messageSearchQuery) return true;
    const searchLower = messageSearchQuery.toLowerCase();
    return (
      msg.messageText?.toLowerCase().includes(searchLower) ||
      msg.userDisplay?.toLowerCase().includes(searchLower)
    );
  });

  // Reset messages when changing chats
  useEffect(() => {
    setAllMessages([]);
    setHasMore(true);
    setIsInitialLoad(true);
    setMessageSearchQuery('');
  }, [selectedChatId]);

  // Infinite scroll handler - load older messages when scrolling UP
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || messagesLoading || !hasMore || isInitialLoad) return;

    // Check if scrolled near TOP (within 200px) to load older messages
    if (container.scrollTop < 200) {
      refetchMessages();
    }
  }, [messagesLoading, hasMore, isInitialLoad, refetchMessages]);

  const selectedChat = chats.find((c: any) => c.id === selectedChatId);

  // Get chat type icon
  const getChatTypeIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="h-3 w-3" />;
      case 'channel':
        return <Radio className="h-3 w-3" />;
      default:
        return <MessageSquare className="h-3 w-3" />;
    }
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
        const response = await syncAllChatsMutation.mutateAsync({
          platformId: selectedPlatformId || undefined,
          ...params,
        });
        const successCount = response.results?.filter((r: any) => r.status === 'success').length || 0;
        const totalCount = response.results?.length || 0;
        toast.success(`Successfully initiated sync for ${successCount}/${totalCount} platforms`);
      } else {
        if (!currentSyncChat) return;
        await syncHistoryMutation.mutateAsync({
          chatId: currentSyncChat.id,
          ...params,
        });
        toast.success(`Successfully synced history for ${currentSyncChat.name}`);
      }
      refetch();
    } catch (error) {
      toast.error(`Failed to sync: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  if (!selectedProjectId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="warning">
          Please select a project to view chats
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Alert variant="danger">
          Failed to load chats: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100">
      {/* Sidebar - Chat List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-white">Chats</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenSyncAllModal}
                disabled={syncAllChatsMutation.isPending}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                title="Sync All Chats"
              >
                <RefreshCw className={`h-5 w-5 ${syncAllChatsMutation.isPending ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => refetch()}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white bg-opacity-90 focus:bg-opacity-100 focus:outline-none text-sm"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            <select
              value={selectedPlatformId}
              onChange={(e) => setSelectedPlatformId(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Platforms</option>
              {platforms.map((platform: any) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
            <select
              value={chatTypeFilter}
              onChange={(e) => setChatTypeFilter(e.target.value as ChatTypeFilter)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="individual">Individual</option>
              <option value="group">Group</option>
              <option value="channel">Channel</option>
            </select>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </p>
            </div>
          ) : (
            chats.map((chat: any) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-green-50' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-white font-semibold shadow-sm">
                  {chat.name?.charAt(0)?.toUpperCase() || chat.providerChatId?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate text-sm">
                      {chat.name || chat.providerChatId}
                    </h3>
                    {chat.lastMessageAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(chat.lastMessageAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {chat.messageCount} messages
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {getChatTypeIcon(chat.chatType)}
                      {chat.chatType}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold shadow-sm">
                  {selectedChat.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedChat.name || selectedChat.providerChatId}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {messagesTotal} messages • {selectedChat.platform.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Message Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-64"
                  />
                </div>
                <button
                  onClick={() => handleOpenSyncModal(selectedChat)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Sync
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4"
            >
              {messagesLoading && allMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {messageSearchQuery ? 'No messages found' : 'No messages yet'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMessages.map((message: any, index: number) => {
                    // Get timestamp
                    const messageTimestamp = message.timestamp;
                    const prevTimestamp = filteredMessages[index - 1]?.timestamp;

                    const isFirstOfDay = index === 0 ||
                      new Date(messageTimestamp).toDateString() !==
                      new Date(prevTimestamp).toDateString();

                    // Determine if message is from user (sent) or received
                    const isSentByUser = message.direction === 'sent';

                    return (
                      <div key={message.id}>
                        {/* Date separator */}
                        {isFirstOfDay && (
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-white px-4 py-1 rounded-full shadow-sm text-xs text-gray-600 font-medium">
                              {new Date(messageTimestamp).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        )}

                        {/* Message bubble */}
                        {isSentByUser ? (
                          /* Sent message - Right side */
                          <div className="flex items-start gap-3 justify-end">
                            <div className="flex-1 min-w-0 flex flex-col items-end">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-xs text-gray-500">
                                  {new Date(messageTimestamp).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className="font-semibold text-sm text-gray-900">
                                  You
                                </span>
                              </div>

                              <div className="bg-green-500 rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[70%]">
                                {message.messageText && (
                                  <p className="text-sm text-white whitespace-pre-wrap break-words">
                                    {message.messageText}
                                  </p>
                                )}

                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {message.attachments.map((attachment: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-green-600 rounded-lg px-3 py-2"
                                      >
                                        <div className="w-8 h-8 bg-green-400 rounded flex items-center justify-center flex-shrink-0">
                                          <span className="text-white font-semibold text-xs">
                                            {attachment.mimeType?.split('/')[0]?.charAt(0)?.toUpperCase() || '📎'}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-white truncate">
                                            {attachment.fileName}
                                          </p>
                                          {attachment.mimeType && (
                                            <p className="text-xs text-green-100">
                                              {attachment.mimeType}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {message.messageType && message.messageType !== 'text' && (
                                <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                  {message.messageType}
                                </span>
                              )}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow-md">
                              Me
                            </div>
                          </div>
                        ) : (
                          /* Received message - Left side */
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow-md">
                              {getDisplayName(message).charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">
                                  {getDisplayName(message)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(messageTimestamp).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>

                              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[70%]">
                                {message.messageText && (
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                    {message.messageText}
                                  </p>
                                )}

                                {message.attachments && message.attachments.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {message.attachments.map((attachment: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200"
                                      >
                                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                                          <span className="text-green-600 font-semibold text-xs">
                                            {attachment.mimeType?.split('/')[0]?.charAt(0)?.toUpperCase() || '📎'}
                                          </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-gray-900 truncate">
                                            {attachment.fileName}
                                          </p>
                                          {attachment.mimeType && (
                                            <p className="text-xs text-gray-500">
                                              {attachment.mimeType}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {message.messageType && message.messageType !== 'text' && (
                                <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                  {message.messageType}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                  {/* Loading indicator for infinite scroll */}
                  {messagesLoading && allMessages.length > 0 && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                    </div>
                  )}
                  {!hasMore && allMessages.length > 0 && (
                    <div className="text-center py-4 text-sm text-gray-500">
                      No more messages
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
              <p className="text-gray-600">
                Choose a chat from the sidebar to view messages
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sync Modal */}
      {currentSyncChat && (
        <SyncHistoryModal
          isOpen={syncModalOpen}
          onClose={() => setSyncModalOpen(false)}
          onSync={handleSync}
          chatName={currentSyncChat.name}
        />
      )}
    </div>
  );
}
