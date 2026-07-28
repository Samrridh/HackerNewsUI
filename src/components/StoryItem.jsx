import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  ExternalLink,
  Clock,
  TrendingUp,
  Bookmark,
  EyeOff,
  Link2,
  Newspaper,
  Check,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchStory } from '../api';
import { getCachedStory } from '../utils/storyCache';
import { useFeed } from '../context/FeedContext';
import { useLibrary } from '../context/LibraryContext';
import { appItemUrl, copyText, hnOpenUrl } from '../utils/hnHtml';
import { SITE_ORIGIN } from '../constants/brand';
import './StoryItem.css';

const StoryItem = ({
  storyId,
  index,
  focused = false,
  revealActions = false,
  onFocus,
}) => {
  const navigate = useNavigate();
  const { upsertStory } = useFeed();
  const { isBookmarked, toggleBookmark, hideStory } = useLibrary();
  const [story, setStory] = useState(() => getCachedStory(storyId));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const existing = getCachedStory(storyId);
    if (existing) {
      setStory(existing);
      upsertStory(existing);
    } else {
      setStory(undefined);
    }

    const getStory = async () => {
      try {
        const data = await fetchStory(storyId);
        if (!cancelled) {
          setStory(data || null);
          if (data) upsertStory(data);
        }
      } catch (error) {
        console.error('Failed to fetch story:', error);
        if (!cancelled && !existing) setStory(null);
      }
    };

    getStory();

    return () => {
      cancelled = true;
    };
  }, [storyId, upsertStory]);

  if (story === undefined) {
    return (
      <div className="story-item skeleton-container">
        <div className="skeleton story-skeleton" />
      </div>
    );
  }

  if (!story || story.deleted || story.dead) {
    return null;
  }

  const itemPath = `/item/${story.id}`;
  const hasExternalUrl = Boolean(story.url);
  const isJob = story.type === 'job';
  const bookmarked = isBookmarked(story.id);

  let domain = null;
  if (hasExternalUrl) {
    try {
      domain = new URL(story.url).hostname.replace(/^www\./, '');
    } catch {
      domain = null;
    }
  }

  const TitleTag = hasExternalUrl ? 'a' : Link;
  const titleProps = hasExternalUrl
    ? { href: story.url, target: '_blank', rel: 'noopener noreferrer' }
    : { to: itemPath };

  const openItem = () => {
    navigate(itemPath);
  };

  const handleCopyLink = async (e) => {
    e.stopPropagation();
    try {
      await copyText(appItemUrl(story.id, SITE_ORIGIN));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const stop = (e) => e.stopPropagation();

  return (
    <article
      className={`story-item animate-fade-in${focused ? ' story-item-focused' : ''}${
        revealActions ? ' story-item-reveal-actions' : ''
      }`}
      data-story-id={story.id}
      tabIndex={-1}
      onClick={onFocus}
    >
      <div className="story-rank">{index}</div>

      <div
        className="story-content story-content-open"
        onClick={(e) => {
          if (e.target.closest('a, button')) return;
          e.stopPropagation();
          onFocus?.();
          openItem();
        }}
      >
        <div className="story-main">
          <TitleTag
            {...titleProps}
            className="story-title"
            onClick={(e) => {
              e.stopPropagation();
              onFocus?.();
            }}
          >
            {domain && (
              <img
                src={`https://icon.horse/icon/${domain}`}
                alt=""
                className="domain-favicon"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            {story.title}
          </TitleTag>

          {hasExternalUrl && domain ? (
            <a
              href={`https://news.ycombinator.com/from?site=${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="story-domain"
              onClick={stop}
            >
              <ExternalLink size={12} /> {domain}
            </a>
          ) : (
            <Link to={itemPath} className="story-domain story-domain-self" onClick={stop}>
              self
            </Link>
          )}
        </div>

        <div className="story-meta">
          {!isJob && typeof story.score === 'number' && (
            <>
              <span className="meta-item points">
                <TrendingUp size={14} /> {story.score} points
              </span>
              <span className="meta-divider">•</span>
            </>
          )}

          {story.by && (
            <>
              <span className="meta-item">
                by{' '}
                <Link to={`/user/${story.by}`} className="meta-link" onClick={stop}>
                  {story.by}
                </Link>
              </span>
              <span className="meta-divider">•</span>
            </>
          )}

          <span className="meta-item">
            <Clock size={14} />{' '}
            {story.time ? formatDistanceToNow(story.time * 1000, { addSuffix: true }) : ''}
          </span>

          {!isJob && (
            <>
              <span className="meta-divider">•</span>
              <Link
                to={itemPath}
                className="meta-item meta-link comments-link"
                onClick={stop}
              >
                <MessageSquare size={14} /> {story.descendants || 0} comments
              </Link>
            </>
          )}

          {isJob && (
            <>
              <span className="meta-divider">•</span>
              <Link to={itemPath} className="meta-item meta-link" onClick={stop}>
                View posting
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="story-actions" onClick={stop}>
        <button
          type="button"
          className={`story-action-btn story-action-bookmark${bookmarked ? ' active' : ''}`}
          title={bookmarked ? 'Remove saved' : 'Save locally'}
          aria-label={bookmarked ? 'Remove saved' : 'Save locally'}
          onClick={(e) => {
            e.stopPropagation();
            toggleBookmark(story);
          }}
        >
          <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>

        <div className="story-actions-secondary">
          <button
            type="button"
            className={`story-action-btn${copied ? ' active' : ''}`}
            title={copied ? 'Copied' : 'Copy link'}
            aria-label={copied ? 'Copied' : 'Copy link'}
            onClick={handleCopyLink}
          >
            {copied ? <Check size={16} /> : <Link2 size={16} />}
          </button>

          {hasExternalUrl && (
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="story-action-btn"
              title="Open article"
              aria-label="Open article"
              onClick={stop}
            >
              <Newspaper size={16} />
            </a>
          )}

          <a
            href={hnOpenUrl(story.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="story-action-btn"
            title="Open on Hacker News (vote / reply)"
            aria-label="Open on Hacker News"
            onClick={stop}
          >
            <ExternalLink size={16} />
          </a>

          <button
            type="button"
            className="story-action-btn"
            title="Hide story"
            aria-label="Hide story"
            onClick={(e) => {
              e.stopPropagation();
              hideStory(story.id);
            }}
          >
            <EyeOff size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default StoryItem;
