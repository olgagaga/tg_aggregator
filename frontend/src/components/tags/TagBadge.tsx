import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/types';
import { cn } from '@/lib/utils';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

export default function TagBadge({ tag, onClick, onRemove, className }: TagBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'cursor-pointer transition-all hover:bg-accent',
        onClick && 'hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-red-600"
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </Badge>
  );
}
