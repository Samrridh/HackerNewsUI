import React from 'react';
import { Link } from 'react-router-dom';
import { WEAVEIT_URL } from '../constants/brand';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <main className="main-content about-page animate-fade-in">
      <header className="about-header">
        <img
          src="/weaveit-logo.png"
          alt=""
          className="weaveit-logo about-logo"
        />
        <h1 className="about-title">About</h1>
        <p className="about-lead">
          Hacker News by Weaveit is a read-only reader for{' '}
          <a
            href="https://news.ycombinator.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Hacker News
          </a>
          , built by{' '}
          <a href={WEAVEIT_URL} target="_blank" rel="noopener noreferrer">
            Weaveit
          </a>
          .
        </p>
      </header>

      <section className="about-section">
        <h2>What this app does</h2>
        <p>
          Browse Top, New, Best, Ask, Show, and Jobs; open threads and search
          with Algolia; save or hide stories locally in your browser.
        </p>
      </section>

      <section className="about-section">
        <h2>What stays on Hacker News</h2>
        <p>
          Voting, commenting, submitting stories, and logging in are not
          available here. Use <strong>Open on Hacker News</strong> on any story
          or thread when you want to vote or reply — those actions happen on
          news.ycombinator.com, not against a fake login in this app.
        </p>
      </section>

      <section className="about-section">
        <h2>Data</h2>
        <p>
          Story data comes from the public Hacker News Firebase API and Algolia
          HN Search. Bookmarks and hidden stories stay in localStorage on this
          device only.
        </p>
      </section>

      <p className="about-back">
        <Link to="/">← Back to Top</Link>
      </p>
    </main>
  );
};

export default AboutPage;
