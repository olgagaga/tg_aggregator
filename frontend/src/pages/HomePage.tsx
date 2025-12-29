import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useFeedContext } from '@/context/FeedContext';
import PostList from '@/components/posts/PostList';
import TagFilter from '@/components/tags/TagFilter';
import FeedSelector from '@/components/feeds/FeedSelector';
import FeedEditor from '@/components/feeds/FeedEditor';
import SearchBar from '@/components/search/SearchBar';
import PullToRefresh from '@/components/ui/PullToRefresh';
import KeyboardShortcutsDialog from '@/components/ui/KeyboardShortcutsDialog';
import { useFeeds } from '@/hooks/useFeeds';
import { useSearch } from '@/hooks/useSearch';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useScrapeAll } from '@/hooks/useChannels';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Settings, X, RefreshCw } from 'lucide-react';
import PostCard from '@/components/posts/PostCard';
import PostSkeleton from '@/components/posts/PostSkeleton';

export default function HomePage() {
  console.log('[DEBUG] HomePage: Rendering HomePage');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { currentFeedId, selectedTags, setSelectedTags } = useFeedContext();
  const { data: feeds = [] } = useFeeds();
  const [isCreatingFeed, setIsCreatingFeed] = useState(false);
  const [isEditingFeed, setIsEditingFeed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  console.log('[DEBUG] HomePage: selectedTags =', selectedTags);
  console.log('[DEBUG] HomePage: currentFeedId =', currentFeedId);

  const currentFeed = feeds.find((f) => f.id === currentFeedId);
  const { scrapeAll, isLoading: isScraping } = useScrapeAll();

  // Search functionality
  const { data: searchResults, isLoading: isSearching } = useSearch(
    searchQuery,
    searchQuery.length > 0
  );
  const isSearchMode = searchQuery.length > 0;

  // Pull to refresh handler
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['posts'] });
    await queryClient.invalidateQueries({ queryKey: ['tags'] });
    if (isSearchMode) {
      await queryClient.invalidateQueries({ queryKey: ['search'] });
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: '/',
      handler: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        searchInput?.focus();
      },
      description: 'Focus search',
    },
    {
      key: 'n',
      handler: () => setIsCreatingFeed(true),
      description: 'Create new feed',
    },
    {
      key: 'b',
      handler: () => navigate('/bookmarks'),
      description: 'Go to bookmarks',
    },
    {
      key: ',',
      handler: () => navigate('/settings'),
      description: 'Go to settings',
    },
    {
      key: 'h',
      handler: () => navigate('/'),
      description: 'Go to home',
    },
    {
      key: 'r',
      handler: handleRefresh,
      description: 'Refresh posts',
    },
    {
      key: '?',
      shift: true,
      handler: () => setShowShortcuts(true),
      description: 'Show keyboard shortcuts',
    },
  ]);

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

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="container mx-auto px-4 py-6">
        {/* Two Column Layout */}
        <div className="flex gap-6 items-start">
          {/* Left Sidebar - Feed Selector and Tag Filter (Desktop only, hide in search mode) */}
          {!isSearchMode && (
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6 space-y-6">
              {/* Feed Selector */}
              <div className="space-y-3">
                <FeedSelector onCreateFeed={() => setIsCreatingFeed(true)} />

                {/* Scrape All Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrapeAll(10)}
                  disabled={isScraping}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isScraping ? 'animate-spin' : ''}`} />
                  {isScraping ? 'Scraping...' : 'Scrape All Channels'}
                </Button>

                {/* Edit Feed Button */}
                {currentFeed && currentFeed.id !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingFeed(true)}
                    className="w-full"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Feed
                  </Button>
                )}
              </div>

              {/* Feed Tag Filters Display */}
              {currentFeed && currentFeed.tag_filters.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    Feed filters:
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

              {/* Tag Filter (only show if not using feed filters) */}
              {(!currentFeed || currentFeed.tag_filters.length === 0) && (
                <TagFilter
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                  onClearAll={handleClearAllTags}
                />
              )}
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 max-w-3xl mx-auto w-full">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                isLoading={isSearching}
                placeholder="Search posts by content or channel..."
              />
            </div>

            {/* Search Results Header */}
            {isSearchMode && (
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">Search Results</h2>
                  {searchResults && (
                    <p className="text-sm text-muted-foreground">
                      Found {searchResults.total} result{searchResults.total !== 1 ? 's' : ''} for "{searchQuery}"
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Search
                </Button>
              </div>
            )}

            {/* Mobile Controls (show when sidebar is hidden) */}
            {!isSearchMode && (
              <div className="lg:hidden mb-6 space-y-4">
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
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Mobile: Filter button with sheet */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm">
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
              </div>
            )}

            {/* Search Results or Regular Post List */}
            {isSearchMode ? (
              <div className="space-y-4">
                {isSearching && (
                  <>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                  </>
                )}

                {!isSearching && searchResults && searchResults.data.length > 0 && (
                  <>
                    {searchResults.data.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onTagClick={handleTagToggle}
                      />
                    ))}
                  </>
                )}

                {!isSearching && searchResults && searchResults.data.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No posts found matching "{searchQuery}"
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleClearSearch}
                      className="mt-4"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <PostList tags={activeTags} onTagClick={handleTagToggle} />
            )}
          </main>
        </div>

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

        {/* Keyboard Shortcuts Help */}
        <KeyboardShortcutsDialog
          open={showShortcuts}
          onOpenChange={setShowShortcuts}
        />
      </div>
    </PullToRefresh>
  );
}
