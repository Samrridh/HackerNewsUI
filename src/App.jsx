import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StoryList from './components/StoryList';
import Sidebar from './components/Sidebar';
import WeaveDBButton from './components/WeaveDBButton';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [layout, setLayout] = useState('center'); // 'center' or 'left'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLayout = () => setLayout(prev => prev === 'center' ? 'left' : 'center');

  return (
    <div className={`app-root layout-${layout}`}>
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        layout={layout} 
        toggleLayout={toggleLayout} 
      />
      <div className="main-layout container">
        <StoryList />
        {layout === 'left' && <Sidebar />}
      </div>
      <Footer />
      <WeaveDBButton />
    </div>
  );
}

export default App;
