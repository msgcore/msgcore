import { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';
import { useChatMessages } from '../../hooks/useChats';

interface ChatMessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  chatId: string;
  chatName?: string;
}

export function ChatMessagesModal({
  isOpen,
  onClose,
  projectId,
  chatId,
  chatName,
}: ChatMessagesModalProps) {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const limit = 50;
  const offset = page * limit;

  const { data, isLoading } = useChatMessages(
    projectId,
    chatId,
    limit,
    offset
  );

  const messages = data?.messages || [];
  const total = data?.pagination?.total || 0;
  const totalPages = Math.ceil(total / limit);

  // Filter messages by search query
  const filteredMessages = messages.filter((msg: any) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      msg.messageText?.toLowerCase().includes(searchLower) ||
      msg.userDisplay?.toLowerCase().includes(searchLower)
    );
  });

  // Scroll to bottom when messages load
  useEffect(() => {
    if (page === 0 && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, page]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col mx-4">
        {/* Header - Messaging app style */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-semibold">
              {chatName?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {chatName || 'Chat'}
              </h3>
              <p className="text-xs text-blue-100">
                {total} message{total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Messages Container - Messaging app style */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Loading messages...</p>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No messages found' : 'No messages yet'}
                </h3>
                <p className="text-sm text-gray-600">
                  {searchQuery ? 'Try adjusting your search' : 'Messages will appear here'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message: any, index: number) => {
                const isFirstOfDay = index === 0 ||
                  new Date(message.receivedAt).toDateString() !==
                  new Date(filteredMessages[index - 1]?.receivedAt).toDateString();

                return (
                  <div key={message.id}>
                    {/* Date separator */}
                    {isFirstOfDay && (
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-white px-4 py-1 rounded-full shadow-sm text-xs text-gray-600 font-medium">
                          {new Date(message.receivedAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}

                    {/* Message bubble */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm shadow-md">
                        {message.userDisplay?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">
                            {message.userDisplay || message.providerUserId}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.receivedAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>

                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
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
                                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-semibold text-xs">
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
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Footer - Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0 || isLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages - 1 || isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-blue-500 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
