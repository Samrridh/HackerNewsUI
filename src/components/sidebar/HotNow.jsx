import React from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { topByScore } from '../../utils/topics';

const HotNow = ({ stories, loading }) => {
  const hot = topByScore(stories, 5);

  return (
    <div className="sidebar-widget sidebar-widget-animate">
      <h3 className="widget-title">
        <Flame size={16} className="widget-icon" /> Hot right now
      </h3>

      {loading && hot.length === 0 && (
        <div className="sidebar-skeleton-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton sidebar-skeleton-row" />
          ))}
        </div>
      )}

      {!loading && hot.length === 0 && (
        <p className="sidebar-empty">Stories will appear as the feed loads.</p>
      )}

      {hot.length > 0 && (
        <ul className="sidebar-story-list">
          {hot.map((story) => (
            <li key={story.id}>
              <Link to={`/item/${story.id}`} className="sidebar-story-link">
                <span className="sidebar-story-title">{story.title}</span>
                <span className="sidebar-story-meta">{story.score} pts</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HotNow;
