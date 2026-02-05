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
  Button,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  BellIcon,
  ClockIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";

import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext"; // Ensure correct path
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useCallback } from "react";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;

  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter(Boolean);

  const { user, logout } = useAuth();
  const { theme } = useTheme();

  const {
    notifications = [],
    unreadCount = 0,
    loading,
    markRead,
  } = useNotifications();

  const handleMarkRead = useCallback(
    async (id) => {
      try {
        await Promise.resolve(markRead?.(id));
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    },
    [markRead]
  );

  const safeUnread = Number.isFinite(Number(unreadCount))
    ? Number(unreadCount)
    : 0;

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md"
          : "px-0 py-1 bg-transparent"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Typography variant="h6" color="blue-gray" className="dark:text-gray-100">
            {page || "Dashboard"}
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon className="h-6 w-6 text-blue-gray-500 dark:text-gray-200" />
          </IconButton>

          {/* User Menu */}
          <Menu>
            <MenuHandler>
                <div className="hidden xl:flex items-center gap-2 cursor-pointer text-blue-gray-600 dark:text-gray-200 hover:opacity-80">
                    <UserCircleIcon className="h-5 w-5" />
                    Hi, {user?.firstName ?? "User"}
                </div>
            </MenuHandler>
            <MenuList className={`border-0 shadow-lg ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"}`}>
                <MenuItem onClick={logout}>
                    <Typography color="red" className="font-medium">Log Out</Typography>
                </MenuItem>
            </MenuList>
          </Menu>

          {/* Notifications Menu */}
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray" className="relative">
                <Badge content={safeUnread || 0} color="red" withBorder={false} invisible={!safeUnread} className="z-10 top-1 -right-1">
                  <BellIcon className="h-5 w-5 text-blue-gray-500 dark:text-gray-200" />
                </Badge>
              </IconButton>
            </MenuHandler>
            <MenuList className={`w-full max-w-xs max-h-[70vh] overflow-y-auto border-0 shadow-xl ${theme === "dark" ? "bg-gray-800 border-gray-700" : "bg-white"}`}>
                {loading && <MenuItem>Loading...</MenuItem>}
                {!loading && !safeUnread && <MenuItem>No new notifications</MenuItem>}
                
                {!loading && safeUnread > 0 && notifications.filter(n => !n.read).slice(0, 5).map((n) => (
                    <MenuItem key={n.id} onClick={() => handleMarkRead(n.id)} className="flex items-start gap-3">
                        <div className="p-1"><ClockIcon className="h-5 w-5 text-blue-gray-500" /></div>
                        <div>
                            <Typography variant="small" className={`font-semibold ${theme === 'dark' ? 'text-gray-200' : 'text-blue-gray-900'}`}>{n.type}</Typography>
                            <Typography variant="small" className="font-normal text-blue-gray-500">{n.message}</Typography>
                        </div>
                    </MenuItem>
                ))}
                
                <div className="my-2 h-px bg-gray-200 dark:bg-gray-700" />
                <Link to="/dashboard/notifications">
                    <MenuItem><Typography variant="small" color="blue" className="font-medium text-center">View all notifications</Typography></MenuItem>
                </Link>
            </MenuList>
          </Menu>

          <ThemeToggle />
        </div>
      </div>
    </Navbar>
  );
}

export default DashboardNavbar;