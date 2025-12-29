import { useState } from 'react';
import { useTags, useDeleteTag, useCreateTag } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X } from 'lucide-react';

export default function TagList() {
  const { data: tags = [], isLoading } = useTags();
  const { deleteTag } = useDeleteTag();
  const { createTag, isLoading: isCreating } = useCreateTag();
  const [newTagName, setNewTagName] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleRemove = (tagName: string) => {
    if (confirm(`Are you sure you want to delete tag "${tagName}"? This will remove it from all posts.`)) {
      deleteTag(tagName);
    }
  };

  const handleAddTag = () => {
    const trimmedName = newTagName.trim().toLowerCase();
    if (trimmedName) {
      createTag(trimmedName, {
        onSuccess: () => {
          setNewTagName('');
          setIsAddingTag(false);
        },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTagName.trim()) {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setNewTagName('');
      setIsAddingTag(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tag Library</h2>
        <Button
          onClick={() => setIsAddingTag(!isAddingTag)}
          size="sm"
          variant={isAddingTag ? 'outline' : 'default'}
        >
          {isAddingTag ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Tag
            </>
          )}
        </Button>
      </div>

      {/* Add Tag Input */}
      {isAddingTag && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isCreating}
                autoFocus
              />
              <Button
                onClick={handleAddTag}
                disabled={!newTagName.trim() || isCreating}
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tags will be available for LLM tagging and manual assignment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tags List */}
      <Card>
        <CardContent className="pt-6">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  className="gap-2 pr-1 text-sm py-1.5 px-3"
                >
                  <span>{tag.name}</span>
                  <span className="text-xs opacity-60">({tag.count})</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(tag.name)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-sm p-0.5 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                No tags yet. Create tags that can be assigned to posts.
              </p>
              <Button onClick={() => setIsAddingTag(true)} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Tag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Tags are used by the LLM to automatically categorize posts. You can also manually assign them when editing posts.
      </p>
    </div>
  );
}
