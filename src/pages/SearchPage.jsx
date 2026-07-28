import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { searchComments, searchStories } from '../searchApi';
import { useFeed } from '../context/FeedContext';
import { deriveTopics } from '../utils/topics';
import { hnHtml } from '../utils/hnHtml';
import './SearchPage.css';

const DEBOUNCE_MS = 350;

function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialTab = searchParams.get('tab') === 'comments' ? 'comments' : 'stories';

  const [input, setInput] = useState(initialQ);
  const [tab, setTab] = useState(initialTab);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debouncedQuery = useDebouncedValue(input.trim(), DEBOUNCE_MS);
  const { visibleStories } = useFeed();
  const suggestions = useMemo(() => deriveTopics(visibleStories, 6), [visibleStories]);

  // Keep local input in sync when navigating via sidebar/topic links
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const nextTab = searchParams.get('tab') === 'comments' ? 'comments' : 'stories';
    setInput((prev) => (prev === q ? prev : q));
    setTab((prev) => (prev === nextTab ? prev : nextTab));
  }, [searchParams]);

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, tab]);

  useEffect(() => {
    const currentQ = searchParams.get('q') || '';
    const currentTab = searchParams.get('tab') === 'comments' ? 'comments' : 'stories';
    if (currentQ === debouncedQuery && currentTab === tab) return;

    const params = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (tab === 'comments') params.tab = 'comments';
    setSearchParams(params, { replace: true });
  }, [debouncedQuery, tab, searchParams, setSearchParams]);

  const runSearch = useCallback(async () => {
    if (!debouncedQuery) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data =
        tab === 'comments'
          ? await searchComments(debouncedQuery, page)
          : await searchStories(debouncedQuery, page);
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
      setResults(null);
      setError('Search failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, tab, page]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const hits = results?.hits || [];
  const nbPages = results?.nbPages || 0;

  const onPickSuggestion = (topic) => {
    setInput(topic);
    setPage(0);
    setTab('stories');
  };

  return (
    <main className="main-content search-page animate-fade-in">
      <header className="search-page-header">
        <h1 className="search-page-title">Search</h1>
        <form
          className="search-page-form"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            setInput(input.trim());
          }}
        >
          <Search size={18} className="search-page-icon" aria-hidden="true" />
          <input
            type="search"
            className="search-page-input"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setPage(0);
            }}
            placeholder="Search stories and comments..."
            aria-label="Search Hacker News"
            autoFocus
          />
        </form>

        <div className="search-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'stories'}
            className={`search-tab${tab === 'stories' ? ' active' : ''}`}
            onClick={() => {
              setTab('stories');
              setPage(0);
            }}
          >
            Stories
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'comments'}
            className={`search-tab${tab === 'comments' ? ' active' : ''}`}
            onClick={() => {
              setTab('comments');
              setPage(0);
            }}
          >
            Comments
          </button>
        </div>
      </header>

      {!debouncedQuery && (
        <section className="search-empty-state">
          <p className="search-hint">Type a query to search Hacker News via Algolia.</p>
          {suggestions.length > 0 && (
            <div className="search-suggestions">
              <p className="search-suggestions-label">From your current feed</p>
              <div className="tag-cloud">
                {suggestions.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className="topic-tag search-suggestion-tag"
                    onClick={() => onPickSuggestion(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {debouncedQuery && loading && (
        <div className="search-loading">
          <div className="skeleton search-skeleton" />
          <div className="skeleton search-skeleton" />
          <div className="skeleton search-skeleton" />
        </div>
      )}

      {debouncedQuery && error && (
        <div className="feed-error" role="alert">
          <p className="feed-error-message">{error}</p>
          <button type="button" className="feed-error-retry" onClick={runSearch}>
            Try again
          </button>
        </div>
      )}

      {debouncedQuery && !loading && !error && hits.length === 0 && (
        <div className="feed-empty">
          <p className="feed-empty-message">
            No {tab} found for “{debouncedQuery}”.
          </p>
        </div>
      )}

      {debouncedQuery && !loading && !error && hits.length > 0 && (
        <>
          <p className="search-result-count">
            {results.nbHits.toLocaleString()} results
            {results.nbHits > hits.length
              ? ` · page ${page + 1} of ${nbPages}`
              : ''}
          </p>

          <ul className="search-results">
            {hits.map((hit) => (
              <li key={hit.objectID} className="search-result">
                {tab === 'stories' ? (
                  <StoryHit hit={hit} />
                ) : (
                  <CommentHit hit={hit} />
                )}
              </li>
            ))}
          </ul>

          {nbPages > 1 && (
            <div className="search-pagination">
              <button
                type="button"
                className="search-page-btn"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </button>
              <span className="search-page-indicator">
                {page + 1} / {nbPages}
              </span>
              <button
                type="button"
                className="search-page-btn"
                disabled={page >= nbPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
};

function StoryHit({ hit }) {
  const id = hit.objectID;
  const hasUrl = Boolean(hit.url);
  let domain = null;
  if (hasUrl) {
    try {
      domain = new URL(hit.url).hostname.replace(/^www\./, '');
    } catch {
      domain = null;
    }
  }

  return (
    <article className="search-hit">
      <h2 className="search-hit-title">
        {hasUrl ? (
          <a href={hit.url} target="_blank" rel="noopener noreferrer">
            {hit.title || 'Untitled'}
          </a>
        ) : (
          <Link to={`/item/${id}`}>{hit.title || 'Untitled'}</Link>
        )}
      </h2>

      {domain && (
        <a
          href={hit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="search-hit-domain"
        >
          <ExternalLink size={12} /> {domain}
        </a>
      )}

      <div className="search-hit-meta">
        {typeof hit.points === 'number' && (
          <span>
            <TrendingUp size={14} /> {hit.points}
          </span>
        )}
        {hit.author && (
          <span>
            by <Link to={`/user/${hit.author}`}>{hit.author}</Link>
          </span>
        )}
        {hit.created_at_i && (
          <span>
            <Clock size={14} />{' '}
            {formatDistanceToNow(hit.created_at_i * 1000, { addSuffix: true })}
          </span>
        )}
        <Link to={`/item/${id}`}>
          <MessageSquare size={14} /> {hit.num_comments || 0} comments
        </Link>
      </div>
    </article>
  );
}

function CommentHit({ hit }) {
  const storyId = hit.story_id || hit.objectID;
  const commentId = hit.objectID;

  return (
    <article className="search-hit search-hit-comment">
      {hit.story_title && (
        <p className="search-hit-story-title">
          on <Link to={`/item/${storyId}`}>{hit.story_title}</Link>
        </p>
      )}
      {hit.comment_text ? (
        <div
          className="search-hit-comment-text hn-html"
          dangerouslySetInnerHTML={hnHtml(hit.comment_text)}
        />
      ) : (
        <p className="search-hit-comment-text">[no content]</p>
      )}
      <div className="search-hit-meta">
        {hit.author && (
          <span>
            by <Link to={`/user/${hit.author}`}>{hit.author}</Link>
          </span>
        )}
        {hit.created_at_i && (
          <span>
            <Clock size={14} />{' '}
            {formatDistanceToNow(hit.created_at_i * 1000, { addSuffix: true })}
          </span>
        )}
        <Link to={`/item/${commentId}`}>View comment</Link>
      </div>
    </article>
  );
}

export default SearchPage;
