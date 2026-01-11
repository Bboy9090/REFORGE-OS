import { toast } from 'sonner';

interface CopyOptions {
  successMessage?: string;
  errorMessage?: string;
  unavailableMessage?: string;
}

export async function copyTextToClipboard(
  text: string,
  {
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy to clipboard. Please copy manually.',
    unavailableMessage = 'Clipboard is not available in this environment.'
  }: CopyOptions = {}
): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    toast.error(unavailableMessage);
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    return true;
  } catch {
    toast.error(errorMessage);
    return false;
  }
}
