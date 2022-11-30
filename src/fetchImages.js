import axios from 'axios';

const API_KEY = '31382006-33462af27eddcc8e16dd10c21';
const BASE_URL = 'https://pixabay.com/api/';

// export const picturesApi = function (searchQuery, page, perPage) {
//   return axios.get(
//     `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}&`
//   );
// };

async function picturesApi(searchQuery, page, perPage) {
  try {
    const resp = await axios.get(
      `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${perPage}&page=${page}&`
    );
    return resp;
  } catch {
    throw new Error('RESPONCE NOT OK!');
  }
}

export { picturesApi };
