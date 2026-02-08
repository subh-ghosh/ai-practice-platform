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

function getIconForType(type) {
  const t = (type || "").toUpperCase();
  if (t.includes("LOGIN") || t.includes("SECURITY")) return <ShieldCheckIcon className="h-5 w-5 text-blue-500" />;
  if (t.includes("PROFILE")) return <PencilSquareIcon className="h-5 w-5 text-orange-500" />;
  if (t.includes("REGISTER")) return <UserCircleIcon className="h-5 w-5 text-green-500" />;
  return <InformationCircleIcon className="h-5 w-5 text-blue-gray-500" />;
}

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("unread");
  const [markingAll, setMarkingAll] = useState(false);

  const BASE_URL = "https://ai-platform-backend-vauw.onrender.com";

  // 1. Fetch
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

  // 2. Mark Single Read (PATCH)
  const markRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      
      // 👇 USE PATCH (Matches Backend)
      await axios.patch(
        `${BASE_URL}/api/notifications/${id}/read`,
        {},
        { headers: { "Authorization": `Bearer ${token}` } }
      );

      // Optimistic Update (Instant UI change)
      if (filter === "unread") {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readFlag: true } : n))
        );
      }
    } catch (err) {
      console.error("Mark read failed:", err);
      // Alert only if it's a real error, not a network blip
      if (err.response?.status === 403) {
        alert("Server Permission Error (403): Please ensure the backend update has finished deploying.");
      }
    }
  };

  // 3. Mark ALL Read (PATCH Loop)
  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    setMarkingAll(true);
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { "Authorization": `Bearer ${token}` } };
      const unreadIds = notifications.filter((n) => !n.readFlag).map((n) => n.id);

      // 👇 USE PATCH (Matches Backend)
      await Promise.all(
        unreadIds.map((id) =>
          axios.patch(`${BASE_URL}/api/notifications/${id}/read`, {}, config)
        )
      );

      await fetchNotifications();
    } catch (err) {
      console.error("Error marking all read:", err);
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
                      <Tab value="unread" onClick={() => setFilter("unread")} className="text-xs font-medium py-1.5">Unread</Tab>
                      <Tab value="all" onClick={() => setFilter("all")} className="text-xs font-medium py-1.5">All History</Tab>
                    </TabsHeader>
                  </Tabs>
                </div>

                {filter === "unread" && notifications.length > 0 && (
                  <Tooltip content="Mark all as read">
                    <IconButton variant="text" color="blue" disabled={markingAll} onClick={markAllAsRead}>
                      {markingAll ? <Spinner className="h-4 w-4" /> : <CheckCircleIcon className="h-5 w-5" />}
                    </IconButton>
                  </Tooltip>
                )}
              </div>
            </div>
          </CardHeader>

          <CardBody className="flex flex-col gap-0 p-0 min-h-[300px]">
            {error && <Typography color="red" className="p-6 text-center text-sm">{String(error)}</Typography>}
            {loading && !notifications.length && <div className="p-6 text-center">Loading...</div>}
            {!loading && !error && notifications.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full py-16 opacity-60">
                 <BellIcon className="h-16 w-16 text-blue-gray-200 mb-4" />
                 <Typography variant="h6" color="blue-gray">No notifications.</Typography>
               </div>
            )}

            {!loading && notifications.map((n, index) => {
              const isUnread = !n.readFlag; 
              return (
                <div key={n.id} className={`group flex items-start gap-4 p-4 hover:bg-gray-50 ${isUnread ? "bg-blue-50/40" : ""} ${index !== notifications.length - 1 ? "border-b border-blue-gray-50" : ""}`}>
                  <div className="mt-1 p-2 bg-white rounded-full shadow-sm border border-blue-gray-50">{getIconForType(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Typography variant="small" className={`font-semibold ${isUnread ? "text-blue-900" : "text-gray-700"}`}>{n.type || "System"}</Typography>
                      <Typography variant="small" className="text-xs text-gray-400 ml-2">{formatDateTime(n.createdAt)}</Typography>
                    </div>
                    <Typography className="text-sm text-gray-600">{n.message}</Typography>
                  </div>
                  {isUnread && (
                    <div className="self-center">
                      <Tooltip content="Mark as read">
                        <IconButton variant="text" color="blue-gray" size="sm" onClick={() => markRead(n.id)}>
                          <CheckCircleIcon className="h-5 w-5 hover:text-blue-500" />
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