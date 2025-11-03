import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import api from "@/api"; // We'll need this if we start using tokens

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the AuthProvider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- THIS IS THE FIX ---
  // We add a loading state. We are "loading" until we check localStorage.
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation(); // Get the location object

  // This hook runs *only once* when the app first loads
  useEffect(() => {
    try {
      // Check if user data exists in localStorage
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        // If it exists, parse it and set our state
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);

        // Optional: If we were using tokens, we'd set the default header here
        // api.defaults.headers.common["Authorization"] = `Bearer ${parsedUser.token}`;
      }
    } catch (error) {
      // If localStorage is corrupted, clear it
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem("user");
    } finally {
      // --- THIS IS THE FIX ---
      // After we're done checking localStorage (even if it's empty),
      // we set loading to false.
      setLoading(false);
    }
  }, []); // The empty array [] means this runs only on mount

  // This is our login function, called from the SignIn page
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);

    // Save to localStorage to persist the session
    localStorage.setItem("user", JSON.stringify(userData));

    // Optional: If we were using tokens
    // api.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;

    // --- FIX: Navigate to the "from" location or fallback to home ---
    const from = location.state?.from?.pathname || "/dashboard/practice";
    navigate(from, { replace: true });
  };

  // This is our logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);

    // Clear from localStorage
    localStorage.removeItem("user");

    // Optional: If we were using tokens
    // delete api.defaults.headers.common["Authorization"];

    navigate("/auth/sign-in");
  };

  // Provide the user, auth status, functions, AND the loading state
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {/* --- THIS IS THE FIX ---
        We don't render the rest of the app (the "children")
        until we are no longer loading.
      */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Create the custom "useAuth" hook
export const useAuth = () => {
  return useContext(AuthContext);
};

