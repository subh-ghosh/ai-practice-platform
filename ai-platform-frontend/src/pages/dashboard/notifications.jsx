import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
  Tabs,
  TabsHeader,
  Tab,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  BellIcon,
  InformationCircleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";

/* ===========================
   Helpers
=========================== */
function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

// Select icon based on notification type
function getIconForType(type) {
  const t = (type || "").toUpperCase();
  if (t.includes("LOGIN") || t.includes("SECURITY")) return <ShieldCheckIcon className="h-5 w-5 text-blue-500" />;
  if (t.includes("PROFILE")) return <PencilSquareIcon className="h-5 w-5 text-orange-500" />;
  if (t.includes("REGISTER")) return <UserCircleIcon className="h-5 w-5 text-green-500" />;
  return <InformationCircleIcon className="h-5 w-5 text-blue-gray-500" />;
}

/* ===========================
   Component
=========================== */
export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("unread"); // 'unread' or 'all'
  const [markingAll, setMarkingAll] = useState(false);

  const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

  // 1. Fetch Notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      const endpoint = filter === "unread" 
        ? `${BASE_URL}/api/notifications/unread` 
        : `${BASE_URL}/api/notifications`;

      const response = await axios.get(endpoint, config);
      setNotifications(response.data);
    } catch (err) {
      console.error("Error loading notifications:", err);
      if (err.response && err.response.status !== 404) {
        setError("Failed to load notifications.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  // 2. Mark Single Read (Updated with Debugging)
  const markRead = async (id) => {
    if (!id) {
      alert("Error: Notification ID is missing.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // 👇 Trying PUT first (Most common)
      await axios.put(
        `${BASE_URL}/api/notifications/${id}/read`,
        {},
        { headers: { "Authorization": `Bearer ${token}` } }
      );

      // Success: Update UI
      if (filter === "unread") {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readFlag: true } : n))
        );
      }
    } catch (err) {
      console.error("Mark read failed:", err);
      // 👇 Show alert so you know WHY it failed
      const status = err.response?.status;
      if (status === 405) {
        alert("Method Not Allowed (405). The backend might want PATCH instead of PUT.");
      } else if (status === 404) {
        alert("Notification not found (404).");
      } else {
        alert(`Failed to mark read: ${err.message}`);
      }
    }
  };

  // 3. Mark ALL Read (Updated with Debugging)
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    setMarkingAll(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };

      const unreadIds = notifications
        .filter((n) => !n.readFlag)
        .map((n) => n.id);

      // Using PUT in loop
      await Promise.all(
        unreadIds.map((id) =>
          axios.put(`${BASE_URL}/api/notifications/${id}/read`, {}, config)
        )
      );

      await fetchNotifications();
    } catch (err) {
      console.error("Error marking all read:", err);
      alert("Failed to mark all as read. Check console for details.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <section className="relative isolate overflow-x-hidden -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8 min-h-[calc(100vh-4rem)] pb-10 flex">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />
      
      <div className="mt-6 has-fixed-navbar page w-full flex flex-col items-center">
        <Card className="w-full max-w-4xl border border-blue-100/60 bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-800/80 dark:border-gray-700 flex-1">
          <CardHeader
            color="transparent"
            floated={false}
            shadow={false}
            className="m-0 p-4 rounded-t-xl border-b border-blue-gray-50 dark:border-gray-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <BellIcon className="h-6 w-6 text-blue-500" />
                <Typography variant="h5" color="blue-gray" className="dark:text-gray-100">
                  Notifications
                </Typography>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-48">
                  <Tabs value={filter}>
                    <TabsHeader className="bg-blue-gray-50/50 dark:bg-gray-700/50 p-1">
                      <Tab
                        value="unread"
                        onClick={() => setFilter("unread")}
                        className={`text-xs font-medium py-1.5 ${filter === 'unread' ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        Unread
                      </Tab>
                      <Tab
                        value="all"
                        onClick={() => setFilter("all")}
                        className={`text-xs font-medium py-1.5 ${filter === 'all' ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                      >
                        All History
                      </Tab>
                    </TabsHeader>
                  </Tabs>
                </div>

                {filter === "unread" && notifications.length > 0 && (
                  <Tooltip content="Mark all as read">
                    <IconButton
                      variant="text"
                      color="blue"
                      disabled={markingAll}
                      onClick={markAllAsRead}
                    >
                      {markingAll ? (
                        <Spinner className="h-4 w-4" />
                      ) : (
                        <CheckCircleIcon className="h-5 w-5" />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>

          <CardBody className="flex flex-col gap-0 p-0 min-h-[300px]">
            {error && (
              <div className="p-6 text-center">
                <Typography color="red" className="text-sm">
                  {String(error)}
                </Typography>
                <Button size="sm" variant="text" onClick={fetchNotifications} className="mt-2">
                  Try Again
                </Button>
              </div>
            )}

            {loading && !notifications.length && (
              <div className="flex flex-col gap-4 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center opacity-60">
                <BellIcon className="h-16 w-16 text-blue-gray-200 dark:text-gray-600 mb-4" />
                <Typography variant="h6" className="text-blue-gray-400 dark:text-gray-500">
                  {filter === "unread" ? "You're all caught up!" : "No notifications yet."}
                </Typography>
                {filter === "unread" && (
                  <Button variant="text" size="sm" color="blue" onClick={() => setFilter("all")} className="mt-2">
                    View History
                  </Button>
                )}
              </div>
            )}

            {!loading && notifications.map((n, index) => {
              const isUnread = !n.readFlag; 
              return (
                <div
                  key={n.id}
                  className={`
                    group flex items-start gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50
                    ${index !== notifications.length - 1 ? "border-b border-blue-gray-50 dark:border-gray-700" : ""}
                    ${isUnread ? "bg-blue-50/40 dark:bg-blue-900/10" : ""}
                  `}
                >
                  <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-blue-gray-50 dark:border-gray-700">
                    {getIconForType(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Typography
                        variant="small"
                        className={`font-semibold mb-0.5 ${isUnread ? "text-blue-900 dark:text-blue-100" : "text-gray-700 dark:text-gray-300"}`}
                      >
                        {n.type || "System Notification"}
                      </Typography>
                      <Typography variant="small" className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatDateTime(n.createdAt)}
                      </Typography>
                    </div>
                    
                    <Typography className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {n.message}
                    </Typography>
                  </div>

                  {isUnread && (
                    <div className="self-center">
                      <Tooltip content="Mark as read">
                        <IconButton
                          variant="text"
                          color="blue-gray"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          // 👇 DEBUG CLICK HANDLER
                          onClick={() => {
                              console.log("Button Clicked ID:", n.id);
                              markRead(n.id);
                          }}
                        >
                          <CheckCircleIcon className="h-5 w-5 text-blue-gray-300 hover:text-blue-500" />
                        </IconButton>
                      </Tooltip>
                    </div>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </section>
  );
}

export default Notifications;