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
} from "@heroicons/react/24/solid";

import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
// import { ThemeToggle } from "./ThemeToggle";

// Helper for relative time
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

  // Notification Logic
  const { notifications, unreadCount, markRead, markAllAsRead } = useNotifications();

  // Filter for the dropdown (first 5 unread, or 3 recent if all read)
  const displayList = notifications.length > 0
    ? notifications.filter(n => !n.readFlag).slice(0, 5)
    : [];
  const finalList = displayList.length > 0 ? displayList : notifications.slice(0, 3);

  return (
    <Navbar
      color="transparent"
      className={`rounded-2xl transition-all ${fixedNavbar
        ? "sticky top-4 z-40 py-3 shadow-lg shadow-blue-gray-500/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10"
        : "px-0 py-1 bg-transparent"
        }`}
      fullWidth
      blurred={false}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">

        {/* BREADCRUMBS & PAGE TITLE */}
        <div className="capitalize">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-blue-gray-500 dark:text-blue-gray-300 opacity-70">
              {layout}
            </span>
            <span className="text-sm font-medium text-blue-gray-500 dark:text-blue-gray-300 opacity-70">/</span>
          </div>
          <Typography variant="h5" color="blue-gray" className="dark:text-white font-bold tracking-tight">
            {page || "Dashboard"}
          </Typography>
        </div>

        {/* RIGHT SIDE ICONS */}
        <div className="flex items-center gap-3">

          {/* Mobile Menu Toggle */}
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500 dark:text-white" />
          </IconButton>

          {/* User Profile Capsule */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/40 dark:bg-white/5 border border-white/20">
            <UserCircleIcon className="h-5 w-5 text-blue-gray-600 dark:text-blue-gray-300" />
            <span className="font-semibold text-sm text-blue-gray-900 dark:text-gray-100">
              {user?.firstName || "Student"}
            </span>
          </div>

          {/* Streak Badge */}
          {user?.streakDays > 0 && (
            <Tooltip content={`${user.streakDays} day streak!`}>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 font-bold text-sm cursor-help hover:scale-105 transition-transform">
                <span className="text-lg">🔥</span>
                {user.streakDays}
              </div>
            </Tooltip>
          )}

          {/* Theme Toggle */}
          {/* ThemeToggle removed */}

          {/* Notifications Menu (Glass Style) */}
          <Menu placement="bottom-end">
            <MenuHandler>
              <div className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/20 dark:hover:bg-white/10 cursor-pointer text-blue-gray-500 dark:text-white transition-colors">
                {unreadCount > 0 ? (
                  <Badge content={unreadCount} withBorder className="bg-red-500 min-w-[18px] min-h-[18px] text-[10px] border-white dark:border-gray-900">
                    <BellIcon className="h-5 w-5" />
                  </Badge>
                ) : (
                  <BellIcon className="h-5 w-5" />
                )}
              </div>
            </MenuHandler>

            <MenuList className="w-80 max-w-[90vw] border border-white/20 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-xl overflow-hidden p-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                <Typography variant="small" className="font-bold text-blue-gray-900 dark:text-white">
                  Notifications
                </Typography>
                {unreadCount > 0 && (
                  <Typography
                    as="button"
                    variant="small"
                    color="blue"
                    className="font-bold text-xs hover:text-blue-600 transition-colors"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all read
                  </Typography>
                )}
              </div>

              <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scroll">
                {finalList.length === 0 ? (
                  <div className="py-6 text-center text-gray-500 text-sm">No new notifications</div>
                ) : (
                  finalList.map((n) => (
                    <MenuItem
                      key={n.id}
                      className={`flex items-start gap-3 p-2 rounded-lg transition-colors
                            ${!n.readFlag
                          ? "bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-white/5"}
                          `}
                    >
                      <div className={`mt-1 p-1 rounded-full shrink-0 ${!n.readFlag ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                        <ClockIcon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <Typography variant="small" className="font-semibold text-xs text-blue-gray-900 dark:text-white truncate">
                            {n.type}
                          </Typography>
                          <Typography variant="small" className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                            {timeAgo(n.createdAt)}
                          </Typography>
                        </div>
                        <Typography variant="small" className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                          {n.message}
                        </Typography>
                      </div>
                      {/* Read Button */}
                      {!n.readFlag && (
                        <div onClick={(e) => { e.stopPropagation(); markRead(n.id); }}>
                          <Tooltip content="Mark as read">
                            <div className="p-1 hover:bg-blue-100 rounded-full cursor-pointer text-blue-500">
                              <CheckCircleIcon className="h-4 w-4" />
                            </div>
                          </Tooltip>
                        </div>
                      )}
                    </MenuItem>
                  ))
                )}
              </div>

              <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800 text-center">
                <Link to="/dashboard/notifications">
                  <Typography variant="small" color="blue" className="font-bold text-xs uppercase hover:underline">
                    View All
                  </Typography>
                </Link>
              </div>
            </MenuList>
          </Menu>

          {/* Logout Button */}
          <IconButton
            variant="text"
            color="red"
            onClick={logout}
            title="Log Out"
            className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

export default DashboardNavbar;