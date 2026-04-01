import React from 'react';
import { Database } from 'lucide-react';
import './WeaveDBButton.css';

const WeaveDBButton = () => {
  return (
    <a 
      href="https://weavedb.app" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="weavedb-btn animate-fade-in"
      title="Powered by WeaveDB"
    >
      {/* We use a fallback icon here. If a specific logo file is provided, it can replace this Database icon */}
      <Database size={20} className="weavedb-logo" />
      <span className="weavedb-text">WeaveDB</span>
    </a>
  );
};

export default WeaveDBButton;
