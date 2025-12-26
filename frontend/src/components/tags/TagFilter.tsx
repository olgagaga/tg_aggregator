import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTags } from '@/hooks/useTags';
import { cn } from '@/lib/utils';

interface TagFilterProps {
  selectedTags: string[];
  onTagToggle: (tagName: string) => void;
  onClearAll?: () => void;
  showCounts?: boolean;
}

export default function TagFilter({
  selectedTags,
  onTagToggle,
  onClearAll,
  showCounts = true
}: TagFilterProps) {
  const { data: tags = [], isLoading, error } = useTags();

  // Sort tags by count (descending) and then alphabetically
  const sortedTags = [...tags].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.name.localeCompare(b.name);
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Filter by tags</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-6 w-20 bg-muted animate-pulse rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load tags
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filter by tags</h3>
        {selectedTags.length > 0 && onClearAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-auto py-1 px-2 text-xs"
          >
            Clear all
          </Button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Active filters:</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedTags.map((tagName) => (
              <Badge
                key={tagName}
                variant="default"
                className="gap-1 pr-1 cursor-pointer"
                onClick={() => onTagToggle(tagName)}
              >
                {tagName}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {sortedTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          const isHumanTag = tag.source === 'human';

          return (
            <Badge
              key={tag.name}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'cursor-pointer transition-colors',
                !isSelected && isHumanTag && 'border-amber-500/50 text-amber-700 hover:bg-amber-50',
                !isSelected && !isHumanTag && 'hover:bg-accent'
              )}
              onClick={() => onTagToggle(tag.name)}
            >
              {tag.name}
              {showCounts && (
                <span className="ml-1 text-xs opacity-60">
                  {tag.count}
                </span>
              )}
            </Badge>
          );
        })}
      </div>

      {tags.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No tags available
        </p>
      )}
    </div>
  );
}
