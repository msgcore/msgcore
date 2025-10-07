import { useState, useCallback } from 'react';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmButtonVariant?: 'danger' | 'primary' | 'secondary';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setOptions(options);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve);
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const ConfirmDialogComponent = useCallback(() => {
    if (!options) return null;

    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        {...options}
      />
    );
  }, [isOpen, options, handleClose, handleConfirm]);

  return {
    confirm,
    ConfirmDialog: ConfirmDialogComponent,
  };
}