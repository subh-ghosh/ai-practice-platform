// src/config.js
let url = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// Ensure URL ends with /api to avoid 404/403 errors on deployment
if (url.endsWith('/')) {
    url = url.slice(0, -1);
}
if (!url.endsWith('/api')) {
    url += '/api';
}

export const API_BASE_URL = url;

console.log("🔌 API BASE URL:", API_BASE_URL);

export default {
    API_BASE_URL
};
