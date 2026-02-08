import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hardcode the URL to ensure stability across pages
  const API_URL = "https://ai-platform-backend-vauw.onrender.com/api/students";

  // 1. Check for token on startup (Auto-Login)
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Restore user from local storage if available
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

 // 2. Login Function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      
      const token = response.data.token || 
                    response.data.jwt || 
                    response.data.accessToken || 
                    (typeof response.data === 'string' ? response.data : null);
      
      if (token) {
        localStorage.setItem("token", token);
        
        const userData = response.data.student || 
                         response.data.user || 
                         { email: email, firstName: "Student" }; 
                         
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
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
      
      if (response.data.status === "LOGIN_SUCCESS") {
         localStorage.setItem("token", response.data.token);
         
         const userData = response.data.student;
         localStorage.setItem("user", JSON.stringify(userData));
         setUser(userData);
         
         return { success: true, status: "LOGIN_SUCCESS" };
      } 
      
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

  // --- 👇 NEW FUNCTION: Update User State Manually 👇 ---
  // This updates the local UI immediately after a successful API save
  const updateUser = (updatedData) => {
    setUser((prevUser) => {
        // Merge the old user data with the new updates
        const newUser = { ...prevUser, ...updatedData };
        
        // Save to localStorage so it persists on refresh
        localStorage.setItem("user", JSON.stringify(newUser));
        
        // If the backend sent a new token (rare but possible), update that too
        if (updatedData.token) {
            localStorage.setItem("token", updatedData.token);
        }
        
        return newUser;
    });
  };
  
  // --- 👇 decrementFreeActions for Free Tier 👇 ---
  // This updates the limit counter locally so the user sees the change instantly
  const decrementFreeActions = () => {
    setUser((prev) => {
      if (!prev) return null;
      const newUser = { ...prev, freeActionsUsed: (prev.freeActionsUsed || 0) + 1 };
      localStorage.setItem("user", JSON.stringify(newUser));
      return newUser;
    });
  };

  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    updateUser, // 👈 Exported for Profile page
    decrementFreeActions // 👈 Exported for Practice page
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}