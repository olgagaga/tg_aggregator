import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { X, Trash2 } from 'lucide-react';
import { useCreateFeed, useUpdateFeed, useDeleteFeed } from '@/hooks/useFeeds';
import { useTags } from '@/hooks/useTags';
import type { Feed } from '@/types';
import { cn } from '@/lib/utils';

interface FeedEditorProps {
  feed?: Feed; // If provided, edit mode; otherwise, create mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function FeedEditor({
  feed,
  open,
  onOpenChange,
  onSuccess,
}: FeedEditorProps) {
  const isEditMode = !!feed;
  const [name, setName] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { createFeed, isLoading: isCreating } = useCreateFeed();
  const { updateFeed, isLoading: isUpdating } = useUpdateFeed(feed?.id || '');
  const { deleteFeed, isLoading: isDeleting } = useDeleteFeed();
  const { data: allTags = [] } = useTags();

  const isLoading = isCreating || isUpdating || isDeleting;

  // Initialize form with feed data in edit mode
  useEffect(() => {
    if (feed) {
      setName(feed.name);
      setSelectedTags(feed.tag_filters);
    } else {
      setName('');
      setSelectedTags([]);
    }
  }, [feed, open]);

  const handleToggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    const data = {
      name: name.trim(),
      tag_filters: selectedTags,
    };

    if (isEditMode) {
      updateFeed(data, {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      });
    } else {
      createFeed(data, {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
          setName('');
          setSelectedTags([]);
        },
      });
    }
  };

  const handleDelete = () => {
    if (!feed) return;

    deleteFeed(feed.id, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
        setShowDeleteConfirm(false);
      },
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
    setShowDeleteConfirm(false);
    if (!isEditMode) {
      setName('');
      setSelectedTags([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Feed' : 'Create New Feed'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your feed name and tag filters.'
              : 'Create a custom feed by selecting tags to filter posts.'}
          </DialogDescription>
        </DialogHeader>

        {!showDeleteConfirm ? (
          <>
            <div className="space-y-4 py-4">
              {/* Feed Name */}
              <div className="space-y-2">
                <label htmlFor="feed-name" className="text-sm font-medium">
                  Feed Name
                </label>
                <Input
                  id="feed-name"
                  placeholder="e.g., Research Papers"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              {/* Tag Filters */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Filter by Tags (optional)
                </label>
                <p className="text-xs text-muted-foreground">
                  Select tags to include in this feed
                </p>

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-muted/50 rounded-md">
                    {selectedTags.map((tagName) => (
                      <Badge
                        key={tagName}
                        variant="default"
                        className="gap-1 pr-1"
                      >
                        {tagName}
                        <button
                          type="button"
                          onClick={() => handleToggleTag(tagName)}
                          className="ml-1 hover:bg-primary-foreground/20 rounded-sm p-0.5"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto border rounded-md p-2">
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => {
                      const isSelected = selectedTags.includes(tag.name);

                      return (
                        <Badge
                          key={tag.name}
                          variant={isSelected ? 'default' : 'outline'}
                          className={cn(
                            'cursor-pointer transition-colors',
                            !isSelected && 'hover:bg-accent'
                          )}
                          onClick={() => handleToggleTag(tag.name)}
                        >
                          {tag.name}
                          <span className="ml-1 text-xs opacity-60">
                            {tag.count}
                          </span>
                        </Badge>
                      );
                    })}
                  </div>

                  {allTags.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tags available
                    </p>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              {isEditMode && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading || feed?.id === 'all'}
                  className="sm:mr-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Feed
                </Button>
              )}
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
                disabled={isLoading || !name.trim()}
              >
                {isLoading
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update Feed'
                  : 'Create Feed'}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="py-4">
              <p className="text-sm">
                Are you sure you want to delete the feed "{feed?.name}"? This
                action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Deleting...' : 'Delete Feed'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
