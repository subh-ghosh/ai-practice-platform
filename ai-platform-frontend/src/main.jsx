import "./styles/tailwind.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MTTheme } from "@material-tailwind/react";
import { MaterialTailwindControllerProvider } from "@/context";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext.jsx";
import { ThemeProvider as AppThemeProvider } from "@/context/ThemeProvider.jsx";
import ErrorBoundary from "@/components/dev/ErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MTTheme>
        <MaterialTailwindControllerProvider>
          <AppThemeProvider>
            <AuthProvider>
              <NotificationProvider>
                <ErrorBoundary>
                  <App />
                </ErrorBoundary>
              </NotificationProvider>
            </AuthProvider>
          </AppThemeProvider>
        </MaterialTailwindControllerProvider>
      </MTTheme>
    </BrowserRouter>
  </React.StrictMode>
);
