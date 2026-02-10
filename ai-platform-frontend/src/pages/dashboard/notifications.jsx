import React, { useState, useMemo } from "react";
import {
  Typography,
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
import { motion, AnimatePresence } from "framer-motion";
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
  // Using solid colors with glow effects for the glass look
  if (t.includes("LOGIN") || t.includes("SECURITY")) return <ShieldCheckIcon className="h-5 w-5 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]" />;
  if (t.includes("PROFILE")) return <PencilSquareIcon className="h-5 w-5 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.6)]" />;
  if (t.includes("REGISTER")) return <UserCircleIcon className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]" />;
  if (t.includes("ERROR") || t.includes("FAILED")) return <ExclamationTriangleIcon className="h-5 w-5 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" />;
  return <InformationCircleIcon className="h-5 w-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]" />;
}

// --- Animation Variants ---

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0, scale: 0.95 },
  visible: { 
    y: 0, 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    x: -20,
    transition: { duration: 0.2 } 
  }
};

// --- Components ---

// Custom Glass Tab Component to replace Material Tailwind Tabs for better animation control
const GlassTabs = ({ filter, setFilter }) => {
  const tabs = [
    { id: "all", label: "All Activity" },
    { id: "unread", label: "Unread" },
  ];

  return (
    <div className="flex p-1 bg-blue-gray-50/30 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 relative z-20">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setFilter(tab.id)}
          className={`${
            filter === tab.id ? "text-blue-600 dark:text-blue-200" : "text-gray-500 dark:text-gray-400"
          } relative w-full px-4 py-2 text-sm font-bold transition-colors duration-300 z-10`}
        >
          {filter === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white dark:bg-white/10 shadow-[0_4px_10px_rgba(0,0,0,0.05)] rounded-lg"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

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
    <div className="relative mt-6 mb-8 w-full h-[calc(100vh-120px)] overflow-hidden rounded-3xl border border-white/40 dark:border-white/10 shadow-2xl bg-white/40 dark:bg-gray-900/60 backdrop-blur-2xl">
      
      {/* --- Ambient Background Animations --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Blue Orb */}
        <motion.div 
          animate={{ x: [0, 50, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-blue-500/20 blur-[120px]" 
        />
        {/* Purple Orb */}
        <motion.div 
          animate={{ x: [0, -40, 20, 0], y: [0, 40, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", delay: 2 }}
          className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-purple-500/20 blur-[100px]" 
        />
        {/* Pink/Rose Orb */}
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
          className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full bg-pink-500/10 blur-[120px]" 
        />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header Section */}
        <div className="p-6 pb-2 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-blue-500/20">
                   <BellIcon className="h-5 w-5 text-white" />
                </div>
                <Typography variant="h4" className="font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-gray-900 to-blue-gray-600 dark:from-white dark:to-gray-400">
                  Notifications
                </Typography>
              </motion.div>
              <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-medium ml-11 mt-1">
                Stay updated with your latest activity.
              </Typography>
            </div>
            
            <div className="flex items-center gap-4">
              {hasUnread && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    variant="gradient"
                    color="blue"
                    className="flex items-center gap-2 normal-case rounded-lg shadow-blue-500/20"
                    onClick={markAllAsRead}
                  >
                    <EnvelopeOpenIcon className="h-3.5 w-3.5" />
                    Mark all read
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between items-end border-b border-gray-200/50 dark:border-gray-700/50 pb-4">
             <div className="w-full md:w-64">
                <GlassTabs filter={filter} setFilter={setFilter} />
             </div>
             <Typography variant="small" className="hidden md:block text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {filteredList.length} Messages
             </Typography>
          </div>
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300/50 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-400/50">
            <AnimatePresence mode="wait">
            {filteredList.length === 0 ? (
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center h-full opacity-70"
                >
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-6 rounded-full shadow-inner mb-4"
                    >
                        <BellIcon className="h-12 w-12 text-gray-400" />
                    </motion.div>
                    <Typography className="text-gray-500 font-medium">No new notifications</Typography>
                    <Typography variant="small" className="text-gray-400">You're all caught up!</Typography>
                </motion.div>
            ) : (
                <motion.div 
                  key={filter} 
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-3"
                >
                {filteredList.map((n) => {
                    const isUnread = !n.readFlag;
                    return (
                    <motion.div
                        key={n.id}
                        layout="position"
                        variants={itemVariants}
                        whileHover={{ 
                            scale: 1.01, 
                            backgroundColor: "rgba(255, 255, 255, 0.6)",
                            borderColor: "rgba(255, 255, 255, 0.5)",
                            boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)"
                        }}
                        className={`group relative flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md transition-all duration-300
                            ${isUnread 
                                ? "bg-white/40 dark:bg-gray-800/40 border-white/40 dark:border-white/10 shadow-lg shadow-blue-500/5" 
                                : "bg-white/10 dark:bg-gray-800/20 border-white/10 dark:border-gray-800/50 hover:bg-white/30"
                            }
                        `}
                    >
                        {/* Status Indicator Dot */}
                        {isUnread && (
                            <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                        )}

                        <div className={`p-3 rounded-xl shrink-0 backdrop-blur-sm ${isUnread ? "bg-white/50 dark:bg-white/10" : "bg-gray-100/50 dark:bg-gray-800/50"}`}>
                            {getIconForType(n.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex justify-between items-baseline mb-1 pr-4">
                                <span className={`text-xs font-bold tracking-wide uppercase ${isUnread ? "text-blue-900 dark:text-blue-100" : "text-gray-500"}`}>
                                {n.type || "System"}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400/80 ml-2">
                                {formatDateTime(n.createdAt)}
                                </span>
                            </div>
                            <p className={`text-sm leading-relaxed ${isUnread ? "text-gray-800 dark:text-gray-100 font-semibold" : "text-gray-500 dark:text-gray-400"}`}>
                                {n.message}
                            </p>
                            
                            {/* Action Area (Only visible on hover or if unread) */}
                            <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {isUnread && (
                                    <Button 
                                        size="sm" 
                                        variant="text" 
                                        className="h-6 px-2 py-0 text-xs font-normal text-blue-600 hover:bg-blue-50/50"
                                        onClick={() => markRead(n.id)}
                                    >
                                        Mark as read
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Quick Action Button */}
                        <div className="self-center">
                            {isUnread && (
                            <Tooltip content="Mark Read">
                                <IconButton 
                                    variant="text" 
                                    color="blue" 
                                    size="sm" 
                                    className="rounded-full hover:bg-blue-100/50 dark:hover:bg-blue-900/30"
                                    onClick={() => markRead(n.id)} 
                                >
                                <CheckCircleIcon className="h-5 w-5 opacity-70 hover:opacity-100 transition-opacity" />
                                </IconButton>
                            </Tooltip>
                            )}
                        </div>
                    </motion.div>
                    );
                })}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Notifications;