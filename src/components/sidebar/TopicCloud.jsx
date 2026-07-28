import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Hash } from 'lucide-react';
import { deriveTopics } from '../../utils/topics';

const TopicCloud = ({ stories }) => {
  const topics = useMemo(() => deriveTopics(stories, 8), [stories]);

  return (
    <div className="sidebar-widget sidebar-widget-animate">
      <h3 className="widget-title">
        <Hash size={16} className="widget-icon" /> Buzzing topics
      </h3>

      {topics.length === 0 ? (
        <p className="sidebar-empty">Topics appear from the current feed.</p>
      ) : (
        <div className="tag-cloud">
          {topics.map((topic) => (
            <Link
              key={topic}
              to={`/search?q=${encodeURIComponent(topic)}`}
              className="topic-tag"
            >
              {topic}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicCloud;
