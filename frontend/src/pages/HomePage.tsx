import { useFeedContext } from '@/context/FeedContext';
import PostList from '@/components/posts/PostList';

export default function HomePage() {
  console.log('[DEBUG] HomePage: Rendering HomePage');
  const { selectedTags, setSelectedTags } = useFeedContext();
  console.log('[DEBUG] HomePage: selectedTags =', selectedTags);

  const handleTagClick = (tagName: string) => {
    console.log('[DEBUG] HomePage: handleTagClick', tagName);
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">All Posts</h1>
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full cursor-pointer hover:bg-primary/20"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag} ×
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <PostList
        tags={selectedTags.length > 0 ? selectedTags : undefined}
        onTagClick={handleTagClick}
      />
    </div>
  );
}
