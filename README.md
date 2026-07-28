# Hacker News by Weaveit

<!-- SCREENSHOT: hero / homepage (list view) -->
<!-- ![Homepage](docs/images/homepage.png) -->

A modern, fast, **read-only** [Hacker News](https://news.ycombinator.com/) reader.

**Live:** [https://hn.weaveit.app/](https://hn.weaveit.app/)  
**Built by:** [Weaveit](https://weaveit.app/)

---

## Why this exists

Official Hacker News is excellent — and intentionally minimal. This project is a cleaner UI on top of the same public data:

- Multiple feeds (Top, New, Best, Ask, Show, Jobs)
- In-app comment threads (paginated so large threads stay snappy)
- Algolia-powered search
- User profiles
- Local bookmarks + hide list (browser only)
- List / cards view, dark mode, keyboard navigation
- Honest about what it **cannot** do: voting, replies, and submissions still happen on HN

<!-- SCREENSHOT: thread / comments -->
<!-- ![Thread view](docs/images/thread.png) -->

---

## Features

| Area | What you get |
|------|----------------|
| Feeds | Top · New · Best · Ask · Show · Jobs |
| Threads | First 10 top-level comments, then infinite scroll; nested replies on demand |
| Search | Public Algolia HN Search API |
| Profiles | `/user/:id` from the Firebase API |
| Library | Save / hide locally · Saved \| Hidden tabs |
| UX | `j`/`k` focus, `Enter` open item, `o` open article, `b` bookmark, `x` hide |
| Views | List (default) or 3-column cards |
| SEO | Absolute URLs for `hn.weaveit.app`, sitemap, robots, Open Graph |
| Agents | [`/llms.txt`](https://hn.weaveit.app/llms.txt) for LLM-friendly site context |

<!-- SCREENSHOT: cards view -->
<!-- ![Cards view](docs/images/cards.png) -->

---

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Hacker News Firebase API](https://github.com/HackerNews/API) (read-only)
- [Algolia HN Search](https://hn.algolia.com/api)
- Deploy target: [Cloudflare Pages](https://pages.cloudflare.com/)

---

## Quick start

### Requirements

- Node.js 20+ (recommended)
- npm 10+

### Install & run

```bash
git clone https://github.com/Samrridh/HackerNewsUI.git
cd HackerNewsUI
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

Output is written to `dist/` (suitable for Cloudflare Pages, Netlify, or any static host).

---

## Project structure

```text
public/           Static assets, robots.txt, sitemap, llms.txt, _headers, _redirects
src/
  api.js          HN Firebase helpers (+ in-flight dedupe)
  searchApi.js    Algolia search
  components/     UI (stories, comments, header, sidebar widgets, …)
  context/        Feed + library (bookmarks/hide/view) state
  pages/          Route pages (item, user, search, saved, about, …)
  utils/          HTML helpers, cache, topics
index.html        Shell + critical CSS
vite.config.js    Build + non-blocking CSS transform
```

---

## Keyboard shortcuts (feeds)

| Key | Action |
|-----|--------|
| `j` / `k` | Move focus (loads more at end with `j`) |
| `Enter` | Open focused item thread |
| `o` | Open external article |
| `b` | Toggle bookmark |
| `x` or `h` | Hide story |

---

## Important limitations (please read)

This is a **reader**, not a full HN client:

- No login against Hacker News
- No voting / commenting / submitting from this app
- Use **Open on Hacker News** when you want to vote or reply
- Bookmarks are **localStorage only** (not synced across devices)

See also the in-app [About](https://hn.weaveit.app/about) page.

---

## Configuration / deploy notes

- Production SEO origin is hardcoded as `https://hn.weaveit.app` (see `src/constants/brand.js` and SEO files).
- Cloudflare Pages: `public/_redirects` handles SPA routes; `public/_headers` sets caching.
- No API keys are required for HN Firebase or Algolia’s public HN Search endpoints.

<!-- SCREENSHOT: dark mode -->
<!-- ![Dark mode](docs/images/dark.png) -->

---

## Contributing

Contributions are welcome. Please:

1. Open an issue for larger changes before spending a lot of time
2. Keep PRs focused and small when possible
3. Do not add fake “vote” / “login” that pretends to hit HN’s write APIs
4. Run `npm run build` before opening a PR

More detail: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Roadmap ideas

- Optional account sync for bookmarks (still no fake HN auth)
- Comment virtualization for huge threads
- Better offline / PWA caching
- Accessibility audit pass
- Your ideas — open an issue

---

## License

MIT — see [LICENSE](./LICENSE).

---

## Credits

- Data: [Hacker News](https://news.ycombinator.com/) / [Y Combinator](https://www.ycombinator.com/)
- Search: [Algolia HN Search](https://hn.algolia.com/)
- Product: [Weaveit](https://weaveit.app/)

Hacker News is a registered trademark of Y Combinator. This project is unofficial and not affiliated with Y Combinator.
