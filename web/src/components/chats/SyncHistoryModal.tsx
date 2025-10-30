import { useState } from 'react';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';

interface SyncHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (params: { startDate?: string; endDate?: string; limit?: number }) => Promise<void>;
  chatName?: string;
}

export function SyncHistoryModal({
  isOpen,
  onClose,
  onSync,
  chatName,
}: SyncHistoryModalProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [limit, setLimit] = useState('100');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const limitNum = parseInt(limit) || 100;
      if (limitNum < 1 || limitNum > 1000) {
        setError('Limit must be between 1 and 1000');
        setIsLoading(false);
        return;
      }

      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setError('Start date must be before end date');
        setIsLoading(false);
        return;
      }

      await onSync({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: limitNum,
      });

      // Reset form and close
      setStartDate('');
      setEndDate('');
      setLimit('100');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setStartDate('');
      setEndDate('');
      setLimit('100');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sync Chat History"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSync} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Sync History
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {chatName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Chat:</strong> {chatName}
            </p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range (Optional)
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Sync messages within a specific date range. Leave empty to sync all available messages.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Limit
          </label>
          <p className="text-xs text-gray-600 mb-3">
            Maximum number of messages to sync (1-1000). Default: 100
          </p>
          <Input
            type="number"
            min="1"
            max="1000"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            disabled={isLoading}
            placeholder="100"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-900">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Existing messages will not be duplicated</li>
                <li>Sync may take a few moments depending on message count</li>
                <li>Messages sent by you (outbound) will be skipped</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
