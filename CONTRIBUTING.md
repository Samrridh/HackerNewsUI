# Contributing to Hacker News by Weaveit

Thanks for helping improve this open-source HN reader.

## Ground rules

- Be respectful in issues and PRs.
- This app is a **read-only reader**. Do not add features that pretend to vote, reply, submit, or log in against the official HN Firebase write surface.
- Prefer linking users to `https://news.ycombinator.com/item?id=…` for write actions.
- Keep changes focused; large refactors need an issue first.

## Setup

```bash
npm install
npm run dev
```

Before submitting:

```bash
npm run build
```

## Pull requests

1. Fork and create a branch from `main`
2. Make your change with a clear commit message
3. Open a PR describing **why** and how to test
4. Screenshots help for UI changes

## Reporting bugs

Include:

- Browser / OS
- URL or route (`/`, `/item/…`, etc.)
- Steps to reproduce
- Expected vs actual behavior

## Feature ideas

Open an issue with the problem you’re solving, not only the solution. Especially welcome: performance, accessibility, and mobile polish.
