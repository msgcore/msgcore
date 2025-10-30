import { useState } from 'react';
import { MessageSquare, Loader2, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
  const limit = 20;
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={chatName || 'Chat Messages'}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-gray-600">
            {total > 0 && (
              <span>
                Showing {offset + 1}-{Math.min(offset + limit, total)} of {total} messages
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Page {page + 1} of {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1 || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              This chat doesn't have any messages yet.
            </p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto space-y-2">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {message.userDisplay || message.providerUserId}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(message.receivedAt)}
                      </div>
                    </div>
                  </div>
                  <Badge variant="info">{message.messageType}</Badge>
                </div>

                {message.messageText && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                    {message.messageText}
                  </p>
                )}

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Attachments ({message.attachments.length})
                    </p>
                    <div className="space-y-1">
                      {message.attachments.map((attachment: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs bg-gray-50 rounded px-2 py-1"
                        >
                          <span className="text-gray-600">{attachment.fileName}</span>
                          {attachment.mimeType && (
                            <Badge variant="info" className="text-xs">
                              {attachment.mimeType}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 font-mono">
                  ID: {message.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
