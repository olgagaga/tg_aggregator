import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Post } from '@/types';
import TagBadge from '@/components/tags/TagBadge';
import { useToggleBookmark } from '@/hooks/useBookmarks';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  onTagClick?: (tagName: string) => void;
}

export default function PostCard({ post, onTagClick }: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { addBookmark, removeBookmark, isLoading } = useToggleBookmark();

  const shouldTruncate = post.content.length > 300;
  const displayContent = isExpanded || !shouldTruncate
    ? post.content
    : post.content.slice(0, 300) + '...';

  const handleBookmarkToggle = () => {
    if (post.is_bookmarked) {
      removeBookmark(post.id);
    } else {
      addBookmark(post.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">{post.channel_name}</h3>
            <p className="text-sm text-muted-foreground">@{post.channel_username}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8',
                post.is_bookmarked && 'text-amber-500'
              )}
              onClick={handleBookmarkToggle}
              disabled={isLoading}
            >
              <Bookmark
                className={cn(
                  'h-4 w-4',
                  post.is_bookmarked && 'fill-current'
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              asChild
            >
              <a
                href={post.original_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open in Telegram"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Post Content */}
        <div className="space-y-2">
          <p className="text-sm whitespace-pre-wrap break-words">
            {displayContent}
          </p>
          {shouldTruncate && (
            <Button
              variant="link"
              className="h-auto p-0 text-sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}
        </div>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {post.media_urls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Media ${index + 1}`}
                className="rounded-md w-full h-auto object-cover"
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag, index) => (
              <TagBadge
                key={`${tag.name}-${index}`}
                tag={tag}
                onClick={() => onTagClick?.(tag.name)}
              />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  );
}
