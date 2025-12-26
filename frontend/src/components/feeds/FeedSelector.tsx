import { useFeedContext } from '@/context/FeedContext';
import { useFeeds } from '@/hooks/useFeeds';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus } from 'lucide-react';

interface FeedSelectorProps {
  onCreateFeed?: () => void;
}

export default function FeedSelector({ onCreateFeed }: FeedSelectorProps) {
  const { currentFeedId, setCurrentFeedId } = useFeedContext();
  const { data: feeds = [], isLoading } = useFeeds();

  const currentFeed = feeds.find((f) => f.id === currentFeedId);
  const feedName = currentFeed?.name || 'All Posts';

  const handleFeedChange = (feedId: string) => {
    setCurrentFeedId(feedId);
  };

  if (isLoading) {
    return (
      <div className="h-10 w-40 bg-muted animate-pulse rounded-md" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="min-w-[160px] justify-between">
          <span className="truncate">{feedName}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>My Feeds</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {feeds.map((feed) => (
          <DropdownMenuItem
            key={feed.id}
            onClick={() => handleFeedChange(feed.id)}
            className="cursor-pointer"
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{feed.name}</span>
              {feed.tag_filters.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {feed.tag_filters.length} filter{feed.tag_filters.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}

        {feeds.length === 0 && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No custom feeds yet
          </div>
        )}

        {onCreateFeed && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCreateFeed}
              className="cursor-pointer text-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create new feed
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
