import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  User,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fetchStoriesBatch, fetchUser } from '../api';
import { hnHtml } from '../utils/hnHtml';
import './UserPage.css';

const INITIAL_SUBMISSIONS = 30;

export function hnUserUrl(id) {
  return `https://news.ycombinator.com/user?id=${encodeURIComponent(id)}`;
}

const UserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_SUBMISSIONS);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setUser(undefined);
      setSubmissions([]);
      setVisibleCount(INITIAL_SUBMISSIONS);
      setError(null);
      try {
        const data = await fetchUser(id);
        if (cancelled) return;
        if (!data) {
          setUser(null);
          setError('User not found.');
          return;
        }
        setUser(data);
      } catch (err) {
        console.error('Failed to load user:', err);
        if (!cancelled) {
          setUser(null);
          setError('Could not load this profile. Check your connection and try again.');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const submittedIds = useMemo(
    () => (Array.isArray(user?.submitted) ? user.submitted : []),
    [user]
  );

  useEffect(() => {
    if (!user || submittedIds.length === 0) {
      setSubmissions([]);
      return undefined;
    }

    let cancelled = false;

    const loadSubs = async () => {
      setLoadingSubs(true);
      try {
        const ids = submittedIds.slice(0, visibleCount);
        const items = await fetchStoriesBatch(ids, 10);
        if (!cancelled) {
          setSubmissions(items.filter((item) => item && !item.deleted));
        }
      } catch (err) {
        console.error('Failed to load submissions:', err);
        if (!cancelled) setSubmissions([]);
      } finally {
        if (!cancelled) setLoadingSubs(false);
      }
    };

    loadSubs();
    return () => {
      cancelled = true;
    };
  }, [user, submittedIds, visibleCount]);

  if (user === undefined) {
    return (
      <main className="main-content user-page">
        <div className="skeleton user-skeleton-header" />
        <div className="skeleton user-skeleton-body" />
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="main-content user-page animate-fade-in">
        <div className="feed-error" role="alert">
          <p className="feed-error-message">{error || 'User not found.'}</p>
          <Link to="/" className="feed-error-retry item-back-btn">
            Back to Top
          </Link>
        </div>
      </main>
    );
  }

  const createdDate = user.created
    ? format(new Date(user.created * 1000), 'MMM d, yyyy')
    : null;
  const createdAgo = user.created
    ? formatDistanceToNow(user.created * 1000, { addSuffix: true })
    : null;

  return (
    <main className="main-content user-page animate-fade-in">
      <button type="button" className="user-back-link" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>

      <section className="user-header">
        <div className="user-identity">
          <div className="user-avatar" aria-hidden="true">
            <User size={22} />
          </div>
          <div>
            <h1 className="user-name">{user.id}</h1>
            <div className="user-stats">
              <span>
                <TrendingUp size={14} /> {user.karma?.toLocaleString?.() ?? user.karma} karma
              </span>
              {createdDate && (
                <span title={createdAgo || undefined}>
                  <Calendar size={14} /> joined {createdDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {user.about && (
          <div
            className="user-about hn-html"
            dangerouslySetInnerHTML={hnHtml(user.about)}
          />
        )}

        <a
          href={hnUserUrl(user.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="user-hn-link"
        >
          <ExternalLink size={14} /> Open on Hacker News
        </a>
      </section>

      <section className="user-submissions" aria-label="Submissions">
        <h2 className="user-section-title">
          Submissions
          {submittedIds.length > 0 && (
            <span className="user-section-count">{submittedIds.length.toLocaleString()}</span>
          )}
        </h2>

        {submittedIds.length === 0 && (
          <p className="user-empty">No public submissions.</p>
        )}

        {submissions.length > 0 && (
          <ul className="user-submission-list">
            {submissions.map((item) => (
              <li key={item.id} className="user-submission">
                <SubmissionRow item={item} />
              </li>
            ))}
          </ul>
        )}

        {loadingSubs && (
          <div className="user-subs-loading">
            <div className="skeleton user-skeleton-row" />
            <div className="skeleton user-skeleton-row" />
          </div>
        )}

        {!loadingSubs && visibleCount < submittedIds.length && (
          <button
            type="button"
            className="load-more-btn"
            onClick={() => setVisibleCount((n) => n + INITIAL_SUBMISSIONS)}
          >
            Load more submissions
          </button>
        )}
      </section>
    </main>
  );
};

function SubmissionRow({ item }) {
  const isComment = item.type === 'comment';
  const title = isComment
    ? item.text
      ? stripHtml(item.text).slice(0, 140) || 'Comment'
      : 'Comment'
    : item.title || 'Untitled';

  return (
    <>
      <div className="user-submission-main">
        <span className={`user-submission-type type-${item.type || 'story'}`}>
          {item.type || 'story'}
        </span>
        <Link to={`/item/${item.id}`} className="user-submission-title">
          {isComment ? title : item.title || 'Untitled'}
        </Link>
      </div>
      <div className="user-submission-meta">
        {!isComment && typeof item.score === 'number' && (
          <span>
            <TrendingUp size={13} /> {item.score}
          </span>
        )}
        {isComment && item.parent && (
          <Link to={`/item/${item.parent}`}>parent</Link>
        )}
        {!isComment && (
          <span>
            <MessageSquare size={13} /> {item.descendants || 0}
          </span>
        )}
        {item.time && (
          <span>{formatDistanceToNow(item.time * 1000, { addSuffix: true })}</span>
        )}
      </div>
    </>
  );
}

function stripHtml(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default UserPage;
