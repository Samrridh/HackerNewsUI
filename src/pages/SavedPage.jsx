import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Eye, Trash2 } from 'lucide-react';
import { fetchStoriesBatch } from '../api';
import { useLibrary } from '../context/LibraryContext';
import './SavedPage.css';

const SavedPage = () => {
  const {
    bookmarks,
    removeBookmark,
    hiddenIds,
    unhideStory,
    unhideAll,
  } = useLibrary();
  const [tab, setTab] = useState('saved');
  const [hiddenStories, setHiddenStories] = useState([]);
  const [loadingHidden, setLoadingHidden] = useState(false);

  useEffect(() => {
    if (tab !== 'hidden') return undefined;

    let cancelled = false;

    const load = async () => {
      if (hiddenIds.length === 0) {
        setHiddenStories([]);
        return;
      }
      setLoadingHidden(true);
      try {
        const stories = await fetchStoriesBatch(hiddenIds, 8);
        if (cancelled) return;
        const byId = new Map(stories.map((s) => [String(s.id), s]));
        setHiddenStories(
          hiddenIds.map((id) => {
            const story = byId.get(String(id));
            return {
              id,
              title: story?.title || story?.text?.slice(0, 80) || `Item ${id}`,
              by: story?.by || null,
              score: typeof story?.score === 'number' ? story.score : null,
            };
          })
        );
      } catch {
        if (!cancelled) {
          setHiddenStories(
            hiddenIds.map((id) => ({
              id,
              title: `Item ${id}`,
              by: null,
              score: null,
            }))
          );
        }
      } finally {
        if (!cancelled) setLoadingHidden(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [tab, hiddenIds]);

  return (
    <main className="main-content saved-page animate-fade-in">
      <header className="saved-header">
        <h1 className="saved-title">
          <Bookmark size={22} /> Library
        </h1>
        <p className="saved-subtitle">
          Stored locally in this browser — not synced to Hacker News.
        </p>

        <div className="saved-tabs" role="tablist" aria-label="Library tabs">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'saved'}
            className={`saved-tab${tab === 'saved' ? ' active' : ''}`}
            onClick={() => setTab('saved')}
          >
            Saved
            {bookmarks.length > 0 ? (
              <span className="saved-tab-count">{bookmarks.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'hidden'}
            className={`saved-tab${tab === 'hidden' ? ' active' : ''}`}
            onClick={() => setTab('hidden')}
          >
            Hidden
            {hiddenIds.length > 0 ? (
              <span className="saved-tab-count">{hiddenIds.length}</span>
            ) : null}
          </button>
        </div>
      </header>

      {tab === 'saved' && (
        <>
          {bookmarks.length === 0 ? (
            <div className="feed-empty">
              <p className="feed-empty-message">No saved stories yet.</p>
              <Link to="/" className="feed-error-retry item-back-btn">
                Browse Top
              </Link>
            </div>
          ) : (
            <ul className="saved-list">
              {bookmarks.map((item) => (
                <li key={item.id} className="saved-item">
                  <div className="saved-item-main">
                    <Link to={`/item/${item.id}`} className="saved-item-title">
                      {item.title}
                    </Link>
                    <div className="saved-item-meta">
                      {item.by && (
                        <Link to={`/user/${item.by}`} className="meta-link">
                          {item.by}
                        </Link>
                      )}
                      {typeof item.score === 'number' && (
                        <span>{item.score} pts</span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="saved-remove-btn"
                    onClick={() => removeBookmark(item.id)}
                    title="Remove from saved"
                    aria-label={`Remove ${item.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {tab === 'hidden' && (
        <>
          {hiddenIds.length === 0 ? (
            <div className="feed-empty">
              <p className="feed-empty-message">No hidden stories.</p>
            </div>
          ) : (
            <>
              <div className="saved-hidden-toolbar">
                <button
                  type="button"
                  className="saved-unhide-all"
                  onClick={unhideAll}
                >
                  <Eye size={16} /> Unhide all
                </button>
              </div>

              {loadingHidden ? (
                <p className="saved-subtitle">Loading hidden stories…</p>
              ) : (
                <ul className="saved-list">
                  {hiddenStories.map((item) => (
                    <li key={item.id} className="saved-item">
                      <div className="saved-item-main">
                        <Link to={`/item/${item.id}`} className="saved-item-title">
                          {item.title}
                        </Link>
                        <div className="saved-item-meta">
                          {item.by && (
                            <Link to={`/user/${item.by}`} className="meta-link">
                              {item.by}
                            </Link>
                          )}
                          {typeof item.score === 'number' && (
                            <span>{item.score} pts</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="saved-remove-btn saved-unhide-btn"
                        onClick={() => unhideStory(item.id)}
                        title="Unhide story"
                        aria-label={`Unhide ${item.title}`}
                      >
                        <Eye size={16} />
                        <span className="saved-unhide-label">Unhide</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </>
      )}
    </main>
  );
};

export default SavedPage;
