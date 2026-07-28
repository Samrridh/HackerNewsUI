import React, { useCallback, useEffect, useRef, useState } from 'react';
import Comment from './Comment';

const PAGE_SIZE = 10;
const LOAD_DELAY_MS = 200;

const CommentList = ({ kidIds = [], label = 'comments' }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  const total = kidIds.length;
  const visibleIds = kidIds.slice(0, visibleCount);
  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);

    window.setTimeout(() => {
      setVisibleCount((n) => Math.min(n + PAGE_SIZE, total));
      setLoadingMore(false);
      loadingRef.current = false;
    }, LOAD_DELAY_MS);
  }, [hasMore, total]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    loadingRef.current = false;
    setLoadingMore(false);
  }, [kidIds]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, visibleCount]);

  if (total === 0) {
    return null;
  }

  return (
    <div className="comment-list">
      <p className="comment-list-hint">
        Loaded {Math.min(visibleCount, total)} of {total} top-level {label}
        {hasMore ? ' · scroll for more' : ''}
      </p>

      <div className="comment-tree">
        {visibleIds.map((kidId) => (
          <Comment key={kidId} commentId={kidId} depth={0} />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="comment-list-sentinel" aria-hidden="true">
          {loadingMore && (
            <p className="comment-list-loading">Loading more {label}…</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentList;
