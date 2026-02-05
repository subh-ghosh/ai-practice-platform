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

 // 2. Login Function (Robust Version)
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      console.log("SERVER RESPONSE:", response.data); // 👈 Check your console for this!

      // TRY ALL POSSIBLE NAMES for the token
      const token = response.data.token || 
                    response.data.jwt || 
                    response.data.accessToken || 
                    response.data.bearerToken ||
                    (typeof response.data === 'string' ? response.data : null);
      
      if (token) {
        localStorage.setItem("token", token);
        
        // Try to find the user object (or create a dummy one if missing)
        const userData = response.data.student || 
                         response.data.user || 
                         { email: email, firstName: "Student" }; 
                         
        localStorage.setItem("user", JSON.stringify(userData));
        
        setUser(userData);
        return { success: true };
      } else {
        console.error("Login succeeded but NO TOKEN found in:", response.data);
        return { success: false, message: "Login failed: No token received." };
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