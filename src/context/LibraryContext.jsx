import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const BOOKMARKS_KEY = 'hn-bookmarks';
const HIDDEN_KEY = 'hn-hidden';
const VIEW_KEY = 'hn-view';
const LEGACY_DENSITY_KEY = 'hn-density';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function readInitialViewMode() {
  const stored = readJson(VIEW_KEY, null);
  if (stored === 'list' || stored === 'cards') return stored;

  const legacy = readJson(LEGACY_DENSITY_KEY, null);
  if (legacy === 'compact') return 'list';
  if (legacy === 'comfortable') return 'cards';
  return 'list';
}

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [bookmarks, setBookmarks] = useState(() => readJson(BOOKMARKS_KEY, []));
  const [hiddenIds, setHiddenIds] = useState(() => readJson(HIDDEN_KEY, []));
  const [viewMode, setViewMode] = useState(readInitialViewMode);
  const [focusMode, setFocusMode] = useState(false);

  useEffect(() => {
    writeJson(BOOKMARKS_KEY, bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    writeJson(HIDDEN_KEY, hiddenIds);
  }, [hiddenIds]);

  useEffect(() => {
    writeJson(VIEW_KEY, viewMode);
    document.documentElement.setAttribute('data-view', viewMode);
    document.documentElement.removeAttribute('data-density');
  }, [viewMode]);

  useEffect(() => {
    if (focusMode) {
      document.documentElement.setAttribute('data-focus-mode', 'true');
    } else {
      document.documentElement.removeAttribute('data-focus-mode');
    }
    return () => document.documentElement.removeAttribute('data-focus-mode');
  }, [focusMode]);

  const isBookmarked = useCallback(
    (id) => bookmarks.some((b) => String(b.id) === String(id)),
    [bookmarks]
  );

  const isHidden = useCallback(
    (id) => hiddenIds.some((hid) => String(hid) === String(id)),
    [hiddenIds]
  );

  const toggleBookmark = useCallback((story) => {
    if (!story?.id) return;
    setBookmarks((prev) => {
      const exists = prev.some((b) => String(b.id) === String(story.id));
      if (exists) return prev.filter((b) => String(b.id) !== String(story.id));
      return [
        {
          id: story.id,
          title: story.title || `Item ${story.id}`,
          url: story.url || null,
          by: story.by || null,
          score: typeof story.score === 'number' ? story.score : null,
          savedAt: Date.now(),
        },
        ...prev,
      ];
    });
  }, []);

  const removeBookmark = useCallback((id) => {
    setBookmarks((prev) => prev.filter((b) => String(b.id) !== String(id)));
  }, []);

  const hideStory = useCallback((id) => {
    setHiddenIds((prev) =>
      prev.some((hid) => String(hid) === String(id)) ? prev : [...prev, id]
    );
  }, []);

  const unhideStory = useCallback((id) => {
    setHiddenIds((prev) => prev.filter((hid) => String(hid) !== String(id)));
  }, []);

  const unhideAll = useCallback(() => {
    setHiddenIds([]);
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === 'list' ? 'cards' : 'list'));
  }, []);

  const value = useMemo(
    () => ({
      bookmarks,
      hiddenIds,
      viewMode,
      focusMode,
      setFocusMode,
      isBookmarked,
      isHidden,
      toggleBookmark,
      removeBookmark,
      hideStory,
      unhideStory,
      unhideAll,
      toggleViewMode,
      // legacy aliases during transition
      density: viewMode === 'list' ? 'compact' : 'comfortable',
      toggleDensity: toggleViewMode,
    }),
    [
      bookmarks,
      hiddenIds,
      viewMode,
      focusMode,
      isBookmarked,
      isHidden,
      toggleBookmark,
      removeBookmark,
      hideStory,
      unhideStory,
      unhideAll,
      toggleViewMode,
    ]
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) {
    throw new Error('useLibrary must be used within LibraryProvider');
  }
  return ctx;
}
