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
  Avatar,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  BellIcon,
  Bars3Icon,
  CheckCircleIcon,
  ClockIcon
} from "@heroicons/react/24/solid";

import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

// Helper for relative time (e.g., "2 mins ago")
function timeAgo(dateString) {
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
  const { theme } = useTheme();

  // Consume Global State (Single Source of Truth)
  const { notifications, unreadCount, markRead, markAllAsRead } = useNotifications();

  // Filter for the dropdown (only show first 5 unread, or 5 latest if all read)
  const displayList = notifications.length > 0 
    ? notifications.filter(n => !n.readFlag).slice(0, 5) 
    : [];
  
  // Fallback: If no unread, show recent history so dropdown isn't empty
  const finalList = displayList.length > 0 ? displayList : notifications.slice(0, 3);

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
        <div className="capitalize">
          <Typography variant="h6" color="blue-gray" className="dark:text-white">
            {page || "Dashboard"}
          </Typography>
        </div>

        <div className="flex items-center gap-4">
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon className="h-6 w-6 text-blue-gray-500 dark:text-white" />
          </IconButton>

          {/* User Menu */}
          <div className="hidden sm:flex items-center gap-2 text-blue-gray-900 dark:text-white">
             <UserCircleIcon className="h-5 w-5" />
             <span className="font-medium text-sm">{user?.firstName || "Student"}</span>
          </div>

          <ThemeToggle />

          {/* Notifications Menu */}
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
            
            <MenuList className="w-80 max-w-[90vw] border-0 shadow-xl bg-white dark:bg-gray-800 dark:border-gray-700 p-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 dark:border-gray-700 mb-1">
                <Typography variant="small" className="font-bold text-blue-gray-900 dark:text-white">
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Typography 
                    as="button" 
                    variant="small" 
                    color="blue" 
                    className="font-medium text-xs hover:text-blue-600 transition-colors"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all read
                  </Typography>
                )}
              </div>

              {finalList.length === 0 ? (
                <div className="py-6 text-center">
                  <Typography variant="small" className="text-gray-500">No notifications</Typography>
                </div>
              ) : (
                finalList.map((n) => (
                  <MenuItem 
                    key={n.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg mb-1 transition-colors 
                      ${!n.readFlag ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                    `}
                    onClick={() => markRead(n.id)}
                  >
                    <div className={`mt-1 p-1.5 rounded-full ${!n.readFlag ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                      <ClockIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-0.5">
                        <Typography variant="small" className="font-semibold text-xs text-blue-gray-900 dark:text-gray-100">
                          {n.type}
                        </Typography>
                        <Typography variant="small" className="text-[10px] text-gray-400">
                          {timeAgo(n.createdAt)}
                        </Typography>
                      </div>
                      <Typography className="text-xs font-normal text-blue-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {n.message}
                      </Typography>
                    </div>
                    {!n.readFlag && <div className="mt-2 w-2 h-2 rounded-full bg-blue-500" />}
                  </MenuItem>
                ))
              )}

              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-center">
                <Link to="/dashboard/notifications">
                  <Typography variant="small" color="blue" className="font-bold text-xs uppercase tracking-wide hover:opacity-80">
                    View All
                  </Typography>
                </Link>
              </div>
            </MenuList>
          </Menu>

          <IconButton
            variant="text"
            color="blue-gray"
            onClick={logout}
            title="Log Out"
          >
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

export default DashboardNavbar;