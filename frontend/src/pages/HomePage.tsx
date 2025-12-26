import { useState } from 'react';
import { useFeedContext } from '@/context/FeedContext';
import PostList from '@/components/posts/PostList';
import TagFilter from '@/components/tags/TagFilter';
import FeedSelector from '@/components/feeds/FeedSelector';
import FeedEditor from '@/components/feeds/FeedEditor';
import { useFeeds } from '@/hooks/useFeeds';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Settings } from 'lucide-react';

export default function HomePage() {
  console.log('[DEBUG] HomePage: Rendering HomePage');
  const { currentFeedId, selectedTags, setSelectedTags } = useFeedContext();
  const { data: feeds = [] } = useFeeds();
  const [isCreatingFeed, setIsCreatingFeed] = useState(false);
  const [isEditingFeed, setIsEditingFeed] = useState(false);

  console.log('[DEBUG] HomePage: selectedTags =', selectedTags);
  console.log('[DEBUG] HomePage: currentFeedId =', currentFeedId);

  const currentFeed = feeds.find((f) => f.id === currentFeedId);

  const handleTagToggle = (tagName: string) => {
    console.log('[DEBUG] HomePage: handleTagToggle', tagName);
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  const handleClearAllTags = () => {
    setSelectedTags([]);
  };

  // Determine which tags to use for filtering
  // If a feed is selected and has tag filters, use those; otherwise use manual selection
  const activeTags = currentFeed?.tag_filters.length
    ? currentFeed.tag_filters
    : selectedTags.length > 0
    ? selectedTags
    : undefined;

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <FeedSelector onCreateFeed={() => setIsCreatingFeed(true)} />

          <div className="flex gap-2">
            {/* Edit Feed Button */}
            {currentFeed && currentFeed.id !== 'all' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingFeed(true)}
              >
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Edit Feed</span>
              </Button>
            )}

            {/* Mobile: Filter button with sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {selectedTags.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                      {selectedTags.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filter Posts</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <TagFilter
                    selectedTags={selectedTags}
                    onTagToggle={handleTagToggle}
                    onClearAll={handleClearAllTags}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Feed Tag Filters Display */}
        {currentFeed && currentFeed.tag_filters.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              This feed shows posts with these tags:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentFeed.tag_filters.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Desktop: Inline filter (only show if not using feed filters) */}
        {(!currentFeed || currentFeed.tag_filters.length === 0) && (
          <div className="hidden md:block">
            <TagFilter
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
              onClearAll={handleClearAllTags}
            />
          </div>
        )}
      </div>

      <PostList tags={activeTags} onTagClick={handleTagToggle} />

      {/* Feed Editor Modals */}
      <FeedEditor
        open={isCreatingFeed}
        onOpenChange={setIsCreatingFeed}
        onSuccess={() => setIsCreatingFeed(false)}
      />

      <FeedEditor
        feed={currentFeed}
        open={isEditingFeed}
        onOpenChange={setIsEditingFeed}
        onSuccess={() => setIsEditingFeed(false)}
      />
    </div>
  );
}
