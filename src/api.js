import axios from 'axios';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export const fetchTopStories = async () => {
  const response = await axios.get(`${BASE_URL}/topstories.json`);
  return response.data;
};

export const fetchStory = async (id) => {
  const response = await axios.get(`${BASE_URL}/item/${id}.json`);
  return response.data;
};
