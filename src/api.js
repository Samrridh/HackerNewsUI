import axios from 'axios';
import { getCachedStory, setCachedStory } from './utils/storyCache';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';
const inflight = new Map();

export const FEED_TYPES = {
  top: 'topstories',
  new: 'newstories',
  best: 'beststories',
  ask: 'askstories',
  show: 'showstories',
  jobs: 'jobstories',
};

export const fetchStoryIds = async (type = 'top') => {
  const endpoint = FEED_TYPES[type] || FEED_TYPES.top;
  const response = await axios.get(`${BASE_URL}/${endpoint}.json`);
  return response.data;
};

/** @deprecated Prefer fetchStoryIds('top') */
export const fetchTopStories = () => fetchStoryIds('top');

export const fetchStory = async (id, { bypassCache = false } = {}) => {
  const key = String(id);

  if (!bypassCache) {
    const cached = getCachedStory(key);
    if (cached !== undefined) return cached;

    const pending = inflight.get(key);
    if (pending) return pending;
  }

  const request = axios
    .get(`${BASE_URL}/item/${id}.json`)
    .then((response) => {
      const data = response.data;
      setCachedStory(key, data);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
};

export const fetchStoriesBatch = async (ids, concurrency = 10) => {
  const results = [];
  for (let i = 0; i < ids.length; i += concurrency) {
    const chunk = ids.slice(i, i + concurrency);
    const stories = await Promise.all(
      chunk.map(async (id) => {
        try {
          return await fetchStory(id);
        } catch {
          return null;
        }
      })
    );
    results.push(...stories);
  }
  return results.filter(Boolean);
};

export const prefetchStories = (ids = []) => {
  ids.forEach((id) => {
    if (getCachedStory(id) !== undefined) return;
    if (inflight.has(String(id))) return;
    fetchStory(id).catch(() => {});
  });
};

export const fetchUser = async (id) => {
  const response = await axios.get(`${BASE_URL}/user/${id}.json`);
  return response.data;
};
