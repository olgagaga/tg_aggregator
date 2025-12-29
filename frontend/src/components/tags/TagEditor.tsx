import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Tag } from '@/types';

interface TagEditorProps {
  currentTags: Tag[];
  onSave: (tags: Tag[]) => void;
  isLoading?: boolean;
  suggestions?: string[];
  allTags?: Array<{ name: string; count: number; source: 'llm' | 'human' }>;
}

export default function TagEditor({
  currentTags,
  onSave,
  isLoading = false,
  suggestions = [],
  allTags = []
}: TagEditorProps) {
  const [tags, setTags] = useState<Tag[]>(currentTags);
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter suggestions based on input and exclude already added tags
  const tagNames = tags.map(t => t.name);
  const filteredSuggestions = suggestions
    .filter(s =>
      !tagNames.includes(s) &&
      s.toLowerCase().includes(inputValue.toLowerCase())
    )
    .slice(0, 5); // Limit to 5 suggestions

  const handleAddTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !tagNames.includes(trimmedTag)) {
      // Check if this tag exists in allTags to preserve its author_type
      const existingTag = allTags.find(t => t.name === trimmedTag);

      const newTag: Tag = {
        name: trimmedTag,
        author_type: existingTag ? existingTag.source : 'human',
        created_at: new Date().toISOString(),
      };

      setTags([...tags, newTag]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t.name !== tagToRemove));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag on backspace if input is empty
      handleRemoveTag(tags[tags.length - 1].name);
    }
  };

  const handleSave = () => {
    onSave(tags);
  };

  const handleCancel = () => {
    // Reset to original tags
    setTags(currentTags);
    setInputValue('');
  };

  const hasChanges = JSON.stringify(tags.map(t => t.name).sort()) !==
                     JSON.stringify(currentTags.map(t => t.name).sort());

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {tags.map((tag) => (
          <Badge
            key={tag.name}
            variant="secondary"
            className="gap-1 pr-1"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag.name)}
              className="ml-1 hover:bg-muted rounded-sm p-0.5"
              disabled={isLoading}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 && (
          <span className="text-sm text-muted-foreground">No tags yet</span>
        )}
      </div>

      {/* Input with Suggestions */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Add tag..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setShowSuggestions(true)}
              disabled={isLoading}
              className="pr-8"
            />
            {inputValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-2"
                onClick={() => handleAddTag(inputValue)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md">
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleAddTag(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {hasChanges && (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Tags'}
          </Button>
        </div>
      )}
    </div>
  );
}
