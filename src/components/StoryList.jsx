import React, { useEffect, useState } from 'react';
import { fetchTopStories } from '../api';
import StoryItem from './StoryItem';
import Loader from './Loader';
import './StoryList.css';

const StoryList = () => {
  const [storyIds, setStoryIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const STORIES_PER_PAGE = 30;

  useEffect(() => {
    const getStories = async () => {
      try {
        const ids = await fetchTopStories();
        setStoryIds(ids); 
      } catch (error) {
        console.error("Failed to fetch stories:", error);
      } finally {
        setLoading(false);
      }
    };
    getStories();
  }, []);

  if (loading) {
    return (
      <main className="container main-content">
        <Loader count={10} />
      </main>
    );
  }

  return (
    <main className="container main-content animate-fade-in">
      <div className="stories-list">
        {storyIds.slice(0, page * STORIES_PER_PAGE).map((id, index) => (
          <StoryItem key={id} storyId={id} index={index + 1} />
        ))}
      </div>
      
      {storyIds.length > page * STORIES_PER_PAGE && (
        <button className="load-more-btn animate-fade-in" onClick={() => setPage(p => p + 1)}>
          Load More Stories
        </button>
      )}
    </main>
  );
};

export default StoryList;
