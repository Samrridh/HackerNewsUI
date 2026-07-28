import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, HelpCircle, MessageCircle } from 'lucide-react';
import { fetchStoryIds, fetchStoriesBatch } from '../../api';

const LiveListWidget = ({
  feed,
  limit,
  title,
  icon: Icon,
  emptyText,
  linkTo,
  linkLabel,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const ids = await fetchStoryIds(feed);
        const stories = await fetchStoriesBatch((ids || []).slice(0, limit), 5);
        if (!cancelled) setItems(stories.filter((s) => s?.title));
      } catch (error) {
        console.error(`Failed to load ${feed} widget:`, error);
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [feed, limit]);

  return (
    <div className="sidebar-widget sidebar-widget-animate">
      <h3 className="widget-title">
        <Icon size={16} className="widget-icon" /> {title}
      </h3>

      {loading && (
        <div className="sidebar-skeleton-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton sidebar-skeleton-row" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && <p className="sidebar-empty">{emptyText}</p>}

      {!loading && items.length > 0 && (
        <ul className="sidebar-story-list">
          {items.map((story) => (
            <li key={story.id}>
              <Link to={`/item/${story.id}`} className="sidebar-story-link">
                <span className="sidebar-story-title">{story.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {linkTo && (
        <Link to={linkTo} className="help-link sidebar-widget-link">
          <HelpCircle size={14} /> {linkLabel}
        </Link>
      )}
    </div>
  );
};

export const LiveJobs = () => (
  <LiveListWidget
    feed="jobs"
    limit={5}
    title="Who's hiring"
    icon={Briefcase}
    emptyText="No job posts available."
    linkTo="/jobs"
    linkLabel="View all jobs"
  />
);

export const LatestAsk = () => (
  <LiveListWidget
    feed="ask"
    limit={3}
    title="Latest Ask HN"
    icon={MessageCircle}
    emptyText="No Ask HN posts available."
    linkTo="/ask"
    linkLabel="View Ask HN"
  />
);

export default LiveJobs;
