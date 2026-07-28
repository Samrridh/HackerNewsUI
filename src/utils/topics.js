const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'its', 'this',
  'that', 'these', 'those', 'you', 'your', 'we', 'our', 'they', 'their', 'not',
  'no', 'yes', 'how', 'what', 'why', 'when', 'who', 'which', 'into', 'over', 'after',
  'before', 'about', 'up', 'out', 'so', 'if', 'than', 'then', 'just', 'more', 'most',
  'some', 'any', 'all', 'can', 'will', 'new', 'via', 'using', 'use', 'used', 'show',
  'ask', 'hn', 'pdf', 'year', 'years', 'day', 'days', 'first', 'one', 'two', 'has',
  'have', 'had', 'do', 'does', 'did', 'get', 'got', 'make', 'made', 'like', 'also',
]);

export function getStoryDomain(story) {
  if (!story?.url) return null;
  try {
    return new URL(story.url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

export function deriveTopics(stories, limit = 8) {
  const counts = new Map();

  for (const story of stories) {
    const domain = getStoryDomain(story);
    if (domain) {
      counts.set(domain, (counts.get(domain) || 0) + 2);
    }

    const words = String(story.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9+.#\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    for (const word of words) {
      if (word.length < 3 || STOPWORDS.has(word)) continue;
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([topic]) => topic);
}

export function topByScore(stories, limit = 5) {
  return [...stories]
    .filter((s) => s && typeof s.score === 'number' && s.title)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
