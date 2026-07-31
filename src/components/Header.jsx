import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  PanelLeftOpen,
  PanelLeftClose,
  Menu,
  X,
  List,
  LayoutGrid,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import './Header.css';

const NAV_ITEMS = [
  { to: '/', label: 'Top', end: true },
  { to: '/new', label: 'New' },
  { to: '/best', label: 'Best' },
  { to: '/show', label: 'Show' },
  { to: '/ask', label: 'Ask' },
  { to: '/jobs', label: 'Jobs' },
  { to: '/saved', label: 'Saved' },
];

const Header = ({ theme, toggleTheme, layout, toggleLayout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { viewMode, toggleViewMode, bookmarks } = useLibrary();

  const closeMenu = () => setIsMenuOpen(false);
  const sidebarOpen = layout === 'left';

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-group" onClick={closeMenu}>
          <div className="logo-icon">Y</div>
          <h1 className="header-title">
            Hacker News <span className="powered-by">by Weaveit</span>
            <img
              src="/weaveit-logo.png"
              alt="Weaveit"
              className="weaveit-logo header-weaveit-logo"
            />
          </h1>
        </Link>

        <button
          type="button"
          className="mobile-menu-btn icon-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`header-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              onClick={closeMenu}
            >
              {label}
              {label === 'Saved' && bookmarks.length > 0 ? (
                <span className="nav-badge">{bookmarks.length}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="header-actions">
          <button
            type="button"
            className="icon-btn desktop-only-btn"
            onClick={toggleViewMode}
            title={`Switch to ${viewMode === 'list' ? 'cards' : 'list'} view`}
            aria-label={`Switch to ${viewMode === 'list' ? 'cards' : 'list'} view`}
          >
            {viewMode === 'list' ? <LayoutGrid size={18} /> : <List size={18} />}
          </button>
          <button
            type="button"
            className="icon-btn desktop-only-btn"
            onClick={toggleLayout}
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-pressed={sidebarOpen}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
