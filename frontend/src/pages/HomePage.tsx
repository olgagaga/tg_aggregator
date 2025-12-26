import { useFeedContext } from '@/context/FeedContext';
import PostList from '@/components/posts/PostList';
import TagFilter from '@/components/tags/TagFilter';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

export default function HomePage() {
  console.log('[DEBUG] HomePage: Rendering HomePage');
  const { selectedTags, setSelectedTags } = useFeedContext();
  console.log('[DEBUG] HomePage: selectedTags =', selectedTags);

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

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">All Posts</h1>

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

        {/* Desktop: Inline filter */}
        <div className="hidden md:block">
          <TagFilter
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onClearAll={handleClearAllTags}
          />
        </div>
      </div>

      <PostList
        tags={selectedTags.length > 0 ? selectedTags : undefined}
        onTagClick={handleTagToggle}
      />
    </div>
  );
}
