import React from 'react';
import { Link } from 'react-router-dom';
import { WEAVEIT_URL } from '../constants/brand';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer animate-fade-in">
      <div className="container footer-content">
        <span className="footer-text">Brought to you by</span>
        <a
          href={WEAVEIT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-logo-link"
        >
          <img src="/weaveit-logo.png" alt="" className="weaveit-logo footer-weaveit-logo" />
          <span className="footer-brand">Weaveit</span>
        </a>
        <span className="footer-sep" aria-hidden="true">
          ·
        </span>
        <Link to="/about" className="footer-about-link">
          About
        </Link>
      </div>
      <p className="footer-honesty">
        Read-only Hacker News reader — vote and reply on news.ycombinator.com
      </p>
    </footer>
  );
};

export default Footer;
