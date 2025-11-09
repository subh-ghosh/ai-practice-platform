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
import { useNotifications } from "@/context/NotificationContext.jsx";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";
import { useCallback } from "react";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;

  const { pathname } = useLocation();
  const [, page = ""] = pathname.split("/").filter(Boolean);

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
      className={`dashboard-navbar rounded-xl transition-all
        ${fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5 bg-white/70 dark:bg-gray-900/40 backdrop-blur-md"
          : "px-0 py-1 bg-transparent"
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        {/* Page title */}
        <div className="capitalize">
          <Typography variant="h6" color="blue-gray" className="dark:text-gray-100">
            {page}
          </Typography>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Sidenav toggle (mobile) – flat */}
          <IconButton
            variant="text"
            color="blue-gray"
            ripple={false}
            className="grid xl:hidden bg-transparent hover:bg-transparent focus:bg-transparent"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-6 w-6 text-blue-gray-500 dark:text-gray-200" />
          </IconButton>

          {/* USER MENU (flat trigger) */}
          <Menu>
            <MenuHandler>
              <div
                className="hidden xl:flex items-center gap-2 px-0 py-0 cursor-pointer select-none text-blue-gray-600 dark:text-gray-200 hover:opacity-80"
                role="button"
                tabIndex={0}
                aria-label="Open user menu"
              >
                <UserCircleIcon className="h-5 w-5" />
                Hi, {user?.firstName ?? "User"}
              </div>
            </MenuHandler>

            <MenuList
              className={`min-w-[10rem] border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/5
                ${theme === "dark" ? "dark:bg-gray-800" : "bg-white"}`}
            >
              <MenuItem
                onClick={logout}
                className={`${theme === "dark" ? "dark:hover:bg-gray-700" : ""}`}
              >
                <Typography color="red" className="font-medium">
                  Log Out
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Mobile user icon – flat */}
          <IconButton
            variant="text"
            color="blue-gray"
            ripple={false}
            className="grid xl:hidden bg-transparent hover:bg-transparent focus:bg-transparent"
            aria-label="User"
          >
            <UserCircleIcon className="h-5 w-5 text-blue-gray-500 dark:text-gray-200" />
          </IconButton>

          {/* NOTIFICATIONS (flat trigger + badge) */}
          <Menu>
            <MenuHandler>
              <IconButton
                variant="text"
                color="blue-gray"
                ripple={false}
                className="bg-transparent hover:bg-transparent focus:bg-transparent relative"
                aria-label="Open notifications"
              >
                <Badge
                  content={safeUnread || 0}
                  color="red"
                  withBorder={false}
                  invisible={!safeUnread}
                  className="z-10 top-1 -right-1"
                >
                  <BellIcon className="h-5 w-5 text-blue-gray-500 dark:text-gray-200" />
                </Badge>
              </IconButton>
            </MenuHandler>

            <MenuList
              className={`w-full max-w-xs max-h-[70vh] overflow-y-auto border-0 shadow-xl ring-1 ring-black/5 dark:ring-white/5
                ${theme === "dark" ? "dark:bg-gray-800" : "bg-white"}`}
            >
              {/* loading state */}
              {loading && (
                <MenuItem className={`${theme === "dark" ? "dark:hover:bg-gray-700" : ""}`}>
                  <Typography
                    variant="small"
                    color={theme === "dark" ? "white" : "blue-gray"}
                    className="font-normal"
                  >
                    Loading notifications...
                  </Typography>
                </MenuItem>
              )}

              {/* empty state */}
              {!loading && !safeUnread && (
                <MenuItem className={`${theme === "dark" ? "dark:hover:bg-gray-700" : ""}`}>
                  <Typography
                    variant="small"
                    color={theme === "dark" ? "white" : "blue-gray"}
                    className="font-normal"
                  >
                    No new notifications
                  </Typography>
                </MenuItem>
              )}

              {/* unread items (top 5) */}
              {!loading &&
                safeUnread > 0 &&
                notifications
                  .filter((n) => !n.read)
                  .slice(0, 5)
                  .map((n) => (
                    <MenuItem
                      key={n.id}
                      className={`flex items-start gap-3 whitespace-normal ${
                        theme === "dark" ? "dark:hover:bg-gray-700" : ""
                      }`}
                      onClick={() => handleMarkRead(n.id)}
                    >
                      <div className="relative p-1">
                        <ClockIcon className="!w-5 !h-5 text-blue-gray-500 dark:text-gray-300" />
                      </div>
                      <div className="min-w-0">
                        <Typography
                          variant="small"
                          color={theme === "dark" ? "white" : "blue-gray"}
                          className="mb-1 font-semibold uppercase text-xs"
                        >
                          {n.type}
                        </Typography>
                        <Typography
                          variant="small"
                          color={theme === "dark" ? "white" : "blue-gray"}
                          className="font-normal break-words"
                        >
                          {n.message}
                        </Typography>
                        <Typography
                          as="span"
                          variant="small"
                          className="text-xs font-medium text-blue-gray-400 dark:text-gray-500"
                        >
                          {new Date(n.createdAt).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </Typography>
                      </div>
                    </MenuItem>
                  ))}

              {/* soft divider (no harsh border seam) */}
              <div className="my-2 h-px bg-black/5 dark:bg-white/10" />

              <Link to="/dashboard/notifications">
                <MenuItem className={`${theme === "dark" ? "dark:hover:bg-gray-700" : ""}`}>
                  <Typography variant="small" color="blue" className="font-medium">
                    View all notifications
                  </Typography>
                </MenuItem>
              </Link>
            </MenuList>
          </Menu>

          {/* THEME TOGGLE – flat */}
          <ThemeToggle />
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";
export default DashboardNavbar;
