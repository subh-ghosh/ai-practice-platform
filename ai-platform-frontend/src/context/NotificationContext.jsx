import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

// Hardcode URL for safety
// Use dynamic URL from config. Remove /api for notification endpoints as they append it themselves or expect the base
const BASE_URL = API_BASE_URL.replace(/\/api$/, "");

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch Notifications (Single Source of Truth)
  // We fetch ALL notifications so the "History" tab works without extra calls
  const fetchNotifications = useCallback(async (isSilent = false) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!isSilent) setLoading(true);

    try {
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      // CHANGED: Fetch ALL notifications, not just unread
      const res = await axios.get(`${BASE_URL}/api/notifications`, config);

      setNotifications(res.data);

      // Calculate unread count locally
      const unread = res.data.filter(n => !n.readFlag).length;
      setUnreadCount(unread);
      setError(null);
    } catch (err) {
      console.error("Context: Failed to fetch notifications", err);
      if (err.response && err.response.status !== 404) {
        setError("Could not load notifications");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // 2. Mark Read (Optimistic Update)
  const markRead = useCallback(async (id) => {
    // INSTANTLY update UI state before server responds (No Lag)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, readFlag: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      await axios.patch(`${BASE_URL}/api/notifications/${id}/read`, {}, config);
    } catch (err) {
      console.error("Context: Failed to mark read", err);
      // If it fails, re-fetch to ensure sync
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // 3. Mark ALL Read (Optimistic Update)
  const markAllAsRead = useCallback(async () => {
    // Optimistic: Mark all as read locally immediately
    setNotifications(prev => prev.map(n => ({ ...n, readFlag: true })));
    setUnreadCount(0);

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      await axios.patch(`${BASE_URL}/api/notifications/read-all`, {}, config);
    } catch (err) {
      console.error("Context: Failed to mark all read", err);
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // Initial Fetch & Polling
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 2 minutes to reduce Redis requests
      const interval = setInterval(() => {
        if (!document.hidden) {
          fetchNotifications(true);
        }
      }, 120000);

      const onVisibility = () => {
        if (!document.hidden) {
          fetchNotifications(true);
        }
      };
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllAsRead,
    refresh: () => fetchNotifications(false)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
