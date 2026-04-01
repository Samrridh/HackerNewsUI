import React, { useEffect, useState } from 'react';
import { fetchStory } from '../api';
import { MessageSquare, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import './StoryItem.css';

const StoryItem = ({ storyId, index }) => {
  const [story, setStory] = useState(null);

  useEffect(() => {
    const getStory = async () => {
      try {
        const data = await fetchStory(storyId);
        setStory(data);
      } catch (error) {
        console.error("Failed to fetch story:", error);
      }
    };
    getStory();
  }, [storyId]);

  if (!story) {
    return <div className="story-item skeleton-container"><div className="skeleton story-skeleton"></div></div>;
  }

  const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : 'news.ycombinator.com';

  return (
    <article className="story-item animate-fade-in">
      <div className="story-rank">
        {index}
      </div>
      
      <div className="story-content">
        <div className="story-main">
          <a href={story.url || `https://news.ycombinator.com/item?id=${story.id}`} target="_blank" rel="noopener noreferrer" className="story-title">
            <img src={`https://icon.horse/icon/${domain}`} alt="" className="domain-favicon" onError={(e) => e.target.style.display = 'none'} />
            {story.title}
          </a>
          <a href={`https://news.ycombinator.com/from?site=${domain}`} target="_blank" rel="noopener noreferrer" className="story-domain">
            <ExternalLink size={12} /> {domain}
          </a>
        </div>

        <div className="story-meta">
          <span className="meta-item points">
            <TrendingUp size={14} /> {story.score} points
          </span>
          <span className="meta-divider">•</span>
          <span className="meta-item">
            by <a href={`https://news.ycombinator.com/user?id=${story.by}`} className="meta-link">{story.by}</a>
          </span>
          <span className="meta-divider">•</span>
          <span className="meta-item">
            <Clock size={14} /> {story.time ? formatDistanceToNow(story.time * 1000, { addSuffix: true }) : ''}
          </span>
          <span className="meta-divider">•</span>
          <a href={`https://news.ycombinator.com/item?id=${story.id}`} className="meta-item meta-link comments-link">
            <MessageSquare size={14} /> {story.descendants || 0} comments
          </a>
        </div>
      </div>
    </article>
  );
};

export default StoryItem;
