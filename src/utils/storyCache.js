const storyCache = new Map();

export function getCachedStory(id) {
  return storyCache.get(String(id));
}

export function setCachedStory(id, story) {
  if (id == null) return;
  storyCache.set(String(id), story);
}

export function clearStoryCache() {
  storyCache.clear();
}
