import React from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useFeed } from '../context/FeedContext';
import { useLibrary } from '../context/LibraryContext';
import SearchWidget from './sidebar/SearchWidget';
import HotNow from './sidebar/HotNow';
import TopicCloud from './sidebar/TopicCloud';
import { LiveJobs, LatestAsk } from './sidebar/LiveJobs';
import ThreadMeta from './sidebar/ThreadMeta';
import UserCard from './sidebar/UserCard';
import SavedWidget from './sidebar/SavedWidget';
import './Sidebar.css';

const FEED_PATHS = ['/', '/new', '/best', '/ask', '/show', '/jobs'];

const Sidebar = () => {
  const location = useLocation();
  const { visibleStories } = useFeed();
  const { focusMode } = useLibrary();

  const itemMatch = matchPath('/item/:id', location.pathname);
  const userMatch = matchPath('/user/:id', location.pathname);
  const searchMatch = matchPath('/search', location.pathname);
  const savedMatch = matchPath('/saved', location.pathname);
  const isJobsFeed = location.pathname === '/jobs';
  const isFeedPage = FEED_PATHS.includes(location.pathname);
  const itemId = itemMatch?.params?.id;
  const userId = userMatch?.params?.id;

  const storiesLoading = isFeedPage && visibleStories.length === 0;

  if (focusMode && itemMatch) {
    return null;
  }

  return (
    <aside className="sidebar" key={location.pathname}>
      {!searchMatch && <SearchWidget />}

      {itemMatch ? (
        <ThreadMeta itemId={itemId} />
      ) : userMatch ? (
        <UserCard userId={userId} />
      ) : savedMatch ? (
        <SavedWidget />
      ) : (
        <>
          <SavedWidget />
          <HotNow stories={visibleStories} loading={storiesLoading} />
          {isFeedPage && <TopicCloud stories={visibleStories} />}
          {isJobsFeed ? <LatestAsk /> : <LiveJobs />}
        </>
      )}
    </aside>
  );
};

export default Sidebar;
