import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Badge,
  Tooltip,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  BellIcon,
  Bars3Icon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";

import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

// --- Helper: Relative Time ---
function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.round(diffMs / 60000);
  const diffHrs = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${diffDays}d ago`;
}

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter(Boolean);
  const { user, logout } = useAuth();
  
  // Notification Context
  const { notifications, unreadCount, markRead, markAllAsRead } = useNotifications();

  // --- Notification Display Logic ---
  // Priority: Show unread first. If no unread, show the last 3 recent notifications.
  const unreadList = notifications.filter((n) => !n.readFlag);
  const displayList = unreadList.length > 0 
    ? unreadList.slice(0, 5) 
    : notifications.slice(0, 3);

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5 bg-white/80 dark:bg-gray-900/90 backdrop-blur-md"
          : "px-0 py-1 bg-transparent"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        
        {/* Breadcrumb / Page Title */}
        <div className="capitalize">
          <Typography variant="h6" color="blue-gray" className="dark:text-white">
            {page || "Dashboard"}
          </Typography>
        </div>

        <div className="flex items-center gap-4">
          
          {/* Mobile Sidenav Toggle */}
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon className="h-6 w-6 text-blue-gray-500 dark:text-white" />
          </IconButton>

          {/* User Info (Desktop) */}
          <div className="hidden sm:flex items-center gap-2 text-blue-gray-900 dark:text-white">
            <UserCircleIcon className="h-5 w-5" />
            <span className="font-medium text-sm">
              {user?.firstName || "Student"}
            </span>
          </div>

          <ThemeToggle />

          {/* Notifications Dropdown */}
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray" className="relative">
                {unreadCount > 0 ? (
                  <Badge content={unreadCount} className="bg-red-500 min-w-[18px] min-h-[18px] text-[10px]">
                    <BellIcon className="h-5 w-5 text-blue-gray-500 dark:text-white" />
                  </Badge>
                ) : (
                  <BellIcon className="h-5 w-5 text-blue-gray-500 dark:text-white" />
                )}
              </IconButton>
            </MenuHandler>

            <MenuList className="w-80 max-w-[90vw] border-0 shadow-xl bg-white dark:bg-gray-800 dark:border-gray-700 p-2 z-[999]">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                <Typography variant="small" className="font-bold text-blue-gray-900 dark:text-white">
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Typography
                    as="button"
                    variant="small"
                    color="blue"
                    className="font-medium text-xs hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all read
                  </Typography>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {displayList.length === 0 ? (
                  <div className="py-6 text-center">
                    <Typography variant="small" className="text-gray-500">
                      No notifications
                    </Typography>
                  </div>
                ) : (
                  displayList.map((n) => (
                    <MenuItem
                      key={n.id}
                      className={`flex items-start gap-3 p-3 rounded-lg mb-1 transition-colors cursor-default
                        ${!n.readFlag ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}
                      `}
                    >
                      {/* Icon */}
                      <div className={`mt-1 p-1.5 rounded-full shrink-0 ${
                        !n.readFlag 
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200" 
                          : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}>
                        <ClockIcon className="h-3.5 w-3.5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <Typography variant="small" className="font-semibold text-xs text-blue-gray-900 dark:text-gray-100 truncate pr-2">
                            {n.type}
                          </Typography>
                          <Typography variant="small" className="text-[10px] text-gray-400 shrink-0">
                            {timeAgo(n.createdAt)}
                          </Typography>
                        </div>
                        <Typography className="text-xs font-normal text-blue-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {n.message}
                        </Typography>
                      </div>

                      {/* Action Button (Mark Read) */}
                      {!n.readFlag && (
                        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                          <Tooltip content="Mark as read">
                            <IconButton
                              variant="text"
                              color="blue"
                              size="sm"
                              className="h-7 w-7 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(n.id);
                              }}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      )}
                    </MenuItem>
                  ))
                )}
              </div>

              {/* View All Link */}
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-center">
                <Link to="/dashboard/notifications" className="inline-block w-full">
                  <Typography variant="small" color="blue" className="font-bold text-xs uppercase tracking-wide hover:opacity-80 py-1">
                    View All
                  </Typography>
                </Link>
              </div>
            </MenuList>
          </Menu>

          {/* Logout Button */}
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={logout}
            title="Log Out"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
          </IconButton>
          
        </div>
      </div>
    </Navbar>
  );
}

export default DashboardNavbar;