import React from 'react';
import './Loader.css';

const Loader = ({ count = 5 }) => {
  return (
    <div className="loader-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="story-item skeleton-card">
          <div className="skeleton title-skeleton"></div>
          <div className="meta-skeletons">
            <div className="skeleton meta-skeleton short"></div>
            <div className="skeleton meta-skeleton"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Loader;
