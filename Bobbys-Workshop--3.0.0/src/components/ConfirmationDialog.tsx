import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  requiredText: string; // Text user must type exactly
  warning?: string;
  danger?: boolean;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  requiredText,
  warning,
  danger = false
}: ConfirmationDialogProps) {
  const [inputText, setInputText] = useState('');
  const isValid = inputText === requiredText;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
      setInputText('');
    }
  };

  const handleClose = () => {
    setInputText('');
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className={danger ? 'text-destructive' : ''}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{description}</p>
            {warning && (
              <div className="mt-3 p-3 bg-yellow-500/20 dark:bg-yellow-500/10 border border-yellow-500/50 rounded text-sm">
                <strong className="font-semibold text-yellow-900 dark:text-yellow-200">⚠️ Warning:</strong>
                <p className="mt-1 text-yellow-800 dark:text-yellow-300">{warning}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="confirmation-input" className="text-sm font-medium">
            Type <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{requiredText}</code> to confirm:
          </Label>
          <Input
            id="confirmation-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid) {
                handleConfirm();
              }
            }}
            className="mt-2 font-mono"
            placeholder={requiredText}
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid}
            className={danger ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

