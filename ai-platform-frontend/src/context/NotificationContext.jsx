import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "@/api";
import { useAuth } from "@/context/AuthContext.jsx";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setUnreadCount(0); return; }
    try {
      setLoading(true);
      const res = await api.get("/api/notifications/unread");
      setNotifications(res.data);
      setUnreadCount(res.data.length || 0);
      setError(null);
    } catch (e) {
      console.error("Failed to load notifications", e);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      // Optimistic update
      setNotifications((prev) => prev.filter(n => n.id !== id));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error("Failed to mark read", e);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll every 20s
    const t = setInterval(() => loadNotifications(), 20000);
    return () => clearInterval(t);
  }, [loadNotifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, error, reload: loadNotifications, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
