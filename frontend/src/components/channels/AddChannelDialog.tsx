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
import { useAddChannel } from '@/hooks/useChannels';

interface AddChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddChannelDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddChannelDialogProps) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');

  const { addChannel, isLoading } = useAddChannel();

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setUsername('');
      setName('');
    }
  }, [open]);

  const handleSave = () => {
    // Remove @ symbol if user included it
    const cleanUsername = username.trim().replace(/^@/, '');

    if (!cleanUsername) {
      return;
    }

    const data = {
      username: cleanUsername,
      name: name.trim() || cleanUsername,
      is_active: true,
    };

    addChannel(data, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
        setUsername('');
        setName('');
      },
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setUsername('');
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Telegram Channel</DialogTitle>
          <DialogDescription>
            Add a new Telegram channel to track and aggregate posts from.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Channel Username */}
          <div className="space-y-2">
            <label htmlFor="channel-username" className="text-sm font-medium">
              Channel Username <span className="text-destructive">*</span>
            </label>
            <Input
              id="channel-username"
              placeholder="e.g., mlnews or @mlnews"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter the channel username without the @ symbol
            </p>
          </div>

          {/* Channel Name (Optional) */}
          <div className="space-y-2">
            <label htmlFor="channel-name" className="text-sm font-medium">
              Display Name (optional)
            </label>
            <Input
              id="channel-name"
              placeholder="e.g., ML News"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              If empty, the username will be used
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
            disabled={isLoading || !username.trim()}
          >
            {isLoading ? 'Adding...' : 'Add Channel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
