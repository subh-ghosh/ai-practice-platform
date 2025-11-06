import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Badge,
} from "@material-tailwind/react";
import { useNotifications } from "@/context/NotificationContext.jsx";
import {
  UserCircleIcon,
  BellIcon,
  ClockIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "@/context/ThemeContext";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
const [layout, page] = pathname.split("/").filter((el) => el !== "");
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
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">

 <div className="capitalize">
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>

        <div className="flex items-center">
          <IconButton
            variant="text"
            color="blue-gray"

className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>

          {/* USER MENU */}
          <Menu>
            <MenuHandler>

  <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />

     Hi, {user?.firstName ?? "User"}
              </Button>
            </MenuHandler>
            <MenuList className={theme === 'dark' ? "dark:bg-gray-800 dark:border-gray-700" : ""}>
              <MenuItem onClick={logout} className={theme === 'dark' ? "dark:hover:bg-gray-700" : ""}>
                <Typography color="red" className="font-medium">
                  Log Out
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>

          <IconButton variant="text" color="blue-gray" className="grid xl:hidden">
            <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
          </IconButton>


{/* --- NOTIFICATION MENU (DYNAMIC) --- */}
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray">
                <Badge
                  content={safeUnread ||
0}
                  withBorder
                  color="red"
                  invisible={!safeUnread}
                  className="z-10 top-1"
                >

       <BellIcon className="h-5 w-5 text-blue-gray-500" />
                </Badge>
              </IconButton>
            </MenuHandler>

            <MenuList className={`w-full max-w-xs border-0 ${theme === 'dark' ? "dark:bg-gray-800 dark:border-gray-700" : ""}`}>
              {loading && (
                <MenuItem className={`flex items-center gap-3 ${theme === 'dark' ? "dark:hover:bg-gray-700" : ""}`}>
                  <Typography variant="small" color={theme === 'dark' ? 'white' : 'blue-gray'} className="font-normal">
                    Loading notifications...
                  </Typography>
                </MenuItem>
              )}


       {!loading && !safeUnread && (
                <MenuItem className={`flex items-center gap-3 ${theme === 'dark' ? "dark:hover:bg-gray-700" : ""}`}>
                  <Typography variant="small" color={theme === 'dark' ? 'white' : 'blue-gray'} className="font-normal">
                    No new notifications
                  </Typography>

       </MenuItem>
              )}

              {!loading &&
                safeUnread > 0 &&
                notifications.slice(0, 5).map((n) => (
                  <MenuItem

            key={n.id}
                    className={`flex items-start gap-3 whitespace-normal ${theme === 'dark' ? "dark:hover:bg-gray-700" : ""}`}
                    onClick={() => handleMarkRead(n.id)}
                  >
                    <div className="relative p-1 after:absolute after:-bottom-6
after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] after:h-4/6">
                      <ClockIcon className="!w-5 !h-5 text-blue-gray-500" />
                    </div>
                    <div>
                      {/* --- THIS IS THE FIX --- */}
                      <Typography
                         variant="small"
                        color={theme === 'dark' ? 'white' : 'blue-gray'}
                        className="mb-1 font-semibold uppercase text-xs"
                      >
                        {n.type}
                      </Typography>
                      <Typography variant="small" color={theme === 'dark' ? 'white' : 'blue-gray'} className="font-normal">
                        {n.message}
                      </Typography>
                      <Typography
                        as="span"
                        variant="small"
                        className="text-xs font-medium text-blue-gray-400 dark:text-gray-500"
                      >
                      {/* --- END OF FIX --- */}
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

              <hr className="my-2 border-blue-gray-50 dark:border-gray-700" />

              <Link to="/dashboard/notifications">
                <MenuItem className={`flex items-center justify-center gap-3 ${theme === 'dark' ? "dark:hover:bg-gray-700" : ""}`}>

          <Typography variant="small" color="blue" className="font-medium">
                    View all notifications
                  </Typography>
                </MenuItem>
              </Link>
            </MenuList>

     </Menu>
          {/* --- END OF NOTIFICATION MENU --- */}

          <ThemeToggle />

        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;