import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { FeedProvider } from './context/FeedContext.jsx';
import { LibraryProvider } from './context/LibraryContext.jsx';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <FeedProvider>
        <LibraryProvider>
          <App />
        </LibraryProvider>
      </FeedProvider>
    </BrowserRouter>
  </StrictMode>
);
