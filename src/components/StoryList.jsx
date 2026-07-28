import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchStoryIds, prefetchStories, fetchStory } from '../api';
import { useFeed } from '../context/FeedContext';
import { useLibrary } from '../context/LibraryContext';
import StoryItem from './StoryItem';
import Loader from './Loader';
import './StoryList.css';

const STORIES_PER_PAGE = 10;

const FEED_LABELS = {
  top: 'Top',
  new: 'New',
  best: 'Best',
  ask: 'Ask',
  show: 'Show',
  jobs: 'Jobs',
};

const StoryList = ({ feed = 'top' }) => {
  const navigate = useNavigate();
  const { setFeed, setVisibleIds, storiesById } = useFeed();
  const { isHidden, toggleBookmark, hideStory } = useLibrary();
  const [storyIds, setStoryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const listRef = useRef(null);
  const advanceAfterLoadRef = useRef(null);

  const feedLabel = FEED_LABELS[feed] || 'Stories';

  const getStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(1);
    setFocusedIndex(0);
    advanceAfterLoadRef.current = null;
    try {
      const ids = await fetchStoryIds(feed);
      setStoryIds(Array.isArray(ids) ? ids : []);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
      setError(`Could not load ${feedLabel} stories. Check your connection and try again.`);
      setStoryIds([]);
    } finally {
      setLoading(false);
    }
  }, [feed, feedLabel]);

  useEffect(() => {
    getStories();
  }, [getStories]);

  const visibleIds = useMemo(() => {
    const sliced = storyIds.slice(0, page * STORIES_PER_PAGE);
    return sliced.filter((id) => !isHidden(id));
  }, [storyIds, page, isHidden]);

  const hasMore = storyIds.length > page * STORIES_PER_PAGE;

  useEffect(() => {
    setFeed(feed);
    setVisibleIds(visibleIds);
  }, [feed, visibleIds, setFeed, setVisibleIds]);

  useEffect(() => {
    if (advanceAfterLoadRef.current != null) return;
    if (focusedIndex >= visibleIds.length) {
      setFocusedIndex(Math.max(0, visibleIds.length - 1));
    }
  }, [visibleIds.length, focusedIndex]);

  // After j-triggered load-more, focus the first newly loaded story
  useEffect(() => {
    const target = advanceAfterLoadRef.current;
    if (target == null) return;
    if (visibleIds.length > target) {
      setFocusedIndex(target);
      advanceAfterLoadRef.current = null;
    }
  }, [visibleIds.length]);

  // Prefetch first feed page as soon as IDs load
  useEffect(() => {
    if (!storyIds.length) return;
    prefetchStories(storyIds.slice(0, STORIES_PER_PAGE));
  }, [storyIds]);

  // Prefetch the next page chunk
  useEffect(() => {
    const start = page * STORIES_PER_PAGE;
    const nextIds = storyIds.slice(start, start + STORIES_PER_PAGE);
    if (nextIds.length) prefetchStories(nextIds);
  }, [page, storyIds]);

  useEffect(() => {
    const id = visibleIds[focusedIndex];
    if (!id) return;
    const el = listRef.current?.querySelector(`[data-story-id="${id}"]`);
    el?.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
  }, [focusedIndex, visibleIds]);

  useEffect(() => {
    const onKeyDown = async (event) => {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === 'j') {
        event.preventDefault();
        if (focusedIndex >= visibleIds.length - 1) {
          if (hasMore) {
            advanceAfterLoadRef.current = visibleIds.length;
            setPage((p) => p + 1);
          }
        } else {
          setFocusedIndex((i) => i + 1);
        }
      } else if (key === 'k') {
        event.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      } else if (key === 'enter') {
        const id = visibleIds[focusedIndex];
        if (id) {
          event.preventDefault();
          navigate(`/item/${id}`);
        }
      } else if (key === 'o') {
        const id = visibleIds[focusedIndex];
        const story = storiesById[id] || (id ? await fetchStory(id).catch(() => null) : null);
        if (story?.url) {
          event.preventDefault();
          window.open(story.url, '_blank', 'noopener,noreferrer');
        }
      } else if (key === 'b') {
        const id = visibleIds[focusedIndex];
        const story = storiesById[id] || (id ? await fetchStory(id).catch(() => null) : null);
        if (story) {
          event.preventDefault();
          toggleBookmark(story);
        }
      } else if (key === 'x' || key === 'h') {
        const id = visibleIds[focusedIndex];
        if (id) {
          event.preventDefault();
          hideStory(id);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    visibleIds,
    focusedIndex,
    hasMore,
    navigate,
    storiesById,
    toggleBookmark,
    hideStory,
  ]);

  if (loading) {
    return (
      <main className="main-content">
        <Loader count={10} />
      </main>
    );
  }

  if (error) {
    return (
      <main className="main-content animate-fade-in">
        <div className="feed-error" role="alert">
          <p className="feed-error-message">{error}</p>
          <button type="button" className="feed-error-retry" onClick={getStories}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (storyIds.length === 0) {
    return (
      <main className="main-content animate-fade-in">
        <div className="feed-empty">
          <p className="feed-empty-message">No {feedLabel} stories right now.</p>
          <button type="button" className="feed-error-retry" onClick={getStories}>
            Refresh
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="main-content animate-fade-in">
      <p className="keyboard-hint">
        Keyboard: <kbd>j</kbd>/<kbd>k</kbd> move · <kbd>Enter</kbd> comments ·{' '}
        <kbd>o</kbd> open · <kbd>b</kbd> save · <kbd>x</kbd> hide
      </p>

      <div className="stories-list" ref={listRef}>
        {visibleIds.map((id, index) => (
          <StoryItem
            key={`${feed}-${id}`}
            storyId={id}
            index={index + 1}
            focused={index === focusedIndex}
            revealActions={index === 0}
            onFocus={() => setFocusedIndex(index)}
          />
        ))}
      </div>

      {visibleIds.length === 0 && (
        <div className="feed-empty">
          <p className="feed-empty-message">All loaded stories are hidden.</p>
        </div>
      )}

      {hasMore && (
        <button
          type="button"
          className="load-more-btn animate-fade-in"
          onClick={() => setPage((p) => p + 1)}
        >
          Load More Stories
        </button>
      )}
    </main>
  );
};

export default StoryList;
