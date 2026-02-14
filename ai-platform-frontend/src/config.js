// src/config.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

console.log("🔌 API BASE URL:", API_BASE_URL);

export default {
    API_BASE_URL
};
