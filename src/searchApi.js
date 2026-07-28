import axios from 'axios';

const ALGOLIA_HN = 'https://hn.algolia.com/api/v1/search';

async function searchHn(query, { page = 0, tags = 'story', hitsPerPage = 20 } = {}) {
  const response = await axios.get(ALGOLIA_HN, {
    params: {
      query: query || '',
      tags,
      page,
      hitsPerPage,
    },
  });
  return response.data;
}

export const searchStories = (query, page = 0) =>
  searchHn(query, { page, tags: 'story' });

export const searchComments = (query, page = 0) =>
  searchHn(query, { page, tags: 'comment' });
