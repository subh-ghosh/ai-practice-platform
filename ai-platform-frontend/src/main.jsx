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
import { PaywallProvider } from "@/context/PaywallContext.jsx"; // 👈 --- ADD THIS IMPORT

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId="245465683815-auku1hggm3glvv2urqkblfnm85d8udel.apps.googleusercontent.com">
        <ThemeProvider>
          <MaterialTailwindControllerProvider>
            <AppThemeProvider>
              <AuthProvider>
                <NotificationProvider>
                  {/* 👇 --- WRAP HERE --- 👇 */}
                  <PaywallProvider>
                    <App />
                  </PaywallProvider>
                  {/* 👆 --- END WRAP --- 👆 */}
                </NotificationProvider>
              </AuthProvider>
            </AppThemeProvider>
          </MaterialTailwindControllerProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);