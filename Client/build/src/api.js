import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // This will dynamically use the correct URL based on environment
});

export default api;