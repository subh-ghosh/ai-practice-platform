import React, { useState, useMemo } from "react";
import {
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Button,
  Tooltip,
  IconButton,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  BellIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  EnvelopeOpenIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion"; // Requires: npm install framer-motion
import { useNotifications } from "@/context/NotificationContext";

// --- Helper Functions ---

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
    });
  } catch { return "—"; }
}

function getIconForType(type) {
  const t = (type || "").toUpperCase();
  if (t.includes("LOGIN") || t.includes("SECURITY")) return <ShieldCheckIcon className="h-5 w-5 text-blue-500" />;
  if (t.includes("PROFILE")) return <PencilSquareIcon className="h-5 w-5 text-orange-500" />;
  if (t.includes("REGISTER")) return <UserCircleIcon className="h-5 w-5 text-green-500" />;
  if (t.includes("ERROR") || t.includes("FAILED")) return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
  return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
}

// --- Sub-Components (Inline for simplicity) ---

const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-50 overflow-hidden bg-gray-50 dark:bg-gray-950">
    <motion.div 
      animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 100, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-color-dodge"
    />
    <motion.div 
      animate={{ scale: [1, 1.1, 1], rotate: [0, -60, 0], y: [0, -100, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-color-dodge"
    />
  </div>
);

// --- Main Component ---

export function Notifications() {
  const { notifications, markRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState("all"); 

  const filteredList = useMemo(() => {
    return notifications.filter(n => {
      if (filter === "unread") return !n.readFlag;
      return true; 
    });
  }, [notifications, filter]);

  const hasUnread = notifications.some(n => !n.readFlag);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden p-4 md:p-8">
      <AnimatedBackground />

      <div className="mx-auto w-full max-w-4xl flex flex-col gap-8 pt-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <Typography variant="h2" className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
              Activity & Notifications
            </Typography>
            <Typography className="text-gray-600 dark:text-gray-400 font-medium mt-2">
              Stay updated with your account activity and platform news.
            </Typography>
          </div>
          
          {hasUnread && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30 rounded-full normal-case text-sm px-6"
                onClick={markAllAsRead}
              >
                <EnvelopeOpenIcon className="h-4 w-4" />
                Mark all read
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Glass Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl p-6 md:p-8"
        >
          {/* Tabs */}
          <div className="mb-6 w-full md:w-96">
            <Tabs value={filter}>
              <TabsHeader 
                className="bg-white/50 dark:bg-black/20 p-1 rounded-xl backdrop-blur-md"
                indicatorProps={{
                  className: "bg-white dark:bg-blue-600 shadow-md rounded-lg"
                }}
              >
                {['all', 'unread'].map((tabVal) => (
                  <Tab 
                    key={tabVal}
                    value={tabVal} 
                    onClick={() => setFilter(tabVal)} 
                    className={`text-sm font-bold py-2 transition-colors z-10 ${
                      filter === tabVal 
                        ? 'text-blue-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                    }`}
                  >
                    {tabVal === 'all' ? 'All History' : 'Unread Only'}
                  </Tab>
                ))}
              </TabsHeader>
            </Tabs>
          </div>

          {/* List Area */}
          <div className="min-h-[400px]">
            <AnimatePresence mode="popLayout">
              {filteredList.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-24 opacity-60"
                >
                  <div className="p-6 bg-white/50 dark:bg-white/5 rounded-full mb-4 shadow-sm backdrop-blur-sm">
                    <BellIcon className="h-12 w-12 text-gray-400" />
                  </div>
                  <Typography variant="h6" className="text-gray-500 dark:text-gray-300">
                    All caught up!
                  </Typography>
                  <Typography className="text-gray-400 text-sm">
                    No notifications to display.
                  </Typography>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredList.map((n) => {
                    const isUnread = !n.readFlag;
                    return (
                      <motion.div
                        layout
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.4)" }}
                        className={`
                          group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300
                          ${isUnread 
                            ? "bg-blue-50/50 border-blue-200/50 dark:bg-blue-900/20 dark:border-blue-800/30" 
                            : "bg-white/30 border-transparent dark:bg-white/5"}
                        `}
                      >
                        {/* Icon Bubble */}
                        <div className={`
                          mt-1 p-3 rounded-xl shadow-sm shrink-0 backdrop-blur-md
                          ${isUnread 
                            ? "bg-white dark:bg-gray-800 text-blue-600" 
                            : "bg-gray-50/80 dark:bg-gray-800/50 opacity-70 grayscale"}
                        `}>
                          {getIconForType(n.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                          <div className="flex justify-between items-start">
                            <Typography className={`text-sm font-bold ${isUnread ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                              {n.type || "System Notification"}
                            </Typography>
                            <Typography className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-3">
                              {formatDateTime(n.createdAt)}
                            </Typography>
                          </div>
                          
                          <Typography className={`text-sm mt-1 leading-relaxed ${isUnread ? "text-gray-700 dark:text-gray-200" : "text-gray-500 dark:text-gray-500"}`}>
                            {n.message}
                          </Typography>
                        </div>

                        {/* Action Button */}
                        <div className="self-center">
                          {isUnread && (
                            <Tooltip content="Mark as read">
                              <IconButton 
                                variant="text" 
                                color="blue" 
                                size="sm" 
                                onClick={() => markRead(n.id)} 
                                className="rounded-full hover:bg-blue-100/50 dark:hover:bg-blue-900/40"
                              >
                                <CheckCircleIcon className="h-6 w-6" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Notifications;