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
  if (t.includes("LOGIN") || t.includes("SECURITY")) return <ShieldCheckIcon className="h-4 w-4 text-blue-500" />;
  if (t.includes("PROFILE")) return <PencilSquareIcon className="h-4 w-4 text-orange-500" />;
  if (t.includes("REGISTER")) return <UserCircleIcon className="h-4 w-4 text-green-500" />;
  if (t.includes("ERROR") || t.includes("FAILED")) return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
  return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
}

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
    <div className="relative mt-6 mb-8 w-full h-[calc(100vh-175px)] overflow-hidden rounded-xl border border-blue-gray-50 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
      
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-400/5 blur-[100px]" />
      </div>

      {/* Main Content Wrapper */}
      <div className="relative z-10 p-6 flex flex-col gap-5 h-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold tracking-tight">
              Notifications
            </Typography>
            <Typography variant="small" className="text-gray-500 dark:text-gray-400 font-normal mt-1">
              Manage your alerts and activity.
            </Typography>
          </div>
          
          {hasUnread && (
            <Button 
              size="sm" 
              variant="text"
              color="blue"
              className="flex items-center gap-2 normal-case hover:bg-blue-50 dark:hover:bg-blue-900/20"
              onClick={markAllAsRead}
            >
              <EnvelopeOpenIcon className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-4 flex-1 min-h-0">
            
            {/* Tabs */}
            <div className="w-full md:w-80 shrink-0">
                <Tabs value={filter} className="w-full">
                <TabsHeader 
                    className="bg-gray-100/50 dark:bg-gray-800/70 p-1 border border-gray-200 dark:border-gray-700"
                    indicatorProps={{ className: "bg-white dark:bg-gray-700 shadow-sm" }}
                >
                    <Tab value="all" onClick={() => setFilter("all")} className="w-1/2 text-xs font-semibold py-2 transition-colors">
                      All
                    </Tab>
                    <Tab value="unread" onClick={() => setFilter("unread")} className="w-1/2 text-xs font-semibold py-2 transition-colors">
                      Unread
                    </Tab>
                </TabsHeader>
                </Tabs>
            </div>

            {/* List with DARK/HIDDEN SCROLLBAR */}
            <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
                <AnimatePresence mode="popLayout" initial={false}>
                {filteredList.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-full opacity-60"
                    >
                        <BellIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                        <Typography variant="small" className="text-gray-500">No notifications found.</Typography>
                    </motion.div>
                ) : (
                    <div className="flex flex-col gap-2 pb-6">
                    {filteredList.map((n) => {
                        const isUnread = !n.readFlag;
                        return (
                        <motion.div
                            key={n.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }} 
                            className={`group relative flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 ${isUnread ? "bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900/30 shadow-sm" : "bg-transparent border-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/30"}`}
                        >
                            <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${isUnread ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                                {getIconForType(n.type)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className={`text-xs font-bold ${isUnread ? "text-gray-900 dark:text-gray-100" : "text-gray-500"}`}>
                                    {n.type || "System"}
                                    </span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                    {formatDateTime(n.createdAt)}
                                    </span>
                                </div>
                                <p className={`text-xs leading-relaxed ${isUnread ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500"}`}>
                                    {n.message}
                                </p>
                            </div>

                            <div className="self-center pl-1">
                                {isUnread && (
                                <Tooltip content="Mark Read">
                                    <IconButton 
                                        variant="text" 
                                        color="blue" 
                                        size="sm" 
                                        className="h-7 w-7 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        onClick={() => markRead(n.id)} 
                                    >
                                    <CheckCircleIcon className="h-4 w-4" />
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
        </div>
      </div>
    </div>
  );
}

export default Notifications;