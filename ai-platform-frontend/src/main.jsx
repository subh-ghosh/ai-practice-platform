import './styles/tailwind.css';

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import { MaterialTailwindControllerProvider } from "@/context";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext.jsx";
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PaywallProvider } from "@/context/PaywallContext.jsx";
import axios from "axios"; // 👈 1. IMPORT AXIOS

// === 2. ADD THIS SECURITY INTERCEPTOR (Crucial!) ===
// This automatically attaches your Token to every request (Stats, Notifications, etc.)
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// ===================================================

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Replace 'clientId' with your actual Google Client ID if needed */}
      <GoogleOAuthProvider clientId="245465683815-auku1hggm3glvv2urqkblfnm85d8udel.apps.googleusercontent.com">
        <ThemeProvider>
          <MaterialTailwindControllerProvider>
            <AppThemeProvider>
              <AuthProvider>
                <NotificationProvider>
                  <PaywallProvider>
                    <App />
                  </PaywallProvider>
                </NotificationProvider>
              </AuthProvider>
            </AppThemeProvider>
          </MaterialTailwindControllerProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);