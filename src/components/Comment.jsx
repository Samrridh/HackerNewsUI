import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchStory, fetchStoriesBatch } from '../api';
import { hnHtml } from '../utils/hnHtml';
import './Comment.css';

const REPLY_BATCH = 10;

const Comment = ({ commentId, depth = 0, initialData = null }) => {
  const [comment, setComment] = useState(initialData || undefined);
  const [collapsed, setCollapsed] = useState(false);
  const [showKids, setShowKids] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [loadedReplies, setLoadedReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  useEffect(() => {
    if (initialData) {
      setComment(initialData);
      return undefined;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchStory(commentId);
        if (!cancelled) setComment(data || null);
      } catch (error) {
        console.error('Failed to load comment:', error);
        if (!cancelled) setComment(null);
      }
    };

    setComment(undefined);
    load();

    return () => {
      cancelled = true;
    };
  }, [commentId, initialData]);

  const kidIds = useMemo(
    () => (Array.isArray(comment?.kids) ? comment.kids : []),
    [comment]
  );

  // Auto-expand first reply batch for top-level comments only
  useEffect(() => {
    if (depth !== 0 || kidIds.length === 0) return;
    setShowKids(true);
    setReplyCount((n) => (n === 0 ? Math.min(REPLY_BATCH, kidIds.length) : n));
  }, [depth, kidIds]);

  useEffect(() => {
    if (!showKids || replyCount === 0) return undefined;

    let cancelled = false;

    const loadBatch = async () => {
      setLoadingReplies(true);
      try {
        const ids = kidIds.slice(0, replyCount);
        const stories = await fetchStoriesBatch(ids, 8);
        if (cancelled) return;

        const byId = new Map(stories.map((s) => [String(s.id), s]));
        const ordered = ids
          .map((id) => byId.get(String(id)))
          .filter((s) => s && !s.deleted);
        setLoadedReplies(ordered);
      } catch (error) {
        console.error('Failed to load replies:', error);
        if (!cancelled) setLoadedReplies([]);
      } finally {
        if (!cancelled) setLoadingReplies(false);
      }
    };

    loadBatch();
    return () => {
      cancelled = true;
    };
  }, [showKids, replyCount, kidIds]);

  if (comment === undefined) {
    return (
      <div className="comment comment-loading" style={{ '--depth': depth }}>
        <div className="skeleton comment-skeleton" />
      </div>
    );
  }

  if (!comment) {
    return null;
  }

  if (comment.deleted) {
    return (
      <div className="comment comment-deleted" style={{ '--depth': depth }}>
        <span className="comment-placeholder">[deleted]</span>
      </div>
    );
  }

  const hasKids = kidIds.length > 0;
  const opacity = Math.max(0.62, 1 - depth * 0.05);
  const remainingReplies = Math.max(0, kidIds.length - replyCount);

  const startShowingKids = () => {
    setShowKids(true);
    setReplyCount((n) => (n === 0 ? Math.min(REPLY_BATCH, kidIds.length) : n));
  };

  const loadMoreReplies = () => {
    setShowKids(true);
    setReplyCount((n) => Math.min(n + REPLY_BATCH, kidIds.length));
  };

  if (collapsed) {
    return (
      <div className="comment comment-collapsed" style={{ '--depth': depth, opacity }}>
        <button
          type="button"
          className="comment-toggle"
          onClick={() => setCollapsed(false)}
          aria-label="Expand thread"
        >
          <ChevronRight size={14} />
        </button>
        <span className="comment-collapsed-meta">
          {comment.by ? (
            <Link to={`/user/${comment.by}`} className="comment-author">
              {comment.by}
            </Link>
          ) : (
            'comment'
          )}
          {hasKids ? ` · ${kidIds.length} ${kidIds.length === 1 ? 'reply' : 'replies'}` : ''}
          {' · '}
          {comment.time
            ? formatDistanceToNow(comment.time * 1000, { addSuffix: true })
            : ''}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`comment${comment.dead ? ' comment-dead' : ''}`}
      style={{ '--depth': depth, opacity }}
    >
      <div className="comment-header">
        <button
          type="button"
          className="comment-toggle"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse thread"
        >
          <ChevronDown size={14} />
        </button>

        {comment.by ? (
          <Link to={`/user/${comment.by}`} className="comment-author">
            {comment.by}
          </Link>
        ) : (
          <span className="comment-author">unknown</span>
        )}

        <span className="comment-time">
          {comment.time
            ? formatDistanceToNow(comment.time * 1000, { addSuffix: true })
            : ''}
        </span>

        {comment.dead && <span className="comment-dead-badge">dead</span>}
      </div>

      {comment.text ? (
        <div
          className="comment-body hn-html"
          dangerouslySetInnerHTML={hnHtml(comment.text)}
        />
      ) : (
        <p className="comment-placeholder">[no content]</p>
      )}

      {hasKids && (
        <div className="comment-kids">
          {!showKids ? (
            <button
              type="button"
              className="comment-load-replies"
              onClick={startShowingKids}
            >
              Load {Math.min(REPLY_BATCH, kidIds.length)} of {kidIds.length}{' '}
              {kidIds.length === 1 ? 'reply' : 'replies'}
            </button>
          ) : (
            <>
              {loadedReplies.map((reply) => (
                <Comment
                  key={reply.id}
                  commentId={reply.id}
                  depth={depth + 1}
                  initialData={reply}
                />
              ))}
              {loadingReplies && (
                <p className="comment-list-loading">Loading replies…</p>
              )}
              {remainingReplies > 0 && !loadingReplies && (
                <button
                  type="button"
                  className="comment-load-replies"
                  onClick={loadMoreReplies}
                >
                  Load {Math.min(REPLY_BATCH, remainingReplies)} more{' '}
                  {remainingReplies === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;
