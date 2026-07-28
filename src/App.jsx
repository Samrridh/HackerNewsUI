import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import StoryList from './components/StoryList';
import Sidebar from './components/Sidebar';
import WeaveitButton from './components/WeaveitButton';
import Footer from './components/Footer';
import SeoHead from './components/SeoHead';
import ItemPage from './pages/ItemPage';
import SearchPage from './pages/SearchPage';
import UserPage from './pages/UserPage';
import SavedPage from './pages/SavedPage';
import AboutPage from './pages/AboutPage';
import PlaceholderPage from './pages/PlaceholderPage';
import { useLibrary } from './context/LibraryContext';
import './App.css';

const THEME_KEY = 'hn-theme';
const LAYOUT_KEY = 'hn-layout';

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value || fallback;
  } catch {
    return fallback;
  }
}

function FeedPage({ feed }) {
  return <StoryList feed={feed} />;
}

function App() {
  const { viewMode } = useLibrary();
  const [theme, setTheme] = useState(() => readStored(THEME_KEY, 'light'));
  const [layout, setLayout] = useState(() => readStored(LAYOUT_KEY, 'center'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore quota / private mode */
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(LAYOUT_KEY, layout);
    } catch {
      /* ignore quota / private mode */
    }
  }, [layout]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const toggleLayout = () => setLayout((prev) => (prev === 'center' ? 'left' : 'center'));

  return (
    <div className={`app-root layout-${layout} view-${viewMode}`}>
      <SeoHead />
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        layout={layout}
        toggleLayout={toggleLayout}
      />
      <div className="main-layout container">
        <Routes>
          <Route path="/" element={<FeedPage feed="top" />} />
          <Route path="/new" element={<FeedPage feed="new" />} />
          <Route path="/best" element={<FeedPage feed="best" />} />
          <Route path="/ask" element={<FeedPage feed="ask" />} />
          <Route path="/show" element={<FeedPage feed="show" />} />
          <Route path="/jobs" element={<FeedPage feed="jobs" />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/item/:id" element={<ItemPage />} />
          <Route path="/user/:id" element={<UserPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="*"
            element={
              <PlaceholderPage title="Not found" detail="That page does not exist." />
            }
          />
        </Routes>
        {layout === 'left' && <Sidebar />}
      </div>
      <Footer />
      <WeaveitButton />
    </div>
  );
}

export default App;
