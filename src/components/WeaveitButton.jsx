import React from 'react';
import { WEAVEIT_URL } from '../constants/brand';
import './WeaveitButton.css';

const WeaveitButton = () => {
  return (
    <a
      href={WEAVEIT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="weaveit-btn animate-fade-in"
      title="Powered by Weaveit"
    >
      <img src="/weaveit-logo.png" alt="" className="weaveit-logo weaveit-btn-logo" />
      <span className="weaveit-text">Weaveit</span>
    </a>
  );
};

export default WeaveitButton;
