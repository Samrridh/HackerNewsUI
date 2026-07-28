import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bookmark,
  Check,
  Clock,
  ExternalLink,
  Focus,
  Link2,
  MessageSquare,
  Newspaper,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchStory } from '../api';
import { useFeed } from '../context/FeedContext';
import { useLibrary } from '../context/LibraryContext';
import { SITE_ORIGIN } from '../constants/brand';
import { appItemUrl, copyText, hnHtml, hnOpenUrl } from '../utils/hnHtml';
import CommentList from '../components/CommentList';
import './ItemPage.css';

const ItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { upsertStory } = useFeed();
  const { focusMode, setFocusMode, isBookmarked, toggleBookmark } = useLibrary();
  const [item, setItem] = useState(undefined);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => setFocusMode(false);
  }, [setFocusMode]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setItem(undefined);
      setError(null);
      try {
        const data = await fetchStory(id);
        if (cancelled) return;
        if (!data) {
          setItem(null);
          setError('This item could not be found.');
          return;
        }
        setItem(data);
        upsertStory(data);
      } catch (err) {
        console.error('Failed to load item:', err);
        if (!cancelled) {
          setItem(null);
          setError('Could not load this thread. Check your connection and try again.');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, upsertStory]);

  if (item === undefined) {
    return (
      <main className="main-content item-page">
        <div className="skeleton item-skeleton-header" />
        <div className="skeleton item-skeleton-body" />
        <div className="skeleton item-skeleton-body" />
      </main>
    );
  }

  if (error || !item) {
    return (
      <main className="main-content item-page animate-fade-in">
        <div className="feed-error" role="alert">
          <p className="feed-error-message">{error || 'Item not found.'}</p>
          <Link to="/" className="feed-error-retry item-back-btn">
            Back to Top
          </Link>
        </div>
      </main>
    );
  }

  if (item.deleted) {
    return (
      <main className="main-content item-page animate-fade-in">
        <div className="feed-empty">
          <p className="feed-empty-message">This item was deleted.</p>
          <Link to="/" className="feed-error-retry item-back-btn">
            Back to Top
          </Link>
        </div>
      </main>
    );
  }

  const kidIds = Array.isArray(item.kids) ? item.kids : [];
  const hasExternalUrl = Boolean(item.url);
  const isJob = item.type === 'job';
  const isComment = item.type === 'comment';

  let domain = null;
  if (hasExternalUrl) {
    try {
      domain = new URL(item.url).hostname.replace(/^www\./, '');
    } catch {
      domain = null;
    }
  }

  return (
    <main className={`main-content item-page animate-fade-in${focusMode ? ' item-page-focus' : ''}`}>
      <div className="item-top-bar">
        <button type="button" className="item-back-link" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          className={`item-focus-btn${focusMode ? ' active' : ''}`}
          onClick={() => setFocusMode(!focusMode)}
          title={focusMode ? 'Exit focus mode' : 'Focus mode'}
        >
          <Focus size={16} /> {focusMode ? 'Exit focus' : 'Focus'}
        </button>
      </div>

      <article className="item-header">
        {item.title ? (
          <h1 className="item-title">
            {hasExternalUrl ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.title}
              </a>
            ) : (
              item.title
            )}
          </h1>
        ) : (
          <h1 className="item-title">Comment thread</h1>
        )}

        {hasExternalUrl && domain && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="item-domain"
          >
            <ExternalLink size={14} /> {domain}
          </a>
        )}

        <div className="item-meta">
          {!isJob && typeof item.score === 'number' && (
            <span className="meta-item points">
              <TrendingUp size={14} /> {item.score} points
            </span>
          )}
          {item.by && (
            <span className="meta-item">
              by{' '}
              <Link to={`/user/${item.by}`} className="meta-link">
                {item.by}
              </Link>
            </span>
          )}
          {item.time && (
            <span className="meta-item">
              <Clock size={14} />{' '}
              {formatDistanceToNow(item.time * 1000, { addSuffix: true })}
            </span>
          )}
          {!isJob && (
            <span className="meta-item">
              <MessageSquare size={14} /> {item.descendants ?? kidIds.length} comments
            </span>
          )}
        </div>

        {item.text && (
          <div
            className="item-text hn-html"
            dangerouslySetInnerHTML={hnHtml(item.text)}
          />
        )}

        <div className="item-actions">
          <button
            type="button"
            className={`item-action-btn${isBookmarked(item.id) ? ' active' : ''}`}
            onClick={() => toggleBookmark(item)}
          >
            <Bookmark size={14} fill={isBookmarked(item.id) ? 'currentColor' : 'none'} />
            {isBookmarked(item.id) ? 'Saved' : 'Save locally'}
          </button>

          <button
            type="button"
            className={`item-action-btn${copied ? ' active' : ''}`}
            onClick={async () => {
              try {
                await copyText(appItemUrl(item.id, SITE_ORIGIN));
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              } catch (err) {
                console.error('Copy failed:', err);
              }
            }}
          >
            {copied ? <Check size={14} /> : <Link2 size={14} />}
            {copied ? 'Copied' : 'Copy link'}
          </button>

          {hasExternalUrl && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="item-action-btn"
            >
              <Newspaper size={14} /> Open article
            </a>
          )}

          <a
            href={hnOpenUrl(item.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="item-hn-link"
          >
            <ExternalLink size={14} /> Open on Hacker News
          </a>

          <p className="item-hn-hint">
            This reader does not vote or post. Use Open on Hacker News to vote or reply.
          </p>
        </div>
      </article>

      {!isComment && (
        <section className="item-comments" aria-label="Comments">
          <h2 className="item-comments-title">
            {kidIds.length > 0
              ? `${item.descendants ?? kidIds.length} comments`
              : 'No comments yet'}
          </h2>

          {kidIds.length > 0 && <CommentList kidIds={kidIds} label="comments" />}
        </section>
      )}

      {isComment && kidIds.length > 0 && (
        <section className="item-comments" aria-label="Replies">
          <h2 className="item-comments-title">Replies</h2>
          <CommentList kidIds={kidIds} label="replies" />
        </section>
      )}
    </main>
  );
};

export default ItemPage;
