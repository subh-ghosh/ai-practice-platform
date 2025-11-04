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

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
