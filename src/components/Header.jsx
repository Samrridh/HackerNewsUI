import React, { useState } from 'react';
import { Sun, Moon, AlignLeft, AlignCenter, Menu, X } from 'lucide-react';
import './Header.css';

const Header = ({ theme, toggleTheme, layout, toggleLayout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo-group">
          <div className="logo-icon">
            Y
          </div>
          <h1 className="header-title">
            Hacker News <span className="powered-by">by WeaveDB</span>
          </h1>
        </div>

        <button className="mobile-menu-btn icon-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={`header-nav ${isMenuOpen ? 'mobile-open' : ''}`}>
          <a href="#" className="nav-link active">Top</a>
          <a href="#" className="nav-link">New</a>
          <a href="#" className="nav-link">Show</a>
          <a href="#" className="nav-link">Ask</a>
          <a href="#" className="nav-link">Jobs</a>
        </nav>
        
        <div className="header-actions">
          <button className="icon-btn" onClick={toggleLayout} title={`Switch to ${layout === 'center' ? 'left-aligned' : 'centered'} layout`}>
            {layout === 'center' ? <AlignLeft size={18} /> : <AlignCenter size={18} />}
          </button>
          <button className="icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
