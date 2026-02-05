import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use the Cloud URL
  const API_URL = import.meta.env.VITE_API_BASE_URL + "/api/students";

  // 1. Check for token on startup (Auto-Login)
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Optional: You could ping the backend here to verify token
          // For now, we decode it or just assume it's valid to keep user logged in
          // const response = await axios.get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` } });
          // setUser(response.data);
          
          // Simple restoration:
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
             setUser(JSON.parse(savedUser));
          }
        } catch (error) {
          console.error("Token invalid", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  // 2. Login Function (The Fix is Here)
 // 2. Login Function (Debug Version)
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      // 🔍 DEBUG LOG: Print exactly what the server sent
      console.log("SERVER RESPONSE:", response.data); 

      // Try to find the token (Handle different possible names)
      const token = response.data.token || response.data.accessToken || response.data.jwt;
      
      if (token) {
        localStorage.setItem("token", token);
        
        // Find the user object
        const userData = response.data.student || response.data.user || response.data.data;
        localStorage.setItem("user", JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      } else {
        console.error("Token missing in response:", response.data);
        return { success: false, message: "Login successful, but no token found." };
      }
    } catch (error) {
      console.error("Login Error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Invalid credentials" 
      };
    }
  };

  // 3. Google Login Function
  const loginWithGoogle = async (idToken) => {
    try {
      const response = await axios.post(`${API_URL}/oauth/google`, { token: idToken });
      
      // Handle Success (Already Registered)
      if (response.data.status === "LOGIN_SUCCESS") {
         localStorage.setItem("token", response.data.token);
         
         const userData = response.data.student;
         localStorage.setItem("user", JSON.stringify(userData));
         setUser(userData);
         
         return { success: true, status: "LOGIN_SUCCESS" };
      } 
      
      // Handle Needs Registration
      return response.data;

    } catch (error) {
      console.error("Google Auth Error:", error);
      return { success: false, message: error.response?.data?.message || "Google login failed" };
    }
  };

  // 4. Logout Function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}