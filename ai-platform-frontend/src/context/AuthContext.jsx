import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await api.post("/api/students/login", { email, password });
      const loggedInUser = response.data;
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      setUser(loggedInUser);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: "Invalid credentials." };
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const response = await api.post("/api/students/oauth/google", { idToken });
      const data = response.data;

      if (data.status === "LOGIN_SUCCESS") {
        // --- CASE 1: LOGIN SUCCESS ---
        const loggedInUser = data.student;
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return { success: true, status: "LOGIN_SUCCESS" };

      } else if (data.status === "NEEDS_REGISTRATION") {
        // --- CASE 2: NEW USER ---
        return {
          success: true,
          status: "NEEDS_REGISTRATION",
          registrationData: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName
          }
        };
      } else {
        return { success: false, message: "Unknown server response." };
      }
    } catch (error) {
      console.error("Google Login failed:", error);
      return { success: false, message: error.response?.data || "Google login failed." };
    }
  };

  // --- 👇 ADD THIS NEW FUNCTION ---
  const decrementFreeActions = () => {
    setUser((currentUser) => {
      // Only run if the user is logged in and on the free plan
      if (currentUser && currentUser.subscriptionStatus === "FREE") {
        const newCount = (currentUser.freeActionsUsed || 0) + 1;

        // Create the updated user object
        const updatedUser = {
          ...currentUser,
          freeActionsUsed: newCount,
        };

        // Save to localStorage and update state
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      // If not free or not logged in, return the same state
      return currentUser;
    });
  };
  // --- 👆 END OF NEW FUNCTION ---

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      loginWithGoogle,
      decrementFreeActions // 👈 --- EXPOSE THE NEW FUNCTION
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);