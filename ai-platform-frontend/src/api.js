import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081',
});

// --- THIS IS THE UPDATED INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    // Don't send a token for public login or register routes
    if (
      config.url === '/api/students/login' ||
      config.url === '/api/students/register'
    ) {
      return config;
    }

    // 1. Get the 'user' string from localStorage
    const userString = localStorage.getItem('user');

    if (userString) {
      // 2. Parse the 'user' object
      const user = JSON.parse(userString);

      // 3. If the user object has a token, add it to the header
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// --- END OF UPDATED INTERCEPTOR ---

export default api;