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
import axios from "axios";

// ── Premium Dark Scrollbar (runtime injection) ─────────────────────────────
// This runs after ALL framework CSS loads so nothing can override it.
; (function () {
  const s = document.createElement('style');
  s.textContent = `
    ::-webkit-scrollbar { width: 7px !important; height: 7px !important; }
    ::-webkit-scrollbar-track { background: #0d0d0f !important; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 100%) !important;
      border-radius: 99px !important;
      border: 2px solid #0d0d0f !important;
      background-clip: padding-box !important;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, rgba(59,130,246,0.9) 0%, rgba(99,102,241,0.75) 100%) !important;
      box-shadow: 0 0 14px rgba(59,130,246,0.65) !important;
      border-color: rgba(0,0,0,0.4) !important;
    }
    * { scrollbar-width: thin !important; scrollbar-color: rgba(255,255,255,0.2) #0d0d0f !important; }
  `;
  document.head.appendChild(s);
})();
// ──────────────────────────────────────────────────────────────────────────

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// ✅ FIXED SECURITY INTERCEPTOR
axios.interceptors.request.use(
  (config) => {

    // ❌ DO NOT attach token to auth endpoints
    if (
      config.url?.includes("/login") ||
      config.url?.includes("/register") ||
      config.url?.includes("/oauth")
    ) {
      return config;
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// APP RENDER
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={googleClientId || ""}>
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
