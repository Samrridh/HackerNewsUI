import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_ORIGIN } from '../constants/brand';

const SITE_NAME = 'Hacker News by Weaveit';

const ROUTE_META = [
  { match: /^\/$/, title: 'Top', description: 'Top stories on Hacker News.' },
  { match: /^\/new$/, title: 'New', description: 'Newest stories on Hacker News.' },
  { match: /^\/best$/, title: 'Best', description: 'Best stories on Hacker News.' },
  { match: /^\/ask$/, title: 'Ask', description: 'Ask HN discussions.' },
  { match: /^\/show$/, title: 'Show', description: 'Show HN posts.' },
  { match: /^\/jobs$/, title: 'Jobs', description: 'Who is hiring on Hacker News.' },
  { match: /^\/search$/, title: 'Search', description: 'Search Hacker News stories and comments.' },
  { match: /^\/saved$/, title: 'Saved', description: 'Your locally saved Hacker News stories.' },
  { match: /^\/about$/, title: 'About', description: 'About Hacker News by Weaveit — a read-only HN reader.' },
  { match: /^\/item\//, title: 'Thread', description: 'Hacker News discussion thread.' },
  { match: /^\/user\//, title: 'Profile', description: 'Hacker News user profile.' },
];

function upsertMeta(attr, key, content) {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const SeoHead = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta =
      ROUTE_META.find((entry) => entry.match.test(pathname)) || {
        title: 'Hacker News',
        description:
          'A modern Hacker News reader by Weaveit with feeds, search, comments, and bookmarks.',
      };

    const fullTitle =
      pathname === '/' ? SITE_NAME : `${meta.title} · ${SITE_NAME}`;

    document.title = fullTitle;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', meta.description);

    const pageUrl = `${SITE_ORIGIN}${pathname === '/' ? '/' : pathname}`;
    const absoluteImage = `${SITE_ORIGIN}/og-image.png`;

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', pageUrl);
    } else {
      const link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', pageUrl);
      document.head.appendChild(link);
    }

    upsertMeta('property', 'og:image', absoluteImage);
    upsertMeta('name', 'twitter:image', absoluteImage);
    upsertMeta('property', 'og:url', pageUrl);
  }, [pathname]);

  return null;
};

export default SeoHead;
