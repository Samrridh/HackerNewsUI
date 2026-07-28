import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

const SavedWidget = () => {
  const { bookmarks } = useLibrary();
  const recent = bookmarks.slice(0, 3);

  return (
    <div className="sidebar-widget sidebar-widget-animate">
      <h3 className="widget-title">
        <Bookmark size={16} className="widget-icon" /> Saved
      </h3>

      {bookmarks.length === 0 ? (
        <p className="sidebar-empty">Bookmark stories to save them locally.</p>
      ) : (
        <>
          <p className="sidebar-saved-count">{bookmarks.length} saved</p>
          <ul className="sidebar-story-list">
            {recent.map((item) => (
              <li key={item.id}>
                <Link to={`/item/${item.id}`} className="sidebar-story-link">
                  <span className="sidebar-story-title">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/saved" className="help-link sidebar-widget-link">
            View all saved
          </Link>
        </>
      )}
    </div>
  );
};

export default SavedWidget;
