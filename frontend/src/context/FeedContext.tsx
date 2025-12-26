import { createContext, useContext, useState, useMemo } from 'react';
import type { ReactNode } from 'react';

interface FeedContextType {
  currentFeedId: string;
  setCurrentFeedId: (feedId: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: ReactNode }) {
  console.log('[DEBUG] FeedContext: FeedProvider rendering');
  const [currentFeedId, setCurrentFeedId] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const value = useMemo(
    () => {
      console.log('[DEBUG] FeedContext: Creating context value', { currentFeedId, selectedTags });
      return {
        currentFeedId,
        setCurrentFeedId,
        selectedTags,
        setSelectedTags,
      };
    },
    [currentFeedId, selectedTags]
  );

  return (
    <FeedContext.Provider value={value}>
      {children}
    </FeedContext.Provider>
  );
}

export function useFeedContext() {
  const context = useContext(FeedContext);
  if (context === undefined) {
    throw new Error('useFeedContext must be used within a FeedProvider');
  }
  return context;
}
