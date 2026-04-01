import React from 'react';
import { Database } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer animate-fade-in">
      <div className="container footer-content">
        <span className="footer-text">Brought to you by</span>
        <a href="https://weavedb.app" target="_blank" rel="noopener noreferrer" className="footer-logo-link">
          <Database size={14} className="footer-icon" />
          <span className="footer-brand">WeaveDB</span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
