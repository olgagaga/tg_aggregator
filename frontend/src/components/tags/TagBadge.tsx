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
  const isHuman = tag.author_type === 'human';

  return (
    <Badge
      variant={isHuman ? 'default' : 'secondary'}
      className={cn(
        'cursor-pointer transition-all',
        isHuman
          ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-100'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
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
