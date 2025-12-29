import { useState } from 'react';
import { useChannels, useRemoveChannel } from '@/hooks/useChannels';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import AddChannelDialog from './AddChannelDialog';
import type { Channel } from '@/types';

export default function ChannelList() {
  const { data: channels = [], isLoading } = useChannels();
  const { removeChannel } = useRemoveChannel();
  const [isAdding, setIsAdding] = useState(false);

  const handleRemove = (username: string) => {
    if (confirm(`Are you sure you want to remove channel @${username}?`)) {
      removeChannel(username);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleClose = () => {
    setIsAdding(false);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tracked Channels</h2>
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Channel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel: Channel) => (
          <Card key={channel.id} className="flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{channel.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    @{channel.username}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(channel.username)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Badge variant={channel.is_active ? 'default' : 'secondary'} className="w-fit">
                {channel.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {channels.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                No channels tracked yet. Add a Telegram channel to start!
              </p>
              <Button onClick={handleAdd} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Channel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AddChannelDialog
        open={isAdding}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        onSuccess={handleClose}
      />
    </div>
  );
}
