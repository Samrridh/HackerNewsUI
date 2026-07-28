import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fetchUser } from '../../api';

const UserCard = ({ userId }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    setUser(undefined);

    const load = async () => {
      try {
        const data = await fetchUser(userId);
        if (!cancelled) setUser(data || null);
      } catch (error) {
        console.error('Failed to load user card:', error);
        if (!cancelled) setUser(null);
      }
    };

    if (userId) load();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="sidebar-widget sidebar-widget-animate">
      <h3 className="widget-title">
        <User size={16} className="widget-icon" /> Profile
      </h3>

      {user === undefined && (
        <div className="sidebar-skeleton-list">
          <div className="skeleton sidebar-skeleton-row" />
          <div className="skeleton sidebar-skeleton-row" />
        </div>
      )}

      {user === null && <p className="sidebar-empty">Profile unavailable.</p>}

      {user && (
        <div className="sidebar-user-card">
          <p className="sidebar-user-name">{user.id}</p>
          <ul className="thread-meta-stats">
            <li>
              <TrendingUp size={14} /> {user.karma?.toLocaleString?.() ?? user.karma} karma
            </li>
            {user.created && (
              <li>
                <Calendar size={14} /> joined{' '}
                {formatDistanceToNow(user.created * 1000, { addSuffix: true })}
              </li>
            )}
            {Array.isArray(user.submitted) && (
              <li>
                <User size={14} /> {user.submitted.length.toLocaleString()} submissions
              </li>
            )}
          </ul>
          <Link to={`/user/${user.id}`} className="help-link sidebar-widget-link">
            View submissions
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserCard;
