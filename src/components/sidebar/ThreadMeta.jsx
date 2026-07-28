import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchStory } from '../../api';

const ThreadMeta = ({ itemId }) => {
  const [item, setItem] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    setItem(undefined);

    const load = async () => {
      try {
        const data = await fetchStory(itemId);
        if (!cancelled) setItem(data || null);
      } catch (error) {
        console.error('Failed to load thread meta:', error);
        if (!cancelled) setItem(null);
      }
    };

    if (itemId) load();

    return () => {
      cancelled = true;
    };
  }, [itemId]);

  return (
    <div className="sidebar-widget sidebar-widget-animate">
      <h3 className="widget-title">
        <MessageSquare size={16} className="widget-icon" /> This thread
      </h3>

      {item === undefined && (
        <div className="sidebar-skeleton-list">
          <div className="skeleton sidebar-skeleton-row" />
          <div className="skeleton sidebar-skeleton-row" />
        </div>
      )}

      {item === null && <p className="sidebar-empty">Thread details unavailable.</p>}

      {item && (
        <div className="thread-meta">
          <p className="thread-meta-title">{item.title || 'Untitled'}</p>
          <ul className="thread-meta-stats">
            {typeof item.score === 'number' && (
              <li>
                <TrendingUp size={14} /> {item.score} points
              </li>
            )}
            <li>
              <MessageSquare size={14} /> {item.descendants || 0} comments
            </li>
            {item.kids?.length > 0 && (
              <li>
                <MessageSquare size={14} /> {item.kids.length} top-level
              </li>
            )}
            {item.by && (
              <li>
                <User size={14} />
                <Link to={`/user/${item.by}`} className="meta-link">
                  {item.by}
                </Link>
              </li>
            )}
            {item.time && (
              <li>
                <Clock size={14} />{' '}
                {formatDistanceToNow(item.time * 1000, { addSuffix: true })}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ThreadMeta;
