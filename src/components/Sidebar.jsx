import React from 'react';
import { Search, Flame, Code, HelpCircle } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-widget search-widget">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search Hacker News..." className="search-input" />
        </div>
      </div>

      <div className="sidebar-widget">
        <h3 className="widget-title">
          <Flame size={16} className="widget-icon" /> Trending Topics
        </h3>
        <div className="tag-cloud">
          <span className="topic-tag">artificial intelligence</span>
          <span className="topic-tag">rust</span>
          <span className="topic-tag">react</span>
          <span className="topic-tag">startups</span>
          <span className="topic-tag">ycombinator</span>
          <span className="topic-tag">show hn</span>
        </div>
      </div>

      <div className="sidebar-widget info-widget">
        <h3 className="widget-title">
          <Code size={16} className="widget-icon" /> Top Tech Jobs
        </h3>
        <ul className="help-list">
          <li><strong>Y Combinator</strong> is actively hiring Core Systems Engineers.</li>
          <li><strong>Stripe</strong> is looking for Frontend Architects in SF/Remote.</li>
          <li><strong>OpenAI</strong> seeking Research Scientists for reinforcement learning.</li>
        </ul>
        <a href="https://news.ycombinator.com/jobs" target="_blank" rel="noopener noreferrer" className="help-link">
          <HelpCircle size={14} /> View all jobs
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
