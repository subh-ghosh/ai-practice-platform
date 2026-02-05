import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios"; // 👈 USE AXIOS
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

// Hardcode URL for safety
const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Notifications (Manual Token)
  const fetchUnread = useCallback(async (isSilent = false) => {
    // Only fetch if user is logged in
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!isSilent) setLoading(true);
    
    try {
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      
      const res = await axios.get(`${BASE_URL}/api/notifications/unread`, config);
      
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.read).length);
      setError(null);
    } catch (err) {
      console.error("Context: Failed to fetch notifications", err);
      // Suppress 404s (just means no notifications)
      if (err.response && err.response.status !== 404) {
          setError("Could not load notifications");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // 2. Mark Read (Manual Token)
  const markRead = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      await axios.put(`${BASE_URL}/api/notifications/${id}/read`, {}, config);
      
      // Update local state immediately for speed
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      
      // Sync with server silently
      fetchUnread(true);
    } catch (err) {
      console.error("Context: Failed to mark read", err);
    }
  }, [fetchUnread]);

  // 3. Reload helper
  const reload = useCallback(() => fetchUnread(false), [fetchUnread]);

  // Initial Fetch when User changes
  useEffect(() => {
    if (user) {
      fetchUnread();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchUnread]);

  // Optional: Auto-refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
        fetchUnread(true);
    }, 60000); 
    return () => clearInterval(interval);
  }, [user, fetchUnread]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    reload,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}