import { useState } from 'react';
import { useFeeds } from '@/hooks/useFeeds';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Plus } from 'lucide-react';
import FeedEditor from './FeedEditor';
import type { Feed } from '@/types';

export default function FeedList() {
  const { data: feeds = [], isLoading } = useFeeds();
  const [editingFeed, setEditingFeed] = useState<Feed | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (feed: Feed) => {
    setEditingFeed(feed);
  };

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleClose = () => {
    setEditingFeed(undefined);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Feeds</h2>
        <Button onClick={handleCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Feed
        </Button>
      </div>

      <div className="space-y-3">
        {feeds.map((feed) => (
          <Card key={feed.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{feed.name}</CardTitle>
                {feed.id !== 'all' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(feed)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {feed.tag_filters.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {feed.tag_filters.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No filters • Shows all posts
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {feeds.length === 0 && (
          <Card>
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                No custom feeds yet. Create one to organize your posts!
              </p>
              <Button onClick={handleCreate} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Feed
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <FeedEditor
        feed={editingFeed}
        open={!!editingFeed || isCreating}
        onOpenChange={(open) => {
          if (!open) handleClose();
        }}
        onSuccess={handleClose}
      />
    </div>
  );
}
