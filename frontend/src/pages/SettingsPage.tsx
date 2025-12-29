import { useState } from 'react';
import FeedList from '@/components/feeds/FeedList';
import ChannelList from '@/components/channels/ChannelList';
import KeyManagementDialog from '@/components/settings/KeyManagementDialog';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';

export default function SettingsPage() {
  const [showKeyDialog, setShowKeyDialog] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button onClick={() => setShowKeyDialog(true)} variant="outline" size="sm">
          <Key className="mr-2 h-4 w-4" />
          API Keys
        </Button>
      </div>

      <div className="space-y-8">
        {/* Channel Management Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Channel Management</h2>
          <ChannelList />
        </section>

        {/* Feed Management Section */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Feed Management</h2>
          <FeedList />
        </section>

        {/* Future sections can go here */}
        {/* <section>
          <h2 className="text-lg font-semibold mb-4">Preferences</h2>
          <p className="text-sm text-muted-foreground">Display preferences coming soon...</p>
        </section> */}
      </div>

      <KeyManagementDialog
        open={showKeyDialog}
        onOpenChange={setShowKeyDialog}
      />
    </div>
  );
}
