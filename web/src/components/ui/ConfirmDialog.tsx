import { ReactNode, useEffect } from 'react';
import { X, AlertTriangle, Info, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmButtonVariant?: 'danger' | 'primary' | 'secondary';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  confirmButtonVariant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, isLoading]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 className="w-6 h-6 text-red-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    info: <Info className="w-6 h-6 text-blue-600" />,
  };

  const iconBgColors = {
    danger: 'bg-red-100',
    warning: 'bg-amber-100',
    info: 'bg-blue-100',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 z-50 transition-opacity"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-4 p-6 pb-4">
            <div className={cn('p-3 rounded-full flex-shrink-0', iconBgColors[variant])}>
              {icons[variant]}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
              <div className="text-sm text-gray-600">
                {message}
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 pb-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmButtonVariant}
              onClick={() => {
                onConfirm();
                if (!isLoading) {
                  onClose();
                }
              }}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}