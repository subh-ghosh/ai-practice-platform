import React, { useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabsHeader,
  Tab,
  IconButton,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import {
  CheckCircleIcon,
  BellIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  EnvelopeOpenIcon
} from "@heroicons/react/24/solid";
import { useNotifications } from "@/context/NotificationContext"; // Use Context!

// Helper for nice dates
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
  return <InformationCircleIcon className="h-5 w-5 text-gray-500" />;
}

export function Notifications() {
  const { notifications, markRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'

  // Filter logic on the client side since we have all data in context
  const filteredList = notifications.filter(n => {
    if (filter === "unread") return !n.readFlag;
    return true; // "all"
  });

  const hasUnread = notifications.some(n => !n.readFlag);

  return (
    <div className="mt-8 mb-8 flex flex-col gap-8 w-full max-w-4xl mx-auto px-4">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h4" color="blue-gray" className="dark:text-white font-bold">
            Activity & Notifications
          </Typography>
          <Typography variant="small" className="text-gray-600 dark:text-gray-400 font-normal mt-1">
            Stay updated with your account activity and platform news.
          </Typography>
        </div>
        
        {hasUnread && (
          <Button 
            variant="outlined" 
            size="sm" 
            color="blue"
            className="flex items-center gap-2 dark:border-blue-400 dark:text-blue-300"
            onClick={markAllAsRead}
          >
            <EnvelopeOpenIcon className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <Card className="border border-blue-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900">
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 p-4 rounded-t-xl border-b border-blue-gray-50 dark:border-gray-800"
        >
          <div className="w-full md:w-96">
            <Tabs value={filter}>
              <TabsHeader className="bg-gray-100 dark:bg-gray-800 p-1">
                <Tab value="all" onClick={() => setFilter("all")} className="text-sm font-medium py-2">
                  All History
                </Tab>
                <Tab value="unread" onClick={() => setFilter("unread")} className="text-sm font-medium py-2">
                  Unread Only
                </Tab>
              </TabsHeader>
            </Tabs>
          </div>
        </CardHeader>

        <CardBody className="p-0 min-h-[400px]">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 opacity-60">
              <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                <BellIcon className="h-10 w-10 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-500 dark:text-gray-400">
                All caught up!
              </Typography>
              <Typography className="text-gray-400 text-sm">
                No notifications to display.
              </Typography>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredList.map((n) => {
                const isUnread = !n.readFlag;
                return (
                  <div 
                    key={n.id} 
                    className={`
                      group flex items-start gap-4 p-5 transition-all duration-200
                      ${isUnread 
                        ? "bg-blue-50/30 dark:bg-blue-900/10 hover:bg-blue-50/60 dark:hover:bg-blue-900/20" 
                        : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50"}
                    `}
                  >
                    {/* Icon Bubble */}
                    <div className={`mt-1 p-2.5 rounded-xl border shadow-sm shrink-0
                      ${isUnread 
                        ? "bg-white border-blue-100 dark:bg-gray-800 dark:border-gray-700" 
                        : "bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700 opacity-70"}
                    `}>
                      {getIconForType(n.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <Typography variant="small" className={`font-bold mb-0.5 ${isUnread ? "text-blue-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                          {n.type || "System Notification"}
                        </Typography>
                        <Typography className="text-[11px] font-medium text-gray-400 whitespace-nowrap ml-3 mt-0.5">
                          {formatDateTime(n.createdAt)}
                        </Typography>
                      </div>
                      
                      <Typography className={`text-sm leading-relaxed ${isUnread ? "text-gray-800 dark:text-gray-200 font-medium" : "text-gray-500 dark:text-gray-500"}`}>
                        {n.message}
                      </Typography>
                    </div>

                    {/* Action Button */}
                    <div className="self-center pl-2">
                      {isUnread ? (
                        <Tooltip content="Mark as read">
                          <IconButton variant="text" color="blue" size="sm" onClick={() => markRead(n.id)} className="rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30">
                            <CheckCircleIcon className="h-6 w-6" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        // Optional: Delete button placeholder if you implement delete later
                        <div className="w-8 h-8" /> 
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;