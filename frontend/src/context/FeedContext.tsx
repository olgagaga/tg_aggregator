import { createContext, useContext, useState, ReactNode } from 'react';

interface FeedContextType {
  currentFeedId: string;
  setCurrentFeedId: (feedId: string) => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

const FeedContext = createContext<FeedContextType | undefined>(undefined);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [currentFeedId, setCurrentFeedId] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  return (
    <FeedContext.Provider
      value={{
        currentFeedId,
        setCurrentFeedId,
        selectedTags,
        setSelectedTags,
      }}
    >
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
