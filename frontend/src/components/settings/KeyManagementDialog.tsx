import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface KeyManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KeyManagementDialog({
  open,
  onOpenChange,
}: KeyManagementDialogProps) {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [telegramApiId, setTelegramApiId] = useState('');
  const [telegramApiHash, setTelegramApiHash] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setOpenaiApiKey('');
      setTelegramApiId('');
      setTelegramApiHash('');
      setShowKeys(false);
    }
  }, [open]);

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // TODO: API endpoint not yet implemented
      // await api.post('/settings/keys', {
      //   openai_api_key: openaiApiKey.trim() || undefined,
      //   telegram_api_id: telegramApiId.trim() || undefined,
      //   telegram_api_hash: telegramApiHash.trim() || undefined,
      // });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.error('API endpoint not yet implemented. Please configure keys in backend .env file.');

      // When implemented, uncomment:
      // toast.success('API keys updated successfully');
      // onOpenChange(false);
    } catch (error) {
      console.error('Failed to update API keys:', error);
      toast.error('Failed to update API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </DialogTitle>
          <DialogDescription>
            Manage your API keys for OpenAI and Telegram services. Leave fields empty to keep existing values.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Show/Hide Toggle */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowKeys(!showKeys)}
              className="gap-2"
            >
              {showKeys ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Keys
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Keys
                </>
              )}
            </Button>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <label htmlFor="openai-key" className="text-sm font-medium">
              OpenAI API Key
            </label>
            <Input
              id="openai-key"
              type={showKeys ? 'text' : 'password'}
              placeholder="sk-..."
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Used for LLM-based tagging and content analysis
            </p>
          </div>

          {/* Telegram API ID */}
          <div className="space-y-2">
            <label htmlFor="telegram-id" className="text-sm font-medium">
              Telegram API ID
            </label>
            <Input
              id="telegram-id"
              type={showKeys ? 'text' : 'password'}
              placeholder="12345678"
              value={telegramApiId}
              onChange={(e) => setTelegramApiId(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Get from{' '}
              <a
                href="https://my.telegram.org/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                my.telegram.org/apps
              </a>
            </p>
          </div>

          {/* Telegram API Hash */}
          <div className="space-y-2">
            <label htmlFor="telegram-hash" className="text-sm font-medium">
              Telegram API Hash
            </label>
            <Input
              id="telegram-hash"
              type={showKeys ? 'text' : 'password'}
              placeholder="abcdef1234567890..."
              value={telegramApiHash}
              onChange={(e) => setTelegramApiHash(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Get from{' '}
              <a
                href="https://my.telegram.org/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                my.telegram.org/apps
              </a>
            </p>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Currently, API keys must be configured in the backend .env file.
              A secure API endpoint for updating keys is coming soon.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Keys'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
