import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const [storiesById, setStoriesById] = useState({});
  const [visibleIds, setVisibleIds] = useState([]);
  const [feed, setFeed] = useState('top');

  const upsertStory = useCallback((story) => {
    if (!story?.id) return;
    setStoriesById((prev) => {
      const existing = prev[story.id];
      if (
        existing &&
        existing.title === story.title &&
        existing.score === story.score &&
        existing.descendants === story.descendants
      ) {
        return prev;
      }
      return { ...prev, [story.id]: story };
    });
  }, []);

  const visibleStories = useMemo(
    () => visibleIds.map((id) => storiesById[id]).filter(Boolean),
    [visibleIds, storiesById]
  );

  const value = useMemo(
    () => ({
      storiesById,
      upsertStory,
      visibleIds,
      setVisibleIds,
      feed,
      setFeed,
      visibleStories,
    }),
    [storiesById, upsertStory, visibleIds, feed, visibleStories]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error('useFeed must be used within FeedProvider');
  }
  return ctx;
}
