import React from 'react';
import './PlaceholderPage.css';

const PlaceholderPage = ({ title, detail }) => {
  return (
    <main className="main-content placeholder-page animate-fade-in">
      <h2 className="placeholder-title">{title}</h2>
      <p className="placeholder-detail">{detail}</p>
    </main>
  );
};

export default PlaceholderPage;
